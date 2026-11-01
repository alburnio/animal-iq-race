// Animal IQ Race - PERINGKAT 1
// Siap: menu, pilih haiwan, 4 pemain, perlumbaan 3D, butang.
// BELUM ADA: soalan IQ, power-up, bunyi, simpan skor (peringkat seterusnya).
(() => {
'use strict';
const PANJANG = 100;                       // jarak garisan penamat
const LORONG = [-4.5, -1.5, 1.5, 4.5];     // kedudukan z setiap lorong
const WARNA = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
const KEKUNCI = ['KeyQ', 'KeyV', 'KeyP', 'KeyM'];
const LABEL = ['Q', 'V', 'P', 'M'];
const HAIWAN = [
  { id: 'arnab', nama: 'Arnab', emoji: '🐰', warna: 0xf4f4f4, laju: 8.4, skala: 0.85 },
  { id: 'harimau', nama: 'Harimau', emoji: '🐯', warna: 0xf08a24, laju: 8.8, skala: 1.15 },
  { id: 'kuda', nama: 'Kuda', emoji: '🐴', warna: 0x8b5a2b, laju: 9.0, skala: 1.3 },
  { id: 'kura', nama: 'Kura-kura', emoji: '🐢', warna: 0x4caf50, laju: 8.0, skala: 0.8 },
];

const $ = id => document.getElementById(id);
let keadaan = 'menu';                      // menu | pilih | kira | lumba | hasil
let pilih = [0, 1, 2, 3];                  // indeks haiwan bagi setiap pemain
let pemain = [], tamat = [];

// ---------- Three.js ----------
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 40, 140);
const kamera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
scene.add(new THREE.HemisphereLight(0xffffff, 0x557755, 0.9));
const matahari = new THREE.DirectionalLight(0xffffff, 0.8);
matahari.position.set(20, 40, 20);
scene.add(matahari);

const box = (w, h, d, c) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: c }));

function binaPersekitaran() {
  const tanah = new THREE.Mesh(new THREE.PlaneGeometry(400, 80), new THREE.MeshLambertMaterial({ color: 0x4f9d4f }));
  tanah.rotation.x = -Math.PI / 2; tanah.position.set(100, 0, 0); scene.add(tanah);
  LORONG.forEach((z, i) => {                // jalur lorong berwarna ikut pemain
    const j = box(PANJANG + 30, 0.05, 2.9, new THREE.Color(WARNA[i]).lerp(new THREE.Color(0xd2b48c), 0.7));
    j.position.set(PANJANG / 2 + 5, 0.03, z); scene.add(j);
    const mula = box(0.4, 0.06, 2.9, WARNA[i]); mula.position.set(-1, 0.06, z); scene.add(mula);
  });
  for (let k = 0; k < 12; k++) for (let c = 0; c < 2; c++) {   // garisan penamat berpetak
    const p = box(0.6, 0.07, 1, (k + c) % 2 ? 0x111111 : 0xffffff);
    p.position.set(PANJANG + c * 0.6 - 0.3, 0.08, (k - 5.5) * 1); scene.add(p);
  }
  for (const z of [-7, 7]) { const t = box(0.4, 6, 0.4, 0xffffff); t.position.set(PANJANG, 3, z); scene.add(t); }
  const sepanduk = box(0.3, 1.2, 14, 0xd32f2f); sepanduk.position.set(PANJANG, 6, 0); scene.add(sepanduk);
  for (let x = -10; x < 150; x += 9) for (const z of [-13, 13]) {  // pokok
    const b = box(0.5, 2, 0.5, 0x6b4423); b.position.set(x + (z > 0 ? 4 : 0), 1, z); scene.add(b);
    const d = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4, 8), new THREE.MeshLambertMaterial({ color: 0x2e7d32 }));
    d.position.set(b.position.x, 4, z); scene.add(d);
  }
}

