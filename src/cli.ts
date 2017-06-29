import { argv } from 'yargs';

const PORT = process.env.PORT || 3000;
const DATA_DIR = './';
const API_ROOT = '/api';
const REPLY_DELAY = 0;
const WRITE_DELAY = 1000;


export function getConfig() {
	let config = {
		port: argv.port || PORT,
		dataDir: argv.data || DATA_DIR,
		webRoot: argv.static,
		apiRoot: argv.prefix || API_ROOT,
		replyDelay: argv.delay || REPLY_DELAY,
		writeDelay: argv['write-time'] || WRITE_DELAY,
		cors: !argv['disable-cors']
	};
	if (!config.apiRoot.startsWith('/'))
		config.apiRoot = '/' + config.apiRoot;
	if (!config.dataDir.endsWith('/'))
		config.dataDir += '/';
	report(config);
	return config;
}

function report(cfg) {
	console.log(`
Starting REST server:
  - Port (--port): ${cfg.port}
  - Data directory (--data): ${cfg.dataDir}
  - Static content directory (--static): ${cfg.webRoot ? cfg.webRoot : 'disabled' }
  - API root (--prefix): ${cfg.apiRoot}
  - Reply delay (--delay): ${cfg.replyDelay} ms
  - Time between file writes (--write-time): ${cfg.writeDelay ? cfg.writeDelay + ' ms' : 'disabled'}
  - CORS (--disable-cors): ${cfg.cors ? 'enabled' : 'disabled'}
`);
}
