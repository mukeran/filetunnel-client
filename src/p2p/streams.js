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
  return new Transform({ transform })
}

export function getProgress (total, cb) {
  let speeder = speedometer()
  let transferred = 0
  let timeout = null
  return (data) => {
    transferred += data.length
    const speed = speeder(data.length)
    if (timeout !== null) return
    timeout = setTimeout(() => {
      timeout = null
    }, 1000)
    cb(null, { transferred, total, speed })
  }
}
