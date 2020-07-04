import ElementUI from 'element-ui'

let messageQueue = []

let timeout = null

function next () {
  if (messageQueue.length === 0) return
  messageQueue[0]()
  messageQueue = messageQueue.slice(1)
  timeout = setTimeout(() => { timeout = null; next() }, 100)
}

function push (type, message) {
  messageQueue.push(() => ElementUI.Message({
    showClose: true,
    message,
    type
  }))
  if (timeout === null) next()
}

function success (message) {
  push('success', message)
}

function error (message) {
  push('error', message)
}

function warning (message) {
  push('warning', message)
}

function info (message) {
  push('info', message)
}

export default {
  success,
  error,
  warning,
  info
}
