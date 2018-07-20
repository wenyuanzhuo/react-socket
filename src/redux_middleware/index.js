import { message_update, guest_update, enterName } from '../action'
//客户端同时监听服务器端消息 socket.on client -Server- client 全双工通信
function createSocketMiddleware(socket) {
  var eventFlag = false;
  return store => next => action => {
    if (!eventFlag) {
      eventFlag = true;
      var socketMethods = [ 'guest update', 'msg from server']
      for(var method of socketMethods) {
        socket.on(method, function(answer) {
          next(answer);
        });
      }
    }
    // send and save 
    socket.emit(action.type, action)
    return next(action);
  }
}

export default createSocketMiddleware
