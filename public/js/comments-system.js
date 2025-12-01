// Sistema de comentarios para Blog de Consejos
// Requiere autenticación para comentar

document.addEventListener('DOMContentLoaded', function() {
    // Cargar comentarios guardados
    loadAllComments();
    
    // Configurar contadores de caracteres
    setupCharCounters();
    
    // Verificar sesión para habilitar/deshabilitar comentarios
    checkAuthForComments();
});

/**
 * Verifica si el usuario está autenticado y habilita/deshabilita comentarios
 */
function checkAuthForComments() {
    const isLoggedIn = window.authSession ? window.authSession.checkSession() : false;
    
    const commentForms = document.querySelectorAll('.comment-form');
    
    commentForms.forEach(form => {
        const textarea = form.querySelector('.comment-input');
        const button = form.querySelector('.btn-comment');
        
        if (!isLoggedIn) {
            textarea.disabled = true;
            textarea.placeholder = 'Debes iniciar sesión para comentar...';
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        } else {
            textarea.disabled = false;
            textarea.placeholder = 'Escribe tu comentario...';
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    });
}

/**
 * Configura los contadores de caracteres para los textareas
 */
function setupCharCounters() {
    const textareas = document.querySelectorAll('.comment-input');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            const charCount = this.value.length;
            const counter = this.closest('.comment-form').querySelector('.char-count');
            counter.textContent = `${charCount}/500`;
            
            // Cambiar color si se acerca al límite
            if (charCount > 450) {
                counter.style.color = '#e74c3c';
            } else if (charCount > 400) {
                counter.style.color = '#f39c12';
            } else {
                counter.style.color = '#666';
            }
        });
    });
}

/**
 * Alterna la visualización de comentarios
 */
function toggleComments(blogId) {
    const commentsContainer = document.getElementById(`comments-${blogId}`);
    const toggleButton = event.target;
    
    if (commentsContainer.style.display === 'none') {
        commentsContainer.style.display = 'block';
        toggleButton.textContent = 'Ocultar comentarios ▲';
        toggleButton.classList.add('active');
    } else {
        commentsContainer.style.display = 'none';
        toggleButton.textContent = 'Ver comentarios ▼';
        toggleButton.classList.remove('active');
    }
}

/**
 * Agrega un nuevo comentario
 */
