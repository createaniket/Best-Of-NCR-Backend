const express = require('express')
const router = new express.Router()

const {registerWithEmail, UserLogin} = require("../controller/usercontroller")


router.post('/signup', registerWithEmail)

router.post('/login', UserLogin)


module.exports = router