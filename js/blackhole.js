/* ===== Black Hole Vortex ===== */

(function () {
  const canvas = document.getElementById('blackholeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('blackholeSection');

  let width, height;
  let isVisible = false;
  const MAX_PARTICLES = 600;
  const particles = [];

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

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      const cx = width / 2;
      const cy = height / 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(width, height) * 0.4 + Math.random() * 300;

      this.x = cx + Math.cos(angle) * dist;
      this.y = cy + Math.sin(angle) * dist;

      // Slight tangential velocity for orbital motion
      const speed = Math.random() * 0.8 + 0.3;
      this.vx = Math.cos(angle + Math.PI * 0.5) * speed;
      this.vy = Math.sin(angle + Math.PI * 0.5) * speed;

      this.size = Math.random() * 2 + 0.5;
      this.trail = [];
      this.maxTrail = Math.floor(Math.random() * 12) + 6;

      // Color: mostly purple-cyan range
      const r = Math.random();
      if (r < 0.4) {
        this.hue = 270 + Math.random() * 30; // purple
      } else if (r < 0.7) {
        this.hue = 180 + Math.random() * 20; // cyan
      } else if (r < 0.9) {
        this.hue = 300 + Math.random() * 30; // magenta
      } else {
        this.hue = 210 + Math.random() * 30; // blue
      }
    }

    update() {
      const cx = width / 2;
      const cy = height / 2;
      const dx = cx - this.x;
      const dy = cy - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Consumed by the black hole
      if (dist < 8) {
        this.reset();
        return;
      }

      // Gravitational pull (inverse square)
      const gravity = 250 / (dist * dist) + 0.015;
      this.vx += (dx / dist) * gravity;
      this.vy += (dy / dist) * gravity;

      // Tangential force for spiral orbit
      const tangent = 40 / (dist * dist);
      this.vx += (-dy / dist) * tangent;
      this.vy += (dx / dist) * tangent;

      // Speed limit
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 7) {
        this.vx = (this.vx / speed) * 7;
        this.vy = (this.vy / speed) * 7;
      }

      // Trail
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) this.trail.shift();

      this.x += this.vx;
      this.y += this.vy;

      // Brightness increases near center (accretion disk heating)
      this.brightness = Math.min(1, 150 / dist);
    }

    draw() {
      // Trail
      if (this.trail.length > 1) {
        for (let i = 1; i < this.trail.length; i++) {
          const alpha = (i / this.trail.length) * this.brightness * 0.4;
          ctx.beginPath();
          ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
          ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${alpha})`;
          ctx.lineWidth = this.size * 0.6;
          ctx.stroke();
        }
      }

      // Particle body
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (0.5 + this.brightness * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, ${50 + this.brightness * 30}%, ${this.brightness})`;
      ctx.fill();

      // Hot glow for close particles
      if (this.brightness > 0.5) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 80%, ${(this.brightness - 0.5) * 0.15})`;
        ctx.fill();
      }
    }
  }

  // Initialize particles
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new Particle());
  }

  // Background stars
  const bgStars = [];
  for (let i = 0; i < 150; i++) {
    bgStars.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    requestAnimationFrame(draw);
    if (!isVisible) return;

    // Slight trail for motion blur
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const time = performance.now() * 0.001;

    // Background stars with twinkle
    for (const star of bgStars) {
      const twinkle = Math.sin(time * 1.5 + star.phase) * 0.3 + 0.6;
      ctx.fillStyle = `rgba(180, 180, 220, ${twinkle * 0.4})`;
      ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
    }

    // Update and draw particles
    for (const p of particles) {
      p.update();
      p.draw();
    }

    // Accretion disk glow (layered radial gradients)
    const diskGrad1 = ctx.createRadialGradient(cx, cy, 15, cx, cy, 200);
    diskGrad1.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
    diskGrad1.addColorStop(0.15, 'rgba(123, 45, 255, 0.12)');
    diskGrad1.addColorStop(0.3, 'rgba(255, 0, 255, 0.06)');
    diskGrad1.addColorStop(0.5, 'rgba(0, 245, 255, 0.03)');
    diskGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = diskGrad1;
    ctx.beginPath();
    ctx.arc(cx, cy, 200, 0, Math.PI * 2);
    ctx.fill();

    // Black hole center
    const holeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    holeGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    holeGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.98)');
    holeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    // Event horizon ring - pulsing
    const pulse = Math.sin(time * 2) * 0.15 + 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(123, 45, 255, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 245, 255, ${pulse * 0.5})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Gravitational lensing ring (outer bright ring)
    ctx.beginPath();
    ctx.arc(cx, cy, 55 + Math.sin(time) * 3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + Math.sin(time * 1.5) * 0.01})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  draw();
})();
