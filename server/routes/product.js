const express = require('express');
const app = express();

const _ = require('underscore');

const { verifyToken } = require('../middlewares/autenticacion');

const Product = require('../models/product');


app.get('/products', verifyToken, (req, res) => {
    let limit = Number(req.body.limit) || 7;
    let desde = Number(req.body.desde) || 0;

    Product.find({ status: true })
        .populate('createdBy', 'name email')
        .populate('category', 'name description')
        .limit(limit)
        .skip(desde)
        .exec((err, products) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Product.countDocuments({ status: true }, (err, numTotal) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    total_products: numTotal,
                    products
                });
            });

        });

});


app.get('/products/:id', (req, res) => {
    // obtener producto y POPULATE

    let idProducto = req.params.id;

    Product.findById( idProducto)
        .populate('createdBy', 'name email')
        .populate('category', 'name description')
        .exec((err, product) => { 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!product) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: "No se ha encontrado el producto"
                }
            });
        }

        res.json({
            ok: true,
            product
        });

    });

});


app.get('/products/search/:termino', verifyToken, (req, res) => {
    
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Product.find({ name: regex })
        .populate('category', 'name description')
        .exec((err, products) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                products
            });
        });

});

app.post('/products', verifyToken, (req, res) => {


    let idUser = req.user._id;
    let idCategory = req.body.category;
    let name = req.body.name;
    let description = req.body.description;

    let price = Number(req.body.price);
    if (Number.isNaN(price) || price<0) {
        return res.status(500).json({
            ok: false,
            err: {
                price: req.body.price,
                message: 'El valor de "price" no es válido'
            }
        });
    }

    let product = new Product({
        name,
        price,
        description,
        category: idCategory,
        createdBy: idUser
    });


    product.save((err, productDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            product: productDB
        });

    });


});

app.put('/products/:id', verifyToken, (req, res) => {

    let idCategory = req.params.id;
    let body = _.pick(req.body, ['name', 'price', 'description', 'category', 'status']);

    Product.findByIdAndUpdate(idCategory, body, { new: true, runValidators: true, useFindAndModify: false }, (err, product) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            product
        });
    });


});

app.delete('/products/:id', verifyToken,(req, res) => {
    // no borrar, cambiar su estado 

    let idProducto = req.params.id;

    Product.findById(idProducto)
        .exec((err, product) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!product) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: "No se ha encontrado el producto"
                    }
                });
            }

            product.status = false;

            product.save((err, product) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    product,
                    message: "Producto eliminado"
                });
            });

        });

});


module.exports = app;