module.exports = {
    home: function(req, res) {
        res.status(200).json({
            "msg": "success",
            "data": "APIs Vesrion 1.0.0 (Integrated app)"
        });
    }
}