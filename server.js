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
  socket.on('msg from client', function(data) {
    socket.broadcast.emit('msg from server', data);//给自己以外的客户端发送消息
    cache.msgList.push(data);
    if (cache.msgList.length >= 100) {
      cache.msgList.shift();
    }
  });
  socket.on('disconnect', function() {
    cache.nameListActive.delete(socket.nickname);
    io.emit('guest update',
      [...cache.nameListActive]
    );
    socket.broadcast.emit('msg from server', {leaveName:socket.nickname})
  });
  socket.on('guest come', function(data) {
    cache.nameListActive.add(data);
    cache.nameList[data] = true;
    socket.nickname = data;
    io.emit('guest update',
      [...cache.nameListActive]
    );
  });
  socket.on('guest leave', function(data) {
    cache.nameListActive.delete(data.leaveName);
    delete cache.nameList[data.leaveName];
    socket.nickname = undefined;
    cache.msgList.push(data)
    io.emit('guest update',
      [...cache.nameListActive]
    );
    socket.broadcast.emit('msg from server', data)
  });
  // socket.on('heart beat', function() {
  //   if (socket.nickname != undefined) {
  //     cache.nameList[socket.nickname] = 7200000;
  //   }
  // });
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
    // var body = new Buffer(rawBody).toString('base64');
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
