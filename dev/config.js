import edges from './dataset-descriptions/edges'
import nodes from './dataset-descriptions/nodes'

export default {
  port: 3002,
  portR: 3005,

  mongoPath: 'mongodb://localhost/tordoir-dev',

  jwtSettings: {
    jwksUri: 'https://spip.eu.auth0.com/.well-known/jwks.json',
    audience: 'https://spip.spatialnetworkslab.com', // this looks like a URL but is just an identifier
    issuer: 'https://spip.eu.auth0.com/'
  },

  datasetDescriptions: {
    edges,
    nodes
  }
}
