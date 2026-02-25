/* ===== Interactive Particle Playground ===== */

(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('particlesOverlay');
  const section = document.getElementById('particles');

  let width, height;
  let particles = [];
  let hasInteracted = false;
  let isVisible = false;

  const colors = [
    '#00f5ff', // cyan
    '#ff00ff', // magenta
    '#7b2dff', // purple
    '#4444ff', // blue
    '#ff4488', // pink
    '#00ff88', // green
  ];

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = (Math.random() - 0.5) * 8 - 2;
      this.life = 1;
      this.decay = Math.random() * 0.015 + 0.005;
      this.size = Math.random() * 4 + 1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.gravity = 0.05;
      this.trail = [];
      this.maxTrail = Math.floor(Math.random() * 8) + 4;
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) this.trail.shift();

      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.99;
      this.life -= this.decay;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -0.6;
      if (this.y > height) {
        this.vy *= -0.5;
        this.y = height;
      }
    }

    draw() {
      // Draw trail
      if (this.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.life * 0.3;
        ctx.lineWidth = this.size * 0.5;
        ctx.stroke();
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.life;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life * 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.life * 0.1;
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }

  function spawnParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y));
    }
  }

  function hideOverlay() {
    if (!hasInteracted) {
      hasInteracted = true;
      overlay.classList.add('hidden');
    }
  }

  // Mouse events on the section
  section.addEventListener('mousemove', (e) => {
    if (!isVisible) return;
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnParticles(x, y, 3);
    hideOverlay();
  });

  section.addEventListener('click', (e) => {
    if (!isVisible) return;
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Burst effect on click
    spawnParticles(x, y, 30);
    hideOverlay();
  });

  // Touch support
  section.addEventListener('touchmove', (e) => {
    if (!isVisible) return;
    const rect = section.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    spawnParticles(x, y, 3);
    hideOverlay();
  }, { passive: true });

  section.addEventListener('touchstart', (e) => {
    if (!isVisible) return;
    const rect = section.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    spawnParticles(x, y, 15);
    hideOverlay();
  }, { passive: true });

  // Visibility check
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(section);

  // Ambient particles (auto-spawn)
  function autoSpawn() {
    if (isVisible && particles.length < 50) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      spawnParticles(x, y, 1);
    }
  }

  setInterval(autoSpawn, 200);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, width, height);

    // Update and draw
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - dist / 80) * 0.15 * particles[i].life;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  animate();
})();
