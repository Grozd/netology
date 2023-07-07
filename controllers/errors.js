
module.exports = {
    error: function(req, res, next) {
        console.log('controller errors');
        res.status(400).json({message: 'Неправильный адрес запроса'})
    }
}