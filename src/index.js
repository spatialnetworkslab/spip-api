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
  const defaultConfig = {
    port: 3002,
    portR: 3005,
    mongoPath: 'mongodb://mongo/spip'
  }

  return Object.assign(defaultConfig, config)
}
