var debug = require('debug')('cpwd:server');
module.exports = {
    normalizePort: function(val) {
        var port = parseInt(val, 10);
        if (isNaN(port)) {
            // named pipe
            return val;
        }
        if (port >= 0) {
            // port number
            return port;
        }
        return false;
    },
    onError: function(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        var bind = typeof error.port === 'string' ?
            'Pipe ' + error.port :
            'Port ' + error.port;

        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    },
    onListening: function(server) {
        console.log(server);
        var addr = server.address();
        var bind = typeof addr === 'string' ?
            'pipe ' + addr :
            'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}