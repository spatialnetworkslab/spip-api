export default {
  port: 3002,

  mongoPath: 'mongodb://localhost/tordoir-dev',

  enableJwt: true,

  jwtSettings: {
    jwksUri: 'https://spip.eu.auth0.com/.well-known/jwks.json',
    audience: 'https://spip.spatialnetworkslab.com', // this looks like a URL but is just an identifier
    issuer: 'https://spip.eu.auth0.com/'
  }
}
