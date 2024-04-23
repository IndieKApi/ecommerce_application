const mongodb = require('mongodb');

const Product = require('../Models/product')

const filehelper = require('../util/file');

const ObjectId = mongodb.ObjectId;

const { validationResult } = require('express-validator');

const path = require('path');



exports.getAddProduct = (req,res,next)=>{

    
    res.render('Admin/edit-product',  {
    
        pagetitle : 'ADD Product',
        path : './views/Admin/add-product',
        editing: false,
        hasError: false,
        isAuthenticated: req.session.isLoggedIn,
        product: {
            title: "",
            imageUrl: "",
            price: "",
            description: ""
        },
        errorMessage: null

    });

};


exports.PostnewProduct = (req,res,next)=>{

    console.log('Runing post new projuect');
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(image);

    if(!image)
    {   
        
        return res.status(422).render('Admin/edit-product',  {
    
            pagetitle : 'ADD Product',
            path : './views/Admin/add-product',
            editing: false,
            hasError: true,
            isAuthenticated: req.session.isLoggedIn,
            product: {
                title: title,
                imageUrl: image,
                price: price,
                description: description
            },
            errorMessage: 'Images Type is not Correct!'
        
    
        });
    }

    
    const error = validationResult(req);
    //console.log(error.array());
    if(!error.isEmpty())
    {
        return  res.status(422).render('Admin/edit-product',  {
    
            pagetitle : 'ADD Product',
            path : './views/Admin/add-product',
            editing: false,
            hasError: true,
            isAuthenticated: req.session.isLoggedIn,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: error.array()[0].msg
        
    
        });
    }


    const basename = path.basename(image.path)
    const relativePath = path.join('/','images', basename);
    //console.log(`this is the relative path ${relativePath}`);
    imageUrl = relativePath;
    //console.log(product.imageUrl);

    const product = new Product({
        title: title, 
        price: price, 
        imageUrl:imageUrl, 
        description: description,
        userId: req.user._id});
    

    product.save()
    .then((result)=>{

        //console.log(result);
        res.redirect('/admin/products');

    }).catch((err)=>{


        //res.redirect('/500');
        // return  res.status(500).render('Admin/edit-product',  {
    
        //     // pagetitle : 'ADD Product',
        //     // path : './views/Admin/add-product',
        //     // editing: false,
        //     // hasError: true,
        //     // isAuthenticated: req.session.isLoggedIn,
        //     // product: {
        //     //     title: title,
        //     //     imageUrl: imageUrl,
        //     //     price: price,
        //     //     description: description
        //     // },
        //     // errorMessage: 'Database Operation Failed, Try Again'
            
            
    
        // });

        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);


    }); 

    //res.redirect('/');
 
};

exports.getEditProduct = (req,res,next)=>{

    
    const editMode = req.query.edit;
    if(!editMode)
    {   
        console.log(`1st redirect`);
        return res.redirect('/');
    }

    const prodID = req.params.productId;
    //console.log(`prodID is ${prodID}`);

    
    Product.findById(prodID)

    .then(product => {

        // throw new Error('Failed');

        if(!product)
        {
            return res.redirect('/');
        }

        res.render('Admin/edit-product',{

            pagetitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: false,
            product: product,
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: null
        });

    }).catch((err)=>{
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    });

  
    //res.sendFile(path.join(rootDir,'views','product.html'));
    

};

exports.postEditProduct = (req,res,next)=>{

    const prodId = req.body.productId;
    //console.log(`this is id ${prodId}`);
    const updatedTitle = req.body.title;
    //console.log(`this is id ${updatedTitle}`);
    const updatedPrice = req.body.price;

    const updatedImageUrl = req.body.imageUrl;

    const image = req.file;

    const updatedDescription = req.body.description;

   
    
    const error = validationResult(req);
    //console.log(error.array());
    if(!error.isEmpty())
    {
        return res.status(422).render('Admin/edit-product',  {
    
            pagetitle : 'ADD Product',
            path : './views/Admin/add-product',
            editing: false,
            hasError: true,
            isAuthenticated: req.session.isLoggedIn,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription
            },
            errorMessage: error.array()[0].msg
        
    
        });
    }



    //console.log('kyu chal rha hia bhai');
    Product.findById(prodId)
    .then(product => {

        if(product.userId.toString() !== req.user._id.toString())
        {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;

        
        if(image)
        {   
            
            const basename = path.basename(image.path)
            const relativePath = path.join('/','images', basename);
            //console.log(`this is the relative path ${relativePath}`);

            filehelper.deleteFile(product.imageUrl);
            product.imageUrl = relativePath;
            //console.log(product.imageUrl);
        }
        

        return product.save().then(results => {

            console.log(results);
            res.redirect('/admin/products');
    
        })

    })
    .catch(err => {

        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })
    
    

};
exports.getProducts = (req,res,next) =>{

    //res.sendFile(path.join(rootDir,'views', 'shop.html'));
    const userId = req.user._id;

   Product.find({userId: userId})
//    .populate('userId')
    .then((products)=> {
        
        
        res.render('Admin/admin-product-list', 
        {products : products,
        pagetitle: 'All Products',
        path : '/admin/admin-product-list',
        isAuthenticated: req.session.isLoggedIn
    })

    }).catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    });


    
 
};

exports.deleteProduct = (req,res,next) => {

    const prodId = req.params.productId;

    Product.findById(prodId)
    .then(product => {
        
        if(!product)
        {
            return next('Product is not set');
        }

        filehelper.deleteFile(product.imageUrl); 
        return Product.deleteOne({_id: prodId, userId: req.user._id});
    })
    .then(() => {
        res.status(200).json({message: 'success'});
    })
    .catch(err => {

        res.status(500).json({message: 'Deleting product Failed'});
        
    });
    
    

    
};