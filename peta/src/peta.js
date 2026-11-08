// Peta ARZAK — maket 3D low-poly yang digerakkan scroll.
// Padat = sudah berdiri. Garis putus-putus emas = rencana.
// Keterangan teks ada di HTML (bisa dibaca pembaca layar); kanvas ini hanya gambar.
import {
  WebGLRenderer, Scene, OrthographicCamera, Group, Mesh, InstancedMesh,
  BoxGeometry, CylinderGeometry, ConeGeometry, ExtrudeGeometry, PlaneGeometry, Shape,
  MeshLambertMaterial, MeshBasicMaterial, LineBasicMaterial, LineSegments, BufferGeometry, Float32BufferAttribute,
  HemisphereLight, DirectionalLight, Vector3, Color, Matrix4, CanvasTexture, RepeatWrapping, SRGBColorSpace, PCFSoftShadowMap
} from 'three';

const stage = document.querySelector('.peta-stage');
const track = document.querySelector('.peta-track');
const POSTER = new URLSearchParams(location.search).has('poster');
if (stage && track) start();

function start() {
  const canvas = stage.querySelector('canvas');
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: POSTER });
  } catch (e) { // tanpa WebGL: kembali ke gambar diam, posisi baca dijaga
    const y0 = track.getBoundingClientRect().top; document.documentElement.classList.remove('peta-live');
    if (y0 < 0) window.scrollBy(0, track.getBoundingClientRect().top - y0);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const C = {
    sea: 0x3E1520, seaSide: 0x2A0B12, land: 0xEADCC8, landSide: 0x8E4250, tile: 0xF6EFE5,
    // burgundy dan emas hanya untuk papan, laut, jembatan, dan rencana; yang sudah berdiri memakai warna netral
    ivory: 0xF9F4ED, sand: 0xE9DAC4, stone: 0xD9C4A7, clinic: 0xB9A58A, roof: 0xA8927A, ink2: 0x5B4A45,
    gold: 0xC9A24B, field: 0xDCCBB0, field2: 0xD2BF9F, tree: 0x9C8C66, tree2: 0x83744F,
    pylon: 0xA3313F, road: 0xD2BEA2, ink: 0x26161A
  };
  const scene = new Scene();
  const unit = new BoxGeometry(1, 1, 1);
  const mats = {};
  const M = (c) => mats[c] || (mats[c] = new MeshLambertMaterial({ color: c }));
  const edges = [];
  const rnd = mulberry32(20241107);

  // ---------- papan laut + daratan ----------
  const seaTop = new MeshLambertMaterial({ color: C.sea }), seaSide = new MeshLambertMaterial({ color: C.seaSide });
  const board = new Mesh(unit, [seaSide, seaSide, seaTop, seaSide, seaSide, seaSide]);
  board.scale.set(43.98, 1.4, 27.98); board.position.set(0, -0.72, 0); board.receiveShadow = true;
  scene.add(board);

  const SBY = [[-22, -14], [-7, -14], [-6, -10.5], [-7.4, -7.2], [-5.4, -4.2], [-6, -1.2], [-4.5, 1.4], [-5.3, 4.4], [-6.9, 7], [-6, 10.4], [-7.8, 14], [-22, 14]];
  const MDR = [[3.4, -14], [22, -14], [22, 14], [6.2, 14], [5, 10.2], [3.1, 6.2], [4.5, 3], [3, 0], [3.8, -3], [2.6, -7], [3.7, -10.4]];
  const TILE = [[26, -5.5], [36, -5.5], [36, 5.5], [26, 5.5]];
  land(SBY, M(C.land));
  land(MDR, M(C.land));
  const gridTex = gridTexture();
  land(TILE, new MeshLambertMaterial({ color: 0xffffff, map: gridTex }));

  function land(pts, top) {
    const s = new Shape();
    pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
    const g = new ExtrudeGeometry(s, { depth: 1.9, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, -1.4, 0);
    const m = new Mesh(g, [top, M(C.landSide)]);
    m.receiveShadow = true; m.castShadow = true; scene.add(m);
  }

  // ---------- kotak padat (instanced) ----------
  const B = [];
  const bx = (x, y, z, w, h, d, c, e = true) => B.push({ x, y, z, w, h, d, c, e });
  const G = 0.5; // tinggi permukaan daratan
  const R = []; // atap limas (instanced)
  const roof = (x, y, z, w, h, d) => R.push({ x, y, z, w, h, d });

  // Surabaya: siluet kota generik (tidak ada rumah pribadi yang dimodelkan)
  const OFFICE = { x: -8.4, z: -3.0, w: 2.0, h: 3.2, d: 1.8 };
  const trees = [];
  for (let i = 0, gx = -20.6; gx <= -7.2; gx += 1.25, i++) {
    for (let j = 0, gz = -12.6; gz <= 12.6; gz += 1.25, j++) {
      if (i % 4 === 3 || j % 4 === 3) continue; // jalan
      if (!inside(SBY, gx, gz, 0.75)) continue;
      if (Math.abs(gx - OFFICE.x) < 3.6 && Math.abs(gz - OFFICE.z) < 3.4) continue;
      const r = rnd();
      if (r < 0.14) { trees.push([gx, gz, 0.42]); continue; }
      const dist = Math.hypot((gx + 14.5) / 6.5, (gz - 0.5) / 8.5);
      const hmax = 0.5 + 4.8 * Math.max(0, 1 - dist);
      const h = 0.35 + rnd() * hmax;
      const w = 0.72 + rnd() * 0.32, d = 0.72 + rnd() * 0.32;
      const pal = h > 2.6 ? [C.ivory, C.ivory, C.stone] : [C.ivory, C.sand, C.stone, C.ivory];
      const c = pal[Math.floor(rnd() * pal.length)];
      bx(gx, G, gz, w, h, d, c);
      if (h > 2.4) { // lantai menara
        for (let y = 0.45; y < h - 0.2; y += 0.42) bx(gx, G + y, gz, w + 0.03, 0.05, d + 0.03, C.stone, false);
        bx(gx, G + h, gz, w * 0.45, 0.22, d * 0.45, C.sand);
      }
    }
  }

  // Madura: Bangkalan + lahan + pepohonan
  const CL = { x: 10.2, z: -6.4 };
  for (let k = 0; k < 46; k++) {
    const x = 6.6 + rnd() * 9, z = -11.8 + rnd() * 8;
    if (Math.hypot(x - CL.x, z - CL.z) < 2.3) continue;
    if (!inside(MDR, x, z, 0.6)) continue;
    if (Math.abs(z - lerpRoadZ(x)) < 0.6) continue;
    const w = 0.62 + rnd() * 0.3, d = 0.58 + rnd() * 0.3, h = 0.36 + rnd() * 0.3;
    bx(x, G, z, w, h, d, rnd() < 0.5 ? C.ivory : C.sand);
    roof(x, G + h, z, w, 0.32, d);
  }
  for (const [x, z, w, d, c] of [[16.5, -10.5, 3.2, 2.2, C.field], [19.6, -9.8, 2.2, 3, C.field2], [15.6, -0.6, 3.4, 2.4, C.field2], [18.8, 2.6, 2.6, 2.4, C.field], [13.4, 4.6, 3, 2, C.field], [9, 7.4, 2.6, 2.2, C.field2], [17, 8.6, 3.4, 2.6, C.field2]]) {
    bx(x, G, z, w, 0.05, d, c, false);
  }
  for (let k = 0; k < 70; k++) {
    const x = 4.5 + rnd() * 17, z = -13 + rnd() * 26;
    if (!inside(MDR, x, z, 0.5) || (x < 16 && z < -2.8 && z > -12.4)) continue;
    if (Math.abs(z - lerpRoadZ(x)) < 0.5 && x < 21) continue;
    trees.push([x, z, 0.3 + rnd() * 0.2]);
  }
  for (let k = 0; k < 26; k++) {
    const x = -21 + rnd() * 14, z = -13.4 + rnd() * 26.8;
    if (inside(SBY, x, z, 0.4) && (x < -19.8 || z > 11.8 || z < -11.8)) trees.push([x, z, 0.36]);
  }

  // Klinik Utama INTRO Dental (padat, sudah berdiri)
  bx(CL.x, G, CL.z, 2.4, 2.15, 1.7, C.clinic);
  for (const y of [0.68, 1.38]) bx(CL.x, G + y, CL.z, 2.44, 0.1, 1.74, C.ivory, false);
  bx(CL.x, G + 2.15, CL.z, 2.52, 0.12, 1.82, C.ivory);
  bx(CL.x, G + 0.52, CL.z + 1.02, 0.9, 0.07, 0.42, C.ivory, false);
  bx(CL.x + 0.6, G, CL.z + 1.35, 0.06, 0.62, 0.06, C.stone, false);

  // jalan Madura: ujung jembatan → klinik → timur
  road(6.4, -2.3, 9.4, -4.85); road(9.4, -4.85, 21.5, -3.6);

  function lerpRoadZ(x) { return x < 9.4 ? -2.3 + (x - 6.4) / 3 * -2.55 : -4.85 + (x - 9.4) / 12.1 * 1.25; }
  function road(x1, z1, x2, z2) {
    const m = new Mesh(unit, M(C.road));
    const L = Math.hypot(x2 - x1, z2 - z1);
    m.scale.set(L, 0.03, 0.42); m.position.set((x1 + x2) / 2, G + 0.015, (z1 + z2) / 2);
    m.rotation.y = Math.atan2(-(z2 - z1), x2 - x1); m.receiveShadow = true; scene.add(m);
  }

  // ---------- Jembatan Suramadu ----------
  const A = new Vector3(-7.7, 0, 2.15), Bp = new Vector3(6.3, 0, -2.35);
  const dirB = Bp.clone().sub(A); const LB = dirB.length();
  const bridge = new Group(); bridge.position.copy(A); bridge.rotation.y = Math.atan2(-dirB.z, dirB.x); scene.add(bridge);
  const DT = 1.55, RP = 2.6;
  const deckY = (x) => (x < RP ? G + (DT - G) * (x / RP) : x > LB - RP ? G + (DT - G) * ((LB - x) / RP) : DT);
  const deckMat = M(C.ivory);
  const part = (w, h, d, mat, x, y, z, rz = 0, shadow = true) => {
    const m = new Mesh(unit, mat); m.scale.set(w, h, d); m.position.set(x, y, z); m.rotation.z = rz;
    m.castShadow = shadow; m.receiveShadow = true; bridge.add(m); return m;
  };
  part(LB - 2 * RP, 0.16, 0.74, deckMat, LB / 2, DT - 0.08, 0);
  const rl = Math.hypot(RP, DT - G), ra = Math.atan2(DT - G, RP);
  part(rl, 0.16, 0.74, deckMat, RP / 2, (G + DT) / 2 - 0.08, 0, ra);
  part(rl, 0.16, 0.74, deckMat, LB - RP / 2, (G + DT) / 2 - 0.08, 0, -ra);
  part(LB - 2 * RP, 0.05, 0.05, M(C.gold), LB / 2, DT + 0.03, 0.36, 0, false);
  part(LB - 2 * RP, 0.05, 0.05, M(C.gold), LB / 2, DT + 0.03, -0.36, 0, false);
  const PY = [LB * 0.42, LB * 0.59], PH = 4.3;
  const pyl = M(C.pylon);
  for (const px of PY) {
    for (const s of [-1, 1]) part(0.2, PH, 0.2, pyl, px, PH / 2 - 0.05, s * 0.46);
    part(0.18, 0.16, 1.1, pyl, px, DT - 0.26, 0);
    part(0.18, 0.18, 1.1, pyl, px, PH - 0.35, 0);
    part(0.24, 0.12, 0.24, M(C.ivory), px, PH, 0.46, 0, false);
    part(0.24, 0.12, 0.24, M(C.ivory), px, PH, -0.46, 0, false);
  }
  const pierGeo = new CylinderGeometry(0.07, 0.09, 1, 8);
  for (let x = RP + 0.3; x < LB - RP; x += 0.95) {
    const t = (x / LB);
    if (t < 0.2 || t > 0.8) continue;
    if (PY.some((p) => Math.abs(p - x) < 0.5)) continue;
    const h = deckY(x) - 0.16;
    const m = new Mesh(pierGeo, M(C.stone)); m.scale.set(1, h, 1); m.position.set(x, h / 2 - 0.05, 0); m.castShadow = true; bridge.add(m);
  }
  const cab = [];
  for (const px of PY) for (const s of [-1, 1]) for (let k = 1; k <= 7; k++) for (const side of [-1, 1]) {
    const ty = PH - 0.45 - k * 0.07;
    cab.push(px, ty, s * 0.46, px + side * k * 0.42, DT + 0.03, s * 0.36);
  }
  const cg = new BufferGeometry(); cg.setAttribute('position', new Float32BufferAttribute(cab, 3));
  bridge.add(new LineSegments(cg, new LineBasicMaterial({ color: 0xFFF8EE, transparent: true, opacity: 0.85 })));

  // mobil kecil di jembatan
  const cars = [];
  const carCols = [C.ivory, C.stone, C.ink2, C.sand, C.ivory, C.clinic];
  for (let k = 0; k < 12; k++) {
    const m = new Mesh(unit, M(carCols[k % carCols.length]));
    m.scale.set(0.32, 0.15, 0.17); bridge.add(m);
    cars.push({ m, u: rnd(), v: (0.022 + rnd() * 0.012) * (k % 2 ? 1 : -1), lane: k % 2 ? -0.17 : 0.17 });
  }
  // perahu nelayan di selat
  const boats = [];
  for (const [x, z, v] of [[-0.95, -6, 0.55], [-0.2, 8, -0.42], [1.4, -11, 0.3]]) {
    const g = new Group();
    const h = new Mesh(unit, M(C.ivory)); h.scale.set(0.2, 0.13, 0.62); h.position.y = 0.04; g.add(h);
    const c = new Mesh(unit, M(C.ink2)); c.scale.set(0.15, 0.13, 0.18); c.position.set(0, 0.17, -0.08); g.add(c);
    const wk = new Mesh(new PlaneGeometry(0.16, 1.4), new MeshBasicMaterial({ color: 0xF3E4D2, transparent: true, opacity: 0.22, depthWrite: false }));
    wk.rotation.x = -Math.PI / 2; wk.position.set(0, -0.01, -0.95 * Math.sign(v)); g.add(wk);
    g.position.set(x, 0, z); if (v < 0) g.rotation.y = Math.PI; scene.add(g);
    boats.push({ g, z, v });
  }

  // ---------- rencana: garis putus-putus emas ----------
  const PLANS = {
    arzak: { x: OFFICE.x, z: OFFICE.z, w: OFFICE.w, h: OFFICE.h, d: OFFICE.d },
    nata: { x: 28.5, z: -2.3, w: 2.4, h: 1.4, d: 1.8 },
    gedung: { x: 33.3, z: -2.0, w: 2.6, h: 2.8, d: 2.2 },
    usaha: { x: 30.6, z: 2.4, w: 2.4, h: 2.1, d: 1.7 }
  };
  const dash = [];
  const ghost = new MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.07, depthWrite: false });
  for (const p of Object.values(PLANS)) {
    dashBox(p.x, G, p.z, p.w, p.h, p.d);
    const gm = new Mesh(unit, ghost); gm.scale.set(p.w, p.h, p.d); gm.position.set(p.x, G + p.h / 2, p.z); scene.add(gm);
    const f = new Mesh(unit, new MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.22, depthWrite: false }));
    f.scale.set(p.w, 0.01, p.d); f.position.set(p.x, G + 0.012, p.z); scene.add(f);
  }
  const dashMat = new MeshBasicMaterial({ color: 0xA27C2C });
  const dashMesh = new InstancedMesh(unit, dashMat, dash.length);
  dash.forEach((m, i) => dashMesh.setMatrixAt(i, m)); scene.add(dashMesh);

  function dashBox(x, y, z, w, h, d) {
    const x0 = x - w / 2, x1 = x + w / 2, y0 = y + 0.03, y1 = y + h, z0 = z - d / 2, z1 = z + d / 2;
    const E = [];
    for (const [ex, ez] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) E.push([[ex, y0, ez], [ex, y1, ez]]);
    for (const ey of [y0, y1]) E.push([[x0, ey, z0], [x1, ey, z0]], [[x1, ey, z0], [x1, ey, z1]], [[x1, ey, z1], [x0, ey, z1]], [[x0, ey, z1], [x0, ey, z0]]);
    const dl = 0.26, gp = 0.16, t = 0.055, v = new Vector3(), q = new Vector3();
    for (const [a, b] of E) {
      v.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = v.length(); v.normalize();
      const n = Math.max(1, Math.floor((L + gp) / (dl + gp)));
      const tot = n * dl + (n - 1) * gp, s0 = (L - tot) / 2;
      for (let k = 0; k < n; k++) {
        const c = s0 + k * (dl + gp) + dl / 2;
        q.set(a[0] + v.x * c, a[1] + v.y * c, a[2] + v.z * c);
        const sx = Math.abs(v.x) > 0.5 ? dl : t, sy = Math.abs(v.y) > 0.5 ? dl : t, sz = Math.abs(v.z) > 0.5 ? dl : t;
        dash.push(new Matrix4().makeScale(sx, sy, sz).setPosition(q));
      }
    }
  }


  // ---------- satukan geometri ----------
  const inst = new MeshLambertMaterial({ color: 0xffffff, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const boxes = new InstancedMesh(unit, inst, B.length);
  const m4 = new Matrix4(), col = new Color();
  B.forEach((b, i) => {
    m4.makeScale(b.w, b.h, b.d).setPosition(b.x, b.y + b.h / 2, b.z);
    boxes.setMatrixAt(i, m4); boxes.setColorAt(i, col.setHex(b.c));
    if (b.e) boxEdges(b);
  });
  boxes.castShadow = boxes.receiveShadow = true; scene.add(boxes);

  const roofGeo = new ConeGeometry(Math.SQRT1_2, 1, 4); roofGeo.rotateY(Math.PI / 4); roofGeo.translate(0, 0.5, 0);
  const roofs = new InstancedMesh(roofGeo, new MeshLambertMaterial({ color: C.roof, flatShading: true }), R.length);
  R.forEach((r, i) => { roofs.setMatrixAt(i, m4.makeScale(r.w + 0.08, r.h, r.d + 0.08).setPosition(r.x, r.y, r.z)); });
  roofs.castShadow = roofs.receiveShadow = true; scene.add(roofs);

  const treeGeo = new ConeGeometry(0.42, 1.15, 6); treeGeo.translate(0, 0.575, 0); // pohon cemara low-poly
  const treeMesh = new InstancedMesh(treeGeo, new MeshLambertMaterial({ color: 0xffffff, flatShading: true }), trees.length);
  trees.forEach(([x, z, r], i) => {
    treeMesh.setMatrixAt(i, m4.makeScale(r * 2, r * 2, r * 2).setPosition(x, G, z));
    treeMesh.setColorAt(i, col.setHex(i % 3 ? C.tree : C.tree2));
  });
  treeMesh.castShadow = true; scene.add(treeMesh);

  const eg = new BufferGeometry(); eg.setAttribute('position', new Float32BufferAttribute(edges, 3));
  scene.add(new LineSegments(eg, new LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.26 })));

  function boxEdges(b) {
    const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, y0 = b.y, y1 = b.y + b.h, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
    for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) edges.push(x, y0, z, x, y1, z);
    edges.push(x0, y1, z0, x1, y1, z0, x1, y1, z0, x1, y1, z1, x1, y1, z1, x0, y1, z1, x0, y1, z1, x0, y1, z0);
  }

  // bayangan lembut papan maket di "meja"
  const sh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }));
  sh.scale.set(82, 46, 1); sh.rotation.x = -Math.PI / 2; sh.position.set(6, -3.2, 1.5); scene.add(sh);

  // ---------- cahaya ----------
  scene.add(new HemisphereLight(0xFFF3E4, 0x6B3A33, 1.55));
  const sun = new DirectionalLight(0xFFE6C6, 2.1);
  sun.position.set(-14, 34, 16); sun.target.position.set(6, 0, -2); scene.add(sun, sun.target);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 32, bottom: -32, near: 1, far: 120 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  renderer.shadowMap.needsUpdate = true;

  // ---------- label (HTML, aria-hidden) ----------
  const layer = stage.querySelector('.peta-labels');
  const LABELS = [
    ['Surabaya', [-15, 6.4, 1.5], [0, 1]],
    ['ARZAK, dalam persiapan pendirian', [OFFICE.x, G + OFFICE.h + 0.25, OFFICE.z], [1], 1],
    ['Selat Madura', [-0.9, 0.2, 9.4], [0]],
    ['Jembatan Suramadu', [A.x + dirB.x * 0.505, PH + 0.5, A.z + dirB.z * 0.505], [2]],
    ['Bangkalan, Madura', [14.2, 1.3, -9.8], [0, 3]],
    ['Klinik Utama INTRO Dental', [CL.x, G + 2.6, CL.z], [3]],
    ['Rencana', [31, G + 0.2, 5.2], [0], 1],
    ['Nata Arah', [PLANS.nata.x, G + PLANS.nata.h + 0.2, PLANS.nata.z], [4], 1],
    ['Gedung dan peralatan', [PLANS.gedung.x, G + PLANS.gedung.h + 0.2, PLANS.gedung.z], [4], 1],
    ['Usaha berikutnya', [PLANS.usaha.x, G + PLANS.usaha.h + 0.2, PLANS.usaha.z], [4], 1]
  ].map(([t, p, steps, plan]) => {
    const el = document.createElement('span'); el.className = 'pl' + (plan ? ' plan' : ''); el.textContent = t; layer.appendChild(el);
    return { el, p: new Vector3(...p), steps };
  });

  // ---------- kamera ----------
  // f: titik fokus, w/h: lebar/tinggi minimum yang terlihat (satuan maket), az/el: sudut kamera (derajat)
  // o: geser fokus ke kanan (desktop) atau ke atas (HP) supaya tidak tertutup kartu keterangan
  // pw/pa: lebar dan sudut untuk layar tegak (HP); maket diputar supaya sumbu panjangnya mengikuti tinggi layar
  const K = [
    { f: [8.5, 0.4, 0.5], w: 70, h: 31, az: 30, el: 36, o: 0.12, pw: 38, pa: 72, po: 0.1 },
    { f: [-9.4, 1.8, -2.4], w: 19, h: 13, az: 26, el: 33, o: 0.16, pw: 15, pa: 58, po: 0.17 },
    { f: [-0.6, 1.6, 0], w: 23, h: 12.5, az: 42, el: 24, o: 0.15, pw: 17, pa: 38, po: 0.17 },
    { f: [10.4, 1.2, -6.4], w: 13, h: 9.5, az: 30, el: 37, o: 0.15, pw: 11, pa: 62, po: 0.17 },
    { f: [31, 1.2, 0], w: 17, h: 13, az: 20, el: 41, o: 0.15, pw: 14, pa: 58, po: 0.17 }
  ];
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const cur = { ...K[0], f: [...K[0].f] };
  const D2R = Math.PI / 180, dir = new Vector3(), right = new Vector3(), up = new Vector3(), tgt = new Vector3(), pv = new Vector3();
  let W = 1, H = 1;

  function goal(s) {
    const i = Math.min(K.length - 2, Math.max(0, Math.floor(s)));
    const e = smooth(clamp((s - i - 0.16) / 0.68));
    const a = K[i], b = K[i + 1];
    const o = {}; for (const key of ['w', 'h', 'az', 'el', 'o', 'pw', 'pa', 'po']) o[key] = a[key] + (b[key] - a[key]) * e;
    o.f = a.f.map((v, k) => v + (b.f[k] - v) * e); return o;
  }
  function place(st, ui) {
    const aspect = W / H, tall = aspect < 0.85;
    const vh = Math.max(st.h, (tall ? st.pw : st.w) / aspect), vw = vh * aspect;
    Object.assign(cam, { left: -vw / 2, right: vw / 2, top: vh / 2, bottom: -vh / 2 }); cam.updateProjectionMatrix();
    const az = (tall ? st.pa : st.az) * D2R, el = st.el * D2R;
    dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    right.set(Math.cos(az), 0, -Math.sin(az)); up.crossVectors(dir, right);
    tgt.set(...st.f);
    if (ui) { if (W >= 900 && aspect > 1.15) tgt.addScaledVector(right, -st.o * vw); else tgt.addScaledVector(up, -st.po * vh); }
    cam.position.copy(tgt).addScaledVector(dir, 120); cam.up.set(0, 1, 0); cam.lookAt(tgt);
    cam.updateMatrixWorld();
  }

  // ---------- loop ----------
  // Kanvas hanya digambar ulang saat kamera bergerak atau sesaat setelah pengunjung menggulir.
  // Mobil dan perahu berhenti 4 detik setelah gulir terakhir, jadi tidak ada gerak terus-menerus (WCAG 2.2.2).
  let last = performance.now(), active = 0, shown = false, lastS = -1, wake = -1e9, dirty = true;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const s = POSTER ? 0 : parseFloat(track.dataset.s || '0');
    active = POSTER ? 0 : parseInt(track.dataset.i || '0', 10);
    if (s !== lastS) { lastS = s; wake = now; }
    const moving = !POSTER && now - wake < 4000;
    const g = goal(s), k = POSTER ? 1 : 1 - Math.exp(-dt * 5.5);
    let delta = 0;
    cur.f = cur.f.map((v, i) => { const d = g.f[i] - v; delta = Math.max(delta, Math.abs(d)); return v + d * k; });
    for (const key of ['w', 'h', 'az', 'el', 'o', 'pw', 'pa', 'po']) { const d = g[key] - cur[key]; delta = Math.max(delta, Math.abs(d)); cur[key] += d * k; }
    if (shown && !moving && !dirty && delta < 0.002) return;
    dirty = false;
    place(cur, !POSTER);

    const t = now / 1000;
    for (const c of cars) {
      if (moving) c.u = (c.u + c.v * dt + 1) % 1;
      const x = RP * 0.4 + c.u * (LB - RP * 0.8), y = deckY(x);
      c.m.position.set(x, y + 0.075, c.lane);
      c.m.rotation.z = x < RP ? Math.atan2(DT - G, RP) : x > LB - RP ? -Math.atan2(DT - G, RP) : 0;
    }
    for (const b of boats) {
      if (moving) { b.z += b.v * dt; if (b.z > 13) b.z = -13; if (b.z < -13) b.z = 13; b.g.position.y = Math.sin(t * 2 + b.z) * 0.02; }
      b.g.position.z = b.z;
    }

    renderer.render(scene, cam);
    const placed = [];
    for (const l of LABELS) {
      pv.copy(l.p).project(cam);
      const on = l.steps.includes(active) && pv.x > -0.98 && pv.x < 0.98 && pv.y > -0.9 && pv.y < 0.86;
      if (on) {
        if (!l.w) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; }
        let x = Math.min(W - l.w / 2 - 8, Math.max(l.w / 2 + 8, (pv.x + 1) / 2 * W)), y = (1 - pv.y) / 2 * H;
        for (let n = 0; n < 3; n++) { // geser ke atas bila menimpa label lain
          const hit = placed.find((r) => Math.abs(r.x - x) < (r.w + l.w) / 2 + 6 && Math.abs(r.y - y) < (r.h + l.h) / 2 + 4);
          if (!hit) break; y = hit.y - (hit.h + l.h) / 2 - 6;
        }
        if (!POSTER && y - l.h < 96) { l.el.classList.remove('on'); continue; } // jangan menimpa judul
        placed.push({ x, y, w: l.w, h: l.h });
        l.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      }
      l.el.classList.toggle('on', on);
    }
    if (!shown) { shown = true; stage.classList.add('ready'); if (POSTER) document.body.dataset.posterReady = '1'; }
  }

  function resize() {
    W = Math.max(1, stage.clientWidth); H = Math.max(1, stage.clientHeight);
    renderer.setSize(W, H, false); dirty = true;
  }
  resize();
  if (POSTER) { requestAnimationFrame(frame); return; }
  new ResizeObserver(() => { resize(); }).observe(stage);
  let running = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; last = performance.now(); renderer.setAnimationLoop(frame); }
    else if (!e.isIntersecting && running) { running = false; renderer.setAnimationLoop(null); }
  }, { rootMargin: '200px 0px' }).observe(track);

  // ---------- tekstur ----------
  function gridTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#F6EFE5'; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = 'rgba(165,129,49,.55)'; x.lineWidth = 2; x.strokeRect(1, 1, 126, 126);
    x.strokeStyle = 'rgba(165,129,49,.22)'; x.lineWidth = 1; x.beginPath(); x.moveTo(64, 0); x.lineTo(64, 128); x.moveTo(0, 64); x.lineTo(128, 64); x.stroke();
    const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(0.5, 0.5); t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
    return t;
  }
  function blobTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 20, 128, 128, 128);
    g.addColorStop(0, 'rgba(42,11,18,.30)'); g.addColorStop(0.55, 'rgba(42,11,18,.12)'); g.addColorStop(1, 'rgba(42,11,18,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  }
}

function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function smooth(t) { return t * t * (3 - 2 * t); }
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function pip(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
function inside(poly, x, z, m) { return pip(x - m, z - m, poly) && pip(x + m, z - m, poly) && pip(x - m, z + m, poly) && pip(x + m, z + m, poly); }
