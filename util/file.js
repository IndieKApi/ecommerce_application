const fs = require('fs');
const path = require('path');



const deleteFile = (filepath) => {

    const relativePath = path.join(__dirname,'..',filepath)

    fs.unlink(relativePath, (err) => {
        if(err)
        {
            throw(err);
        }
    })
}

exports.deleteFile = deleteFile;