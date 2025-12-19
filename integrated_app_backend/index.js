const express = require('express');
var https = require('https');
var fs = require("fs");
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
var bootstrap = require("./api/v1/middlewares/bootstrap");
var error = require("./api/v1/middlewares/error");
var helper = require("./api/v1/helpers/server.helper");
var headers = require("./api/v1/middlewares/headers");
var uploads = require("./api/v1/tasks/upload.task");
var indexRouter = require('./api/v1/routes/index.route');
var { socketSingleton } = require("./api/v1/helpers/socket.helper");
var socketRouter = require("./api/v1/routes/socket.route");
var { redisSingleton } = require("./api/v1/helpers/redis.helper");
var pingCamera = require('./api/v1/helpers/ping.helper');

dotenv.config();

const app = express();

bootstrap(app);
headers(app);
uploads();



app.use(cors());
app.use(express.json());

app.use('/api', indexRouter);

error(app);

const port = helper.normalizePort(process.env.PORT || 3000);
const ip = 'localhost';

app.set('port', port);

var server = http.createServer({
  key: fs.readFileSync('./config/encryption/domain.key'),
  cert: fs.readFileSync('./config/encryption/domain.crt')
}, app);

socketSingleton.configure(server);

server.listen(port, ip, function() {
  console.log('app is running at : http://' + ip + ":" + port);
});

server.on('error', helper.onError);

socketRouter.connection(socketSingleton.io);
redisSingleton.redisClient.subscribe("msg");

setInterval(()=>{
	pingCamera.pingCam(io);
},60000);


module.exports = app;