// ---------- Watak haiwan 3D (dibina daripada bentuk asas, boleh berlari) ----------
function binaHaiwan(h) {
  const g = new THREE.Group(), kaki = [];
  const kura = h.id === 'kura';
  const badan = box(kura ? 1.5 : 1.7, kura ? 0.5 : 0.8, 0.8, h.warna); badan.position.y = 1.0; g.add(badan);
  const kepala = box(0.6, 0.55, 0.55, h.warna);
  kepala.position.set(kura ? 1.0 : 1.1, kura ? 1.0 : 1.55, 0); g.add(kepala);
  for (const z of [-0.15, 0.15]) {          // mata
    const m = box(0.1, 0.1, 0.1, 0x000000); m.position.set(kepala.position.x + 0.3, kepala.position.y + 0.1, z); g.add(m);
  }
  if (h.id === 'arnab') for (const z of [-0.15, 0.15]) {
    const t = box(0.14, 0.8, 0.12, 0xffc0cb); t.position.set(1.0, 2.2, z); g.add(t);
  }
  if (h.id === 'kuda') {
    const leher = box(0.4, 0.8, 0.45, h.warna); leher.position.set(0.9, 1.5, 0); leher.rotation.z = -0.4; g.add(leher);
    const bulu = box(0.9, 0.2, 0.15, 0x2b1a0e); bulu.position.set(0.6, 1.95, 0); bulu.rotation.z = -0.4; g.add(bulu);
  }
  if (h.id === 'harimau') for (let i = -2; i <= 2; i++) {
    const s = box(0.15, 0.82, 0.82, 0x222222); s.position.set(i * 0.33, 1.0, 0); g.add(s);
  }
  if (kura) {
    const cengkerang = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x2e7d32 }));
    cengkerang.position.y = 1.2; cengkerang.scale.set(1, 0.8, 0.9); g.add(cengkerang);
  }
  const ekor = box(0.15, 0.15, 0.5, h.id === 'arnab' ? 0xffffff : h.warna);
  ekor.position.set(-0.95, 1.1, 0); g.add(ekor);
  for (const [x, z] of [[0.55, 0.28], [0.55, -0.28], [-0.55, 0.28], [-0.55, -0.28]]) {   // 4 kaki berpangsi
    const pivot = new THREE.Group(); pivot.position.set(x, kura ? 0.8 : 0.95, z);
    const kk = box(0.2, kura ? 0.8 : 0.95, 0.2, kura ? 0x66bb6a : h.warna); kk.position.y = -0.4; pivot.add(kk);
    g.add(pivot); kaki.push(pivot);
  }
  g.scale.setScalar(h.skala);
  return { g, kaki, badan };
}

function sediaPemain() {
  pemain.forEach(p => scene.remove(p.g));
  pemain = pilih.map((idx, i) => {
    const h = HAIWAN[idx], m = binaHaiwan(h);
    m.g.position.set(0, 0, LORONG[i]); scene.add(m.g);
    return { ...m, i, h, x: 0, v: 0, boost: 0, fasa: Math.random() * 6, selesai: false };
  });
}

// ---------- UI ----------
function tunjuk(id) {
  ['menu', 'pilih', 'kira', 'hud', 'hasil'].forEach(s => $(s).hidden = s !== id && !(id === 'kira' && s === 'hud'));
}
function lukisKad() {
  $('kad').innerHTML = '';
  pilih.forEach((idx, i) => {
    const h = HAIWAN[idx], d = document.createElement('div');
    d.className = 'kartu'; d.style.setProperty('--w', WARNA[i]);
    d.innerHTML = `<div>Pemain ${i + 1}</div><div class="emoji">${h.emoji}</div><div class="nama">${h.nama}</div>
      <button data-i="${i}" data-d="-1">◀</button><button data-i="${i}" data-d="1">▶</button>`;
    $('kad').appendChild(d);
  });
}
function tukar(i, d) {                       // tukar haiwan; jika sudah diambil, tukar ganti dengan pemain itu
  const baru = (pilih[i] + d + 4) % 4, lain = pilih.indexOf(baru);
  pilih[lain] = pilih[i]; pilih[i] = baru;
  lukisKad(); sediaPemain();
}
$('kad').addEventListener('click', e => { const b = e.target.closest('button'); if (b) tukar(+b.dataset.i, +b.dataset.d); });
$('btnMula').onclick = () => { keadaan = 'pilih'; tunjuk('pilih'); lukisKad(); };
$('btnCara').onclick = () => $('cara').hidden = !$('cara').hidden;
$('btnKembali').onclick = () => { keadaan = 'menu'; tunjuk('menu'); };
$('btnLumba').onclick = mulaKira;
$('btnSemula').onclick = mulaKira;
$('btnMenu').onclick = () => { keadaan = 'menu'; sediaPemain(); tunjuk('menu'); };

