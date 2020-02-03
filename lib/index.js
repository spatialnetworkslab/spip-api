import express from 'express'
import timeout from 'connect-timeout'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import history from 'connect-history-api-fallback'
import * as yargs from 'yargs'

import setupMongo from './setupMongo.js'
import setupJwt from './setupJwt.js'

import * as clusterSets from './routes/clusterSets.js'
import * as masks from './routes/masks.js'
import * as edges from './routes/edges.js'
import * as nodes from './routes/nodes.js'
import * as model from './routes/model.js'
import * as savedSets from './routes/savedSets.js'

function setup ({ mongoPath, jwtSettings }) {
  const mongo = setupMongo(mongoPath)
  const checkJwt = setupJwt(jwtSettings)

  const argv = yargs
    .option('p', {
      alias: 'port',
      demandOption: false,
      default: 3002,
      describe: 'port to run node server on',
      type: 'number'
    })
    .argv

  const app = express()
  
  app.use(helmet()) // helmet sets a number of security based middlewares
  app.use(morgan('dev')) // morgan for logging
  app.use(cookieParser())
  app.use(bodyParser.json({limit: '50mb', parameterLimit: 25000}))
  app.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 25000, extended: true}))
  // app.use(history())
  // app.use(checkJwt) // this enforces authentication. disable if needed for testing
  app.disable('etag')

  app.use('/api/', checkJwt, clusterSets.router)
  app.use('/api/', checkJwt, masks.router)
  app.use('/api/', checkJwt, edges.router)
  app.use('/api/', checkJwt, nodes.router)
  app.use('/api/', checkJwt, model.router)
  app.use('/api/', checkJwt, savedSets.router)
  app.use('/api/', checkJwt, timeout('15m'), haltOnTimedout, model.router)

  // Comment above stuff out and comment below stuff in for offline testing
  // app.use('/api/', clusterSets.router)
  // app.use('/api/', masks.router)
  // app.use('/api/', edges.router)
  // app.use('/api/', nodes.router)
  // app.use('/api/', model.router)
  // app.use('/api/', savedSets.router)
  // app.use('/api/', timeout('15m'), haltOnTimedout, model.router)

  app.use('/', history(), express.static(path.join(__dirname, '../dist')))

  return {
    run () {
      const server = app.listen(argv.port, function () {
        console.log(`SPiP server running on ${argv.port}!`)
      })
    
      // http://derpturkey.com/increase-request-timeout-for-express-4/
      server.timeout = 15 * 60 * 1000
    }
  }
}

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

const spipAPI = { setup }

export default spipAPI