"use strict";
const http = require('http');
const fs = require('fs');
const express = require('express');
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
    let json = null;
    let cberr = null;
    // Assume all file read errors mean "file does not exist yet"
    if (err) {
        json = [];
        success(json);
    }
    else {
        try {
            json = JSON.parse(data);
            // Update global structure
            files[fname] = json;
            // Return JSON object to caller
            success(json);
        }
        catch (jpe) {
            cberr = { code: 500, msg: 'Error during JSON parse: ' + jpe.toString() };
            fail(cberr);
        }
    }
    // Notify listeners, if any
    for (let cb of reading[fname])
        cb(cberr, json);
    // File is ready
    reading[fname] = undefined;
}
function getJsonFile(fname) {
    return new Promise((success, fail) => {
        if (!fname.match(/^[a-zA-Z0-9\.-_]+$/))
            // Fail at invalid file name
            return fail({ code: 400, msg: 'Invalid colletion name' });
        if (files[fname])
            // File is in memory, just return its content
            return success(files[fname]);
        if (reading[fname] !== undefined)
            // File is being read: subscribe to being called when available
            return reading[fname].push((err, data) => err ? fail(err) : success(data));
        // Read the file
        reading[fname] = [];
        fs.readFile(DATA_DIR + fname + '.json', 'utf8', (err, data) => {
            handleFileRead(fname, success, fail, err, data);
        });
    });
}
setInterval(_ => {
    for (let fname of Object.keys(changed))
        fs.writeFile(DATA_DIR + fname + '.json', files[fname]);
    changed = {};
}, WRITE_DELAY);
// -------------------- Request handlng --------------------
function handleGetAll(req, res) {
    console.log(`GET - before reading ${req.params.file}`);
    getJsonFile(req.params.file)
        .then(json => {
        console.log(`GET for file ${req.params.file}`);
        res.json(json);
    })
        .catch(err => {
        console.log('Error:', err.msg);
        res.status(err.code);
        res.json({ error: err });
    });
}
function handleGetOne(req, res) {
    console.log(`GET for file "${req.params.file}.json", id "${req.params.id}"`);
    res.send('OK');
}
function handlePost(req, res) {
    getJsonFile(req.params.file)
        .then(json => {
        console.log(`POST for file ${req.params.file}`);
        json.push(req.body);
        res.json({ msg: 'ok' });
    })
        .catch(err => {
        console.log('Error:', err.msg);
        res.status(err.code);
        res.json({ error: err });
    });
}
function handlePut(req, res) {
    console.log(`PUT for file "${req.params.file}", id "${req.params.id}"`);
    res.send('OK');
}
function handleDelete(req, res) {
    console.log(`DELETE for file "${req.params.file}", id "${req.params.id}"`);
    res.send('OK');
}
// -------------------- Main --------------------
function main() {
    let app = createExpressApp();
    let route = API_ROOT + '/:file';
    app.get(route, handleGetAll);
    app.get(route + '/:id', handleGetOne);
    app.post(route, handlePost);
    app.put(route + '/:id', handlePut);
    app.delete(route + ':id', handleDelete);
    http.createServer(app).listen(PORT);
    console.log('API server ready on port ' + PORT);
}
main();
//# sourceMappingURL=server.js.map