var timerInterval = null;
var timerSegundos = 0;
var timerTotal = 0;
var timerCorriendo = false;

function formatTimer(s) {
  var m = Math.floor(s / 60);
  var seg = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (seg < 10 ? '0' : '') + seg;
}

function abrirTimer(tiempoPreset) {
  cerrarTimer();
  var modal = document.getElementById('modalTimer');
  if (!modal) return;
  modal.classList.remove('oculto');
  var partes = tiempoPreset ? tiempoPreset.match(/(\d+)/) : null;
  timerSegundos = partes ? parseInt(partes[1], 10) * 60 : 600;
  timerTotal = timerSegundos;
  timerCorriendo = false;
  actualizarTimerUI();
}

function cerrarTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  var modal = document.getElementById('modalTimer');
  if (modal) modal.classList.add('oculto');
  timerCorriendo = false;
}

function toggleTimer() {
  if (timerCorriendo) {
    pausarTimer();
  } else {
    iniciarTimer();
  }
}

function sonarCampana() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);

    var osc2 = ctx.createOscillator();
    var gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1320;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.15, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 1);
  } catch (e) {}
}

function iniciarTimer() {
  if (timerSegundos <= 0) return;
  timerCorriendo = true;
  document.getElementById('timerBoton').textContent = '⏸';
  timerInterval = setInterval(function () {
    timerSegundos--;
    if (timerSegundos <= 0) {
      timerSegundos = 0;
      pausarTimer();
      document.getElementById('timerAlarma').style.display = 'block';
      sonarCampana();
    }
    actualizarTimerUI();
  }, 1000);
}

function pausarTimer() {
  timerCorriendo = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  document.getElementById('timerBoton').textContent = '▶';
}

function reiniciarTimer() {
  pausarTimer();
  timerSegundos = timerTotal;
  document.getElementById('timerAlarma').style.display = 'none';
  actualizarTimerUI();
}

function actualizarTimerUI() {
  var display = document.getElementById('timerDisplay');
  if (display) display.textContent = formatTimer(timerSegundos);
  var barra = document.getElementById('timerBarra');
  if (barra && timerTotal > 0) barra.style.width = ((timerSegundos / timerTotal) * 100) + '%';
}
