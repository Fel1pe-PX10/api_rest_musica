// Importar ddbb
const conn = require('./database/connection');

// Importar dependencias
const express = require('express');
const cors = require('cors');

// Mensaje de bienvenida
console.log('Start de App Musica con Node');

// Ejecutar conexion a la bbdd
conn();

// Crear servidor de node
const app = express();
const port = 3910;

// configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Cargar configuracion de rutas 


// Ruta de prueba
app.get('/test', (req, res) => {
    return res.json({
        status: 'success',
        message: 'exito'
    }); 
});

// Poner el servidor a escuchar peticiones http
app.listen(port, () => {
    console.log('Servidor de node escuchando por el puerto', port);
})