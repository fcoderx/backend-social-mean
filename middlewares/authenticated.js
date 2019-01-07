const jwt = require('jwt-simple');
const momnet = require('moment');
const secret = 'cl4v3_s3cr3t4_r3d_s0c14l_m34n';

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'La petición no tiene la cabezara de autenticación'
        });
    }

    const token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        const payload = jwt.decode(token, secret);

        if(payload.ex <= momnet().unix()) {
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
        
        req.user = payload;
    }catch(ex) {
        return res.status(404).send({
            message: 'El token no es valido'
        });
    } 


    next();
};