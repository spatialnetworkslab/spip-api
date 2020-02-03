export default {
  mongoPath: 'mongodb://localhost/tordoir-dev',

  jwtSettings: {
    jwksUri: 'https://spip.eu.auth0.com/.well-known/jwks.json',
    audience: 'https://spip.spatialnetworkslab.com', // this looks like a URL but is just an identifier
    issuer: `https://spip.eu.auth0.com/`
  }
}
