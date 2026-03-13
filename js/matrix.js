/* ===== Matrix Digital Rain ===== */

(function () {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('matrixSection');
  let width, height;
  let isVisible = false;
  let columns, drops, speeds, hues;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|~$%&';
  const fontSize = 15;

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(width / fontSize) + 1;
    if (!drops || drops.length !== columns) {
      drops = [];
      speeds = [];
      hues = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -50;
        speeds[i] = Math.random() * 0.4 + 0.6;
        // Mostly cyan, some magenta, some green
        const r = Math.random();
        hues[i] = r < 0.5 ? 180 : r < 0.75 ? 300 : 120;
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(section);

  let frame = 0;
  let glitchTimer = 0;

  // Center message that types out
  const message = 'WELCOME TO THE MATRIX';
  let msgIndex = 0;
  let msgTimer = 0;
  let msgVisible = '';

  function draw() {
    requestAnimationFrame(draw);
    if (!isVisible) return;

    frame++;
    if (frame % 2 !== 0) return; // ~30fps for authentic feel

    // Random glitch: occasionally flash brighter
    glitchTimer--;
    const isGlitch = glitchTimer > 0;
    if (Math.random() < 0.005) glitchTimer = 3;

    // Fade trail
    ctx.fillStyle = isGlitch ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px "JetBrains Mono", monospace';

    for (let i = 0; i < columns; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Previous chars form the trail (handled by fade overlay)
      // Current head char is bright white
      const hue = hues[i];
      const saturation = 100;
      const lightness = isGlitch ? 90 : 70;

      // Draw trailing char (colored)
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.85)`;
      ctx.fillText(char, x, y);

      // Draw head char (white/bright)
      ctx.fillStyle = isGlitch ? '#ffffff' : `hsla(${hue}, 40%, 95%, 1)`;
      ctx.fillText(char, x, y);

      // Reset column when it goes off screen
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
        speeds[i] = Math.random() * 0.4 + 0.6;
        const r = Math.random();
        hues[i] = r < 0.5 ? 180 : r < 0.75 ? 300 : 120;
      }

      drops[i] += speeds[i];
    }

    // Center message
    msgTimer++;
    if (msgTimer % 8 === 0 && msgIndex < message.length) {
      msgVisible += message[msgIndex];
      msgIndex++;
    }

    if (msgVisible.length > 0) {
      const centerX = width / 2;
      const centerY = height / 2;
      const msgFontSize = Math.min(width / 12, 48);

      // Glow behind text
      ctx.save();
      ctx.font = `bold ${msgFontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Shadow glow
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 30;
      ctx.fillStyle = 'rgba(0, 245, 255, 0.9)';
      ctx.fillText(msgVisible, centerX, centerY);

      // Solid text on top
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(msgVisible, centerX, centerY);

      // Cursor blink
      if (msgIndex < message.length || Math.floor(frame / 30) % 2 === 0) {
        const textWidth = ctx.measureText(msgVisible).width;
        ctx.fillStyle = '#00f5ff';
        ctx.fillRect(centerX + textWidth / 2 + 4, centerY - msgFontSize / 2, 3, msgFontSize);
      }

      ctx.restore();
    }

    // Scanline overlay effect
    if (frame % 120 < 3) {
      const scanY = Math.random() * height;
      ctx.fillStyle = 'rgba(0, 245, 255, 0.03)';
      ctx.fillRect(0, scanY, width, 2);
    }
  }

  draw();
})();
