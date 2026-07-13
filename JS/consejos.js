var TABLA_TIPS = 'tips';
var editandoTipId = null;
var filtroCategoriaConsejo = 'Todas';
var busquedaConsejo = '';
var CATEGORIAS_CONSEJOS = ['Todas', 'Ahorro en la cocina', 'Arroces y pastas', 'Carnes y aves', 'Cocinas del mundo', 'Condimentos y especias', 'Conservación de alimentos', 'Ensaladas y aderezos', 'Ingredientes', 'Métodos de cocción', 'Nutrición', 'Organización', 'Panadería y masas', 'Repostería', 'Seguridad e higiene', 'Trucos rápidos', 'Técnicas de cocina', 'Utensilios'];

async function peticionTips(url, opts) {
  var res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    ...opts
  });
  if (!res.ok) {
    var texto = await res.text();
    throw new Error('Supabase error ' + res.status + ': ' + texto);
  }
  if (opts && opts.method === 'DELETE') return null;
  return res.json();
}

async function obtenerTips() {
  try {
    return await peticionTips(SUPABASE_URL + '/rest/v1/' + TABLA_TIPS + '?select=*&order=created_at.asc');
  } catch (e) {
    return [];
  }
}

async function guardarTip(tip) {
  await peticionTips(SUPABASE_URL + '/rest/v1/' + TABLA_TIPS, {
    method: 'POST',
    body: JSON.stringify(tip)
  });
}

async function actualizarTip(tip) {
  await peticionTips(SUPABASE_URL + '/rest/v1/' + TABLA_TIPS + '?id=eq.' + encodeURIComponent(tip.id), {
    method: 'PATCH',
    body: JSON.stringify({ titulo: tip.titulo, contenido: tip.contenido, autor: tip.autor, user_id: tip.user_id || null, avatar_url: tip.avatar_url || '', categoria: tip.categoria || '' })
  });
}

async function eliminarTip(id) {
  await peticionTips(SUPABASE_URL + '/rest/v1/' + TABLA_TIPS + '?id=eq.' + encodeURIComponent(id), {
    method: 'DELETE'
  });
}

function mostrarFormularioConsejo(modoEdicion) {
  var wrapper = document.getElementById('consejosFormWrapper');
  wrapper.classList.remove('oculto');
  if (!modoEdicion) {
    editandoTipId = null;
    document.getElementById('campoTituloConsejo').value = '';
    document.getElementById('campoContenidoConsejo').value = '';
    var sc = document.getElementById('campoCategoriaConsejo');
    if (sc) sc.value = '';
    document.getElementById('btnGuardarConsejo').textContent = '💾 Guardar consejo';
    document.getElementById('btnCancelarConsejo').classList.add('oculto');
  }
  window.scrollTo({ top: wrapper.offsetTop - 20, behavior: 'smooth' });
}

function ocultarFormularioConsejo() {
  editandoTipId = null;
  document.getElementById('campoTituloConsejo').value = '';
  document.getElementById('campoContenidoConsejo').value = '';
  var sc = document.getElementById('campoCategoriaConsejo');
  if (sc) sc.value = '';
  document.getElementById('btnGuardarConsejo').textContent = '💾 Guardar consejo';
  document.getElementById('btnCancelarConsejo').classList.add('oculto');
  document.getElementById('consejosFormWrapper').classList.add('oculto');
}

