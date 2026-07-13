const tipos = ['Todos', 'Desayuno', 'Almuerzo', 'Cena', 'Media Tarde', 'Indefinido', 'Postre', 'Acompañamiento'];
const dificultades = ['Todas', 'Fácil', 'Media', 'Difícil'];
const tiempos = ['Cualquiera', '≤ 15 min', '≤ 30 min', '≤ 60 min', '> 60 min'];
const porcionesOpts = ['Cualquiera', '1', '2', '4', '6', '8+'];
const puntuaciones = ['Cualquiera', '4+ ★', '3+ ★', '2+ ★', '1+ ★'];
const favoritosOpts = ['Todos', 'Favoritos'];
const dietas = ['Todas', 'Ninguna', 'Diabéticos', 'Celíacos', 'Veganos', 'Vegetarianos'];

function normalizarTexto(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

let recetas = [];
let filtroTipo = 'Todos';
let filtroDificultad = 'Todas';
let filtroTiempo = 'Cualquiera';
let filtroPorciones = 'Cualquiera';
let filtroPuntuacion = 'Cualquiera';
let filtroFavorito = 'Todos';
let filtroAutor = 'Todos';
let busqueda = '';
let filtroCategoria = 'Todas';
let filtroDieta = 'Todas';
var favoritosUsuario = [];
const ORDEN_MOMENTO = ['Desayuno', 'Almuerzo', 'Media Tarde', 'Cena', 'Indefinido', 'Postre', 'Acompañamiento'];
let ordenActual = 'none';
let ordenMomentoRotacion = 0;
let ordenDificultadAsc = true;
let ordenTiempoAsc = true;
let ordenFavoritosAsc = true;
let ordenSubidaAsc = false;
let ordenPuntuacionAsc = false;

function parseTiempoAMinutos(str) {
  if (!str) return Infinity;
  let total = 0;
  const h = str.match(/(\d+)\s*hora/i);
  if (h) total += parseInt(h[1]) * 60;
  const m = str.match(/(\d+)\s*min/i);
  if (m) total += parseInt(m[1]);
  return total || Infinity;
}

function mostrarSkeletonGrid(n) {
  n = n || 8;
  var grid = document.getElementById('gridRecetas');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < n; i++) {
    html += `
      <div class="skeleton-card" style="animation-delay:${i * 40}ms">
        <div class="sk-base skeleton-card-img"></div>
        <div class="skeleton-card-body">
          <div class="sk-base skeleton-card-titulo"></div>
          <div class="sk-base skeleton-card-desc"></div>
          <div class="sk-base skeleton-card-desc2"></div>
          <div class="skeleton-card-footer">
            <div class="sk-base skeleton-card-badge"></div>
            <div class="sk-base skeleton-card-badge"></div>
            <div class="sk-base skeleton-card-badge"></div>
          </div>
        </div>
      </div>`;
  }
  grid.innerHTML = html;
}

