"use strict";
const yargs_1 = require("yargs");
const PORT = 3000;
const DATA_DIR = './';
const API_ROOT = '/api';
const REPLY_DELAY = 0;
const WRITE_DELAY = 1000;
function getConfig() {
    let config = {
        port: yargs_1.argv.port || PORT,
        dataDir: yargs_1.argv.data || DATA_DIR,
        webRoot: yargs_1.argv.static,
        apiRoot: yargs_1.argv.prefix || API_ROOT,
        replyDelay: yargs_1.argv.delay || REPLY_DELAY,
        writeDelay: yargs_1.argv['write-time'] || WRITE_DELAY,
        cors: !yargs_1.argv['disable-cors']
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
  - Time between file writes (--write-time): ${cfg.writeDelay ? cfg.writeDelay + ' ms' : 'disabled'}
  - CORS (--disable-cors): ${cfg.cors ? 'enabled' : 'disabled'}
`);
}
//# sourceMappingURL=cli.js.map