const router = require('express').Router()
const userRoute = require('./user')
const bookRoute = require('./book')

router.use(userRoute)
router.use(bookRoute)


module.exports = router