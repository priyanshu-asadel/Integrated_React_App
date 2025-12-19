var fs = require("fs");
var path = require("../../../config/credentials").uploadPath;

module.exports = () => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}