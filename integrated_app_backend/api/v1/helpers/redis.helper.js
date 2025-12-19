var redis = require("redis");
const config = require("../../../config/credentials");
module.exports = {
    redisSingleton: (function() {
        this.redisClient = null;
        this.redisClient = redis.createClient({
			url : "redis://"+config.redisHost+":"+config.redisPort
		});
        // this.redisClient.select(10, function(err, res) {
        //     console.log("database 10");
        // });
		this.redisClient.on('ready', (err) => {
			console.log("Redis is successfully connected!!");
		});
		this.redisClient.on('error', (err) => {
			console.log("Redis Error " + err);
		});
        return this;
    })()
}