const mongoose = require('mongoose');




const userSchema  = new mongoose.Schema({

    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    cart: {
        items: [{productId: {type: mongoose.Schema.Types.ObjectId,ref: 'Product',required: true}, quantity : {type: Number,required: true}}]
    },

    resetToken : String,
    resetTokenExpiration : Date

});

userSchema.methods.addToCart = function(product){

    const cartProductIndex = this.cart.items.findIndex(cp => {
                    //console.log(`Product cp id ${cp.productId}`);
                    //console.log(`Product id ${product._id}`);
                    return cp.productId.toString() === product._id.toString();
                });

            
                let newQuantity = 1;
                const updatedCartItems = [...this.cart.items];
            
                if (cartProductIndex >= 0) {
                    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
                    updatedCartItems[cartProductIndex].quantity = newQuantity;
                } else {
                    updatedCartItems.push({ productId: product._id, 
                        quantity: newQuantity });
                }
            

                const updatedCart =  { items : updatedCartItems };
            
                this.cart = updatedCart;
            
                return this.save();

}


userSchema.methods.removeFromCart = function(prodId) {

    const updatedCartItems = this.cart.items.filter(item => {

                    return item.productId.toString() !== prodId.toString();
        
                });

                this.cart.items = updatedCartItems;

                return this.save();

}


userSchema.methods.clearCart = function () {

    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);




























// const mongodb = require('mongodb');

// const getDb = require('../util/database').getDb;

// class User {

//     constructor(username,email,cart,id)
//     {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
        
//     }

//     save()
//     {
//         const db = getDb();

//         return db.collection('users').insertOne(this);

//     }


//     addTOCart(product) {   
//         //console.log(this.cart);
//         const cartProductIndex = this.cart.findIndex(cp => {
//             //console.log(`Product cp id ${cp.productId}`);
//             //console.log(`Product id ${product._id}`);
//             return cp.productId.toString() === product._id.toString();
//         });
    
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart];
    
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
//         }
    
//         const updatedCart = updatedCartItems;
    
//         const db = getDb();
    
//         return db.collection('users').updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: updatedCart } }
//         );
//     }


//     getCart() {
//         const db = getDb();
    
//         const productIds = this.cart.map(i => i.productId);
    
//         return db.collection('products')
//             .find({ _id: { $in: productIds } }).toArray()
//             .then(products => {
//                 return products.map(p => {
//                     const cartItem = this.cart.find(item => item.productId.toString() === p._id.toString());

//                     //console.log(cartItem.quantity);
                    

//                     const loging = {...p, quantity: cartItem.quantity}

//                     //console.log(`logging ${loging}`);
//                     return loging;
//                 });
//             });
//     }

//     deleteItemFromCart(prodId)
//     {
//         const updatedCartItems = this.cart.filter(item => {

//             return item.productId.toString() !== prodId.toString();

//         });


        
//         const db = getDb();
    
//         return db.collection('users').updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: updatedCartItems } }
//         );

//     }


//     static findbyId(userId)
//     {
//         const db = getDb();

//         return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)});
//     }



//     addOrder()
//     {
//         const db = getDb();

//         return this.getCart()
//         .then(products => {

//             const order = {

//                 items: products,
    
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
//                     name: this.username, 
//                     email: this.email 
//                 }
//             };

//             return db
//             .collection('orders')
//             .insertOne(order)

//         })
//         .then(result => {
            
//             this.cart = [];
//             //console.log(`Cart after Update ${this.cart}`);
    
//             return db
//             .collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this._id) },
//                 { $set: { cart: [] } }
//         );
//         });
        
//     }

//     getOrders()
//     {
//         const db = getDb();

//         return db
//         .collection('orders').find({'user._id': new mongodb.ObjectId(this._id)})
//         .toArray();
//     }
// }

// module.exports = User;


