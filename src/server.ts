const http = require('http')
const fs = require('fs')
const express = require('express')
import { Request, Response, Application } from 'express'
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')
import { getConfig } from './cli'
import { search } from './search'


// -------------------- App setup --------------------

const config = getConfig()

function createExpressApp(): Application {
	let app = express()
	setupCompression(app)
	setupJSON(app)
	if (config.cors) setupCORS(app)
	return app
}

function setupCompression(app: Application) {
	// Enable gzip compression
	app.use(compression())
}

function setupJSON(app: Application) {
	// Configure app to use bodyParser()
	// this will let us get the data from a POST
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())
}

function setupCORS(app: Application) {
	app.use(cors())
}


// -------------------- File handling --------------------

let files: Record<string, any> = {}
let reading: Record<string, any>  = {}
let changed: Record<string, boolean>  = {}

function handleFileRead(fname: string, success: any, fail: any, err: any, data: any) {
	let json: any = null
	let cberr: any = null
	if (err) {
		// Assume all file read errors mean "file does not exist yet" and create array
		json = []
		files[fname] = json
		success(json)
	}
	else {
		try {
			json = JSON.parse(data)
			// Update global structure
			files[fname] = json
			// Return JSON object to caller
			success(json)
		} catch (jpe: any) {
			cberr = { code: 500, msg: 'Error during JSON parse: ' + jpe.toString() }
			fail(cberr)
		}
	}
	// Notify listeners, if any
	for (let cb of reading[fname]) cb(cberr, json)
	// File is ready
	reading[fname] = undefined
}

function getJsonFile(fname: string) {
	return new Promise<any[]>((success, fail) => {
		if (!fname.match(/^[a-zA-Z0-9\.-_]+$/))
			// Fail at invalid file name
			return fail({ code: 400, msg: 'Invalid colletion name' })
		if (files[fname])
			// File is in memory, just return its content
			return success(files[fname])
		if (reading[fname] !== undefined)
			// File is being read: subscribe to being called when available
			return reading[fname].push(
				(err: any, data: any) => err ? fail(err) : success(data)
			)
		// Read the file
		reading[fname] = []
		fs.readFile(config.dataDir + fname + '.json', 'utf8', (err: any, data: any) => {
			handleFileRead(fname, success, fail, err, data)
		})
	})
}

function markChanged(fname: string) {
	changed[fname] = true
}

function setupPeriodicWrite() {
	if (config.writeDelay < 0) return
	setInterval(_ => {
		for (let fname of Object.keys(changed)) {
			fs.writeFile(
				config.dataDir + fname + '.json',
				JSON.stringify(files[fname], null, 2),
				(err: Error) => console.dir(err)
			)
		}
		changed = {}
	}, config.writeDelay)
}


// -------------------- Request handlng --------------------

function uniqueId(len: number) {
	return Math.random().toString(36).substr(2, len)
}

function reply(res: Response, obj: any) {
	const sendReply = () => res.json(obj)
	if (config.replyDelay)
		setTimeout(sendReply, config.replyDelay)
	else
		sendReply()
}

function handleError(err: any, res: Response) {
	console.log('Error:', err.msg)
	res.status(err.code)
	reply(res, { error: err })
}

function handleGetAll(req: Request, res: Response) {
	getJsonFile(req.params.file)
	.then(json => {
		console.log(`GET for file ${req.params.file}`)
		let data = json
		if (req.query) data = search(req.query, json)
		reply(res, { msg: 'OK', data })
	})
	.catch(err => handleError(err, res))
}

function handleGetOne(req: Request, res: Response) {
	let id = req.params.id
	let fname = req.params.file
	getJsonFile(fname)
	.then(json => {
		console.log(`GET for file "${fname}", id "${id}"`)
		let item = json.find(item => item._id == id)
		if (item) {
			reply(res, { msg: 'OK', data: item })
		}
		else {
			res.status(404)
			reply(res, { error: `Item ${id} not found in ${fname}` })
		}
	})
	.catch(err => handleError(err, res))
}

function handlePost(req: Request, res: Response) {
	let fname = req.params.file
	getJsonFile(fname)
	.then(json => {
		console.log(`POST for file ${fname}`)
		if (!req.body._id)
			req.body._id = uniqueId(16)
		json.push(req.body)
		reply(res, { msg: 'OK', _id: req.body._id })
		markChanged(fname)
	})
	.catch(err => handleError(err, res))
}

function handlePut(req: Request, res: Response) {
	let id = req.params.id
	let fname = req.params.file
	getJsonFile(fname)
	.then(json => {
		console.log(`PUT for file "${fname}", id "${id}"`)
		let idx = json.findIndex(item => item._id == id)
		if (idx >= 0) {
			if (!req.body._id)
				req.body._id = id
			json[idx] = req.body
			markChanged(fname)
			reply(res, { msg: 'OK' })
		}
		else {
			res.status(404)
			reply(res, { error: `Item ${id} not found in ${fname}` })
		}
	})
	.catch(err => handleError(err, res))
}

function handleDelete(req: Request, res: Response) {
	let id = req.params.id
	let fname = req.params.file
	getJsonFile(fname)
	.then(json => {
		console.log(`DELETE for file "${fname}", id "${id}"`)
		let idx = json.findIndex(item => item._id == id)
		if (idx >= 0) {
			json.splice(idx, 1)
			markChanged(fname)
			reply(res, { msg: 'OK' })
		}
		else {
			res.status(404)
			reply(res, { error: `Item ${id} not found in ${fname}` })
		}
	})
	.catch(err => handleError(err, res))
}


// -------------------- Main --------------------

function main() {
	let app = createExpressApp()
	if (config.webRoot)
		app.use(express.static(config.webRoot))
	let route = config.apiRoot + '/:file'
	let routeWithId = route + '/:id'
	app.get(route, handleGetAll)
	app.get(routeWithId, handleGetOne)
	app.post(route, handlePost)
	app.put(routeWithId, handlePut)
	app.delete(routeWithId, handleDelete)
	setupPeriodicWrite()
	http.createServer(app).listen(config.port)
}

main()
