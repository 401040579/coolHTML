/* ===== Magnetic Scatter Text ===== */

(function () {
  const container = document.getElementById('magneticText');
  if (!container) return;
  const section = document.getElementById('magneticSection');

  const text = container.textContent.trim();
  container.textContent = '';
  container.setAttribute('aria-label', text);

  const mouse = { x: -9999, y: -9999, active: false };
  const REPEL_RADIUS = 180;
  const SPRING = 0.06;
  const DAMPING = 0.82;

  const chars = [];

  // Create individual span for each character
  text.split('').forEach((char) => {
    const span = document.createElement('span');
    span.className = 'magnetic-char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    container.appendChild(span);

    chars.push({
      el: span,
      ox: 0, oy: 0,     // displacement offset
      vx: 0, vy: 0,     // velocity
      rotation: 0,
      vr: 0,             // rotational velocity
    });
  });

  // Mouse tracking
  section.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  section.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  section.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    mouse.active = true;
  }, { passive: true });

  section.addEventListener('touchend', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function animate() {
    requestAnimationFrame(animate);

    chars.forEach((c) => {
      const rect = c.el.getBoundingClientRect();
      const charCX = rect.left + rect.width / 2;
      const charCY = rect.top + rect.height / 2;

      const dx = charCX - mouse.x;
      const dy = charCY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repulsion force
      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) * 30;
        c.vx += (dx / dist) * force;
        c.vy += (dy / dist) * force;
        c.vr += (dx > 0 ? 1 : -1) * force * 0.3;
      }

      // Spring back to origin
      c.vx += -c.ox * SPRING;
      c.vy += -c.oy * SPRING;
      c.vr += -c.rotation * SPRING * 1.5;

      // Damping
      c.vx *= DAMPING;
      c.vy *= DAMPING;
      c.vr *= DAMPING;

      // Integrate
      c.ox += c.vx;
      c.oy += c.vy;
      c.rotation += c.vr;

      // Color based on displacement
      const displacement = Math.sqrt(c.ox * c.ox + c.oy * c.oy);
      const hue = 190 + Math.min(displacement * 1.5, 120); // cyan → purple → magenta
      const lightness = 65 + Math.min(displacement * 0.3, 25);
      const scale = 1 + Math.min(displacement * 0.002, 0.2);

      c.el.style.transform = `translate(${c.ox}px, ${c.oy}px) rotate(${c.rotation}deg) scale(${scale})`;

      if (displacement > 3) {
        c.el.style.color = `hsl(${hue}, 100%, ${lightness}%)`;
        c.el.style.textShadow = `0 0 ${Math.min(displacement * 0.5, 20)}px hsl(${hue}, 100%, 70%)`;
      } else {
        c.el.style.color = '';
        c.el.style.textShadow = '';
      }
    });
  }

  animate();
})();
