
const mongoose = require('mongoose');

Schema = mongoose.Schema;

const productSchema = new Schema({

    title: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },

    description: {
        type: String,
        require: true
    },

    imageUrl: {
        type: String,
        require: true
    },

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }

});


module.exports = mongoose.model('Product',productSchema);






// const mongodb = require('mongodb');



// class Product {

//     constructor(title,price,description, imageUrl, id, userId)
//     {   
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = userId;

//     }


//     save()
//     {
//         const db = getDb();
//         //console.log("Database instance fetched:", db);
    
//         let dbOp;
//         if (this._id) {
//             //console.log("Updating existing document with ID:", this._id);
//             dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this});
//         } else {
//             //console.log("Inserting new document:", this);
//             dbOp = db.collection('products').insertOne(this);
//         }
        
//         return dbOp
//             .then(results => {
//                 //console.log("Database operation successful:", results);
//                 return results;  // Ensure the result is returned to the calling method
//             })
//             .catch(err => {
//                 console.log("Database operation failed:", err);
//                 throw err;  // Ensure errors are thrown back to the caller
//             });
//     }


//     static fetchAll()
//     {
//         const db = getDb();
//         return db.collection('products')
//         .find()
//         .toArray().
//         then(products => {

//             //console.log(products);
//             return products;
//         })
//         .catch(err => {
//             console.log(err);
//         })
        
//     }

//     static findbyId(prodId)
//     {
//         const db = getDb();
        
//         return db.collection('products')
//         .find({_id: new mongodb.ObjectId(prodId)}).next()
//         .then(product => {
//             //console.log(product);
//             return product;
//         })
//         .catch(err => {

//             console.log(err);
//         })
//     }

//     static deletebyId(prodId)
//     {
//         const db = getDb();

//         return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
//         .then(results => {
            
//             //console.log('delete hua');
//             console.log(results);
            
//         })
//         .catch(errr => 
//         {   
//             console.log('nhi hua delete');
//             console.log(errr);
//         })
//     }


// }



// module.exports = Product;