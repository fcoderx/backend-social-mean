const mongoose = require('mongoose');
const app = require('./app');
const port = 3800;

// Conexión a la BD
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/meanSocial', {useNewUrlParser: true})
    .then( () => {
        console.log('La conexión a la base de datos meanSocial se realizo satisfactoriamente');

        // Crear servidor
        app.listen(port, () => {
            console.log('Servidor corriendo en el puerto ' + port);
        });
    })
    .catch(err => console.log(err));