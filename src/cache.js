// levelup cache middelware for express
// specifically for (expensive) sqlite requests

import level from 'level'

const leveldb = level('./leveldb-store', { keyEncoding: 'json' })

export const leveldbCache = function (req, res, next) {
  // construct key from url and req.body (params). should always uniquely identify req
  const key = {
    url: req.originalUrl || req.url,
    params: req.body
  }
  leveldb.get(key, (err, value) => {
    if (err) {
      if (err.notFound) {
        // key not found means it is not in cache
        // we wrap the send method to insert key in cache first
        res.sendResponse = res.send
        res.send = (body) => {
          leveldb.put(key, body)
          res.sendResponse(body)
        }
        next()
      }
      // other error
      return err
    }
    // if we do not have error, it means we have the result already cached
    // send that instead of executing sql
    res.send(value)
  })
}
