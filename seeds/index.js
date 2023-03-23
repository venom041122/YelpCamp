const mongoose=require('mongoose')
mongoose.set('strictQuery',true)
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers')
const Campground=require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true})
    // .then(() => {
    //     console.log("mongo CONNECTION OPEN!!!")
    // })
    // .catch(err => {
    //     console.log("OH NO mongo connection ERROR!!!!")
    //     console.log(err)
    // })
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("database connected");
});

const sample= array=> array[Math.floor(Math.random()*array.length)];

const seedDB=async()=>{
    await Campground.deleteMany({});
    // const c= new Campground({title:'forest'})
    // await c.save();

    for(let i=0;i<300;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'6414af3fc248bcc690d2aee8',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            //image:'https://source.unsplash.com/collection/483251',
            description:'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis officiis, expedita mollitia repudiandae impedit, laudantium quaerat cumque, maiores recusandae eum porro doloribus explicabo tempore libero. Quam nesciunt molestiae sint nisi.',
            price,
            geometry: {
                type: "Point",
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/ds0hipthr/image/upload/v1679326780/YelpCamp/gwql3ypqidnr4zkrgf4b.jpg',
                  filename: 'YelpCamp/gwql3ypqidnr4zkrgf4b'
                },
                {
                  url: 'https://res.cloudinary.com/ds0hipthr/image/upload/v1679326780/YelpCamp/jj2qjbzdt6uqi4f8qrpq.jpg',
                  filename: 'YelpCamp/jj2qjbzdt6uqi4f8qrpq'
                },
                {
                  url: 'https://res.cloudinary.com/ds0hipthr/image/upload/v1679326779/YelpCamp/ixpgu7kztgudwv2s0wkw.jpg',
                  filename: 'YelpCamp/ixpgu7kztgudwv2s0wkw'
                }
              ]
        })
        await camp.save();
    }
}

seedDB();