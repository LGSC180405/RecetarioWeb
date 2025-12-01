// Script de inicialización de MongoDB para RedRecetas
// Este script se ejecuta automáticamente cuando se crea el contenedor de MongoDB

print('🚀 Iniciando configuración de RedRecetas...');

// Cambiar a la base de datos RedRecetas
db = db.getSiblingDB('RedRecetas');

print('📦 Creando colecciones...');

// Crear colecciones
db.createCollection('usuarios');
db.createCollection('recetas');
db.createCollection('valoracions');  // Nota: tu modelo usa 'Valoracion' pero el init tiene 'valoracions'
db.createCollection('blogconsejos');
db.createCollection('comentarioblogs');

print('✅ Colecciones creadas');

print('👥 Insertando usuarios de prueba...');

// Insertar usuarios
db.usuarios.insertMany([
  { 
    nombreUsuario: '@chefLuis', 
    correoElectronico: 'chef@example.com', 
    contrasena: '123456',
    imagenPerfil: {
      nombreArchivo: 'perfil_chefLuis.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/perfiles/'
    },
    favoritos: [],
    fechaRegistro: new Date(),
    tipo: "usuario"
  },
  { 
    nombreUsuario: '@gamer', 
    correoElectronico: 'gamer@example.com', 
    contrasena: '654321',
    imagenPerfil: {
      nombreArchivo: 'perfil_gamer.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/perfiles/'
    },
    favoritos: [],
    fechaRegistro: new Date(),
    tipo: "usuario"
  },
  { 
    nombreUsuario: '@maria_chef', 
    correoElectronico: 'maria@example.com', 
    contrasena: '123456',
    imagenPerfil: {
      nombreArchivo: 'perfil_maria.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/perfiles/'
    },
    favoritos: [],
    fechaRegistro: new Date(),
    tipo: "usuario"
  },
  {
    nombreUsuario: '@admin', 
    correoElectronico: 'admin@example.com', 
    contrasena: 'admin',
    imagenPerfil: {
      nombreArchivo: 'admin.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/perfiles/'
    },
    favoritos: [],
    fechaRegistro: new Date(),
    tipo: "admin"
  }
]);

print('✅ Usuarios insertados: ' + db.usuarios.countDocuments());

print('🍽️ Insertando recetas de prueba...');

// Insertar recetas
db.recetas.insertMany([
  { 
    usuario: '@chefLuis', 
    titulo: 'Pasta Energética',
    tipo: 'Cena',
    ingredientes: ['Pasta', 'Tomate', 'Queso', 'Albahaca', 'Aceite de oliva'], 
    descripcion: 'Ideal para gamers que necesitan energía durante largas sesiones',
    pasos: [
      'Hervir agua con sal',
      'Cocinar la pasta al dente',
      'Preparar salsa de tomate con albahaca',
      'Mezclar pasta con salsa',
      'Agregar queso rallado al servir'
    ],
    imagen: {
      nombreArchivo: 'pasta_energetica.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/recetas/'
    },
    fechaCreacion: new Date()
  },
  { 
    usuario: '@chefLuis', 
    titulo: 'Ensalada Gamer',
    tipo: 'Almuerzo',
    ingredientes: ['Lechuga', 'Tomate', 'Pollo', 'Aguacate', 'Aderezo'], 
    descripcion: 'Saludable y rápida para mantener tu energía',
    imagen: {
      nombreArchivo: 'ensalada_gamer.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/recetas/'
    },
    fechaCreacion: new Date()
  },
  { 
    usuario: '@maria_chef', 
    titulo: 'Tacos al Pastor',
    tipo: 'Cena',
    ingredientes: ['Carne de cerdo', 'Piña', 'Tortillas', 'Cilantro', 'Cebolla', 'Limón'], 
    descripcion: 'Deliciosos tacos mexicanos con el toque perfecto',
    imagen: {
      nombreArchivo: 'tacos_pastor.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/recetas/'
    },
    fechaCreacion: new Date()
  },
  { 
    usuario: '@gamer', 
    titulo: 'Smoothie Energético',
    tipo: 'Desayuno',
    ingredientes: ['Plátano', 'Fresas', 'Yogurt', 'Miel', 'Avena'], 
    descripcion: 'Perfect para empezar el día con toda la energía',
    imagen: {
      nombreArchivo: 'smoothie_energetico.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/recetas/'
    },
    fechaCreacion: new Date()
  }
]);

print('✅ Recetas insertadas: ' + db.recetas.countDocuments());

print('⭐ Insertando valoraciones...');

