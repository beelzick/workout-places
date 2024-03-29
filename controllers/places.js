const Place = require('../models/place.js')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, res, next) => {
    const places = await Place.find({})
    res.render('places/index', { places })
}
module.exports.renderNewForm = (req, res, next) => {
    res.render('places/new')
}
module.exports.createPlace = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.place.location,
        limit: 1
    }).send()
    const place = await new Place(req.body.place)
    place.geometry = geoData.body.features[0].geometry
    place.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    place.author = req.user._id
    await place.save()
    req.flash('success', 'Successfully made a new place')
    res.redirect(`/places/${place._id}`)
}
module.exports.showPlace = async (req, res, next) => {
    const place = await Place.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!place) {
        req.flash('error', 'Cannot find that place!')
        return res.redirect('/places')
    }
    res.render('places/show', { place })
}
module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params
    const place = await Place.findById(id)
    if (!place) {
        req.flash('error', 'Cannot find that place!')
        return res.redirect('/places')
    }
    res.render('places/edit', { place })
}
module.exports.updatePlace = async (req, res, next) => {
    const { id } = req.params
    console.log(req.body)
    const place = await Place.findByIdAndUpdate(id, req.body.place, { runValidators: true, new: true })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    place.images.push(...imgs)
    await place.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename)
        }
        await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated place')
    res.redirect(`/places/${place._id}`)
}
module.exports.deletePlace = async (req, res, next) => {
    await Place.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted place')
    res.redirect('/places')
}