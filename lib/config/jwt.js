import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'

// Authentication middleware.
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://spip.eu.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'https://spip.spatialnetworkslab.com', // this looks like a URL but is just an identifier
  issuer: `https://spip.eu.auth0.com/`,
  algorithms: ['RS256']
})

export default checkJwt