// Insertar valoraciones
db.valoracions.insertMany([
  {
    recetaTitulo: 'Pasta Energética',
    usuario: '@gamer',
    calificacion: 5,
    estrellas: 5,
    comentario: 'Perfecta para sesiones largas de gaming',
    fecha: new Date()
  },
  {
    recetaTitulo: 'Ensalada Gamer',
    usuario: '@gamer',
    calificacion: 4,
    estrellas: 4,
    comentario: 'Muy fresca y nutritiva, me mantiene con energía',
    fecha: new Date()
  },
  {
    recetaTitulo: 'Tacos al Pastor',
    usuario: '@chefLuis',
    calificacion: 5,
    estrellas: 5,
    comentario: '¡Deliciosos! Los mejores tacos que he probado',
    fecha: new Date()
  },
  {
    recetaTitulo: 'Smoothie Energético',
    usuario: '@maria_chef',
    calificacion: 5,
    estrellas: 5,
    comentario: 'Ideal para comenzar el día con toda la energía',
    fecha: new Date()
  }
]);

print('✅ Valoraciones insertadas: ' + db.valoracions.countDocuments());

print('📝 Insertando blogs de consejos...');

// Insertar blogs
db.blogconsejos.insertMany([
  {
    autor: '@chefLuis',
    titulo: 'Snacks para mantener energía',
    imagen: {
      nombreArchivo: 'snacks_energia.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/blogs/'
    },
    contenido: 'Frutos secos, batidos, y más. Mantén tu energía durante largas sesiones de juego con estos consejos nutricionales. Los snacks saludables son esenciales para mantener la concentración y el rendimiento.',
    categoria: 'Nutrición',
    fechaPublicacion: new Date()
  },
  {
    autor: '@chefLuis',
    titulo: 'Hidratación para gamers',
    imagen: {
      nombreArchivo: 'hidratacion.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/blogs/'
    },
    contenido: 'El agua es esencial. Aprende cuánto y cuándo beber para mantenerte en tu mejor forma. La deshidratación afecta directamente tu rendimiento y concentración.',
    categoria: 'Salud',
    fechaPublicacion: new Date()
  },
  {
    autor: '@maria_chef',
    titulo: 'Comidas rápidas y saludables',
    imagen: {
      nombreArchivo: 'comidas_rapidas.jpg',
      tipo: 'image/jpeg',
      almacenadoEn: 'uploads/blogs/'
    },
    contenido: 'No tienes que sacrificar la salud por la velocidad. Descubre recetas que puedes preparar en menos de 15 minutos sin comprometer la nutrición.',
    categoria: 'Consejos',
    fechaPublicacion: new Date()
  }
]);

print('✅ Blogs insertados: ' + db.blogconsejos.countDocuments());

print('💬 Insertando comentarios de blog...');

// Insertar comentarios de blog
db.comentarioblogs.insertMany([
  {
    blogTitulo: 'Snacks para mantener energía',
    usuario: '@gamer',
    texto: 'Muy útil para mis streams largos, ¡gracias por los consejos!',
    fecha: new Date()
  },
  {
    blogTitulo: 'Hidratación para gamers',
    usuario: '@gamer',
    texto: 'Excelente consejo, me ayudó mucho a mejorar mi concentración',
    fecha: new Date()
  },
  {
    blogTitulo: 'Comidas rápidas y saludables',
    usuario: '@chefLuis',
    texto: 'Estas recetas son perfectas para cuando tienes poco tiempo',
    fecha: new Date()
  }
]);

print('✅ Comentarios insertados: ' + db.comentarioblogs.countDocuments());

print('🔧 Creando índices para optimizar búsquedas...');

// Crear índices
db.usuarios.createIndex({ nombreUsuario: 1 }, { unique: true });
db.usuarios.createIndex({ correoElectronico: 1 }, { unique: true });
db.recetas.createIndex({ titulo: 1 });
db.recetas.createIndex({ tipo: 1 });
db.recetas.createIndex({ usuario: 1 });
db.recetas.createIndex({ ingredientes: 1 });
db.valoracions.createIndex({ recetaTitulo: 1 });
db.valoracions.createIndex({ usuario: 1 });
db.blogconsejos.createIndex({ titulo: 1 });
db.blogconsejos.createIndex({ autor: 1 });
db.comentarioblogs.createIndex({ blogTitulo: 1 });

print('✅ Índices creados');

print('\n🎉 ========================================');
print('   Base de datos RedRecetas inicializada');
print('========================================\n');

print('📊 Resumen de datos insertados:');
print('   👥 Usuarios: ' + db.usuarios.countDocuments());
print('   🍽️ Recetas: ' + db.recetas.countDocuments());
print('   ⭐ Valoraciones: ' + db.valoracions.countDocuments());
print('   📝 Blogs: ' + db.blogconsejos.countDocuments());
print('   💬 Comentarios: ' + db.comentarioblogs.countDocuments());
print('\n✅ ¡Todo listo para usar RedRecetas!\n');

// Actualizar algunos favoritos de ejemplo
const recetas = db.recetas.find().toArray();
if (recetas.length > 0) {
  db.usuarios.updateOne(
    { nombreUsuario: '@gamer' },
    { $set: { favoritos: [recetas[0]._id, recetas[1]._id] } }
  );
  print('✅ Favoritos actualizados para @gamer');
}
