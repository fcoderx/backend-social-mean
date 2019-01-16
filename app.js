let express = require('express');
let bodyParser = require('body-parser');

let app = express();

// Cargar rutas
let user_routes = require('./routes/user');
let follow_routes = require('./routes/follow');
let publication_routes = require('./routes/publication');
let message_routes = require('./routes/message');

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cors


// Rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

//exportar
module.exports = app;