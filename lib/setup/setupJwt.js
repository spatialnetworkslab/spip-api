import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'

// Authentication middleware.
export default function setupJwt ({ jwksUri, audience, issues }) {
  const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri
    }),
  
    // Validate the audience and the issuer.
    audience,
    issuer,
    algorithms: ['RS256']
  })
  
  return checkJwt
}
