import express from 'express'
import httpProxy from 'http-proxy'

export default function model (portR) {
  // location of R server
  // set up with env vars later
  const proxy = httpProxy.createProxyServer({
    target: {
      host: 'localhost',
      port: portR
    },
    proxyTimeout: 900000 // 15 minutes
  })

  proxy.on('error', function (e) {
    console.log('Error connecting')
    console.log(e)
  })

  proxy.on('proxyReq', function (proxyReq, req, res, options) {
    if (req.body) {
      const bodyData = JSON.stringify(req.body)
      // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
      proxyReq.setHeader('Content-Type', 'application/json')
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
      // stream the content
      proxyReq.write(bodyData)
    }
  })

  const router = express.Router()

  router.route('/model')
    .all(function (req, res, next) {
      proxy.web(req, res)
    })

  return router
}
