import express from 'express'

export default function configFrontend (frontendConfig) {
  const router = express.Router()

  router.route('/config').get((req, res) => {
    res.send(frontendConfig)
  })

  return router
}
