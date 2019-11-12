const jwt = require('jsonwebtoken');

// ==========
//  Verificar TOKEN


let verifyToken = ( req, res, next) => {

    let token = req.get('Authorization');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'TOKEN no válido'
                }
            });
        }

        req.user = decoded.user;
        next();

    });

};


let verifyRole = ( req, res, next ) => {

    let user = req.user;
    
    if (user.role != 'ADMIN_ROLE') {
        return res.status(400).json({
            ok: false,
            err: {
                msg: 'El usuario no tiene permisos'
            }
        });
    }
    

    next();

};


let verifyTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'TOKEN no válido'
                }
            });
        }

        req.user = decoded.user;
        next();

    });

};


module.exports = {
    verifyToken,
    verifyRole,
    verifyTokenImg

};