function addComment(blogId) {
    // Verificar autenticación
    const isLoggedIn = window.authSession ? window.authSession.checkSession() : false;
    
    if (!isLoggedIn) {
        showNotification('⚠️ Debes iniciar sesión para comentar', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Obtener el textarea y su contenido
    const card = document.querySelector(`[data-blog-id="${blogId}"]`);
    const textarea = card.querySelector('.comment-input');
    const commentText = textarea.value.trim();
    
    // Validar que no esté vacío
    if (!commentText) {
        showNotification('⚠️ El comentario no puede estar vacío', 'warning');
        textarea.focus();
        return;
    }
    
    // Validar longitud
    if (commentText.length > 500) {
        showNotification('⚠️ El comentario es demasiado largo (máximo 500 caracteres)', 'warning');
        return;
    }
    
    // Obtener información del usuario
    const user = window.authSession.getCurrentUser();
    const username = user ? user.username : 'Usuario Anónimo';
    
    // Crear objeto de comentario
    const comment = {
        id: Date.now(),
        blogId: blogId,
        username: username,
        text: commentText,
        timestamp: new Date().toISOString(),
        likes: 0
    };
    
    // Guardar comentario
    saveComment(comment);
    
    // Limpiar textarea
    textarea.value = '';
    const charCounter = card.querySelector('.char-count');
    charCounter.textContent = '0/500';
    charCounter.style.color = '#666';
    
    // Recargar comentarios de esta tarjeta
    loadComments(blogId);
    
    // Mostrar notificación
    showNotification('✓ Comentario publicado exitosamente', 'success');
}

/**
 * Guarda un comentario en localStorage
 */
function saveComment(comment) {
    try {
        // Obtener comentarios existentes
        let comments = JSON.parse(localStorage.getItem('blogComments')) || [];
        
        // Agregar nuevo comentario
        comments.push(comment);
        
        // Guardar en localStorage
        localStorage.setItem('blogComments', JSON.stringify(comments));
        
    } catch (e) {
        console.error('Error al guardar comentario:', e);
        showNotification('❌ Error al guardar el comentario', 'error');
    }
}

/**
 * Carga comentarios de un blog específico
 */
function loadComments(blogId) {
    try {
        // Obtener comentarios del localStorage
        const comments = JSON.parse(localStorage.getItem('blogComments')) || [];
        
        // Filtrar comentarios de este blog
        const blogComments = comments.filter(c => c.blogId === blogId);
        
        // Ordenar por fecha (más recientes primero)
        blogComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Obtener contenedor de comentarios
        const commentsList = document.querySelector(`#comments-${blogId} .comments-list`);
        const commentsCount = document.querySelector(`[data-blog-id="${blogId}"] .comments-count`);
        
        // Actualizar contador
        commentsCount.textContent = blogComments.length;
        
        // Limpiar lista
        commentsList.innerHTML = '';
        
        // Si no hay comentarios
        if (blogComments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
            return;
        }
        
        // Renderizar comentarios
        blogComments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
        
    } catch (e) {
        console.error('Error al cargar comentarios:', e);
    }
}

/**
 * Carga todos los comentarios de todas las tarjetas
 */
function loadAllComments() {
    const cards = document.querySelectorAll('[data-blog-id]');
    cards.forEach(card => {
        const blogId = parseInt(card.getAttribute('data-blog-id'));
        loadComments(blogId);
    });
}

/**
 * Crea el elemento HTML de un comentario
 */
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.setAttribute('data-comment-id', comment.id);
    
    // Formatear fecha
    const date = new Date(comment.timestamp);
    const formattedDate = formatDate(date);
    
    // Verificar si el comentario es del usuario actual
    const currentUser = window.authSession ? window.authSession.getCurrentUser() : null;
    const isOwnComment = currentUser && currentUser.username === comment.username;
    
    div.innerHTML = `
        <div class="comment-header">
            <div class="comment-user">
                <span class="comment-avatar">👤</span>
                <span class="comment-username">${escapeHtml(comment.username)}</span>
                ${isOwnComment ? '<span class="own-badge">Tú</span>' : ''}
            </div>
            <span class="comment-date">${formattedDate}</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
        <div class="comment-actions-bottom">
            <button class="btn-like ${comment.liked ? 'liked' : ''}" onclick="likeComment(${comment.id}, ${comment.blogId})">
                ${comment.liked ? '❤️' : '🤍'} ${comment.likes > 0 ? comment.likes : ''}
            </button>
            ${isOwnComment ? `<button class="btn-delete" onclick="deleteComment(${comment.id}, ${comment.blogId})">🗑️ Eliminar</button>` : ''}
        </div>
    `;
    
    return div;
}

/**
 * Da like a un comentario
 */
function likeComment(commentId, blogId) {
    try {
        let comments = JSON.parse(localStorage.getItem('blogComments')) || [];
        const commentIndex = comments.findIndex(c => c.id === commentId);
        
        if (commentIndex !== -1) {
            // Toggle like
            if (comments[commentIndex].liked) {
                comments[commentIndex].liked = false;
                comments[commentIndex].likes = Math.max(0, (comments[commentIndex].likes || 0) - 1);
            } else {
                comments[commentIndex].liked = true;
                comments[commentIndex].likes = (comments[commentIndex].likes || 0) + 1;
            }
            
            localStorage.setItem('blogComments', JSON.stringify(comments));
            loadComments(blogId);
        }
    } catch (e) {
        console.error('Error al dar like:', e);
    }
}

/**
 * Elimina un comentario
 */
function deleteComment(commentId, blogId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
        return;
    }
    
    try {
        let comments = JSON.parse(localStorage.getItem('blogComments')) || [];
        comments = comments.filter(c => c.id !== commentId);
        localStorage.setItem('blogComments', JSON.stringify(comments));
        loadComments(blogId);
        showNotification('✓ Comentario eliminado', 'success');
    } catch (e) {
        console.error('Error al eliminar comentario:', e);
        showNotification('❌ Error al eliminar el comentario', 'error');
    }
}

/**
 * Formatea una fecha a formato legible
 */
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Muestra una notificación temporal
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}