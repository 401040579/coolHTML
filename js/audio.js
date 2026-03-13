/* ===== Audio Reactive Circular Visualizer (Simulated Beats) ===== */

(function () {
  const canvas = document.getElementById('audioCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('audioSection');

  let width, height;
  let isVisible = false;
  let time = 0;
  const BARS = 128;
  const data = new Float32Array(BARS);
  let rotation = 0;

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

  // Generate simulated frequency data that looks like music
  function updateData() {
    time += 0.018;
    const t = time;

    for (let i = 0; i < BARS; i++) {
      const freq = i / BARS;

      // Bass: big slow sine, strongest at low frequencies
      const bass = Math.max(0, Math.sin(t * 3.5) * 0.7 + 0.3) * (1 - freq) * 0.75;

      // Mid frequencies: layered sines
      const mid = (Math.sin(t * 5.2 + i * 0.15) * 0.5 + 0.5) *
                  Math.exp(-Math.pow(freq - 0.35, 2) * 15) * 0.5;

      // Treble: noise + fast sine at high frequencies
      const treble = (Math.sin(t * 9 + i * 0.4) * 0.25 + Math.random() * 0.15) * freq * 0.4;

      // Beat drop: sharp spike synchronized with bass
      const beat = Math.pow(Math.max(0, Math.sin(t * 3.5)), 16) * (1 - freq * 0.6) * 0.7;

      // Melody hits
      const melody = Math.max(0, Math.sin(t * 7 + Math.floor(i / 8) * 2)) *
                     Math.exp(-Math.pow(freq - 0.5, 2) * 30) * 0.25;

      data[i] = Math.min(1, Math.max(0, bass + mid + treble + beat + melody));
    }
  }

  // Floating particles around the visualizer
  const floaters = [];
  for (let i = 0; i < 60; i++) {
    floaters.push({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.5 + 1.2,
      speed: (Math.random() - 0.5) * 0.003,
      size: Math.random() * 2 + 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    requestAnimationFrame(draw);
    if (!isVisible) return;

    updateData();
    rotation += 0.002;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.2;

    // Average amplitude for reactive effects
    let avg = 0;
    for (let i = 0; i < BARS; i++) avg += data[i];
    avg /= BARS;

    // Background radial pulse
    const pulseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 3.5);
    pulseGrad.addColorStop(0, `rgba(123, 45, 255, ${avg * 0.12})`);
    pulseGrad.addColorStop(0.4, `rgba(0, 245, 255, ${avg * 0.04})`);
    pulseGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = pulseGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer frequency bars
    for (let i = 0; i < BARS; i++) {
      const angle = (i / BARS) * Math.PI * 2 + rotation;
      const value = data[i];
      const barH = value * baseRadius * 1.2;

      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius + barH);
      const y2 = cy + Math.sin(angle) * (baseRadius + barH);

      const hue = (i / BARS * 300 + rotation * 80) % 360;

      // Glow layer
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${value * 0.15})`;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Main bar
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.3 + value * 0.7})`;
      ctx.lineWidth = Math.max(1.5, (width / BARS) * 0.4);
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Inner mirror bars
    for (let i = 0; i < BARS; i++) {
      const angle = (i / BARS) * Math.PI * 2 + rotation;
      const value = data[i];
      const barH = value * baseRadius * 0.45;

      const x1 = cx + Math.cos(angle) * (baseRadius - 5);
      const y1 = cy + Math.sin(angle) * (baseRadius - 5);
      const x2 = cx + Math.cos(angle) * (baseRadius - 5 - barH);
      const y2 = cy + Math.sin(angle) * (baseRadius - 5 - barH);

      const hue = ((i / BARS * 300 + 180) + rotation * 80) % 360;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue}, 100%, 55%, ${0.15 + value * 0.35})`;
      ctx.lineWidth = Math.max(1, (width / BARS) * 0.25);
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Floating particles
    for (const f of floaters) {
      f.angle += f.speed;
      const dist = baseRadius * f.dist + Math.sin(time * 2 + f.phase) * 20;
      const px = cx + Math.cos(f.angle + rotation) * dist;
      const py = cy + Math.sin(f.angle + rotation) * dist;
      const alpha = (Math.sin(time * 3 + f.phase) * 0.3 + 0.5) * (0.3 + avg * 0.7);

      ctx.beginPath();
      ctx.arc(px, py, f.size + avg * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 245, 255, ${alpha})`;
      ctx.fill();
    }

    // Center orb with breathing
    const orbR = baseRadius * 0.35 + avg * baseRadius * 0.2;
    const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
    orbGrad.addColorStop(0, `rgba(255, 255, 255, ${0.1 + avg * 0.15})`);
    orbGrad.addColorStop(0.3, `rgba(0, 245, 255, ${0.06 + avg * 0.1})`);
    orbGrad.addColorStop(0.6, `rgba(123, 45, 255, ${0.04 + avg * 0.06})`);
    orbGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
    ctx.fillStyle = orbGrad;
    ctx.fill();

    // Base ring
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 245, 255, ${0.06 + avg * 0.12})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Outer decorative rings
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.6 + avg * 25, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(123, 45, 255, ${0.02 + avg * 0.04})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 2.0 + avg * 15, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 0, 255, ${0.01 + avg * 0.03})`;
    ctx.lineWidth = 0.3;
    ctx.stroke();
  }

  draw();
})();
