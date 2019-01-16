const express = require('express');
const MessageController = require('../controllers/message');
const md_auth = require('../middlewares/authenticated').ensureAuth;

const api = express.Router();

api.get('/pru-message', md_auth, MessageController.pruebaMessage);
api.post('/message', md_auth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth, MessageController.getReceivedMessages);
api.get('/messages/:page?', md_auth, MessageController.getEmmitMessages);
api.get('/unviewed-messages', md_auth, MessageController.getUnviewedMessages);
api.get('/set-viewed-messages', md_auth, MessageController.setViewedMessages);

module.exports = api;