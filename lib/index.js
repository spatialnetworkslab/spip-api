import setupApp from './setup/setupApp.js'

function setup (config) {
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
