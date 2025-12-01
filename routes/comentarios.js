const express = require('express');
const router = express.Router();
const ComentarioBlog = require('../models/ComentarioBlog');

// Crear comentario
router.post('/', async (req, res) => {
  try {
    const comentario = new ComentarioBlog(req.body);
    await comentario.save();
    res.json(comentario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos los comentarios
router.get('/', async (req, res) => {
  try {
    const comentarios = await ComentarioBlog.find();
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener comentarios por blog
router.get('/:titulo', async (req, res) => {
  try {
    const comentarios = await ComentarioBlog.find({ blogTitulo: req.params.titulo });
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;