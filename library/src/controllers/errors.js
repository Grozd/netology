
module.exports = {
    error: function(req, res, next) {
        res.render('./pages/404', { message: '' })
    }
}