const express = require('express')
const { check, body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth')

const User = require('../Models/user');

router.get('/login', authController.getLogIn);
router.get('/signup',authController.getSignUp);
router.get('/reset',authController.getReset);
router.get('/reset/:token',authController.getNewPassword);


router.post('/login' ,[

    check('email')
        .isEmail()
        .withMessage('Please Enter Vaild Email')
        .normalizeEmail(),

    body('password',
        'Please Enter the valid Password with atleast 5 numbers Only!')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),


    ], authController.postLogIn);



router.post('/signup', 
[check('email')
.isEmail()
.withMessage('Please Enter Vaild Email')
.custom((value, {req} ) => {
    
        return User.findOne({email : value})
        .then( userDoc => {
    
        if(userDoc)
        {   
            return Promise.reject('Email Already Exist!');
        }
    })

})
.normalizeEmail(),

body('password',
    'Please Enter the valid Password with atleast 5 numbers Only!')
    .isLength({min: 5})
    .isAlphanumeric()
    .trim(),
    
body('confirmPassword').trim().custom((value, {req}) => {

        if(value !== req.body.password){

            throw new Error('Password Doest Match!');
        }

        return true;
    })
    


], 

authController.postSignUp);
router.post('/logout', authController.postLogOut);
router.post('/reset', authController.postReset);
router.post('/new-password', authController.postNewPassword);



module.exports = router;
