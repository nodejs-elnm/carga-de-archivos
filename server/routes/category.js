const express = require('express');
const app = express();

// Modelo (clase)
const Category = require('../models/category');

// Middlewares
const { verifyToken } = require('../middlewares/autenticacion');
const { verifyRole } = require('../middlewares/autenticacion');


app.get('/category', verifyToken, (req, res) => {

    Category.find({}) //para filtrar una salida, sin el "string datos", sólo se aplica la búsqueda total
        .sort('name')
        .populate('createdBy modifiedBy', 'name email')
        .exec((err, categories) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Category.countDocuments({}, (err, numTotal) => {
                res.json({
                    ok: true,
                    total_categorias: numTotal,
                    categories
                });
            });

        });

});

app.get('/category/:id', verifyToken, (req, res) => {

    let id = req.params.id;

    Category.findById(id, (err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'No se ha encontrado la categoría'
                }
            });
        }

        res.json({
        ok: true,
        category: categoryDB
    });

});

});

app.post('/category', verifyToken, (req, res) => {

    let body = req.body;

    let category = new Category({
        name: body.name,
        description: body.description || '',
        createdBy: req.user._id
    });

    category.save((err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'No se ha podido guardar'
                }
            });

        }

        res.json({
            ok: true,
            category: categoryDB
        });

    });

});


app.put('/category/:id', verifyToken, (req, res) => {

    let id = req.params.id;
    let id_user = req.user._id; 
    

    let data = {
        modifiedBy: id_user,
        name: req.body.name,
        description: req.body.description
    };

    
    Category.findById(id, (err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoryDB) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'No existe esa categoría'
                }
            });
        }

        if (data.name) {
            categoryDB.name = data.name;
        }
        if (data.description) {
            categoryDB.description = data.description;
        }

        categoryDB.modifiedBy = data.modifiedBy;

        categoryDB.save((err, category) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                category
            });
        });

    });

});


app.delete('/category/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    Category.findByIdAndDelete(id, (err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            msg: 'Categoría borrada',
            category: categoryDB
        });
    });

});


module.exports = app;