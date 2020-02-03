import mongoose from 'mongoose'

export default function setupMongoose (mongoPath) {
  mongoose.Promise = global.Promise
  mongoose.connect(mongoPath, { useNewUrlParser: true })

  return mongoose
}