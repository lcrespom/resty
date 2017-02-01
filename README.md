# Resty
A small, zero-config, file-based REST API database, useful for testing client applications.

## Usage
Start the server with `npm start` and send HTTP requests to it. Data is stored in JSON files, one file per path. For example, all requests to `/api/users` will read and update from users.json.

### REST API
- `GET /api/route`: Returns all elements in the JSON file specified by the route.
- `POST /api/route`: Adds an element at the end of the JSON file specified by the route. If not present, adds an `_id` property with a unique value, useful for GET/PUT/Delete operations.
- `PUT /api/route/id`: Updates the element identified by `id`.
- `DELETE /api/route/id`: Removes the element identified by `id`.
- `GET /api/route/id`: Returns a single element identified by `id`.

## Command-line parameters
- `--port`: HTTP port to be used.
- `--data`: directory used to store JSON files. Defaults to working directory.
- `--prefix`: API prefix. Defaults to /api.
- `--delay`: response delay in milliseconds. Defaults to 0.
- `--write-time`: interval between file updates in milliseconds. Defaults to 1000. If set to 0, data will not be written to file.
