let express = require('express');
let bodyParser = require('body-parser');

let app = express();

// Cargar rutas
let user_routes = require('./routes/user');
let follow_routes = require('./routes/follow');

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cors


// Rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);


//exportar
module.exports = app;