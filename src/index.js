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

const defaultConfig = {
  port: 3002,
  portR: 3005,
  mongoPath: 'mongodb://localhost/tordoir-dev'
}

function parseConfig (config) {
  return Object.assign(
    Object.assign({}, defaultConfig),
    config
  )
}
