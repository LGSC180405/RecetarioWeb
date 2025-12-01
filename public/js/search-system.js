// Sistema de búsqueda para La Cabaña
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const menuItems = document.querySelectorAll('.menu-item');
    const noResultsMessage = document.getElementById('no-results-message');

    // Función para realizar la búsqueda
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let hasResults = false;

        menuItems.forEach(item => {
            const title = item.querySelector('h2').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            // Busca en el título y descripción
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'flex';
                hasResults = true;
                
                // Animación de aparición
                item.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                item.style.display = 'none';
            }
        });

        // Mostrar u ocultar mensaje de "sin resultados"
        if (!hasResults && searchTerm !== '') {
            if (!noResultsMessage) {
                createNoResultsMessage();
            } else {
                noResultsMessage.style.display = 'block';
            }
        } else {
            if (noResultsMessage) {
                noResultsMessage.style.display = 'none';
            }
        }

        // Si el término de búsqueda está vacío, mostrar todos
        if (searchTerm === '') {
            menuItems.forEach(item => {
                item.style.display = 'flex';
            });
        }
    }

    // Crear mensaje de "sin resultados"
    function createNoResultsMessage() {
        const menuGrid = document.querySelector('.menu-grid');
        const message = document.createElement('div');
        message.id = 'no-results-message';
        message.className = 'no-results';
        message.innerHTML = `
            <div class="no-results-content">
                <img src="img/search-icon.png" alt="Sin resultados" onerror="this.style.display='none'">
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        menuGrid.parentElement.insertBefore(message, menuGrid);
    }

    // Búsqueda en tiempo real mientras se escribe
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        
        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
                searchInput.blur(); // Oculta el teclado en móviles
            }
        });
    }

    // Búsqueda al hacer clic en el botón
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    // Limpiar búsqueda al hacer clic en el icono de limpiar
    const clearButton = document.getElementById('clear-search');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            performSearch();
            searchInput.focus();
        });
    }

    // Mostrar/ocultar botón de limpiar
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const clearButton = document.getElementById('clear-search');
            if (clearButton) {
                clearButton.style.display = this.value ? 'block' : 'none';
            }
        });
    }
});