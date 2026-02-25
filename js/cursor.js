/* ===== Custom Glow Cursor ===== */

(function () {
  const glow = document.getElementById('cursorGlow');
  const dot = document.getElementById('cursorDot');

  if (window.innerWidth < 768) return; // Skip on mobile

  let cursorX = 0, cursorY = 0;
  let glowX = 0, glowY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  // Hover detection for interactive elements
  const hoverTargets = 'a, button, .glass-card, .back-to-top';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('hover');
    }
  });

  function animate() {
    // Smooth follow for glow (slower)
    glowX += (cursorX - glowX) * 0.08;
    glowY += (cursorY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';

    // Faster follow for dot
    dotX += (cursorX - dotX) * 0.2;
    dotY += (cursorY - dotY) * 0.2;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    requestAnimationFrame(animate);
  }

  animate();

  // Hide when cursor leaves window
  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    dot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
    dot.style.opacity = '1';
  });
})();
