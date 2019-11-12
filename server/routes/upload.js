const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');

const User = require('../models/user');
const Product = require('../models/product');

// default options
app.use(fileUpload());


app.put('/upload/:type/:id', (req, res) => {
    
    let type = req.params.type;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
                ok: false,
                message: 'No files were uploaded.'
            });
    }

    // Validar TYPE
    let types_valid = ['products', 'users'];
    if (types_valid.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + types_valid.join(', '),
                type_received: type
            }
        });
    }


    let file = req.files.file;
    let fileSplit = file.name.split('.');
    let fileExt = fileSplit[fileSplit.length -1];
   
    // ext permitidas
    let exts = ['png', 'jpg', 'jpeg', 'gif'];

    if (exts.indexOf(fileExt) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + exts.join(', '),
                ext_received: fileExt 
            }
        });
    }

    // cambiar nombre del archivo
    let newNameFile = `${ id }-${ new Date().getMilliseconds() }.${ fileExt }`;

    file.mv(`uploads/${type}/${ newNameFile }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Al llegar aquí la imagen ya se ha subido
        if (type === 'users') {
            imgUser(id, res, newNameFile);
        } else {
            imgProduct(id, res, newNameFile);
        }

        
    }); 

});



function imgUser(id, res, nameFile) {
    User.findById(id, (err, user) => {

        if (err) {

            deleteFile(nameFile, 'users');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!user) {
            deleteFile(nameFile, 'users');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no ha sido encontrado'
                }
            });
        }

        deleteFile(user.img, 'users');
        

        user.img = nameFile;

        user.save( (err, user) => {
            return res.json({
                ok: true,
                user
            });
        });

    });
}

function imgProduct(id, res, nameFile) {

    Product.findById(id, (err, product) => {
       
        if (err) {

            deleteFile(nameFile, 'products');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!product) {
       
            deleteFile(nameFile, 'products');
       
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        deleteFile(product.img, 'products');

        product.img = nameFile;

        product.save((err, product) => {
            return res.json({
                ok: true,
                product
            });
        });

    });


}

function deleteFile(nameFile, type, ) {

    let pathImg = path.resolve(__dirname, `../../uploads/${ type }/${ nameFile }`);

    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }
}

module.exports = app;