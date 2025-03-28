import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAAK8N_zcj4N3iAIJ73NPurl_Mtet2dA8c",
    authDomain: "juego-torres-ceballos.firebaseapp.com",
    projectId: "juego-torres-ceballos",
    storageBucket: "juego-torres-ceballos.firebasestorage.app",
    messagingSenderId: "388847156697",
    appId: "1:388847156697:web:fabc1f98b9ea834113edc8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables del juego
let clicks = 0;
let tiempoRestante = 10;
let intervalo;

// 🚀 Iniciar el juego
window.iniciarJuego = function () {
    let nombre = document.getElementById("nombreJugador").value.trim();
    
    // Validar si el usuario ingresó un nombre
    if (!nombre) {
        document.getElementById("mensajeFinal").innerText = "⚠️ Por favor, ingresa tu nombre antes de jugar.";
        return;
    }

    // Reiniciar juego
    clicks = 0;
    tiempoRestante = 10;
    document.getElementById("contador").innerText = clicks;
    document.getElementById("tiempo").innerText = tiempoRestante;
    document.getElementById("mensajeFinal").innerText = ""; // Borrar mensajes anteriores

    // Desactivar botones mientras corre el tiempo
    document.querySelector("button[onclick='iniciarJuego()']").disabled = true;
    document.querySelector("button[onclick='contarClick()']").disabled = false;

    // Temporizador
    intervalo = setInterval(() => {
        if (tiempoRestante > 0) {
            tiempoRestante--;
            document.getElementById("tiempo").innerText = tiempoRestante;
        } else {
            clearInterval(intervalo);
            document.querySelector("button[onclick='iniciarJuego()']").disabled = false;
            document.querySelector("button[onclick='contarClick()']").disabled = true;

            guardarPuntuacion(nombre, clicks);
            document.getElementById("mensajeFinal").innerText = `⏳ ¡Tiempo terminado! Puntos: ${clicks}`;
            cargarPuntuaciones();
        }
    }, 1000);
};

// 🔘 Contar clics
window.contarClick = function () {
    if (tiempoRestante > 0) {
        clicks++;
        document.getElementById("contador").innerText = clicks;
    }
};

// 💾 Guardar puntuación en Firebase
async function guardarPuntuacion(nombre, puntos) {
    try {
        await addDoc(collection(db, "puntuaciones"), {
            nombre: nombre,
            puntos: puntos,
            fecha: new Date()
        });
    } catch (error) {
        console.error("Error guardando puntuación: ", error);
    }
}

// 📊 Cargar mejores puntuaciones
async function cargarPuntuaciones() {
    const consulta = query(collection(db, "puntuaciones"), orderBy("puntos", "desc"), limit(5));
    const resultados = await getDocs(consulta);

    let tablaHTML = "<h2>Top 5 Puntuaciones</h2><ul>";
    resultados.forEach(doc => {
        const data = doc.data();
        tablaHTML += `<li>${data.nombre}: ${data.puntos} puntos</li>`;
    });
    tablaHTML += "</ul>";
    document.getElementById("puntuaciones").innerHTML = tablaHTML;
}

// Cargar las puntuaciones al inicio
window.onload = cargarPuntuaciones;
