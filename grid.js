// Tron-style perspective grid background
(function () {
  const canvas = document.getElementById('grid-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Grid config
  const HORIZON_Y   = 0.52;   // horizon position as fraction of H
  const V_LINES     = 18;     // vertical lines
  const H_LINES     = 14;     // horizontal lines
  const SPEED       = 0.18;   // scroll speed (0–1 per second)
  const COLOR_GRID  = '#00e5ff';
  const COLOR_GLOW  = '#00e5ff';

  let offset = 0;
  let last   = null;

  function draw(ts) {
    if (!last) last = ts;
    const dt = (ts - last) / 1000;
    last = ts;
    offset = (offset + SPEED * dt) % 1;

    ctx.clearRect(0, 0, W, H);

    const hy = H * HORIZON_Y;

    // Gradient fade — brighter near horizon, fades to edges
    ctx.save();

    // ── Vertical lines ──────────────────────────────────────────
    for (let i = 0; i <= V_LINES; i++) {
      const t   = i / V_LINES;          // 0..1 left to right
      const bx  = W * t;                // bottom x (flat)
      const tx  = W * 0.5 + (bx - W * 0.5) * 0.0; // vanishing point center
      // perspective: lines converge to vanishing point at (W/2, hy)
      const vpx = W / 2;

      ctx.beginPath();
      ctx.moveTo(vpx, hy);
      ctx.lineTo(bx, H);

      const alpha = 0.12 + 0.18 * Math.sin(Math.PI * t);
      ctx.strokeStyle = COLOR_GRID;
      ctx.globalAlpha = alpha;
      ctx.lineWidth   = 0.7;
      ctx.stroke();
    }

    // ── Horizontal lines ─────────────────────────────────────────
    for (let i = 0; i <= H_LINES; i++) {
      // distribute in perspective (closer lines near bottom)
      const p   = (i + offset) / H_LINES; // 0..1
      const py  = hy + Math.pow(p, 2.2) * (H - hy);

      if (py < hy || py > H) continue;

      // width at this y via perspective
      const frac = (py - hy) / (H - hy);
      const half = frac * (W / 2);
      const lx   = W / 2 - half;
      const rx   = W / 2 + half;

      const alpha = 0.07 + 0.2 * frac;
      ctx.beginPath();
      ctx.moveTo(lx, py);
      ctx.lineTo(rx, py);
      ctx.strokeStyle = COLOR_GRID;
      ctx.globalAlpha = alpha;
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    }

    // ── Horizon glow line ─────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, hy, W, hy);
    grad.addColorStop(0,   'transparent');
    grad.addColorStop(0.2, COLOR_GLOW);
    grad.addColorStop(0.5, COLOR_GLOW);
    grad.addColorStop(0.8, COLOR_GLOW);
    grad.addColorStop(1,   'transparent');

    ctx.beginPath();
    ctx.moveTo(0, hy);
    ctx.lineTo(W, hy);
    ctx.strokeStyle = grad;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.restore();

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
