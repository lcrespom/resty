# Resty
A small, zero-config, file-based REST API database, useful for testing client applications.

## Install
- **Global install**: `npm install resty -g` _(and prefix `sudo` if required)_
- **Local install**: `npm install resty --save-dev`

## Usage
If you installed it globally, just type `resty` and pass any command-line parameter (see below). If you installed it locally, type `node_modules/.bin/resty`.

Data is stored in JSON files, one file per path. For example, all requests to `/api/users` will read and update from users.json.

### Usage example
1. Start server, storing files in the `json` directory: `resty --data json`.
2. Add a record from the command line: `curl http://localhost:3000/api/users -H "Content-Type: application/json" -d '{ "name": "Luis", "password": "mypw" }' -X POST`
3. Query all records from the command line: `curl http://localhost:3000/api/users`

### REST API
- `GET /api/route`: Returns all elements in the JSON file specified by the route.
- `POST /api/route`: Adds an element at the end of the JSON file specified by the route. If not present, adds an `_id` property with a unique value, useful for GET/PUT/Delete operations.
- `PUT /api/route/id`: Updates the element identified by `id`.
- `DELETE /api/route/id`: Removes the element identified by `id`.
- `GET /api/route/id`: Returns a single element identified by `id`.

### Command-line parameters
- `--port`: HTTP port to be used. Defaults to 3000.
- `--data`: directory used to store JSON files. Defaults to working directory.
- `--prefix`: API prefix. Defaults to /api.
- `--static`: directory used for static content. Disabled by default.
- `--delay`: response delay in milliseconds. Defaults to 0.
- `--write-time`: interval between file updates in milliseconds. Defaults to 1000. If set to 0, data will not be written to file.
- `--disable-cors`: enable/disable CORS. It is enabled by default, so that requests can be sent from pages served from any host or port.
