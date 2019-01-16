let User = require('../models/user');
let Publication = require('../models/publication');

let Follow = require('../models/follow');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

function home(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Pruebas en el servidor node js'
    });
}

// Registro de usuarios
function saveUser(req, res){
    let params = req.body;
    let user = new User();

    if (params.name && params.surname && params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'USER_ROLE';
        user.image = null;

        User.find({ $or: [ // Controlar usuarios duplicados
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]})
        .exec( (err, users) => {
            if (err) {
                res.status(500).send({
                    message: 'Error en la peticion de usuarios'
                });
            }

            if (users && users.length > 0) {
                res.status(200).send({
                    message: 'El usuario que intentas registrar ya existe'
                });
            } else {
                // Cifra la contraseña y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save( (err, userStored) => {
                        if (err) {
                            return res.status(500).send({
                                message: 'Error al guardar el usuario'
                            });
                        } 

                        if (userStored) {
                            res.status(200).send({
                                user: userStored
                            });
                        } else {
                            res.status(404).send({
                                message: 'No se ha registrado el usuario'
                            });
                        }
                    });
                });
            }
        });

    } else {
        return res.status(200).send({
            message: 'Rellena todos los campos solicitados'
        });
    }
}

// login
function loginUser(req, res) {
    let params = req.body;
    let email = params.email;
    let password = params.password;

    User.findOne({email: email}, (err, user) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la petición'
            });
        }

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {

                    if (params.token){
                        // Generar y devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                         });
                    } else {
                        // Devolver datos del usuario
                        user.password = undefined;
                        return res.status(200).send({
                           user
                        });
                    }

                } else {
                    return res.status(404).send({
                        message: 'El usuario no se pudo identificar'
                    });
                }
            });

        } else {
            return res.status(404).send({
                message: 'El usuario no se pudo identificar!!'
            });
        }
    });
}

// Conseguir datos de un usuario
function getUser(req, res) {
    let userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }

        if (!user) {
            return res.status(404).send({
                message: 'El usuario no existe'
            });
        }

        followThisUser(req.user.sub, userId).then( (value) => {
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
}

async function followThisUser(identity_user_id, user_id) {
    let following = await Follow.findOne({user: identity_user_id, followed: user_id}, (err, follow) => {

        if (err) return new throwError(err);
        return follow;
    });

    let followed = await Follow.findOne({user: user_id, followed: identity_user_id}, (err, follow) => {

        if (err) return new throwError(err);
        return follow;
    });

    return {
        following,
        followed
    };
} 

// Obtener los usuarios con paginación
function getUsers(req, res) {
    const identity_user_id = req.user.sub;
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    } 

    const itemsPerPage = 5;
    
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }

        if (!users) {
            return res.status(404).send({
                message: 'No hay usuarios disponibles'
            });
        }

        followUserIds(identity_user_id).then( value => {
            return res.status(200).send({
                users,
                user_following: value.following,
                user_follo_me: value.followed,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        });
    });
}

async function followUserIds(user_id) {
    let following = await Follow.find({user: user_id}).select({'_id':0 ,'_v':0, 'user':0})
    .exec().then(following => {
        let follow_clean = [];

        following.forEach(follow => {
            // Guardar los ids de los usuarios que sigo
            follow_clean.push(follow.followed);
        });

        return follow_clean;
    })
    .catch(err => {
        return new throwError(err);
    });

    let followed = await Follow.find({followed: user_id}).select({'_id':0 ,'_v':0, 'followed':0})
    .exec().then(followed => {
        let follow_clean = [];

        followed.forEach(follow => {
            // Guarda los usuarios que yo sigo
            follow_clean.push(follow.user);
        });

        return follow_clean;
    })
    .catch(err => {
        return new throwError(err);
    });

    return {
        following,
        followed
    };
}

// Contador de los usuarios que seguimos, que nos siguen y las publicaciones que tenemos
function getCounters(req, res) {
    let userId = req.user.sub;

    if (req.params.id) {
        userId = req.params.id;
    }
    
    getCountFollow(userId).then( value => {
        return res.status(200).send({
            value
        });
    });
}

async function getCountFollow(user_id) {
    let following = await Follow.countDocuments({user: user_id}, (err, count) => {
        if (err) return new throwError(err);

        return count;
    });

    let followed = await Follow.countDocuments({followed: user_id}, (err, count) => {
        if (err) return new throwError(err);

        return count;
    });

    let publications = await Publication.countDocuments({user: user_id}, (err, count) => {
        if (err) return new throwError(err);

        return count;
    });

    return{
        following,
        followed,
        publications
    };
}

// Actualizar Usuario
function updateUser(req, res) {
    let userId = req.params.id;
    let update = req.body;

    // Borrar la propiedad password
    delete update.password;

    if (userId !== req.user.sub) {
        return res.status(500).send({
            message: 'No tienes permiso para actualizar los datos del usuario'
        });
    }

    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdate) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }

        if (!userUpdate) {
            return res.status(404).send({
                message: 'No se ha podido actualizar el usuario'
            });
        }

        return res.status(200).send({
            user: userUpdate
        });
    });
}

// Subir archivos de imagen/Avatar de usuario
function uploadImage(req, res) {
    let userId = req.params.id;

    if (req.files) {
        let file_path = req.files.image.path;
        console.log(file_path);
        let file_split = file_path.split('\/');
        console.log(file_split);
        let file_name = file_split[2];
        console.log(file_name);
        let ext_split = file_name.split('\.');
        console.log(ext_split);
        let file_ext = ext_split[1];
        console.log(file_ext);

        if (userId !== req.user.sub) {
            return removeImages(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            // Actualizar el usuario logeado
            User.findByIdAndUpdate(userId,{image: file_name}, {new: true}, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error en la peticion'
                    });
                }
                
                if (!userUpdate) {
                    return res.status(404).send({
                        message: 'No se ha podido actualizar el usuario'
                    });
                }
                return res.status(200).send({
                    user: userUpdate
                });
                
            });

            // fs.unlink(file_path);

        } else{
            return removeImages(res, file_path, 'Extensión no valida');
        } 

    } else {
        return res.status(500).send({
            message: 'No se han subido imagenes'
        });
    }
}

function removeImages(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({
            message: message
        });
    });
}

// 
function getImageFile(req, res) {
    const image_file = req.params.imageFile;
    let path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({
                message: 'No existe la imagen'
            });
        }
    });
}

module.exports = {
    home,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
};

