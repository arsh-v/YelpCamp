const path = require('path');
const mongoose = require('mongoose');
const campground = require('../models/campground');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true, 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 2000; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // your user id
            author: '62b0a1f1c67596980a66e54a',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae, adipisci enim voluptates nihil at cupiditate dolorem asperiores amet, nesciunt, laborum ducimus obcaecati! Dignissimos exercitationem praesentium assumenda vitae! Veniam, veritatis debitis?',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dhotp2ie1/image/upload/v1655813088/Yelpcamp/ask5veqfzoaovnal2hfu.jpg',
                    filename: 'Yelpcamp/ask5veqfzoaovnal2hfu'
                },
                {
                    url: 'https://res.cloudinary.com/dhotp2ie1/image/upload/v1655813088/Yelpcamp/kprwnuptolr3ahaahnai.jpg',
                    filename: 'Yelpcamp/kprwnuptolr3ahaahnai'
                },
                {
                    url: 'https://res.cloudinary.com/dhotp2ie1/image/upload/v1655813088/Yelpcamp/lehjy7usdsa8l3camw08.jpg',
                    filename: 'Yelpcamp/lehjy7usdsa8l3camw08'
                }
            ]
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})