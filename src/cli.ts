import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

type Config = {
	port: number
	dataDir: string
	webRoot: string
	apiRoot: string
	replyDelay: number
	writeDelay: number
	cors: boolean
}

type ArgvConfig = {
	port: number
	data: string
	static: string
	prefix: string
	delay: number
	'write-time': string
	'disable-cors': boolean
}

const PORT = process.env.PORT ? +process.env.PORT : 3000
const DATA_DIR = './'
const API_ROOT = '/api'
const REPLY_DELAY = 0
const WRITE_DELAY = 1000

const argv = yargs(hideBin(process.argv)).argv as unknown as ArgvConfig

export function getConfig() {
	let config: Config = {
		port: argv.port || PORT,
		dataDir: argv.data || DATA_DIR,
		webRoot: argv.static,
		apiRoot: argv.prefix || API_ROOT,
		replyDelay: argv.delay || REPLY_DELAY,
		writeDelay: parseInt(argv['write-time'], 10) || WRITE_DELAY,
		cors: !argv['disable-cors']
	}
	if (!config.apiRoot.startsWith('/'))
		config.apiRoot = '/' + config.apiRoot
	if (!config.dataDir.endsWith('/'))
		config.dataDir += '/'
	report(config)
	return config
}

function report(cfg: Config) {
	console.log(`
Starting REST server:
  - Port (--port): ${cfg.port}
  - Data directory (--data): ${cfg.dataDir}
  - Static content directory (--static): ${cfg.webRoot ? cfg.webRoot : 'disabled' }
  - API root (--prefix): ${cfg.apiRoot}
  - Reply delay (--delay): ${cfg.replyDelay} ms
  - Time between file writes (--write-time): ${cfg.writeDelay > 0 ? cfg.writeDelay + ' ms' : 'disabled'}
  - CORS (--disable-cors): ${cfg.cors ? 'enabled' : 'disabled'}
`)
}
