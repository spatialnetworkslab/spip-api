import mongoose from 'mongoose'

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/tordoir-dev', { useNewUrlParser: true })

export {mongoose}
