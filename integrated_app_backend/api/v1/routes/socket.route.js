module.exports = {
    connection: function(io) {
        io.sockets.on("connection", function(socket) {
            //console.log("connected, count : ", io.engine.clientsCount);
            socket.emit('connected', {
                connected: true,
                socketId: socket.id
            });
            socket.on("msg", function(data) {
                console.log(data);
            });
            // disconnect
            socket.on("disconnect", function() {
                console.log("disconnected");
            });
        });
    }
}