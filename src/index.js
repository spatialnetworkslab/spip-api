import setupApp from './setup/setupApp.js'

function setup (_config) {
  const config = parseConfig(_config)
  const app = setupApp(config)
  const port = config.port

  return {
    run () {
      const server = app.listen(port, function () {
        console.log(`SPiP server running on ${port}!`)
      })

      // http://derpturkey.com/increase-request-timeout-for-express-4/
      server.timeout = 15 * 60 * 1000
    }
  }
}

const spipAPI = { setup }

export default spipAPI

function parseConfig (config) {
  const PORT = process.env.PORT || 3002
  const HOST_R = process.env.HOST_R || 'localhost:3005'
  const HOST_MONGO = process.env.HOST_MONGO || 'localhost:27017'
  const MONGO_DB = process.env.MONGO_DB || 'spip'

  const defaultConfig = {
    port: PORT,
    hostR: HOST_R,
    mongoPath: `mongodb://${HOST_MONGO}/${MONGO_DB}`
  }

  return Object.assign(defaultConfig, config)
}
