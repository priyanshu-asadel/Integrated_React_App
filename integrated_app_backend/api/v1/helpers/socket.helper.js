var socket = require('socket.io');
const redisAdapter = require('socket.io-redis');
const config = require("../../../config/credentials");
module.exports = {
    socketSingleton: (function() {
        this.io = null;
        this.configure = function(server) {
            this.io = socket(server);
            this.io.adapter(redisAdapter({
                host: config.redisHost,
                port: config.redisPort
            }));
        }
        return this;
    })()
}