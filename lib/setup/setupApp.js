import express from 'express'
import timeout from 'connect-timeout'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import history from 'connect-history-api-fallback'

import setupMongoose from './setupMongoose.js'
import setupJwt from './setupJwt.js'

import clusterSets from '../routes/clusterSets.js'
import masks from '../routes/masks.js'
import savedSets from '../routes/savedSets.js'

import edges from '../routes/edges.js'
import nodes from '../routes/nodes.js'

import * as model from '../routes/model.js'

export default function setupApp ({ mongoPath, enableJwt, jwtSettings, datasetDescriptions }) {
  const mongoose = setupMongoose(mongoPath)
  const checkJwt = jwtSettings ? setupJwt(jwtSettings) : undefined

  const app = express()

  app.use(helmet()) // helmet sets a number of security based middlewares
  app.use(morgan('dev')) // morgan for logging
  app.use(cookieParser())
  app.use(bodyParser.json({ limit: '50mb', parameterLimit: 25000 }))
  app.use(bodyParser.urlencoded({ limit: '50mb', parameterLimit: 25000, extended: true }))
  app.disable('etag')

  setupRoutes(app, checkJwt, mongoose, datasetDescriptions)

  app.use('/', history(), express.static(path.join(__dirname, '../dist')))

  return app
}

function setupRoutes (app, checkJwt, mongoose, datasetDescriptions) {
  app.use(...routeArgs(checkJwt, clusterSets(mongoose)))
  app.use(...routeArgs(checkJwt, masks(mongoose)))
  app.use(...routeArgs(checkJwt, savedSets(mongoose)))

  app.use(...routeArgs(checkJwt, edges(datasetDescriptions.edges)))
  app.use(...routeArgs(checkJwt, nodes(datasetDescriptions.nodes)))

  app.use(...routeArgs(checkJwt, model.router))
  app.use(...routeArgs(checkJwt, timeout('15m'), haltOnTimedout, model.router))
}

function routeArgs (checkJwt, ...otherArgs) {
  // checkJwt is undefined if the user did not provide jwt-settings.
  // If the user did not provide jwt-settings, security will be disabled.
  if (checkJwt !== undefined) {
    return ['/api/', checkJwt, ...otherArgs]
  }

  if (checkJwt === undefined) {
    return ['/api/', ...otherArgs]
  }
}

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}
