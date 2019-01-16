const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePaginate = require('mongoose-pagination');

let Publication = require('../models/publication');
let User = require('../models/user');
let Follow = require('../models/follow');

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando rutas del publication'
    });
} 

function savePublications(req, res) {
    let body = req.body;

    if (!body.text) {
        return res.status(404).send({
            message: 'Debe enviar un texto'
        });
    }

    let publication = new Publication();
    publication.text = body.text;
    publication.file = null;
    publication.user = req.user.sub;
    publication.create_at = moment().unix();

    publication.save( (err, publicationStored) => {
        if (err) {
            return res.status(500).send({
                message: 'Error al guardar la publicación'
            });
        }

        if (!publicationStored) {
            return res.status(404).send({
                message: 'La publicación no se ha guardado'
            });
        }

        return res.status(200).send({
            publication: publicationStored
        });
    });

}

function getPublications(req, res) {
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = 4;

    Follow.find({user: req.user.sub}).populate('followed').exec( (err, follows) => {
        if (err) {
            return res.status(500).send({
                message: 'Error al devolver los seguimientos'
            });
        } 

        let follow_clean = [];

        follows.forEach(follow => {
            follow_clean.push(follow.followed);
        });

        Publication.find({user: {"$in": follow_clean}}).sort('create_at').populate('user')
                   .paginate(page, itemsPerPage, (err, publications, total) => {
                        if (err) {
                            return res.status(500).send({
                                message: 'Error al devolver las publicaciones'
                            });
                        } 

                        if (!publications) {
                            return res.status(404).send({
                                message: 'No hay publicaciones'
                            });
                        }

                        return res.status(200).send({
                            total,
                            pages: Math.ceil(total/itemsPerPage),
                            page: page,
                            publications
                        });
                   });
    });
}

function getPublication(req, res) {
    let publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err) {
            return res.status(500).send({
                message: 'Error al devolver la publicación'
            });
        }

        if (!publication) {
            return res.status(404).send({
                message: 'No existe la publicacion'
            });
        }

        return res.status(200).send({
            publication
        });
    });
}

function deletePublication(req, res) {
    let publicationId = req.params.id;

    Publication.findOneAndDelete({user: req.user.sub, _id: publicationId}, (err, publicationRemove) => {
        if (err) {
            return res.status(500).send({
                message: 'Error al borrar la publicación'
            });
        }

        if (!publicationRemove) {
            return res.status(404).send({
                message: 'No se ha borrado la publicacion'
            });
        }

        return res.status(200).send({
            message: 'Publicación eliminada exitosamente',
            publicationRemove
        });
    });
}

// Subir archivos de imagen en las publicaciones
function uploadImage(req, res) {
    let publicationId = req.params.id;

    if (req.files) {
        let file_path = req.files.file.path;
        console.log(file_path);
        let file_split = file_path.split('\/');
        console.log(file_split);
        let file_name = file_split[2];
        console.log(file_name);
        let ext_split = file_name.split('\.');
        console.log(ext_split);
        let file_ext = ext_split[1];
        console.log(file_ext);

        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            // Actualizar documento de publicación
            Publication.findOne({user: req.user.sub, _id: publicationId}).exec((err, publication) => {
                if (publication) {
                    
                    Publication.findByIdAndUpdate(publicationId,{file: file_name}, {new: true}, (err, publicationUpdate) => {
                        if (err) {
                            return res.status(500).send({
                                message: 'Error en la peticion'
                            });
                        }
                        
                        if (!publicationUpdate) {
                            return res.status(404).send({
                                message: 'No se ha podido actualizar el usuario'
                            });
                        }
                        return res.status(200).send({
                            publication: publicationUpdate
                        });
                        
                    });

                } else {
                    return removeImages(res, file_path, 'No tienes permiso para actualizar esta publicación');
                }
            });

        } else {
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
    let path_file = './uploads/publications/' + image_file;

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
    pruebas,
    savePublications,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
};