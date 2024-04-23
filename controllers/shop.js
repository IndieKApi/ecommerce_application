//Work of the Controller os to cennect the Model(Which handle the data sie like fetch, save) with the views(What user see).

const fs =require('fs');

const Product = require('../Models/product')

const path = require('path');

const User = require('../Models/user');

const Order = require('../Models/order');

const mongoose = require('mongoose');

const express = require('express')

const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req,res,next) =>{

    const page = req.query.page || 1;

    let totalItems;


    Product.find().count()
    .then(numProducts => {
        totalItems = numProducts;

        return  Product.find()
        .skip((page-1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
        //console.log(products);
        res.render('shop/product-list',{
            products : products,
            pagetitle: 'Shop',
            path : '/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE*page < totalItems,
            hasPreviosPage: page > 1,
            nextPage: parseInt(page) + 1,
            previousPage: page-1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
            
        })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    });     

    
};


exports.getProductID = (req,res,next) => {

    const prodId = req.params.productID;

    
    
    Product.findById(prodId)
    .then((product) =>{
        res.render('shop/product-list-details', {

            pagetitle: product.title,
            product: product,
            path: '/products',
            isAuthenticated: req.session.isLoggedIn
        });

    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })
    
    

};
exports.getIndex = (req, res, next) => {

    const page = req.query.page || 1;

    let totalItems;


    Product.find().count()
    .then(numProducts => {
        totalItems = numProducts;

        return  Product.find()
        .skip((page-1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
        //console.log(products);
        res.render('shop/index',{
            products : products,
            pagetitle: 'Shop',
            path : '/',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE*page < totalItems,
            hasPreviosPage: page > 1,
            nextPage: parseInt(page) + 1,
            previousPage: page-1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
            
        })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    });     

}


exports.getShopProducts = (req,res, next) => {

    res.render('shop/product-list',{
        pagetitle: 'Products List',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.getCart = (req,res,next) => {

    req.user.populate('cart.items.productId')
    .then(user => {
        
        //console.log(user.cart.items);
        const products = user.cart.items;

        res.render('shop/cart',
            {
                path: '/cart',
                pagetitle: 'Your Cart',
                products: products,
                isAuthenticated: req.session.isLoggedIn

            })


    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })
    
 

};

exports.postCart = (req,res,next) =>{

    prodId = req.body.productid;
    
    //console.log(`find product id ${prodId}`);
    
    Product.findById(prodId)
    .then(product => {

        return req.user.addToCart(product);

    }).then(results => {
        

        res.redirect('/cart');

        //console.log(results);
    }).catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })

    

};

exports.postCartDeleteProducts = (req,res,next) => {

    const prodId = req.body.productId;


    req.user.removeFromCart(prodId)
    .then(results => {

        res.redirect('/cart');

    })
    .catch(err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
    })
    
    
};
exports.getOrders = (req,res,next) => {

    Order.find({'user.userId' : req.user._id})
    .then(orders => {

        res.render('shop/orders',
        {
            path: '/orders',
            pagetitle: 'Your Order',
            orders: orders,
            isAuthenticated: req.session.isLoggedIn
        });
    })
   

};

exports.postOrder = (req,res,next) => {


    req.user.populate('cart.items.productId')
    .then(user => {
        
        //console.log(user.cart.items);
        const products = user.cart.items.map(i => {
            return {
                quantity: i.quantity, product: {...i.productId._doc}
            };
        });


        console.log(`our product is ${products}`);
        const order =  new Order({

            user: {
                
                email: req.user.email,
                userId: req.user._id
    
            },

            products: products
    
        });

        return order.save();

    })
   .then( (results)=>  {

    return req.user.clearCart();
    

   })
   .then(results => {

    res.redirect('/orders');

   })

   .catch( err => {
        console.log(err);
        const error = new Error(err)

        error.httpStatusCode = 500;

        return next(error);
   })


}

exports.checkout = (req,res,next) => {

    res.render('shop/checkout',{

        path: '/checkout',
        pagetitle: 'Checkout'
    });
};

exports.getInvoice = (req,res,next) => {

    const orderId = req.params.orderId;

    Order.findById(orderId)
    .then( order => {
        if(!order)
        {
            return next(new Error('No Order Found'));
        }

        if(order.user.userId.toString() !== req.user._id.toString())
        {
            return next(new Error('Unauthorize Access'));
        }

        const invoiceName =  orderId + '-Invoice.pdf';
        const invoicePath = path.join('data','Invoices', invoiceName);

        const pdfDoc = new PDFDocument();

        pdfDoc.pipe(fs.createWriteStream(invoicePath));

        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice',{
            underline: true
        });



        pdfDoc.text('------------------------------------------------------');

        let totalPrice = 0;

        order.products.forEach(prod => {
            totalPrice += prod.quantity*prod.product.price;

            pdfDoc.fontSize(14).text(prod.product.title + ' - ' +  prod.quantity + ' X ' + '$' + prod.product.price);
        });
        
        pdfDoc.text('------------------------------------------------------');
        pdfDoc.text('Total-Price = $'+totalPrice);

        
        pdfDoc.end();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename= " ' + invoiceName + '"');
    // fs.readFile(invoicePath, (err,data) => {

    //     if(err)
    //     {
    //        return next();
    //     }

    //     res.setHeader('Content-Type', 'application/pdf');
    //     res.setHeader('Content-Disposition', 'inline; filename= " ' + invoiceName + '"');
    //     res.send(data);

    // })

        // const file = fs.createReadStream(invoicePath);
       
        // file.pipe(res);







    })
    .catch(err => 
        next(err)
    );

    
}