async function initConsejos() {
  var sesion = obtenerSesion();
  var toggleBtn = document.getElementById('btnToggleConsejo');
  if (sesion) {
    toggleBtn.classList.remove('oculto');
  }

  renderizarFiltrosCategoriaConsejo();
  var selectCat = document.getElementById('campoCategoriaConsejo');
  if (selectCat) {
    CATEGORIAS_CONSEJOS.forEach(function (c, i) {
      if (i === 0) return;
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      selectCat.appendChild(opt);
    });
  }
  var tips = await obtenerTips();
  renderizarConsejos(tips);

  var nombreField = document.getElementById('campoNombreConsejo');
  if (nombreField) nombreField.closest('.form-campo').style.display = 'none';

  toggleBtn.addEventListener('click', function () {
    var wrapper = document.getElementById('consejosFormWrapper');
    if (wrapper.classList.contains('oculto')) {
      mostrarFormularioConsejo(false);
    } else {
      ocultarFormularioConsejo();
    }
  });

  document.getElementById('consejosForm').addEventListener('click', function (e) {
    var btn = e.target.closest('.tf-btn');
    if (!btn) return;
    var ta = document.getElementById('campoContenidoConsejo');
    if (!ta) return;
    if (btn.dataset.tag === 'bold') formatearTexto(ta, '**', '**');
    else if (btn.dataset.tag === 'underline') formatearTexto(ta, '__', '__');
  });

  var buscador = document.getElementById('buscadorConsejos');
  var timeoutBusqueda;
  if (buscador) {
    buscador.addEventListener('input', function () {
      clearTimeout(timeoutBusqueda);
      var self = this;
      timeoutBusqueda = setTimeout(function () {
        busquedaConsejo = self.value.trim();
        renderizarConsejos(tips);
      }, 200);
    });
  }

  document.getElementById('btnToggleCategorias').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('filtrosCategoriaConsejo').classList.toggle('oculto');
  });

  document.getElementById('filtrosCategoriaConsejo').addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-categoria');
    if (!btn) return;
    filtroCategoriaConsejo = btn.dataset.categoria;
    this.classList.add('oculto');
    renderizarFiltrosCategoriaConsejo();
    renderizarConsejos(tips);
  });

  document.addEventListener('click', function (e) {
    var cont = document.getElementById('filtrosCategoriaConsejo');
    var toggle = document.getElementById('btnToggleCategorias');
    if (cont && !cont.classList.contains('oculto') && !cont.contains(e.target) && !toggle.contains(e.target)) {
      cont.classList.add('oculto');
    }
  });

  document.getElementById('btnGuardarConsejo').addEventListener('click', async function () {
    var sesionTips = obtenerSesion();
    if (!sesionTips) return;

    var titulo = document.getElementById('campoTituloConsejo').value.trim();
    var contenido = document.getElementById('campoContenidoConsejo').value.trim();
    var categoria = document.getElementById('campoCategoriaConsejo').value;
    if (!titulo || !contenido) return;

    if (editandoTipId) {
      await actualizarTip({ id: editandoTipId, titulo: titulo, contenido: contenido, categoria: categoria, autor: sesionTips.username, user_id: sesionTips.userId, avatar_url: sesionTips.avatarUrl || '' });
    } else {
      await guardarTip({
        id: Date.now().toString(),
        titulo: titulo,
        contenido: contenido,
        categoria: categoria,
        autor: sesionTips.username,
        user_id: sesionTips.userId,
        avatar_url: sesionTips.avatarUrl || ''
      });
    }

    ocultarFormularioConsejo();
    var tips = await obtenerTips();
    renderizarConsejos(tips);
  });

  document.getElementById('btnCancelarConsejo').addEventListener('click', ocultarFormularioConsejo);
}

function esLargo(texto) {
  if (texto.length > 200) return true;
  var saltos = texto.split('\n').length;
  return saltos > 4;
}

function toggleVerMas(btn) {
  var card = btn.closest('.consejo-card');
  if (!card) return;
  var expandido = card.classList.contains('expandido');
  card.classList.toggle('expandido', !expandido);
  btn.textContent = expandido ? 'Ver más' : 'Ver menos';
}

