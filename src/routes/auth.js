import express from 'express'

export default function setupAuthRoute (app, auth) {
  const router = express.Router()

  router.route('/auth').get((req, res) => {
    if (auth) {
      res.send(auth.frontend)
    }

    if (!auth) {
      res.send(null)
    }
  })

  app.use('/api/', router)
}
