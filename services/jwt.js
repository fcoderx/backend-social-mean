const jwt = require('jwt-simple');
const momnet = require('moment');
const secret = 'cl4v3_s3cr3t4_r3d_s0c14l_m34n';

exports.createToken = (user) => {
    let payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: momnet().unix(),
        exp: momnet().add(30, 'days').unix
    };

    return jwt.encode(payload, secret);
};