const router = require('express').Router()
const userRoute = require('./user')
const bookRoute = require('./book')
const counterRoute = require('./counter')

router.use(userRoute)
router.use(bookRoute)
router.use(counterRoute)


module.exports = router