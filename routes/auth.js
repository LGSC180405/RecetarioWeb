const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }
    const usuario = await Usuario.findOne({
      $or: [{ nombreUsuario: username }, { correoElectronico: username }]
    });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    if (usuario.contrasena !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const usuarioRespuesta = {
      nombreUsuario: usuario.nombreUsuario,
      correoElectronico: usuario.correoElectronico,
      imagenPerfil: usuario.imagenPerfil,
      fechaRegistro: usuario.fechaRegistro
    };
    res.json({ mensaje: 'Login exitoso', usuario: usuarioRespuesta });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Verificar usuario
router.post('/verify', async (req, res) => {
  try {
    const { nombreUsuario } = req.body;
    if (!nombreUsuario) {
      return res.status(400).json({ error: 'Nombre de usuario requerido' });
    }
    const usuario = await Usuario.findOne({ nombreUsuario });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const usuarioRespuesta = {
      nombreUsuario: usuario.nombreUsuario,
      correoElectronico: usuario.correoElectronico,
      imagenPerfil: usuario.imagenPerfil,
      fechaRegistro: usuario.fechaRegistro
    };
    res.json({ valido: true, usuario: usuarioRespuesta });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Cambiar contraseña
router.put('/change-password', async (req, res) => {
  try {
    const { nombreUsuario, oldPassword, newPassword } = req.body;
    if (!nombreUsuario || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const usuario = await Usuario.findOne({ nombreUsuario });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (usuario.contrasena !== oldPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    usuario.contrasena = newPassword;
    await usuario.save();
    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;