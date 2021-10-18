const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/wrapAsync')
const places = require('../controllers/places')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })
const { isLoggedIn, isAuthor, validatePlace } = require('../middleware')

router.route('/')
    .get(wrapAsync(places.index))
    .post(isLoggedIn, upload.array('image'), validatePlace, wrapAsync(places.createPlace)) //upload can't be before validation- change it

router.get('/new', isLoggedIn, places.renderNewForm)

router.route('/:id')
    .get(wrapAsync(places.showPlace))
    .put(isLoggedIn, isAuthor, upload.array('image'), validatePlace, wrapAsync(places.updatePlace))
    .delete(isLoggedIn, isAuthor, wrapAsync(places.deletePlace))

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(places.renderEditForm))

module.exports = router