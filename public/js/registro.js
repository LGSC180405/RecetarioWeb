document.addEventListener("DOMContentLoaded", () => {
    // Usar la configuración global de config.js en lugar de hardcodear
    const API_URL = window.API_URL || API_CONFIG.BASE_URL; // ✅ Usa config dinámica
    
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtener campos
        const correo = document.getElementById("email").value.trim();
        const usuario = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const confirmar = document.getElementById("confirm-password").value;
        const tipo = "usuario";

        // Validar contraseñas
        if (password !== confirmar) {
            alert("⚠️ Las contraseñas no coinciden.");
            return;
        }

        // Crear objeto EXACTO como tu backend lo espera
        const nuevoUsuario = {
            nombreUsuario: usuario,
            correoElectronico: correo,
            contrasena: password,
            tipo: tipo
        };

        try {
            // Usar la API dinámica en lugar de localhost hardcodeado
            const respuesta = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoUsuario)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                alert("🎉 Usuario registrado exitosamente");
                window.location.href = "login.html";
            } else {
                alert("❌ Error: Correo o Usuario ya registrado");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("❌ No se pudo conectar al servidor.");
        }

    });

});