$('kawalan').innerHTML = WARNA.map((w, i) => `<button data-p="${i}" style="background:${w}">P${i + 1} [${LABEL[i]}]</button>`).join('');
$('kawalan').addEventListener('pointerdown', e => { const b = e.target.closest('button'); if (b) tekan(+b.dataset.p); });
addEventListener('keydown', e => { const i = KEKUNCI.indexOf(e.code); if (i >= 0 && !e.repeat) tekan(i); });

function tekan(i) {                           // setiap tekanan menambah kelajuan
  const p = pemain[i];
  if (keadaan === 'lumba' && p && !p.selesai) p.boost = Math.min(p.boost + 1.6, 7);
}

// ---------- Aliran permainan ----------
function mulaKira() {
  sediaPemain(); tamat = []; keadaan = 'kira'; tunjuk('kira'); $('hud').hidden = false;
  let n = 3; $('nombor').textContent = n;
  const t = setInterval(() => {
    n--;
    if (n > 0) $('nombor').textContent = n;
    else { clearInterval(t); $('nombor').textContent = 'LUMBA!'; keadaan = 'lumba';
      setTimeout(() => { if (keadaan === 'lumba') $('kira').hidden = true; }, 700); }
  }, 1000);
}
function akhir() {
  keadaan = 'hasil';
  $('senarai').innerHTML = tamat.map((p, k) =>
    `<li style="color:${WARNA[p.i]}">${['🥇', '🥈', '🥉', ''][k]} Pemain ${p.i + 1} - ${p.h.emoji} ${p.h.nama}</li>`).join('');
  setTimeout(() => { $('hud').hidden = true; $('hasil').hidden = false; }, 1200);
}

// ---------- Gelung utama ----------
let kamX = 6;
const jam = new THREE.Clock();
function ubah() {
  const dt = Math.min(jam.getDelta(), 0.05);
  for (const p of pemain) {
    if (keadaan === 'lumba' && !p.selesai) {
      p.boost = Math.max(0, p.boost - 4 * dt);
      p.v = p.h.laju * 0.35 + p.boost;   // tanpa tekan: perlahan; tekan berulang: laju
      p.x += p.v * dt;
      if (p.x >= PANJANG) { p.selesai = true; tamat.push(p); if (tamat.length === 4) akhir(); }
    } else if (p.selesai) { p.v *= 0.97; p.x += p.v * dt; }
    else p.v = keadaan === 'kira' ? 0 : 2.5;                      // berjoging di tempat semasa menu
    p.fasa += (p.v * 1.4 + 1) * dt * 3;
    p.kaki.forEach((k, n) => k.rotation.z = Math.sin(p.fasa + (n % 2 ? Math.PI : 0)) * Math.min(0.3 + p.v * 0.09, 0.9));
    p.badan.position.y = 1.0 + Math.abs(Math.sin(p.fasa)) * 0.05 * (1 + p.v * 0.2);
    p.g.position.x = p.x;
  }
  if (keadaan === 'lumba' || keadaan === 'hasil') {
    const depan = Math.max(...pemain.map(p => p.x));
    kamX += (depan + 2 - kamX) * Math.min(1, 3 * dt);
    kamera.position.set(kamX, 7, 17); kamera.lookAt(kamX + 4, 1, 0);
    const urut = [...pemain].sort((a, b) => b.x - a.x);
    $('kedudukan').innerHTML = urut.map((p, k) =>
      `<div style="color:${WARNA[p.i]}">${k + 1}. P${p.i + 1} ${p.h.emoji} ${Math.min(100, Math.round(p.x / PANJANG * 100))}%</div>`).join('');
  } else { kamX = 6; kamera.position.set(8, 6, 15); kamera.lookAt(3, 1.2, 0); }
}
function saiz() {
  renderer.setSize(innerWidth, innerHeight, false);
  kamera.aspect = innerWidth / innerHeight; kamera.updateProjectionMatrix();
}
addEventListener('resize', saiz);
function gelung() { ubah(); renderer.render(scene, kamera); requestAnimationFrame(gelung); }

binaPersekitaran(); sediaPemain(); saiz(); tunjuk('menu'); gelung();
})();
