const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema
const imageSchema = new Schema({
        url: String,
        filename: String
})
imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
})
const opts = { toJSON: { virtuals: true } };
const placeSchema = new Schema({
    name: String,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    images: [imageSchema],
    entry: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)
placeSchema.virtual('properties.popUpText').get(function(){
    return `<strong><a href="/places/${this._id}">${this.name}</a></strong>
    <p>${this.description.substring(0,30)}...</p>`
})

placeSchema.post('findOneAndDelete', async function (place) {
    if (place.reviews.length) {
        await Review.deleteMany({
            _id: {
                $in: place.reviews
            }
        })

    }
})

module.exports = mongoose.model('Place', placeSchema)