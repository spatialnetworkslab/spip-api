import spipAPI from '../dist/spip-api.cjs.js'
import config from './config.js'

spipAPI
  .setup(config)
  .run()
