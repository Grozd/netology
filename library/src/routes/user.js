const router = require('express').Router()
const usersController = require('../controllers/user')

router.get('/api/user/login', usersController.get_pageLogin)
router.post('/api/user/login', usersController.login)

router.get('/logout', usersController.logout)
router.get('/api/user/me', usersController.get_pageProfile)
router.post('/api/user/signup', usersController.signup)

module.exports = router