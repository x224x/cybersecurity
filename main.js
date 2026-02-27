/* ================================================================
   MAIN.JS — Efectos compartidos: paleta de colores + matrix rain
   Incluir en todas las páginas con: <script src="main.js"></script>
   ================================================================ */

(function () {

  /* ── PALETTE SWITCHER ───────────────────────────────────────── */
  const html = document.documentElement;

  function applyPalette(p) {
    html.setAttribute('data-palette', p);
    document.querySelectorAll('.pal-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.p === p)
    );
    localStorage.setItem('x224-palette', p);
  }

  applyPalette(localStorage.getItem('x224-palette') || 'cyber');

  document.querySelectorAll('.pal-btn').forEach(btn =>
    btn.addEventListener('click', () => applyPalette(btn.dataset.p))
  );


  /* ── MATRIX RAIN ────────────────────────────────────────────── */
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>?/~`';
  const fSize = 14;
  let drops   = [];
  let dColors = [];

  function initDrops() {
    const cols = Math.floor(canvas.width / fSize);
    drops   = Array.from({ length: cols }, () => Math.random() * -100);
    dColors = drops.map(() =>
      getComputedStyle(html).getPropertyValue('--matrix-color').trim()
    );
  }
  initDrops();
  window.addEventListener('resize', initDrops);

  setInterval(() => {
    const c = getComputedStyle(html).getPropertyValue('--matrix-color').trim();
    ctx.fillStyle = 'rgba(0,0,0,0.045)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < drops.length; i++) {
      ctx.fillStyle = dColors[i] || c;
      ctx.font      = fSize + 'px JetBrains Mono';
      ctx.fillText(
        chars[Math.floor(Math.random() * chars.length)],
        i * fSize, drops[i] * fSize
      );
      if (drops[i] * fSize > canvas.height && Math.random() > 0.96) {
        drops[i]   = 0;
        dColors[i] = c;
      }
      drops[i]++;
    }
  }, 45);

})();