function ordenarRecetas(lista) {
  if (ordenActual === 'none') return lista;
  var copia = lista.slice();
  if (ordenActual === 'momento') {
    if (ORDEN_MOMENTO.indexOf('Indefinido') !== -1) {
      var indefIdx = (ORDEN_MOMENTO.indexOf('Indefinido') - ordenMomentoRotacion + ORDEN_MOMENTO.length) % ORDEN_MOMENTO.length;
      copia.sort(function(a, b) {
        if (a.tipo === 'Indefinido' && b.tipo !== 'Indefinido') return 1;
        if (b.tipo === 'Indefinido' && a.tipo !== 'Indefinido') return -1;
        var ia = (ORDEN_MOMENTO.indexOf(a.tipo) - ordenMomentoRotacion + ORDEN_MOMENTO.length) % ORDEN_MOMENTO.length;
        var ib = (ORDEN_MOMENTO.indexOf(b.tipo) - ordenMomentoRotacion + ORDEN_MOMENTO.length) % ORDEN_MOMENTO.length;
        return ia - ib;
      });
    } else {
      var rot = ordenMomentoRotacion;
      copia.sort(function(a, b) {
        var ia = (ORDEN_MOMENTO.indexOf(a.tipo) - rot + ORDEN_MOMENTO.length) % ORDEN_MOMENTO.length;
        var ib = (ORDEN_MOMENTO.indexOf(b.tipo) - rot + ORDEN_MOMENTO.length) % ORDEN_MOMENTO.length;
        return ia - ib;
      });
    }
  } else if (ordenActual === 'dificultad') {
    var ORD = ['Fácil', 'Media', 'Difícil'];
    copia.sort(function(a, b) {
      var ia = ORD.indexOf(a.dificultad);
      var ib = ORD.indexOf(b.dificultad);
      return ordenDificultadAsc ? ia - ib : ib - ia;
    });
  } else if (ordenActual === 'tiempo') {
    copia.sort(function(a, b) {
      var ta = parseTiempoAMinutos(a.tiempo);
      var tb = parseTiempoAMinutos(b.tiempo);
      return ordenTiempoAsc ? ta - tb : tb - ta;
    });
  } else if (ordenActual === 'favoritos') {
    copia.sort(function(a, b) {
      var fa = a.favorito || favoritosUsuario.indexOf(a.id) !== -1;
      var fb = b.favorito || favoritosUsuario.indexOf(b.id) !== -1;
      return ordenFavoritosAsc ? (fa ? -1 : 1) : (fa ? 1 : -1);
    });
  } else if (ordenActual === 'subida') {
    copia.sort(function(a, b) {
      var ta = new Date(a.created_at).getTime();
      var tb = new Date(b.created_at).getTime();
      return ordenSubidaAsc ? ta - tb : tb - ta;
    });
  } else if (ordenActual === 'puntuacion') {
    copia.sort(function(a, b) {
      return ordenPuntuacionAsc ? a.puntuacion - b.puntuacion : b.puntuacion - a.puntuacion;
    });
  }
  return copia;
}

function actualizarBotonOrdenar() {
  var btn = document.getElementById('btnOrdenar');
  if (!btn) return;
  var textos = { 'none': '🔽 Ordenar', 'momento': '📋 Momento 🔽', 'dificultad': '📊 Dificultad 🔽', 'tiempo': '⏱️ Tiempo 🔽', 'favoritos': '❤️ Favoritos 🔽', 'subida': '📅 Subida 🔽', 'puntuacion': '★ Puntuación 🔽' };
  btn.textContent = textos[ordenActual] || textos['none'];
}

function actualizarDropdownOrden() {
  document.querySelectorAll('.ordenar-opcion').forEach(function(el) {
    var texto = el.dataset.texto;
    if (el.dataset.orden === ordenActual) {
      el.textContent = '✓ ' + texto;
    } else {
      el.textContent = texto;
    }
  });
}

function cerrarDropdownOrden() {
  var dd = document.getElementById('ordenarDropdown');
  if (dd) dd.classList.add('oculto');
}

