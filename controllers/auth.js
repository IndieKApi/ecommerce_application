//imports
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../Models/user');
const fs = require('fs');
const crypto = require('crypto');

const { validationResult } = require('express-validator');

const session = require('express-session');

const nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'coldbeerstudio@gmail.com',
      pass: 'uswg ewug ntym bdfa'
    }
  });
  
  

exports.getLogIn = (req,res,next) =>{


    let message = req.flash('error');
    if(message.length > 0) 
    {
        message = message[0];
    }

    else{

        message = null;
    }
    res.render('auth/Login',{
        pagetitle: 'Login',
        path: '/login',
        isAuthenticated: false,
        errorMessage: message,
        oldInput: {
            email: ""
        },
        validationsErrors: []

    })

};

exports.postLogIn = (req,res,next) =>{

    const email = req.body.email;
    const password = req.body.password;

    const error = validationResult(req);
    
    if(!error.isEmpty())
    {   
        //console.log(error.array()[0].msg)
        return res.status(422).render('auth/Login',{
            path: '/login',
            pagetitle: 'Login',
            isAuthenticated: false,
            errorMessage: error.array()[0].msg,
            oldInput: {
                email: email
            },
            validationsErrors: error.array()[0].path
            
        });
    }


    User.findOne({email:email})
    .then(user => {

        if(!user)
        {   req.flash('error','Invalid email or password!')
            return res.redirect('/login');
        }

        bcrypt.compare(password,user.password)
        .then( doMatch => {

            
            if(doMatch){

                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => 
                {
                    console.log(err);
                    res.redirect('/');
                });
            }
            req.flash('error','Invalid email or password!')
            res.redirect('/login');
        
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        })


    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })
    

};



exports.getSignUp = (req,res,next) => {

    let message = req.flash('error');
    if(message.length > 0) 
    {
        message = message[0];
    }

    else{

        message = null;
    }
    res.render('auth/Signup',{
        path: '/signup',
        pagetitle: 'SignUp',
        isAuthenticated: false,
        errorMessage: message,
        oldInput: {
            email: ""
        },
        validationsErrors: []
    });
}


exports.postSignUp = (req,res,next) =>{

    const email = req.body.email ;
    const password = req.body.password;
   
    // console.log(email);
    // console.log(password);
    const error = validationResult(req);

    if(!error.isEmpty())
    {   
        //console.log(error.array()[0].msg)
        return res.status(422).render('auth/Signup',{
            path: '/signup',
            pagetitle: 'SignUp',
            isAuthenticated: false,
            errorMessage: error.array()[0].msg,
            oldInput: {
                email: email
            },
            validationsErrors: error.array()[0].path
        });
    }



        bcrypt.hash(password,12)
        .then(hashedpass => {

            const mailFilePath = path.join(__dirname,'..','public','mails','signup.html');
            const htmlTemplate = fs.readFileSync(mailFilePath, 'utf8');

            const user = new User({
                email : email,
                password: hashedpass,
                cart: {items: []}
    
            });
            
            var mailOptions = {
                from: 'coldbeerstudio@gmail.com',
                to: email,
                subject: 'successfully SignUp',
                html: htmlTemplate
              };
            
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
            
            return user.save();
        })
        .then(results => {
    
            //we created user successfuly
            res.redirect('/login');
    
    
        }) 
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })
    
};


exports.postLogOut = (req,res,next) =>{

    req.session.destroy( () => {

        res.redirect('/');
    })
};

exports.getReset = (req,res,next) => {

    let message = req.flash('error');
    if(message.length > 0) 
    {
        message = message[0];
    }

    else{

        message = null;
    }

    res.render('auth/reset',{
        path: '/reset',
        pagetitle: 'Reset Password',
        isAuthenticated: false,
        errorMessage: message
    });
}


exports.postReset = (req,res,next) => {

    const email = req.body.email;

    crypto.randomBytes(32, (err,buffer) => {
            
        if(err)
        {   
            console.log(err);
            return res.redirect('/reset');   
        }

        const token = buffer.toString('hex');
        User.findOne({email: email})
        .then(user => {
            if(!user)
            {
                req.flash('error', 'No Account with the email found');
                return res.redirect('/reset');
            }

            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(results => {
            //sent email to the user
        const passwordResetMailhtmlpPath = path.join(__dirname,'..','public','mails','passResetMail.html');
        
        const htmlTemplate = fs.readFileSync(passwordResetMailhtmlpPath, 'utf8');

            const resetlink = `http://localhost:3000/reset/${token}`;
            const mailFileWithLink = htmlTemplate.replace('{{resetLink}}',resetlink);

            var mailOptions = {
                from: 'coldbeerstudio@gmail.com',
                to: email,
                subject: 'Password Reset',
                html: mailFileWithLink
              };
            
            res.redirect('/')
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  
                }
              });

        })
        .catch(err => {
            console.log(err);
            const error = new Error(err)

            error.httpStatusCode = 500;

            return next(error);
        })



            
    });



};

exports.getNewPassword = (req,res,next) => {

    const token = req.params.token;

    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user=> {

        res.render('auth/new-password',{
            path: '/new-password',
            pagetitle: 'New Password',
            isAuthenticated: false,
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });



    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })

    let message = req.flash('error');
    if(message.length > 0) 
    {
        message = message[0];
    }

    else{

        message = null;
    }

    

}

exports.postNewPassword = (req,res,next) => {

    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let ResetUser;

    User.findOne({
        resetToken: token, 
        resetTokenExpiration: {$gt: Date.now() }, 
        _id: userId 
    })
    .then(user => {
        
        ResetUser = user;
        return bcrypt.hash(newPassword,12);

    })
    .then(hashedpass => {
        ResetUser.password = hashedpass;
        ResetUser.resetToken = null;
        ResetUser.resetTokenExpiration = null;
        

        return ResetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })
    

}