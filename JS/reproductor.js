(async function () {

    // Pide la lista de canciones a la API serverless
    let canciones = [];
    try {
        const res = await fetch("/api/canciones");
        canciones = await res.json();
    } catch {
        console.error("No se pudo cargar la lista de canciones.");
        return;
    }

    if (!canciones.length) return;

    const audio        = new Audio();
    let indice         = 0;
    let reproduciendo  = false;
    let shuffle        = false;

    const elCancion   = document.getElementById("RepCancion");
    const elInterpretes     = document.getElementById("RepInterpretes");
    const elPlay      = document.getElementById("RepPlay");
    const elAnterior  = document.getElementById("RepAnterior");
    const elSiguiente = document.getElementById("RepSiguiente");
    const elShuffle   = document.getElementById("RepShuffle");
    const elBarra     = document.getElementById("RepBarra");
    const elActual    = document.getElementById("RepActual");
    const elTotal     = document.getElementById("RepTotal");
    const elVol       = document.getElementById("RepBarraVol");
    const elLista     = document.getElementById("RepLista");
    const elDescargar = document.getElementById("RepDescargar");

    function formato(s) {
        s = Math.floor(s) || 0;
        return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }

    function siguienteIndice(direccion) {
        if (shuffle) {
            let nuevo;
            do { nuevo = Math.floor(Math.random() * canciones.length); }
            while (canciones.length > 1 && nuevo === indice);
            return nuevo;
        }
        return (indice + direccion + canciones.length) % canciones.length;
    }

    function cargar(i) {
        indice = (i + canciones.length) % canciones.length;
        const c = canciones[indice];
        audio.src = c.src;
        elCancion.textContent = c.titulo;
        elInterpretes.textContent   = c.interpretes;
        elBarra.value         = 0;
        elActual.textContent  = "0:00";
        elTotal.textContent   = "0:00";
        document.querySelectorAll(".RepLista li").forEach((li, idx) =>
            li.classList.toggle("activa", idx === indice));
        if (reproduciendo) audio.play();
    }

    function togglePlay() {
        if (reproduciendo) {
            audio.pause();
            reproduciendo = false;
            elPlay.innerHTML = "&#9654;";
        } else {
            audio.play();
            reproduciendo = true;
            elPlay.innerHTML = "&#9646;&#9646;";
        }
    }

    function toggleShuffle() {
        shuffle = !shuffle;
        elShuffle.classList.toggle("activo", shuffle);
    }

    audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.duration)) {
            elBarra.max          = Math.floor(audio.duration);
            elBarra.value        = Math.floor(audio.currentTime);
            elActual.textContent = formato(audio.currentTime);
            elTotal.textContent  = formato(audio.duration);
        }
    });

    audio.addEventListener("ended", () => cargar(siguienteIndice(1)));

    elPlay.addEventListener("click",      togglePlay);
    elShuffle.addEventListener("click",   toggleShuffle);
    elAnterior.addEventListener("click",  () => { reproduciendo = true; cargar(siguienteIndice(-1)); });
    elSiguiente.addEventListener("click", () => { reproduciendo = true; cargar(siguienteIndice(1)); });

    elBarra.addEventListener("input", () => { audio.currentTime = elBarra.value; });
    elVol.addEventListener("input",   () => { audio.volume = elVol.value / 100; });
    elDescargar.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = canciones[indice].src;
        a.download = canciones[indice].src.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Construir lista de canciones
    canciones.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<div class="RepListaRow"><span class="RepListaNum">${i + 1}</span><span class="RepListaTitulo">${c.titulo}</span></div><span class="RepListaAutor">${c.interpretes}</span>`;
        li.addEventListener("click", () => { reproduciendo = true; cargar(i); });
        elLista.appendChild(li);
    });

    audio.volume = elVol.value / 100;
    cargar(0);

})();
