const mongoose = require('mongoose');

const ComentarioBlogSchema = new mongoose.Schema({
  blogTitulo: { type: String, required: true },
  usuario: { type: String, required: true },
  texto: String,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComentarioBlog', ComentarioBlogSchema, 'comentariosblogs');
