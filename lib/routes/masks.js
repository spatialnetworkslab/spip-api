import express from 'express'

import {mongoose} from '../config/db.js'

let MaskModel = mongoose.model('MaskModel', new mongoose.Schema({
  name: {
    type: 'string',
    required: true
  },
  data: {
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

router.route('/masks')
  .get(function (req, res, next) {
    MaskModel.find({
      creator: req.user.sub
    })
      .sort('-updated')
      .select('_id name data.spatialUnits data.added data.description')
      .exec(function (err, list) {
        if (err) throw err
        res.send(list)
      })
  })
  .post(function (req, res, next) {
    let incomingMask = req.body
    let mask = new MaskModel({
      name: incomingMask.name,
      data: incomingMask.data,
      creator: req.user.sub
    })
    mask.save(function (err) {
      if (err) {
        console.log(err)
      } else {
        res.send(mask._id)
      }
    })
  })

router.route('/masks/:maskID')
  .get(function (req, res, next) {
    MaskModel.findById(req.params.maskID, function (err, mask) {
      if (err) throw err
      res.send(mask)
    })
  })
  .delete(function (req, res, next) {
    MaskModel.findByIdAndRemove(req.params.maskID, (err, m) => {
      if (err) throw err
      res.send('ok')
    })
  })
