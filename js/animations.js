/* ===== GSAP Scroll Animations + Typewriter + Counters ===== */

(function () {
  gsap.registerPlugin(ScrollTrigger);

  // ---- Typewriter Effect ----
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'No Framework. No Build. Pure Magic.',
    'Just HTML + CSS + JavaScript.',
    '10,000 particles. Zero dependencies.',
    'Built different. Shipped raw.',
    'GPU goes brrr.',
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 60;

  function typewrite() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      typewriterEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 30;
    } else {
      typewriterEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 60;
    }

    if (!isDeleting && charIndex === current.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500; // Pause before new phrase
    }

    setTimeout(typewrite, typeSpeed);
  }

  typewrite();

  // ---- Reveal Text Animations ----
  gsap.utils.toArray('.reveal-text').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // ---- Glass Cards Stagger In ----
  gsap.to('.glass-card', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.cards-grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // Card tilt on hover
  document.querySelectorAll('.glass-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -10;
      const rotateY = (x - centerX) / centerX * 10;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

      // Update glow position
      const px = (x / rect.width * 100).toFixed(0);
      const py = (y / rect.height * 100).toFixed(0);
      card.style.setProperty('--mouse-x', px + '%');
      card.style.setProperty('--mouse-y', py + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });

  // ---- Counter Animation ----
  const counterItems = document.querySelectorAll('.counter-item');

  gsap.to('.counter-item', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.counter-grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      onEnter: () => startCounters(),
    },
  });

  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    document.querySelectorAll('.counter-number').forEach((el) => {
      const target = parseInt(el.dataset.target);
      const duration = target > 100 ? 2000 : 1500;
      const start = performance.now();

      function updateCounter(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * eased);

        el.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // ---- Scroll Indicator Fade ----
  gsap.to('.scroll-indicator', {
    opacity: 0,
    y: 20,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '30% top',
      scrub: true,
    },
  });

  // ---- Morph Section Text Animation ----
  gsap.to('.morph-text h2', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.morph-section',
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    },
  });

  gsap.to('.morph-text .sub', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.3,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.morph-section',
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    },
  });

  // ---- Back to Top ----
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Parallax subtle on sections ----
  gsap.utils.toArray('section').forEach((section, i) => {
    if (i === 0) return; // Skip hero
    gsap.from(section, {
      opacity: 0.3,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'top 60%',
        scrub: true,
      },
    });
  });

})();