function consejosFiltrados(tips) {
  return tips.filter(function (t) {
    if (filtroCategoriaConsejo !== 'Todas' && t.categoria !== filtroCategoriaConsejo) return false;
    if (busquedaConsejo) {
      var q = busquedaConsejo.toLowerCase();
      var titulo = (t.titulo || '').toLowerCase();
      var contenido = (t.contenido || '').toLowerCase();
      if (titulo.indexOf(q) === -1 && contenido.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function renderizarFiltrosCategoriaConsejo() {
  var contenedor = document.getElementById('filtrosCategoriaConsejo');
  if (!contenedor) return;
  contenedor.innerHTML = CATEGORIAS_CONSEJOS.map(function (c) {
    var activo = c === filtroCategoriaConsejo ? ' activo' : '';
    return '<button class="btn-categoria' + activo + '" data-categoria="' + c + '">' + c + '</button>';
  }).join('');
  var btn = document.getElementById('btnToggleCategorias');
  if (btn) btn.innerHTML = '📂 Categorías de consejos' + (filtroCategoriaConsejo !== 'Todas' ? ': <strong>' + filtroCategoriaConsejo + '</strong>' : '');
}

function renderizarConsejos(tips) {
  var grid = document.getElementById('consejosGrid');
  var sin = document.getElementById('sinConsejos');
  var sesion = obtenerSesion();
  var filtradas = consejosFiltrados(tips);

  if (!filtradas.length) {
    grid.innerHTML = '';
    sin.classList.remove('oculto');
    return;
  }

  sin.classList.add('oculto');
  grid.innerHTML = filtradas.map(function (t) {
    var fecha = '';
    if (t.created_at) {
      fecha = new Date(t.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    var esPropio = sesion && t.user_id === sesion.userId;
    var avatarTip = t.user_id ? avatarHtmlFor(t.autor, t.avatar_url, 24) : '';
    var autor = (avatarTip ? avatarTip + ' ' : '') + '<span>' + (t.autor || 'Anónimo') + '</span>';
    var largo = esLargo(t.contenido);
    var badgeCategoria = t.categoria ? '<span class="consejo-badge-categoria">#' + t.categoria + '</span>' : '';
    var acciones = esPropio
      ? '<div class="consejo-acciones">' +
          '<button class="btn-accion" onclick="editarTip(\'' + t.id + '\')">✏️</button>' +
          '<button class="btn-eliminar-tip" onclick="eliminarTipClick(\'' + t.id + '\')">🗑️</button>' +
        '</div>'
      : '';
    return '<div class="consejo-card' + (largo ? ' truncado' : '') + '">' +
      '<h3>' + convertirMarkdown(t.titulo) + '</h3>' +
      (badgeCategoria ? badgeCategoria : '') +
      '<p>' + convertirMarkdown(t.contenido) + '</p>' +
      (largo ? '<button class="ver-mas-btn" onclick="toggleVerMas(this)">Ver más</button>' : '') +
      '<div class="consejo-meta">' +
        '<span>' + autor + ' · ' + fecha + '</span>' +
        acciones +
      '</div>' +
    '</div>';
  }).join('');
}

async function editarTip(id) {
  var tips = await obtenerTips();
  var tip = tips.find(function (t) { return t.id === id; });
  if (!tip) return;
  var sesion = obtenerSesion();
  if (tip.user_id && sesion && tip.user_id !== sesion.userId) return;
  if (tip.user_id && !sesion) return;

  editandoTipId = tip.id;
  document.getElementById('campoTituloConsejo').value = tip.titulo;
  document.getElementById('campoContenidoConsejo').value = tip.contenido;
  document.getElementById('campoCategoriaConsejo').value = tip.categoria || '';
  document.getElementById('btnGuardarConsejo').textContent = '✏️ Actualizar consejo';
  document.getElementById('btnCancelarConsejo').classList.remove('oculto');

  var wrapper = document.getElementById('consejosFormWrapper');
  wrapper.classList.remove('oculto');
  window.scrollTo({ top: wrapper.offsetTop - 20, behavior: 'smooth' });
}

async function eliminarTipClick(id) {
  var tips = await obtenerTips();
  var tip = tips.find(function (t) { return t.id === id; });
  if (!tip) return;
  var sesion = obtenerSesion();
  if (tip.user_id && sesion && tip.user_id !== sesion.userId) return;
  if (tip.user_id && !sesion) return;
  if (!confirm('¿Eliminar este consejo?')) return;
  await eliminarTip(id);
  var tips = await obtenerTips();
  renderizarConsejos(tips);
}

document.addEventListener('DOMContentLoaded', initConsejos);
