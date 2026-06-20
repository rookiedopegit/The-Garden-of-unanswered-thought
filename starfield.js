// starfield.js — ambient night sky: stars + drifting aurora ribbons + nebula dust
// Runs independently behind the React app on a fixed full-screen canvas.

(function () {
  const canvas = document.getElementById('starfield-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 400;

  // ---------- Starfield ----------
  const STAR_COUNT = window.innerWidth < 768 ? 900 : 1800;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(STAR_COUNT * 3);
  const starSize = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 2000;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 1000 - 200;
    starSize[i] = Math.random() * 2 + 0.4;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(starSize, 1));

  const starMat = new THREE.PointsMaterial({
    color: 0xdbe4f3,
    size: 1.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // a closer, slightly warmer star layer for parallax depth
  const STAR_COUNT_2 = window.innerWidth < 768 ? 250 : 500;
  const starGeo2 = new THREE.BufferGeometry();
  const starPos2 = new Float32Array(STAR_COUNT_2 * 3);
  for (let i = 0; i < STAR_COUNT_2; i++) {
    starPos2[i * 3] = (Math.random() - 0.5) * 1400;
    starPos2[i * 3 + 1] = (Math.random() - 0.5) * 1400;
    starPos2[i * 3 + 2] = (Math.random() - 0.5) * 400 + 100;
  }
  starGeo2.setAttribute('position', new THREE.BufferAttribute(starPos2, 3));
  const starMat2 = new THREE.PointsMaterial({
    color: 0xffd97a,
    size: 2.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
  });
  const stars2 = new THREE.Points(starGeo2, starMat2);
  scene.add(stars2);

  // ---------- Aurora ribbons ----------
  function makeAurora(color, yOffset, zOffset, speed, ampl) {
    const segments = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3 * 2);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const indices = [];
    for (let i = 0; i < segments; i++) {
      const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
    geo.setIndex(indices);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { yOffset, zOffset, speed, ampl, segments };
    scene.add(mesh);
    return mesh;
  }

  const auroraTeal = makeAurora(0x3ddc97, 250, -300, 0.00018, 90);
  const auroraViolet = makeAurora(0x9b7fe0, 150, -250, 0.00013, 70);
  const auroraGold = makeAurora(0xffd97a, 350, -350, 0.00021, 60);
  const auroras = [auroraTeal, auroraViolet, auroraGold];

  function updateAurora(mesh, t) {
    const { yOffset, zOffset, speed, ampl, segments } = mesh.userData;
    const pos = mesh.geometry.attributes.position.array;
    const width = 1800;
    for (let i = 0; i <= segments; i++) {
      const x = -width / 2 + (width * i) / segments;
      const wave =
        Math.sin(x * 0.004 + t * speed * 1000) * ampl +
        Math.sin(x * 0.0017 - t * speed * 600) * ampl * 0.5;
      const yTop = yOffset + wave;
      const yBot = yTop - 60 - Math.sin(x * 0.003 + t * speed * 800) * 20;
      pos[i * 6 + 0] = x;
      pos[i * 6 + 1] = yTop;
      pos[i * 6 + 2] = zOffset;
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = yBot;
      pos[i * 6 + 5] = zOffset;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
  }

  // ---------- Scroll-driven camera + reactive intensity ----------
  let scrollProgress = 0;
  let targetScrollY = 0;
  let windActive = false;

  window.__gardenSky = {
    setScroll(p) { targetScrollY = p; },
    setWind(active) { windActive = active; },
  };

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    targetScrollY = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    scrollProgress += (targetScrollY - scrollProgress) * 0.06;

    if (!prefersReduced) {
      stars.rotation.y = t * 0.004 + scrollProgress * 0.6;
      stars.rotation.x = scrollProgress * 0.15;
      stars2.rotation.y = t * 0.006 + scrollProgress * 0.4;

      const windBoost = windActive ? 1.8 : 1;
      auroras.forEach((a) => updateAurora(a, t * windBoost));

      camera.position.y = -scrollProgress * 700 + mouseY * 12;
      camera.position.x = mouseX * 14;
      camera.position.z = 400 - scrollProgress * 100;
      camera.lookAt(camera.position.x * 0.3, camera.position.y, camera.position.z - 300);

      const twinkle = 0.75 + Math.sin(t * 1.4) * 0.1;
      starMat.opacity = twinkle * (windActive ? 1.15 : 1);
      starMat2.opacity = 0.45 + Math.sin(t * 0.9 + 1) * 0.15;
    } else {
      camera.position.y = -scrollProgress * 700;
    }

    renderer.render(scene, camera);
  }
  animate();
  onScroll();
})();
