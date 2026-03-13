/* ===== Synthwave Retro Grid ===== */

(function () {
  const canvas = document.getElementById('synthwaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('synthwaveSection');

  let width, height;
  let isVisible = false;
  let time = 0;

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(section);

  // Generate static mountain silhouette points
  function generateMountain(segments, maxHeight, roughness) {
    const points = [0];
    for (let i = 1; i < segments; i++) {
      const prev = points[i - 1];
      points.push(prev + (Math.random() - 0.5) * roughness);
    }
    // Normalize
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    return points.map(p => ((p - min) / range) * maxHeight);
  }

  const mountain1 = generateMountain(100, 0.15, 0.03);
  const mountain2 = generateMountain(100, 0.1, 0.02);

  // Static stars
  const stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.45,
      size: Math.random() * 1.8 + 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    requestAnimationFrame(draw);
    if (!isVisible) return;

    time += 0.012;

    const horizon = height * 0.52;
    const vanishX = width / 2;

    // === Sky ===
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#050010');
    skyGrad.addColorStop(0.4, '#0f0025');
    skyGrad.addColorStop(0.7, '#1a0040');
    skyGrad.addColorStop(1, '#2d0066');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizon + 2);

    // === Stars ===
    const t = performance.now() * 0.001;
    for (const star of stars) {
      const twinkle = Math.sin(t * 2 + star.phase) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // === Sun ===
    const sunY = horizon - height * 0.06;
    const sunR = Math.min(width, height) * 0.12;

    // Sun glow
    const glowGrad = ctx.createRadialGradient(vanishX, sunY, sunR * 0.3, vanishX, sunY, sunR * 4);
    glowGrad.addColorStop(0, 'rgba(255, 110, 199, 0.4)');
    glowGrad.addColorStop(0.3, 'rgba(255, 0, 128, 0.12)');
    glowGrad.addColorStop(0.6, 'rgba(123, 45, 255, 0.04)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(vanishX, sunY, sunR * 4, 0, Math.PI * 2);
    ctx.fill();

    // Sun body with gradient
    ctx.save();
    ctx.beginPath();
    ctx.arc(vanishX, sunY, sunR, 0, Math.PI * 2);
    ctx.clip();

    const sunGrad = ctx.createLinearGradient(vanishX, sunY - sunR, vanishX, sunY + sunR);
    sunGrad.addColorStop(0, '#ffee00');
    sunGrad.addColorStop(0.3, '#ff6ec7');
    sunGrad.addColorStop(0.6, '#ff0080');
    sunGrad.addColorStop(1, '#7b2dff');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(vanishX - sunR, sunY - sunR, sunR * 2, sunR * 2);

    // Sun scan lines (black stripes that get thicker toward bottom)
    const stripeCount = 9;
    for (let i = 0; i < stripeCount; i++) {
      const progress = (i + 0.5) / stripeCount;
      const stripeY = sunY - sunR + progress * sunR * 2;
      const stripeH = 1 + progress * sunR * 0.15;
      if (i % 2 === 0) {
        ctx.fillStyle = '#050010';
        ctx.fillRect(vanishX - sunR, stripeY, sunR * 2, stripeH);
      }
    }
    ctx.restore();

    // === Mountains ===
    ctx.fillStyle = '#0a0018';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let i = 0; i < mountain1.length; i++) {
      const x = (i / (mountain1.length - 1)) * width;
      const y = horizon - mountain1[i] * height;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, horizon);
    ctx.closePath();
    ctx.fill();

    // Second mountain layer (closer, shorter)
    ctx.fillStyle = '#060010';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let i = 0; i < mountain2.length; i++) {
      const x = (i / (mountain2.length - 1)) * width;
      const y = horizon - mountain2[i] * height * 0.6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, horizon);
    ctx.closePath();
    ctx.fill();

    // === Ground ===
    const groundGrad = ctx.createLinearGradient(0, horizon, 0, height);
    groundGrad.addColorStop(0, '#1a0040');
    groundGrad.addColorStop(1, '#000000');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizon, width, height - horizon);

    // === Grid - Horizontal lines (perspective, moving toward viewer) ===
    const gridLinesH = 35;
    const gridSpeed = time * 0.4;

    ctx.lineWidth = 1;
    for (let i = 0; i < gridLinesH; i++) {
      let depth = ((i / gridLinesH) + gridSpeed) % 1;
      // Quadratic for perspective compression
      const perspective = depth * depth;
      const y = horizon + (height - horizon) * perspective;
      const alpha = Math.pow(depth, 0.3) * 0.5;

      ctx.strokeStyle = `rgba(255, 0, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // === Grid - Vertical lines (converging to vanishing point) ===
    const vertLines = 22;
    for (let i = -vertLines; i <= vertLines; i++) {
      const ratio = i / vertLines;
      const bottomX = vanishX + ratio * width * 1.4;
      const alpha = 0.25 * (1 - Math.abs(ratio) * 0.4);

      ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    // Horizon glow line
    const horizonGrad = ctx.createLinearGradient(0, horizon - 2, 0, horizon + 4);
    horizonGrad.addColorStop(0, 'transparent');
    horizonGrad.addColorStop(0.5, 'rgba(255, 0, 255, 0.5)');
    horizonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, horizon - 2, width, 6);

    // === CRT Scanline overlay ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }

    // Vignette
    const vigGrad = ctx.createRadialGradient(vanishX, height / 2, height * 0.3, vanishX, height / 2, height * 0.8);
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
  }

  draw();
})();
