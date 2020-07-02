/**
 * stream utils
 */
const { Transform } = require('stream')
const speedometer = require('speedometer')

export function IVInserter (iv) {
  let inserted = false
  let transform = (chunk, encoding, callback) => {
    if (!inserted) {
      inserted = true
      chunk = Buffer.concat([iv, chunk])
    }
    callback(null, chunk)
  }
  let tr = new Transform({ transform })
  return tr
}

export function getProgresser (total, cb) {
  let speeder = speedometer()
  let transferred = 0
  let onData = (data) => {
    transferred += data.length
    var speed = speeder(data.length)
    cb(null, { transferred, total, speed })
  }
  return onData
}

// module.exports = { IVInserter, recvProgresser, sendProgresser }
