const express = require('express');
const UserController = require('../controllers/user');
const mdAuth = require('../middlewares/authenticated').ensureAuth;

const api = express.Router();

const multipart = require('connect-multiparty');
const mdUpload = multipart({uploadDir: './uploads/users'});

api.get('/home', mdAuth, UserController.home);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', mdAuth, UserController.getUser);
api.get('/users/:page?', mdAuth, UserController.getUsers);
api.get('/counters/:id?', mdAuth, UserController.getCounters);
api.put('/update-user/:id', mdAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [mdAuth, mdUpload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);


module.exports = api; 