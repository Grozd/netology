const router = require('express').Router()
const usersController = require('../controllers/user')
//const { check } = require('express-validator')

router.get('/api/user/login', usersController.get_pageLogin)
router.post('/api/user/login', usersController.login,  (req, res) => {
    res.redirect('/')
})

router.get('/logout', usersController.logout)
router.get('/api/user/me', usersController.get_pageProfile)
router.post('/api/user/signup', usersController.signup)

module.exports = router