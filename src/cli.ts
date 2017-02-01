import { argv } from 'yargs';

const PORT = 3000;
const DATA_DIR = './';
const API_ROOT = '/api';
const REPLY_DELAY = 0;
const WRITE_DELAY = 1000;


export function getConfig() {
	let config = {
		port: argv.port || PORT,
		dataDir: argv.data || DATA_DIR,
		apiRoot: argv.prefix || API_ROOT,
		replyDelay: argv.delay || REPLY_DELAY,
		writeDelay: argv['write-time'] || WRITE_DELAY
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
  - API root (--prefix): ${cfg.apiRoot}
  - Reply delay (--delay): ${cfg.replyDelay} ms
  - Time between file writes (--write-time): ${cfg.writeDelay ? cfg.writeDelay + ' ms' : 'disabled'}
`);
}
