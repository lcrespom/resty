const http = require('http');
const fs = require('fs');
const express = require('express');
import { Request, Response } from 'express';
const compression = require('compression');
const bodyParser = require('body-parser');

const API_ROOT = '/api';
const PORT = 3000;
const DATA_DIR = './';
const WRITE_DELAY = 1000;


// -------------------- App setup --------------------

function createExpressApp() {
	let app = express();
	setupCompression(app);
	setupJSON(app);
	return app;
}

function setupCompression(app) {
	// Enable gzip compression
	app.use(compression());
}

function setupJSON(app) {
	// Configure app to use bodyParser()
	// this will let us get the data from a POST
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	return app;
}


// -------------------- File handling --------------------

let files = {};
let reading = {};
let changed = {};

function handleFileRead(fname, success, fail, err, data) {
	let json: any = null;
	let cberr: any = null;
	if (err) {
		// Assume all file read errors mean "file does not exist yet" and create array
		json = [];
		files[fname] = json;
		success(json);
	}
	else {
		try {
			json = JSON.parse(data);
			// Update global structure
			files[fname] = json;
			// Return JSON object to caller
			success(json);
		} catch (jpe) {
			cberr = { code: 500, msg: 'Error during JSON parse: ' + jpe.toString() };
			fail(cberr);
		}
	}
	// Notify listeners, if any
	for (let cb of reading[fname]) cb(cberr, json);
	// File is ready
	reading[fname] = undefined;
}

function getJsonFile(fname) {
	return new Promise<any[]>((success, fail) => {
		if (!fname.match(/^[a-zA-Z0-9\.-_]+$/))
			// Fail at invalid file name
			return fail({ code: 400, msg: 'Invalid colletion name' });
		if (files[fname])
			// File is in memory, just return its content
			return success(files[fname]);
		if (reading[fname] !== undefined)
			// File is being read: subscribe to being called when available
			return reading[fname].push(
				(err, data) => err ? fail(err) : success(data)
			);
		// Read the file
		reading[fname] = [];
		fs.readFile(DATA_DIR + fname + '.json', 'utf8', (err, data) => {
			handleFileRead(fname, success, fail, err, data);
		});
	});
}

function markChanged(fname) {
	changed[fname] = true;
}

setInterval(_ => {
	for (let fname of Object.keys(changed))
		fs.writeFile(DATA_DIR + fname + '.json',
			JSON.stringify(files[fname], null, 2));
	changed = {};
}, WRITE_DELAY);


// -------------------- Request handlng --------------------

function uniqueId(len) {
	return Math.random().toString(36).substr(2, len);
}

function handleError(err, res) {
	console.log('Error:', err.msg);
	res.status(err.code);
	res.json({ error: err });
}

function handleGetAll(req: Request, res: Response) {
	getJsonFile(req.params.file)
	.then(json => {
		console.log(`GET for file ${req.params.file}`);
		res.json(json);
	})
	.catch(err => handleError(err, res));
}

function handleGetOne(req: Request, res: Response) {
	console.log(`GET for file "${req.params.file}.json", id "${req.params.id}"`);
	res.send('OK');
}

function handlePost(req: Request, res: Response) {
	let fname = req.params.file;
	getJsonFile(fname)
	.then(json => {
		console.log(`POST for file ${fname}`);
		if (!req.body._id)
			req.body._id = uniqueId(16);
		json.push(req.body);
		res.json({ msg: 'ok' });
		markChanged(fname);
	})
	.catch(err => handleError(err, res));
}

function handlePut(req: Request, res: Response) {
	let id = req.params.id;
	let fname = req.params.file;
	getJsonFile(fname)
	.then(json => {
		console.log(`PUT for file "${fname}", id "${id}"`);
		let idx = json.findIndex(item => item._id == id);
		if (idx >= 0) {
			if (!req.body._id)
				req.body._id = id;
			json[idx] = req.body;
			markChanged(fname);
			res.json({ msg: 'ok' });
		}
		else {
			res.status(404);
			res.json({ error: `Item ${id} not found in ${fname}` });
		}
	})
	.catch(err => handleError(err, res));
}

function handleDelete(req: Request, res: Response) {
	let id = req.params.id;
	let fname = req.params.file;
	getJsonFile(fname)
	.then(json => {
		console.log(`DELETE for file "${fname}", id "${id}"`);
		let idx = json.findIndex(item => item._id == id);
		if (idx >= 0) {
			json.splice(idx, 1);
			markChanged(fname);
			res.json({ msg: 'ok' });
		}
		else {
			res.status(404);
			res.json({ error: `Item ${id} not found in ${fname}` });
		}
	})
	.catch(err => handleError(err, res));
}


// -------------------- Main --------------------

function main() {
	let app = createExpressApp();
	let route = API_ROOT + '/:file';
	let routeWithId = route + '/:id';
	app.get(route, handleGetAll);
	app.get(routeWithId, handleGetOne);
	app.post(route, handlePost);
	app.put(routeWithId, handlePut);
	app.delete(routeWithId, handleDelete);
	http.createServer(app).listen(PORT);
	console.log('API server ready on port ' + PORT);
}

main();
