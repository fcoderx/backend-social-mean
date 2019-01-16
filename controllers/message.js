const moment = require('moment');
const mongoosePaginate = require('mongoose-pagination');

const User = require('../models/user');
const Message = require('../models/message');

function pruebaMessage(req, res) {
    res.send({
        message: 'probando message model'
    });
}

function saveMessage(req, res) {
    let body = req.body;

    if (!body.text || !body.receiver) {
        return res.send({
            message: 'Envia los datos necesarios'
        });
    }

    let message = new Message();

    message.emitter = req.user.sub;
    message.receiver = body.receiver;
    message.text = body.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save( (err, messageStored) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la petición'
            });
        }

        if (!messageStored) {
            return res.status(404).send({
                message: 'Error al guardar el mensaje'
            });
        }

        return res.send({
            message: messageStored
        });
    });
}

// Obtener los mensajes que hemos recibido
function getReceivedMessages(req, res) {
    let userId = req.user.sub;

    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    const itemPerPage = 4;

    Message.find({receiver: userId})
    .populate('emitter', '_id name surname nick')
    .paginate(page, itemPerPage, (err, messages, total) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la petición'
            });
        }

        if (!messages) {
            return res.status(404).send({
                message: 'No hay mensajes'
            });
        }

        return res.send({
            total,
            pages: Math.ceil(total/itemPerPage),
            messages
        });
    });
}

// Obtener los mensajes que hemos enviado
function getEmmitMessages(req, res) {
    let userId = req.user.sub;

    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    const itemPerPage = 4;

    Message.find({emitter: userId})
    .populate('emitter receiver', '_id name surname nick')
    .paginate(page, itemPerPage, (err, messages, total) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la petición'
            });
        }

        if (!messages) {
            return res.status(404).send({
                message: 'No hay mensajes'
            });
        }

        return res.send({
            total,
            pages: Math.ceil(total/itemPerPage),
            messages
        });
    });
}

// Obtener los mensajes no leidos
function getUnviewedMessages(req, res) {
    let userId = req.user.sub;

    Message.countDocuments({receiver: userId, viewed: 'false'}).exec( (err, count) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la petición'
            });
        }

        return res.send({
            'unviewed': count
        });
    });
}

// Moddificar los mensajes no leidos a vistos/leiods
function setViewedMessages(req, res) {
    let userId = req.user.sub;

    Message.updateMany({receiver: userId, viewed: 'false'}, {viewed: 'true'}, {multi: true}, (err, messageUpdate) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la petición'
            });
        }

        return res.send({
            messages: messageUpdate
        });
    });
}

module.exports = {
    pruebaMessage,
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages
};