async function init() {
  mostrarSkeletonGrid(8);
  try {
    recetas = await obtenerRecetas();
  } catch (e) {
    console.error('Error al cargar recetas:', e);
    recetas = [];
  }

  var sesion = obtenerSesion();
  if (sesion) {
    favoritosUsuario = await obtenerFavoritos(sesion.userId);
  }

  const params = new URLSearchParams(window.location.search);
  filtroTipo = params.get('tipo') || 'Todos';
  filtroDieta = params.get('dieta') || 'Todas';

  const buscador = document.getElementById('buscador');
  const panelFiltros = document.getElementById('panelFiltros');
  const btnFiltros = document.getElementById('btnFiltros');
  const btnCerrarFiltros = document.getElementById('btnCerrarFiltros');

  if (buscador) {
    var timeoutBusqueda;
    buscador.addEventListener('input', function () {
      clearTimeout(timeoutBusqueda);
      var self = this;
      timeoutBusqueda = setTimeout(function () {
        busqueda = self.value.trim();
        renderizar();
      }, 200);
    });
  }

  if (btnFiltros) {
    btnFiltros.addEventListener('click', function () {
      panelFiltros.classList.toggle('visible');
      btnFiltros.classList.toggle('activo');
    });
  }

  if (btnCerrarFiltros) {
    btnCerrarFiltros.addEventListener('click', function () {
      panelFiltros.classList.remove('visible');
      btnFiltros.classList.remove('activo');
    });
  }

  var btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener('click', function () {
      limpiarFiltros();
      panelFiltros.classList.remove('visible');
      btnFiltros.classList.remove('activo');
    });
  }

  panelFiltros.addEventListener('click', function (e) {
    var header = e.target.closest('.filtro-header');
    if (header) header.parentElement.classList.toggle('plegado');
  });

  var btnOrdenar = document.getElementById('btnOrdenar');
  var ordenarDropdown = document.getElementById('ordenarDropdown');
  if (btnOrdenar && ordenarDropdown) {
    btnOrdenar.addEventListener('click', function (e) {
      e.stopPropagation();
      ordenarDropdown.classList.toggle('oculto');
    });
    ordenarDropdown.addEventListener('click', function (e) {
      var opcion = e.target.closest('.ordenar-opcion');
      if (!opcion) return;
      var criterio = opcion.dataset.orden;
      if (criterio === ordenActual) {
        if (criterio === 'momento') {
          ordenMomentoRotacion = (ordenMomentoRotacion + 1) % ORDEN_MOMENTO.length;
        } else if (criterio === 'dificultad') {
          ordenDificultadAsc = !ordenDificultadAsc;
        } else if (criterio === 'tiempo') {
          ordenTiempoAsc = !ordenTiempoAsc;
        } else if (criterio === 'favoritos') {
          ordenFavoritosAsc = !ordenFavoritosAsc;
        } else if (criterio === 'subida') {
          ordenSubidaAsc = !ordenSubidaAsc;
        } else if (criterio === 'puntuacion') {
          ordenPuntuacionAsc = !ordenPuntuacionAsc;
        }
      } else {
        ordenActual = criterio;
        if (criterio === 'momento') ordenMomentoRotacion = 0;
        else if (criterio === 'dificultad') ordenDificultadAsc = true;
        else if (criterio === 'tiempo') ordenTiempoAsc = true;
        else if (criterio === 'favoritos') ordenFavoritosAsc = true;
        else if (criterio === 'subida') ordenSubidaAsc = false;
        else if (criterio === 'puntuacion') ordenPuntuacionAsc = false;
      }
      actualizarBotonOrdenar();
      actualizarDropdownOrden();
      cerrarDropdownOrden();
      renderizar();
    });
  }

  document.addEventListener('click', function (e) {
    if (ordenarDropdown && !e.target.closest('#btnOrdenar') && !e.target.closest('#ordenarDropdown')) {
      cerrarDropdownOrden();
    }
  });

  renderizarFiltrosTipo();
  renderizarFiltrosDificultad();
  renderizarFiltrosTiempo();
  renderizarFiltrosPorciones();
  renderizarFiltrosPuntuacion();
  if (estaLogueado()) renderizarFiltrosFavorito();
  renderizarFiltrosAutor();
  renderizarFiltrosCategorias();
  renderizarFiltrosDieta();
  renderizar();

  var filtroFavGrupo = document.querySelector('.panel-filtros .filtro-grupo:nth-child(6)');
  if (filtroFavGrupo) filtroFavGrupo.style.display = estaLogueado() ? '' : 'none';
  document.querySelectorAll('.ordenar-opcion.solo-login').forEach(function(el) {
    el.style.display = estaLogueado() ? '' : 'none';
  });

  var spinner = document.getElementById('spinner-global');
  if (spinner) spinner.classList.add('ocultar');
}

