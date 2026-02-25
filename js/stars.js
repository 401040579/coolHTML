/* ===== Three.js Star Field + Morphing Geometry ===== */

(function () {
  // ---- Star Field Background ----
  const canvas = document.getElementById('starfield');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Stars
  const isMobile = window.innerWidth < 768;
  const starCount = isMobile ? 2000 : 5000;
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  const colorPalette = [
    { r: 0, g: 0.96, b: 1 },       // cyan
    { r: 1, g: 0, b: 1 },           // magenta
    { r: 0.48, g: 0.18, b: 1 },     // purple
    { r: 0.9, g: 0.9, b: 1 },       // white-blue
  ];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;

    sizes[i] = Math.random() * 3 + 0.5;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const starMat = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- Morphing Geometry Section ----
  const morphCanvas = document.getElementById('morphCanvas');
  const morphRenderer = new THREE.WebGLRenderer({ canvas: morphCanvas, antialias: true, alpha: true });
  morphRenderer.setSize(window.innerWidth, window.innerHeight);
  morphRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const morphScene = new THREE.Scene();
  const morphCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  morphCamera.position.z = 3;

  // Create sphere and icosahedron geometries for morphing
  const sphereGeo = new THREE.IcosahedronGeometry(1.2, 8);
  const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);

  // Use the sphere as the base mesh
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x7b2dff,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });

  const morphMesh = new THREE.Mesh(sphereGeo.clone(), wireMat);
  const glowMesh = new THREE.Mesh(sphereGeo.clone(), glowMat);
  glowMesh.scale.setScalar(1.05);

  morphScene.add(morphMesh);
  morphScene.add(glowMesh);

  // Inner glowing sphere
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.05,
  });
  const innerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), innerMat);
  morphScene.add(innerSphere);

  // Morph progress
  let morphProgress = 0;
  const morphBarFill = document.getElementById('morphBarFill');

  // Scroll-based morph
  const morphSection = document.getElementById('morph');

  function updateMorphProgress() {
    if (!morphSection) return;
    const rect = morphSection.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.top < viewH && rect.bottom > 0) {
      morphProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - viewH)));
    }
  }

  window.addEventListener('scroll', updateMorphProgress, { passive: true });

  // Vertex morphing
  function morphVertices(mesh, progress) {
    const pos = mesh.geometry.attributes.position;
    const count = pos.count;
    const time = performance.now() * 0.001;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const len = Math.sqrt(x * x + y * y + z * z);
      if (len === 0) continue;

      const nx = x / len;
      const ny = y / len;
      const nz = z / len;

      // Smooth sphere radius
      const baseR = 1.2;
      // Spiky distortion based on morph progress
      const noise = Math.sin(nx * 5 + time) * Math.cos(ny * 5 + time) * Math.sin(nz * 5 + time);
      const targetR = baseR + noise * 0.3 * progress;

      pos.setXYZ(i, nx * targetR, ny * targetR, nz * targetR);
    }
    pos.needsUpdate = true;
  }

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Smooth mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Rotate stars
    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.0001;

    // Mouse parallax on stars
    stars.rotation.y += mouseX * 0.0005;
    stars.rotation.x += mouseY * 0.0005;

    renderer.render(scene, camera);

    // Morph geometry
    const time = performance.now() * 0.001;
    morphMesh.rotation.y = time * 0.3;
    morphMesh.rotation.x = time * 0.15;
    glowMesh.rotation.y = time * 0.3;
    glowMesh.rotation.x = time * 0.15;
    innerSphere.rotation.y = -time * 0.2;

    morphVertices(morphMesh, morphProgress);

    // Update morph bar
    if (morphBarFill) {
      morphBarFill.style.width = (morphProgress * 100) + '%';
    }

    // Color shift based on morph
    const r = morphProgress;
    wireMat.color.setRGB(0, 0.96 * (1 - r) + 0.2 * r, 1 * (1 - r) + 0.5 * r);
    wireMat.color.lerp(new THREE.Color(0xff00ff), morphProgress * 0.5);

    morphRenderer.render(morphScene, morphCamera);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    morphCamera.aspect = w / h;
    morphCamera.updateProjectionMatrix();
    morphRenderer.setSize(w, h);
  });
})();
