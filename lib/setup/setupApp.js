export default function setupApp () {
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

  app.use('/api/', checkJwt, clusterSets(mongoose))
  app.use('/api/', checkJwt, masks(mongoose))
  app.use('/api/', checkJwt, savedSets(mongoose))

  app.use('/api/', checkJwt, edges.router)
  app.use('/api/', checkJwt, nodes.router)
  app.use('/api/', checkJwt, model.router)
  app.use('/api/', checkJwt, timeout('15m'), haltOnTimedout, model.router)

  // Comment above stuff out and comment below stuff in for offline testing
  // app.use('/api/', clusterSets.router)
  // app.use('/api/', masks.router)
  // app.use('/api/', savedSets.router)
  // app.use('/api/', edges.router)
  // app.use('/api/', nodes.router)
  // app.use('/api/', model.router)
  // app.use('/api/', timeout('15m'), haltOnTimedout, model.router)

  app.use('/', history(), express.static(path.join(__dirname, '../dist')))
}