function renderizarFiltrosTipo() {
  const contenedor = document.getElementById('filtrosTipo');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  tipos.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroTipo === t ? ' activo' : '');
    btn.textContent = t;
    btn.addEventListener('click', function () {
      filtroTipo = t;
      const url = new URL(window.location);
      if (t === 'Todos') url.searchParams.delete('tipo');
      else url.searchParams.set('tipo', t);
      window.history.pushState({}, '', url);
      renderizarFiltrosTipo();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosDificultad() {
  const contenedor = document.getElementById('filtrosDificultad');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  dificultades.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroDificultad === d ? ' activo' : '');
    btn.textContent = d;
    btn.addEventListener('click', function () {
      filtroDificultad = d;
      renderizarFiltrosDificultad();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosTiempo() {
  const contenedor = document.getElementById('filtrosTiempo');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  tiempos.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroTiempo === t ? ' activo' : '');
    btn.textContent = t;
    btn.addEventListener('click', function () {
      filtroTiempo = t;
      renderizarFiltrosTiempo();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosPorciones() {
  const contenedor = document.getElementById('filtrosPorciones');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  porcionesOpts.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroPorciones === p ? ' activo' : '');
    btn.textContent = p === 'Cualquiera' ? p : (p === '8+' ? '8+' : p + ' pers.');
    btn.addEventListener('click', function () {
      filtroPorciones = p;
      renderizarFiltrosPorciones();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosPuntuacion() {
  const contenedor = document.getElementById('filtrosPuntuacion');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  puntuaciones.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroPuntuacion === p ? ' activo' : '');
    btn.textContent = p;
    btn.addEventListener('click', function () {
      filtroPuntuacion = p;
      renderizarFiltrosPuntuacion();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosFavorito() {
  const contenedor = document.getElementById('filtrosFavorito');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  favoritosOpts.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroFavorito === f ? ' activo' : '');
    btn.textContent = f === 'Favoritos' ? '⭐ ' + f : f;
    btn.addEventListener('click', function () {
      filtroFavorito = f;
      renderizarFiltrosFavorito();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosCategorias() {
  const contenedor = document.getElementById('filtrosCategorias');
  if (!contenedor) return;
  var cats = ['Todas'].concat(recetas
    .reduce(function (acc, r) {
      if (r.categorias) {
        r.categorias.split(',').forEach(function (c) {
          var t = c.trim();
          if (t && acc.indexOf(t) === -1) acc.push(t);
        });
      }
      return acc;
    }, [])
    .sort()
  );
  contenedor.innerHTML = '';
  cats.forEach(function (c) {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroCategoria === c ? ' activo' : '');
    btn.textContent = c === 'Todas' ? c : '🏷️ ' + c;
    btn.addEventListener('click', function () {
      filtroCategoria = c;
      renderizarFiltrosCategorias();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosDieta() {
  const contenedor = document.getElementById('filtrosDieta');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  dietas.forEach(function (d) {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroDieta === d ? ' activo' : '');
    btn.textContent = d === 'Todas' ? d : (d === 'Ninguna' ? '🚫 Ninguna' : '🥗 ' + d);
    btn.addEventListener('click', function () {
      filtroDieta = d;
      const url = new URL(window.location);
      if (d === 'Todas') url.searchParams.delete('dieta');
      else url.searchParams.set('dieta', d);
      window.history.pushState({}, '', url);
      renderizarFiltrosDieta();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function renderizarFiltrosAutor() {
  const contenedor = document.getElementById('filtrosAutor');
  if (!contenedor) return;
  var autores = ['Todos'].concat(recetas
    .map(function (r) { return r.autor || 'Anónimo'; })
    .filter(function (a, i, arr) { return a && arr.indexOf(a) === i; })
    .sort()
  );
  contenedor.innerHTML = '';
  autores.forEach(function (a) {
    const btn = document.createElement('button');
    btn.className = 'btn-categoria' + (filtroAutor === a ? ' activo' : '');
    btn.textContent = a === 'Todos' ? a : '✍️ ' + a;
    btn.addEventListener('click', function () {
      filtroAutor = a;
      renderizarFiltrosAutor();
      renderizar();
    });
    contenedor.appendChild(btn);
  });
}

function recetasFiltradas() {
  return recetas.filter(r => {
    const porTipo = filtroTipo === 'Todos' || r.tipo === filtroTipo;
    const porDificultad = filtroDificultad === 'Todas' || r.dificultad === filtroDificultad;
    const minutos = parseTiempoAMinutos(r.tiempo);
    const porTiempo = filtroTiempo === 'Cualquiera' ||
      (filtroTiempo === '≤ 15 min' && minutos <= 15) ||
      (filtroTiempo === '≤ 30 min' && minutos <= 30) ||
      (filtroTiempo === '≤ 60 min' && minutos <= 60) ||
      (filtroTiempo === '> 60 min' && minutos > 60);
    const p = r.porciones || 0;
    const porPorciones = filtroPorciones === 'Cualquiera' ||
      (filtroPorciones === '8+' && p >= 8) ||
      (filtroPorciones !== '8+' && p === parseInt(filtroPorciones));
    const punt = r.puntuacion || 0;
    const porPuntuacion = filtroPuntuacion === 'Cualquiera' ||
      (filtroPuntuacion === '4+ ★' && punt >= 4) ||
      (filtroPuntuacion === '3+ ★' && punt >= 3) ||
      (filtroPuntuacion === '2+ ★' && punt >= 2) ||
      (filtroPuntuacion === '1+ ★' && punt >= 1);
    const esFavUsuario = favoritosUsuario.indexOf(r.id) !== -1;
    const porFavorito = filtroFavorito === 'Todos' || (filtroFavorito === 'Favoritos' && (r.favorito || esFavUsuario));
    var categoriasReceta = r.categorias ? r.categorias.split(',').map(function(c) { return c.trim(); }) : [];
    const porCategoria = filtroCategoria === 'Todas' || categoriasReceta.indexOf(filtroCategoria) !== -1;
    const porAutor = filtroAutor === 'Todos' || (r.autor || 'Anónimo') === filtroAutor;
    const porDieta = filtroDieta === 'Todas' || (filtroDieta === 'Ninguna' ? !r.dieta : r.dieta === filtroDieta);
    var porBusqueda = busqueda === '';
    if (!porBusqueda) {
      var bNorm = normalizarTexto(busqueda);
      porBusqueda = normalizarTexto(r.titulo).includes(bNorm) ||
        r.preparaciones.some(p => p.ingredientes.some(i => normalizarTexto(i).includes(bNorm)));
    }
    return porTipo && porDificultad && porTiempo && porPorciones && porPuntuacion && porFavorito && porCategoria && porDieta && porAutor && porBusqueda;
  });
}

function renderizar() {
  const grid = document.getElementById('gridRecetas');
  const sinResultados = document.getElementById('sinResultados');
  if (!grid) return;

  var filtradas = recetasFiltradas();
  filtradas = ordenarRecetas(filtradas);

  if (filtradas.length === 0) {
    grid.innerHTML = '';
    sinResultados.classList.remove('oculto');
    return;
  }

  sinResultados.classList.add('oculto');

  grid.innerHTML = filtradas.map(r => crearTarjeta(r)).join('');
  animarTarjetas();
}

function animarTarjetas() {
  var tarjetas = document.querySelectorAll('#gridRecetas .tarjeta');
  if (!tarjetas.length) return;

  if (!('IntersectionObserver' in window)) {
    tarjetas.forEach(function(el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var idx = parseInt(el.dataset.idx || 0, 10);
        setTimeout(function() {
          el.classList.add('visible');
        }, idx * 40);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.05 });

  tarjetas.forEach(function(el, i) {
    el.dataset.idx = i;
    observer.observe(el);
  });
}

document.addEventListener('click', async function (e) {
  var btn = e.target.closest('.card-fav-btn');
  if (btn) {
    e.preventDefault();
    await toggleFavorito(btn.dataset.id);
    return;
  }
});

async function toggleFavorito(id) {
  var sesion = obtenerSesion();
  if (sesion) {
    var idx = favoritosUsuario.indexOf(id);
    if (idx === -1) {
      await agregarFavorito(sesion.userId, id);
      favoritosUsuario.push(id);
    } else {
      await quitarFavorito(sesion.userId, id);
      favoritosUsuario.splice(idx, 1);
    }
  } else {
    var todas = await obtenerRecetas();
    var r = todas.find(function (r) { return r.id === id; });
    if (!r) return;
    r.favorito = !r.favorito;
    await actualizarReceta(r);
  }
  recetas = await obtenerRecetas();
  var r = recetas.find(function (r) { return r.id === id; });
  var esFav = r ? (r.favorito || favoritosUsuario.indexOf(id) !== -1) : false;
  var btn = document.querySelector('.card-fav-btn[data-id="' + id + '"]');
  if (btn) {
    btn.classList.toggle('card-fav-activo', esFav);
    btn.title = esFav ? 'Quitar de favoritos' : 'Añadir a favoritos';
    btn.textContent = esFav ? '❤️' : '🤍';
  }
}

function crearTarjeta(r) {
  const estrellas = '★'.repeat(Math.round(r.puntuacion));
  const estrellaVacia = '☆'.repeat(5 - Math.round(r.puntuacion));
  var esFav = r.favorito || favoritosUsuario.indexOf(r.id) !== -1;
  const favClase = esFav ? ' card-fav-activo' : '';
  const favBtn = estaLogueado() ? `<button class="card-fav-btn${favClase}" data-id="${r.id}" title="${esFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">${esFav ? '❤️' : '🤍'}</button>` : '';
  return `
    <div class="tarjeta">
      ${favBtn}
      <a href="receta.html?id=${r.id}">
        <div class="tarjeta-imagen" style="background-image:url('${r.imagen}')">
          <span class="tarjeta-tipo">${r.tipo}</span>
        </div>
        <div class="tarjeta-info">
          <div class="tarjeta-puntuacion">
            <span class="estrella">${estrellas}${estrellaVacia}</span>
            <span>${r.puntuacion}</span>
            <span class="resenas-count">(${r.resenas.length} reseñas)</span>
          </div>
          <h3 class="tarjeta-titulo">${r.titulo}</h3>
          <p class="tarjeta-descripcion">${r.descripcion}</p>
          <div class="tarjeta-autor">✍️ ${r.autor || 'Anónimo'}</div>
          ${r.categorias || r.dieta ? `
          <div class="tarjeta-meta">
            ${r.categorias ? '<div class="tarjeta-categorias">' + r.categorias.split(',').map(function(c) { return '<span class="mini-categoria">' + c.trim() + '</span>'; }).join('') + '</div>' : ''}
            ${r.dieta ? '<span class="tarjeta-dieta">🥗 ' + r.dieta + '</span>' : ''}
          </div>` : ''}
          <div class="tarjeta-footer">
            <span><span class="icono">🕐</span> ${r.tiempo}</span>
            <span><span class="icono">📊</span> ${r.dificultad}</span>
            <span><span class="icono">👥</span> ${r.personas > 0 ? r.personas : '—'} pers.</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

function limpiarFiltros() {
  busqueda = '';
  filtroDificultad = 'Todas';
  filtroTiempo = 'Cualquiera';
  filtroPorciones = 'Cualquiera';
  filtroPuntuacion = 'Cualquiera';
  filtroFavorito = 'Todos';
  filtroAutor = 'Todos';
  filtroCategoria = 'Todas';
  filtroDieta = 'Todas';
  filtroTipo = 'Todos';
  const buscador = document.getElementById('buscador');
  if (buscador) buscador.value = '';
  const url = new URL(window.location);
  url.searchParams.delete('tipo');
  url.searchParams.delete('dieta');
  window.history.pushState({}, '', url);
  renderizarFiltrosTipo();
  renderizarFiltrosDificultad();
  renderizarFiltrosTiempo();
  renderizarFiltrosPorciones();
  renderizarFiltrosPuntuacion();
  renderizarFiltrosFavorito();
  renderizarFiltrosAutor();
  renderizarFiltrosCategorias();
  renderizarFiltrosDieta();
  ordenActual = 'none';
  ordenMomentoRotacion = 0;
  ordenDificultadAsc = true;
  ordenTiempoAsc = true;
  actualizarBotonOrdenar();
  actualizarDropdownOrden();
  renderizar();
}

window.aplicarDietaNavFilter = function (dieta) {
  if (filtroDieta === dieta) dieta = 'Todas';
  filtroDieta = dieta;
  var url = new URL(window.location);
  if (dieta === 'Todas') url.searchParams.delete('dieta');
  else url.searchParams.set('dieta', dieta);
  window.history.pushState({}, '', url);
  renderizarFiltrosDieta();
  renderizar();
};

function recetaAleatoria() {
  var disponibles = recetasFiltradas();
  if (!disponibles.length) return;
  var elegida = disponibles[Math.floor(Math.random() * disponibles.length)];
  var sugerencia = document.getElementById('sugerenciaAleatoria');
  var link = document.getElementById('sugerenciaLink');
  if (sugerencia && link) {
    link.textContent = elegida.titulo;
    link.href = 'receta.html?id=' + elegida.id;
    sugerencia.classList.remove('oculto');
  }
}

document.addEventListener('click', function (e) {
  if (e.target.closest('#btnAleatorio')) {
    e.preventDefault();
    recetaAleatoria();
  }
  if (e.target.closest('#sugerenciaCerrar')) {
    e.preventDefault();
    document.getElementById('sugerenciaAleatoria').classList.add('oculto');
  }
});

document.addEventListener('DOMContentLoaded', init);
