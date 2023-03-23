if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}



const express=require('express')
const path =require('path');
const mongoose=require('mongoose')
const ejsMate=require('ejs-mate')
 const session=require('express-session')
 const flash=require('connect-flash')

const ExpressError=require('./utils/ExpressError')
const methodOverride=require('method-override')
mongoose.set('strictQuery',true)
const passport=require('passport');
const LocalStrategy=require('passport-local')
const User=require('./models/user')

const userRoutes=require('./routes/users')
const campgroundRoutes=require('./routes/campground')
const reviewRoutes=require('./routes/reviews');



const mongoSanitize=require('express-mongo-sanitize');
// const MongoStore = require('connect-mongo');
const { func } = require('joi');

const MongoDBStore=require('connect-mongo')(session);

const db_url=process.env.DB_URL

// const db_url='mongodb://127.0.0.1:27017/yelp-camp';
// mongoose.connect(db_url, { useNewUrlParser: true,
//     useUnifiedTopology: true})

mongoose.connect(db_url, { useNewUrlParser: true,
    useUnifiedTopology: true})

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("database connected");
});

const app= express();

app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))


// to parse reqq.body
app.use(express.urlencoded({extended:true}))

//to send put request in edit form
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
    replaceWith:'_'
}))

const store=new MongoDBStore({
    url:db_url,
    secret:'thisshouldbeabettersecret',
    touchAfter:24*60*60
});

store.on("error",function(e){
    console.log("session store error",e)
})

const sessionConfig={
    store,
    name:'session',
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());
//app.use(helmet({contentSecurityPolicy:false}))

//for authentication
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req,res,next)=>{
    res.locals.currentUser=req.user
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})

app.get('/fakeUser',async(req,res)=>{
    const user=new User({email:'abcd123@gmail.com',username:'abcd'})
    const newUSer=await User.register(user,'chicken')
    res.send(newUSer)
})


app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)


app.get('/',(req,res)=>{
    res.render("home")
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message='Something went wrong';
    res.status(statusCode).render('error' ,{err})
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})