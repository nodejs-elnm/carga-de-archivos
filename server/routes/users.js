// Requires
const express = require('express');
const bcrypt = require('bcryptjs');
const _ = require('underscore');
const User = require('../models/user');

const app = express();

// Middlewares
const { verifyToken} = require('../middlewares/autenticacion');
const { verifyRole } = require('../middlewares/autenticacion');



app.get('/user', verifyToken ,(req, res) => {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limit = req.query.limite || 5;
    limit = Number(limit);


    User.find( { estado: true }, "name email google estado role" ) //para filtrar una salida, sin el "string datos", sólo se aplica la búsqueda total
        .limit(limit)
        .skip(desde)
        .exec( (err, users ) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.countDocuments({ estado: true }, (err, numTotal) => {
                res.json({
                    ok:true,
                    total_usuarios: numTotal,
                    users
                });
            });

        });
    
    
});

app.post('/user', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10),
        role: body.role
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        

        res.json({
            ok: true,
            user: userDB
        });
    });

});

app.put('/user/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'estado'] );

    User.findByIdAndUpdate( id, body, { new: true, runValidators: true, useFindAndModify: false }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });
    });


});

app.delete('/user/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    //User.findByIdAndRemove(id, (err, user) => {

    let estado = {
        estado: false
    };


    User.findByIdAndUpdate(id, estado, {new: true}, (err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if ( !user ){
            return res.status(400).json({
                ok:false,
                err: {
                    msg: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            user
        });
    });

});


module.exports = app;