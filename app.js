let express = require('express');
let bodyParser = require('body-parser');

let app = express();

// Cargar rutas
let user_routes = require('./routes/user');

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cors


// Rutas
app.use('/api', user_routes);


//exportar
module.exports = app;