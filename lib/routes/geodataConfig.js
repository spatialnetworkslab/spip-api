import express from 'express'
import geodataConfig from '../config/geodata.js'

export const router = express.Router()

router.route('/geodataConfig')
  .get((req, res) => {
    res.json(geodataConfig)
  })
