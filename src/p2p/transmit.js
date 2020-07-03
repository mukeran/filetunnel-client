/**
 * 发送中转文件的具体流程
 * 已经返回了一个 transmitId
 * 1. transmit('0\n'+transmitId+'\n')
 * .then(packet)
 * packet.data = transmit ready
 * 开始 transmit 文件
 *
 * 整体封装成一个大函数
 *
 *  let socket = createConnection(config.HOST, config.DATA_PORT)
 *  socket.write('0\n'+transmitId+'\n')
 * .then(transmitready)
 *    transmit(socket, uid, targetUid, deadline, filePath, size, sha1)
 */

/* transmit(socket, uid, targetUid, deadline, filePath, size, sha1) */
export function connect (socket) {
}
