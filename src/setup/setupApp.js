import express from 'express'
import timeout from 'connect-timeout'
// import morgan from 'morgan'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import history from 'connect-history-api-fallback'
import cors from 'cors'

import setupMongoose from './setupMongoose.js'
import setupJwt from './setupJwt.js'

import setupAuthRoute from '../routes/auth.js'

import clusterSets from '../routes/clusterSets.js'
import masks from '../routes/masks.js'
import savedSets from '../routes/savedSets.js'
import edges from '../routes/edges.js'
import nodes from '../routes/nodes.js'
import model from '../routes/model.js'
import configFrontend from '../routes/configFrontend.js'

export default function setupApp (config) {
  const app = express()
  app.use(cors())

  app.use(helmet()) // helmet sets a number of security based middlewares
  // app.use(morgan('dev')) // morgan for logging
  app.use(cookieParser())
  app.use(bodyParser.json({ limit: '50mb', parameterLimit: 25000 }))
  app.use(bodyParser.urlencoded({ limit: '50mb', parameterLimit: 25000, extended: true }))
  app.disable('etag')

  setupRoutes(app, config)

  app.use('/', history(), express.static(path.join(__dirname, '../dist')))

  return app
}

function setupRoutes (app, { auth, hostR, mongoPath, datasetDescriptions, frontendConfig }) {
  setupAuthRoute(app, auth)

  const mongoose = setupMongoose(mongoPath)
  const setRoute = createSetRoute(app, auth)

  setRoute(clusterSets(mongoose))
  setRoute(masks(mongoose))
  setRoute(savedSets(mongoose))
  setRoute(edges(datasetDescriptions.edges))
  setRoute(nodes(datasetDescriptions.nodes))
  setRoute(model(hostR))
  setRoute(timeout('15m'), haltOnTimedout, model(hostR))
  setRoute(configFrontend(frontendConfig))
}

function createSetRoute (app, auth) {
  if (auth) {
    const checkJwt = setupJwt(auth.backend)
    return (...otherArgs) => { app.use('/api/', checkJwt, ...otherArgs) }
  }

  if (!auth) return (...otherArgs) => { app.use('/api/', ...otherArgs) }
}

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}
