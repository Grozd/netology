const router = require('express').Router()
const usersController = require('../controllers/user')

router.route('/api/user/login')
.get(usersController.read)
.post(usersController.create)

module.exports = router