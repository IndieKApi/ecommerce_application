const fs = require('fs')
const path = require('path');
const http = require('http');

//Expernal import
const express = require('express')
const bodyparse = require('body-parser')
const multer = require('multer')

const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const app = express();

const MONGODB_URI = 'mongodb+srv://kapilhedau:Kapil123@cluster0.25fxh0q.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0';

const csrfProtection = csrf();


app.set('view engine','ejs');
 

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {

    const imagesPath = path.join(__dirname, 'images');
    
      cb(null, imagesPath);
    
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const fileFilter = (req,file,cb) => {

  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  if(allowedTypes.includes(file.mimetype))
  {
    cb(null,true);
  }
  
  else
  {
    cb(null,false);
  }
  
}

//routes Import
const adminRoutes = require('./routes/admin');
const shoproutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const mongoConnect = require('./util/database').mongoConnect;

const User = require('./Models/user')



//import 404 controller

const Controller404 = require('./controllers/error');


//parsing middleware
app.use(bodyparse.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));

//settng tthe session of the user
const store =  new MongoDBSore({

    uri : MONGODB_URI,
    collection: 'sessions',

});

app.use(session({
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false, 
    store: store
}));
app.use(csrfProtection);
app.use(flash());



app.use((req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn,
  res.locals.csrfToken = req.csrfToken();
  next();
});

//checking the user

app.use((req, res, next) => {

 
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if(!user)
        {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        
        throw new Error(err);
        
      });
  });





app.use('/admin',adminRoutes.routes);

app.use(shoproutes.routes);

app.use(authRoutes);


app.get('/500',Controller404.Error500);


app.use(Controller404.Error404);


app.use((error,req,res,next) => {

  
  
  console.log(error);
  res.status(500).render('500', {pagetitle: 'Internal Server Error'});

});


mongoose.connect(MONGODB_URI)
.then(results => { 
    app.listen(3000);
})
.catch(err => {

    console.log(err);
})



