import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";

// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.08);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 6);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("scene"),
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;

// === LIGHTING ===
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const spotLight = new THREE.SpotLight(0xffd6a5, 2);
spotLight.position.set(-5, 10, 5);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.2;
spotLight.castShadow = true;
scene.add(spotLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// === CHRISTMAS TREE ===
const tree = new THREE.Group();

// Batang
const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 16);
const trunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b4513,
  metalness: 0.2,
  roughness: 0.8
});
const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
trunk.position.y = -1.2;
tree.add(trunk);

// Daun
const leafMaterial = new THREE.MeshStandardMaterial({
  color: 0x0b8457,
  metalness: 0.3,
  roughness: 0.4
});
const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.5, 32), leafMaterial);
const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 32), leafMaterial);
const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 32), leafMaterial);
cone1.position.y = 0;
cone2.position.y = 1.2;
cone3.position.y = 2.2;
tree.add(cone1, cone2, cone3);

// Bintang
const starGeometry = new THREE.IcosahedronGeometry(0.25, 0);
const starMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd60a,
  emissive: 0xfff5b7,
  emissiveIntensity: 2,
  metalness: 0.6
});
const star = new THREE.Mesh(starGeometry, starMaterial);
star.position.y = 3.1;
tree.add(star);

// === SNOW PARTICLES ===
const snowCount = 300;
const snowGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(snowCount * 3);

for (let i = 0; i < snowCount; i++) {
  const x = (Math.random() - 0.5) * 20;
  const y = Math.random() * 10 + 2;
  const z = (Math.random() - 0.5) * 20;
  positions.set([x, y, z], i * 3);
}
snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.08,
  transparent: true,
  opacity: 0.8,
  depthWrite: false
});

const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

// === SNOW ANIMATION ===
function animateSnow() {
  const pos = snowGeometry.attributes.position;
  for (let i = 0; i < snowCount; i++) {
    let y = pos.getY(i) - 0.02 - Math.random() * 0.02;
    if (y < -1.5) y = Math.random() * 10 + 2;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
}


scene.add(tree);

// === ANIMATION LOOP ===
function animate() {
  requestAnimationFrame(animate);

  animateSnow(); // 🌨️ panggil animasi salju di setiap frame

  tree.rotation.y += 0.005;
  star.rotation.y += 0.02;
  renderer.render(scene, camera);
}

animate();

// === WINDOW RESIZE ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === INTERACTIVITY ===
const playBtn = document.getElementById("play");
playBtn.addEventListener("click", () => {
  gsap.to(playBtn, { scale: 0.8, opacity: 0, duration: 1, ease: "power2.inOut" });
  gsap.to(tree.rotation, { y: "+=" + Math.PI * 2, duration: 3, ease: "expo.inOut" });
  gsap.to(camera.position, { z: 5.5, duration: 3, ease: "power3.inOut" });
  startSceneMotion();
});

// Kamera parallax (follow mouse)
document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  gsap.to(camera.position, {
    x: x * 1.5,
    y: -y * 1.5,
    duration: 1,
    ease: "power2.out"
  });
});

// === GLOW PULSE ===
gsap.to(star.material, {
  emissiveIntensity: 4,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
});

// === CAMERA BREATHING ===
function startSceneMotion() {
  gsap.to(camera.position, {
    z: 6.5,
    duration: 5,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });
}

// === AUDIO & LYRICS SYSTEM ===
const audio = document.getElementById("song");
let lyrics = [];
let currentLine = "";
const lyricBox = document.getElementById("lyrics");

// Load lyric JSON
fetch("lyrics.json")
  .then((res) => res.json())
  .then((data) => (lyrics = data));

// Update lyric text with GSAP fade
const lyricImage = document.getElementById("lyric-image");

// Update lyric text + image
function updateLyric(line) {
  if (line.text !== currentLine) {
    currentLine = line.text;
    gsap.to([lyricBox, lyricImage], { opacity: 0, duration: 0.3, onComplete: () => {
      lyricBox.textContent = line.text;

      if (line.image) {
        lyricImage.src = line.image;
        lyricImage.style.display = "block";
      } else {
        lyricImage.style.display = "none";
      }

      gsap.to([lyricBox, lyricImage], { opacity: 1, duration: 0.5 });
    }});
  }
}


// Sync lyrics with song time
function startLyrics() {
  setInterval(() => {
    const t = audio.currentTime;
    const line = lyrics.find((l) => Math.abs(l.time - t) < 0.2);
    if (line) updateLyric(line); // kirim seluruh objek line, bukan line.text
  }, 100);
}

// === ENHANCE PLAY BUTTON FUNCTIONALITY ===
playBtn.addEventListener("click", () => {
  gsap.to(playBtn, { scale: 0.8, opacity: 0, duration: 1, ease: "power2.inOut" });
  gsap.to(tree.rotation, { y: "+=" + Math.PI * 2, duration: 3, ease: "expo.inOut" });
  gsap.to(camera.position, { z: 5.5, duration: 3, ease: "power3.inOut" });
  startSceneMotion();

  // Play the song
  audio.currentTime = 0;
  audio.play();
  startLyrics();
  
  // Beat-based light animation
  beatLight();
});

// === HEART EXPLOSION ===
let hasExploded = false;

// Grup untuk semua hati
const hearts = new THREE.Group();
scene.add(hearts);

// Buat banyak sphere (bisa diganti shape hati)
const heartCount = 100;
const heartGeometry = new THREE.SphereGeometry(0.1, 12, 12);
const heartMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4d6d,
  emissive: 0xffccd5,
  emissiveIntensity: 1,
  transparent: true,
  opacity: 1
});

for (let i = 0; i < heartCount; i++) {
  const h = new THREE.Mesh(heartGeometry, heartMaterial.clone());
  h.position.set(
    (Math.random() - 0.5) * 2,
    Math.random() * 0.5 + 1,
    (Math.random() - 0.5) * 2
  );
  hearts.add(h);
}
hearts.visible = false;

// Efek meledak ke atas
function triggerHeartExplosion() {
  hearts.visible = true;
  hearts.children.forEach((h) => {
    const tx = (Math.random() - 0.5) * 6;
    const ty = Math.random() * 4 + 2;
    const tz = (Math.random() - 0.5) * 6;

    gsap.to(h.position, {
      x: tx,
      y: ty,
      z: tz,
      duration: 2.5,
      ease: "power2.out"
    });
    gsap.to(h.material, {
      opacity: 0,
      duration: 2.5,
      delay: 1,
      onComplete: () => {
        scene.remove(hearts);
      }
    });
  });

  // Kamera & scene fade
  gsap.to(camera.position, { z: 8, duration: 3, ease: "power2.inOut" });
  gsap.to("#lyrics", { opacity: 0, duration: 1.5 });
  gsap.to("#vignette", { opacity: 1, duration: 2, background: "rgba(0,0,0,0.9)" });
}

// Cek kapan explosion terjadi (misal di 105 detik)
setInterval(() => {
  if (audio.currentTime > audio.duration - 5 && !hasExploded) {
    triggerHeartExplosion();
    hasExploded = true;
  }
}, 500);

function beatLight() {
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(spotLight, { intensity: 3, duration: 1, ease: "sine.inOut" })
    .to(spotLight, { intensity: 1.5, duration: 1, ease: "sine.inOut" });
}
