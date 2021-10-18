require('dotenv').config()
const mongoose = require('mongoose')
const Place = require('../models/place')
const cities = require('./cities_pl.json')
const { places, descriptors } = require('./seedInitiators')
const dbUrl = process.env.DB_URL
const  gyms  = require('./gyms')
cities.forEach((element) => {
    element.lat = parseFloat(element.lat)
    element.lng = parseFloat(element.lng)
    element.population = parseFloat(element.population)
    element.population_proper = parseFloat(element.population_proper)
})

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

const randArrEl = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Place.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random433 = Math.floor(Math.random() * 433)
        const entryPrice = Math.floor(Math.random() * 30) + 5
        const place = new Place({
            author: '616ddd873f3861399c61d8f1',
            location: `${cities[random433].city}, ${cities[random433].admin_name}`,
            name: `${randArrEl(descriptors)} ${randArrEl(places)}`,
            images: [
                {
                    url: gyms[i],
                    filename: gyms[i].slice(89, 94)
                },
                {
                    url: gyms[i + 1],
                    filename: gyms[i + 1].slice(89, 94)
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium, dolorum. In voluptates ipsum, quidem culpa animi facilis beatae. Tenetur doloribus minima repellat cupiditate sunt adipisci incidunt libero molestias rem veritatis?',
            entry: entryPrice,
            geometry: {
                type: 'Point',
                coordinates: [`${cities[random433].lng}`, `${cities[random433].lat}`]
            }
        })
        await place.save()
    }
}
seedDB().then(() => {
    mongoose.connection.close()
})