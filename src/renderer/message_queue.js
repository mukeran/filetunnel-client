/**
 * 解决 ElementUI Message 显示重叠的 bug (通过引入一个队列，每 100ms 进行一次执行)
 */
import ElementUI from 'element-ui'

let messageQueue = []

let timeout = null

function next () {
  if (messageQueue.length === 0) return
  const cb = messageQueue[0]
  messageQueue = messageQueue.slice(1)
  cb()
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
