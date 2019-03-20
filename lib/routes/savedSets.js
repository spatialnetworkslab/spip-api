import express from 'express'
import {mongoose} from '../config/db.js'

let SavedSet = mongoose.model('SavedSet', new mongoose.Schema({
  name: {
    type: 'string',
    required: true
  },
  object: {
    type: 'string',
    required: true
  },
  layer: {
    type: 'Object',
    required: true
  },
  creator: {
    type: 'string',
    require: true
  },
  updated: {
    type: Date,
    default: Date.now
  },
  public: Boolean
}))

export const router = express.Router()

router.route('/savedSets/:object')
  .get(function (req, res, next) {
    SavedSet.find({
      creator: req.user.sub,
      object: req.params.object
    })
      .sort('-updated')
      .select('_id name layer.spatialUnits layer.cluster layer.mask layer.description layer.source')
      .exec(function (err, list) {
        if (err) throw err
        res.send(list)
      })
  })
  .post(function (req, res, next) {
    let incomingLayer = req.body
    let layer = new SavedSet({
      name: incomingLayer.name,
      object: req.params.object,
      layer: incomingLayer.layer,
      creator: req.user.sub
    })
    layer.save(function (err) {
      if (err) {
        console.log(err)
      } else {
        res.send(layer._id)
      }
    })
  })

router.route('/savedSets/:type/:layerID')
  .get(function (req, res, next) {
    SavedSet.findById(req.params.layerID, function (err, layer) {
      if (err) throw err
      res.send(layer)
    })
  })
  .delete(function (req, res, next) {
    SavedSet.findByIdAndRemove(req.params.layerID, (err, l) => {
      if (err) throw err
      res.send('ok')
    })
  })
