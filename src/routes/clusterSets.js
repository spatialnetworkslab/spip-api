import express from 'express'

export default function clusterSets (mongoose) {
  const ClusterSet = mongoose.model('ClusterSet', new mongoose.Schema({
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

  const router = express.Router()

  router.route('/clusterSet')
    // get list of all sets for this user
    .get(function (req, res, next) {
      ClusterSet.find({
        creator: req.user.sub
      })
        .sort('-updated')
        .select('_id name data.spatialUnits data.added data.mode data.description')
        .exec(function (err, list) {
          if (err) throw err
          res.send(list)
        })
    })
    // post new cluster set
    .post(function (req, res, next) {
      console.log(req.body)
      const incomingSet = req.body
      const set = new ClusterSet({
        name: incomingSet.name,
        data: incomingSet.data,
        creator: req.user.sub
      })
      set.save(function (err) {
        if (err) {
          console.log(err)
        } else {
          res.send(set._id)
        }
      })
    })

  router.route('/clusterSet/:serverID')
    // get cluster set
    .get(function (req, res, next) {
      ClusterSet.findById(req.params.serverID, function (err, set) {
        if (err) throw err
        res.send(set)
      })
    })
    // update already existing cluster set
    .put(function (req, res, next) {
      var incomingSet = req.body
      ClusterSet.findByIdAndUpdate(req.params.serverID, {
        $set: {
          data: incomingSet.data,
          updated: new Date()
        }
      }, function (err, set) {
        if (err) return console.log(err)
        res.send(set._id)
      })
    })
    // remove cluster set
    .delete(function (req, res, next) {
      ClusterSet.findByIdAndRemove(req.params.serverID, function (err, set) {
        if (err) return console.log(err)
        res.send('done')
      })
    })

  return router
}
