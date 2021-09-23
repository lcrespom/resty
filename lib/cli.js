"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const PORT = process.env.PORT ? +process.env.PORT : 3000;
const DATA_DIR = './';
const API_ROOT = '/api';
const REPLY_DELAY = 0;
const WRITE_DELAY = 1000;
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).argv;
function getConfig() {
    let config = {
        port: argv.port || PORT,
        dataDir: argv.data || DATA_DIR,
        webRoot: argv.static,
        apiRoot: argv.prefix || API_ROOT,
        replyDelay: argv.delay || REPLY_DELAY,
        writeDelay: parseInt(argv['write-time'], 10) || WRITE_DELAY,
        cors: !argv['disable-cors']
    };
    if (!config.apiRoot.startsWith('/'))
        config.apiRoot = '/' + config.apiRoot;
    if (!config.dataDir.endsWith('/'))
        config.dataDir += '/';
    report(config);
    return config;
}
exports.getConfig = getConfig;
function report(cfg) {
    console.log(`
Starting REST server:
  - Port (--port): ${cfg.port}
  - Data directory (--data): ${cfg.dataDir}
  - Static content directory (--static): ${cfg.webRoot ? cfg.webRoot : 'disabled'}
  - API root (--prefix): ${cfg.apiRoot}
  - Reply delay (--delay): ${cfg.replyDelay} ms
  - Time between file writes (--write-time): ${cfg.writeDelay > 0 ? cfg.writeDelay + ' ms' : 'disabled'}
  - CORS (--disable-cors): ${cfg.cors ? 'enabled' : 'disabled'}
`);
}
