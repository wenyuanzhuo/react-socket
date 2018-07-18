var koa = require('koa');
var parse = require('co-body');
var route = require('koa-route');
var views = require('co-views');
var webpack = require('webpack');
var webpackDev = require('koa-webpack-dev-middleware');
var webpackConf = require('./webpack.config.js');
var compiler = webpack(webpackConf);
var serve = require('koa-static');
var app = new koa();

var render = views('./src', {
  ext: 'ejs'
});

var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

var cache = {
  nameList: {},
  nameListActive: new Set([]),
  msgList: [],
};

io.on('connection', function(socket) {//监听客户端连接
  socket.on('MSG_UPDATE', function(data) {
    socket.broadcast.emit('msg from server', {
      type: 'MSG_UPDATE',
      msg: data.msg
    });//给自己以外的客户端发送消息
    cache.msgList.push(data.msg);
    if (cache.msgList.length >= 100) {
      cache.msgList.shift();
    }
  }); 
  socket.on('disconnect', function() {
    cache.nameListActive.delete(socket.nickname);
    io.emit('guest update',{
      type: 'GUEST_UPDATE',
      nameList: [...cache.nameListActive]
    });
    socket.broadcast.emit('msg from server', {
      type: 'MSG_UPDATE',
      msg: {leaveName:socket.nickname}
    })
  });
  socket.on('NICKNAME_GET', function(data) {
    cache.nameListActive.add(data.nickName);
    cache.nameList[data.nickName] = true;
    socket.nickname = data.nickname;
    io.emit('guest update',{
      type: 'GUEST_UPDATE',
      nameList: [...cache.nameListActive]
    });
  });
  socket.on('NICKNAME_FORGET', function(data) {
    cache.nameListActive.delete(data.nickName.leaveName);
    delete cache.nameList[data.nickName.leaveName];
    socket.nickname = undefined;
    cache.msgList.push(data.nickName)
    io.emit('guest update',{
      type: 'GUEST_UPDATE',
      nameList: [...cache.nameListActive]
    });
    socket.broadcast.emit('msg from server', {
      type: 'MSG_UPDATE',
      msg: data.nickName
    })
  });
});

app.use(webpackDev(compiler, {
  contentBase: webpackConf.output.path,
  publicPath: webpackConf.output.publicPath,
  hot: false
}));

app.use(route.get('/', function*() {
  this.body = yield render('index', {});
}));

app.use(route.post('/api/nickname', function*() {
  var rawBody = yield parse(this, {});
  if (!(rawBody in cache.nameList)) {
    this.body = JSON.stringify({
      legal: 'yes'
    });
  } else {
    this.body = JSON.stringify({
      legal: 'repeat'
    });
  }
}));

app.use(route.post('/api/logout', function*() {
  var deleteNickName = yield parse(this, {})
  var nick = new Buffer(deleteNickName, 'base64').toString();
  cache.nameListActive.delete(nick);
  cache.msgList = []
  delete cache.nameList[nick];
  this.body = '';
}));

server.listen(process.env.PORT || 5000, function() {
  console.log('listening');
});

server.on('error', err => {
  console.log('error --> ', err.message);
  process.exit(1);
});
