if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const joi = require('joi');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Review = require('./models/review');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const MongoDBStore = require('connect-mongodb-session')(session);
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const reviews = require('./routes/reviews');
// 'mongodb://localhost:27017/yelp-camp'

mongoose.connect( dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));




app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    uri : dbUrl,
    secret,
    touchAfter : 24*3600,
    collection:'sessions'
});

store.on("error" , (e) =>{
    console.log("session store breaks!!");
})
const sessionConfig = {
    store,
    name : 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhotp2ie1/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);





app.use((req, res, next) => {
    // console.log(req.session);
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get("/", (req, res) => {
    res.render('home')
})

// this will execute when nothing will match above
app.all('*', (req, res, next) => {
    // res.send('404 !!!');
    next(new ExpressError('page not found', 404));
})


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    // console.log(err);
    if (!err.message) err.message = 'somthing went wrong!!';
    res.status(statusCode).render('error', { err });

    // res.send('oh boy that is bad!!');
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})