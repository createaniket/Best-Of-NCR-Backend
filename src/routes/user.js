const express = require('express')
const router = new express.Router()

const {registerWithEmail, UserLogin, googleLogin} = require("../controller/usercontroller")


router.post('/signup', registerWithEmail)

router.post('/login', UserLogin)

router.post('/google-login', googleLogin)



module.exports = router