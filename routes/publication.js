const express = require('express');
const PublicationController = require('../controllers/publication');
const mdAuth = require('../middlewares/authenticated').ensureAuth;

const api = express.Router();

const multipart = require('connect-multiparty');
const mdUpload = multipart({uploadDir: './uploads/publications'});

api.get('/pruebas-pub', mdAuth, PublicationController.pruebas);
api.post('/publication', mdAuth, PublicationController.savePublications);
api.get('/publications/:page?', mdAuth, PublicationController.getPublications);
api.get('/publication/:id', mdAuth, PublicationController.getPublication);
api.delete('/publication/:id', mdAuth, PublicationController.deletePublication);
api.post('/upload-image-pub/:id', [mdAuth, mdUpload], PublicationController.uploadImage);
api.get('/get-image-put/:imageFile', PublicationController.getImageFile);

module.exports = api;