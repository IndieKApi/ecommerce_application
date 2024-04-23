const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {


    MongoClient.connect('mongodb+srv://kapilhedau:Kapil123@cluster0.25fxh0q.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0'
)
    .then(client => {
        _db = client.db();
        console.log('DB Connected');
        callback();
    })
    .catch(err => {
        console.log(err);
    });
    

}

const getDb = () => {

    if(_db)
    {
        return _db;
    }

    throw 'No database';
};

exports.mongoConnect = mongoConnect;

exports.getDb = getDb;

