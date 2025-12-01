document.addEventListener("DOMContentLoaded", async () => {
  // Obtener configuración de API
  const API_URL = window.API_URL || 'http://localhost:3000/api';
  const API_BASE = window.API_BASE || 'http://localhost:3000';
  
  console.log('🔧 Configuración:');
  console.log('   API_URL:', API_URL);
  console.log('   API_BASE:', API_BASE);
  
  const contenedorBlogs = document.querySelector('.contenido');
  
  if (!contenedorBlogs) {
    console.error('❌ Contenedor de blogs no encontrado');
    return;
  }

  try {
    console.log('📖 Cargando blogs desde:', `${API_URL}/blogs`);
    
    // Obtener blogs desde la API
    const response = await fetch(`${API_URL}/blogs`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const blogs = await response.json();
    console.log(`✅ ${blogs.length} blogs cargados:`, blogs);
    
    // Limpiar contenedor (eliminar tarjetas estáticas)
    contenedorBlogs.innerHTML = '';
    
    if (blogs.length === 0) {
      contenedorBlogs.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <p style="font-size: 1.2rem; color: #666;">📝 No hay blogs disponibles aún.</p>
          <a href="CrearBlog.html" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
            Crear el primer blog
          </a>
        </div>
      `;
      return;
    }
    
    // Crear tarjetas dinámicamente
    blogs.forEach((blog, index) => {
      const blogId = blog._id || index + 1;
      
      // Formatear fecha
      const fecha = new Date(blog.fecha).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      // Construir URL de imagen
      let imagenURL = 'img/pri.jpg'; // Imagen por defecto
      
      if (blog.imagen?.almacenadoEn) {
        // Si la imagen tiene una URL completa, usarla directamente
        if (blog.imagen.almacenadoEn.startsWith('http')) {
          imagenURL = blog.imagen.almacenadoEn;
        } else {
          // Si es una ruta relativa, construir la URL completa
          imagenURL = `${API_BASE}${blog.imagen.almacenadoEn}`;
        }
        console.log('🖼️ Imagen del blog:', blog.titulo, '→', imagenURL);
      } else {
        console.log('ℹ️ Blog sin imagen:', blog.titulo);
      }
      
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta';
      tarjeta.setAttribute('data-blog-id', blogId);
      
      tarjeta.innerHTML = `
        <img src="${imagenURL}" 
             alt="${blog.titulo}" 
             onerror="this.onerror=null; this.src='img/pri.jpg'; console.error('Error cargando imagen:', '${imagenURL}');"
             style="width: 100%; height: 200px; object-fit: cover;">
        <h3>${blog.titulo}</h3>
        <p>${blog.contenido || 'Sin contenido'}</p>
        <div class="descrip">
          <img src="img/user.png" alt="usuario">
          <p>${blog.autor}</p>
          <p>${fecha}</p>
        </div>
        
        <!-- Sección de comentarios -->
        <div class="comments-section">
          <div class="comments-header">
            <h4>💬 Comentarios (<span class="comments-count">0</span>)</h4>
            <button class="toggle-comments" onclick="toggleComments('${blogId}')">
              Ver comentarios ▼
            </button>
          </div>
          
          <div class="comments-container" id="comments-${blogId}" style="display: none;">
            <div class="comments-list"></div>
            <div class="comment-form">
              <textarea class="comment-input" placeholder="Escribe tu comentario..." maxlength="500"></textarea>
              <div class="comment-actions">
                <span class="char-count">0/500</span>
                <button class="btn-comment" onclick="addComment('${blogId}')">
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      contenedorBlogs.appendChild(tarjeta);
    });
    
    console.log('✅ Blogs renderizados correctamente');
    
  } catch (error) {
    console.error('❌ Error al cargar blogs:', error);
    contenedorBlogs.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #d32f2f; background: #ffebee; border-radius: 8px; margin: 2rem;">
        <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">⚠️ Error al cargar los blogs</p>
        <p style="font-size: 0.9rem; color: #666;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.6rem 1.2rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;">
          🔄 Reintentar
        </button>
      </div>
    `;
  }
});

// Función helper para verificar si una URL de imagen es válida
async function verificarImagen(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
/*document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = window.API_URL || 'http://localhost:3000/api';
  const contenedorBlogs = document.querySelector('.contenido');
  
  try {
    // Obtener blogs desde la API
    const response = await fetch(`${API_URL}/blogs`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const blogs = await response.json();
    console.log('Blogs cargados:', blogs);
    
    // Limpiar contenedor (eliminar tarjetas estáticas)
    contenedorBlogs.innerHTML = '';
    
    // Crear tarjetas dinámicamente
    blogs.forEach((blog, index) => {
      const blogId = blog._id || index + 1;
      const fecha = new Date(blog.fecha).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta';
      tarjeta.setAttribute('data-blog-id', blogId);
      
      tarjeta.innerHTML = `
        <img src="${blog.imegen?.almacenadoEn || 'img/pri.jpg'}" alt="${blog.titulo}">
        <h3>${blog.titulo}</h3>
        <p>${blog.contenido}</p>
        <div class="descrip">
          <img src="img/user.png" alt="usuario">
          <p>${blog.autor}</p>
          <p>${fecha}</p>
        </div>
        
        <!-- Sección de comentarios -->
        <div class="comments-section">
          <div class="comments-header">
            <h4>💬 Comentarios (<span class="comments-count">0</span>)</h4>
            <button class="toggle-comments" onclick="toggleComments('${blogId}')">
              Ver comentarios ▼
            </button>
          </div>
          
          <div class="comments-container" id="comments-${blogId}" style="display: none;">
            <div class="comments-list"></div>
            <div class="comment-form">
              <textarea class="comment-input" placeholder="Escribe tu comentario..." maxlength="500"></textarea>
              <div class="comment-actions">
                <span class="char-count">0/500</span>
                <button class="btn-comment" onclick="addComment('${blogId}')">
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      contenedorBlogs.appendChild(tarjeta);
    });
    
    if (blogs.length === 0) {
      contenedorBlogs.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay blogs disponibles aún.</p>';
    }
    
  } catch (error) {
    console.error('Error al cargar blogs:', error);
    contenedorBlogs.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #d32f2f;">
        <p>⚠️ Error al cargar los blogs</p>
        <p style="font-size: 0.9rem;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
          Reintentar
        </button>
      </div>
    `;
  }
});*/