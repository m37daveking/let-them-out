// Let Them Out — let your notes mingle

(function () {
  const appScreen = document.getElementById("app");
  const btnStart = document.getElementById("btn-start");
  const setupStatus = document.getElementById("setup-status");
  const introOverlay = document.getElementById("intro-overlay");
  let userApiKey = "";

  // Draw the street scene behind the intro on load (called after PALETTES defined below)

  function drawSetupBackground() {
    const canvas = document.getElementById("street-canvas");
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const P = 4, s = P;
    const SIDEWALK_Y = H * 0.72;

    function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h)); }
    function seed(v) { return () => { v = (v * 16807) % 2147483647; return v / 2147483647; }; }

    // Sky
    ["#5B9BD5","#6BA8DD","#7CB5E5","#8EC2ED","#A0CFF5","#B2DCFC"].forEach((c, i) => {
      px(0, i * Math.ceil(SIDEWALK_Y / 6), W, Math.ceil(SIDEWALK_Y / 6), c);
    });

    // Sun
    const sx = W * 0.82, sy = H * 0.1, ss = P * 2;
    px(sx - ss * 5, sy - ss * 0.5, ss * 10, ss, "#FFE87C");
    px(sx - ss * 0.5, sy - ss * 5, ss, ss * 10, "#FFE87C");
    px(sx - ss * 2, sy - ss * 2, ss * 4, ss * 4, "#FFD700");
    px(sx - ss * 3, sy - ss, ss * 6, ss * 2, "#FFD700");
    px(sx - ss, sy - ss * 3, ss * 2, ss * 6, "#FFD700");

    // Clouds
    const cr = seed(99);
    for (let i = 0; i < 5; i++) {
      const cx = cr() * W, cy = 60 + cr() * H * 0.12;
      px(cx, cy, s * 10, s * 2, "#fff");
      px(cx + s * 2, cy - s * 2, s * 6, s * 2, "#fff");
      px(cx - s * 2, cy + s * 2, s * 14, s * 2, "#fff");
    }

    // Skyscrapers
    const baseY = SIDEWALK_Y - 18;
    // Skyscraper 1 (left)
    const sk1x = Math.floor(W * 0.18), sk1w = s * 12, sk1h = s * 55;
    px(sk1x, baseY - sk1h, sk1w, sk1h, "#8A9AAA");
    px(sk1x + s * 2, baseY - sk1h - s * 6, sk1w - s * 4, s * 6, "#8A9AAA");
    px(sk1x + sk1w / 2 - s * 0.5, baseY - sk1h - s * 18, s, s * 12, "#7A8A9A");
    for (let wy = baseY - sk1h + s * 3; wy < baseY - s * 2; wy += s * 3)
      for (let wx = sk1x + s * 1.5; wx < sk1x + sk1w - s * 1.5; wx += s * 2.5)
        px(wx, wy, s * 1.2, s * 1.8, "#A0B8D0");
    // Tower (centre)
    const twx = Math.floor(W * 0.55), tww = s * 8, twh = s * 48;
    px(twx, baseY - twh, tww, twh, "#9A8A7A");
    px(twx - s * 2, baseY - twh + s * 2, tww + s * 4, s * 8, "#A89A8A");
    px(twx + tww / 2 - s * 2, baseY - twh + s * 4, s * 4, s * 4, "#F5F0E0");
    px(twx + s, baseY - twh - s * 4, tww - s * 2, s * 4, "#9A8A7A");
    px(twx + tww / 2 - s * 0.5, baseY - twh - s * 16, s, s * 12, "#8A7A6A");
    px(twx + tww / 2 + s * 0.5, baseY - twh - s * 16, s * 3, s * 2, "#C0392B");
    // Skyscraper 2 (right)
    const sk2x = Math.floor(W * 0.78), sk2w = s * 14, sk2h = s * 50;
    px(sk2x, baseY - sk2h, sk2w, sk2h, "#7090B0");
    px(sk2x + s * 2, baseY - sk2h - s * 6, sk2w - s * 4, s * 6, "#7090B0");
    px(sk2x + s * 4, baseY - sk2h - s * 10, sk2w - s * 8, s * 4, "#7090B0");
    px(sk2x + sk2w / 2 - s * 0.5, baseY - sk2h - s * 16, s, s * 6, "#506070");
    for (let wy = baseY - sk2h + s * 2; wy < baseY - s * 2; wy += s * 2.5)
      for (let wx = sk2x + s; wx < sk2x + sk2w - s; wx += s * 2)
        px(wx, wy, s * 1.5, s * 1.8, "#80A8D0");

    // Back buildings
    const br = seed(17);
    let bx = -30;
    while (bx < W + 60) {
      const bw = s * 8 + Math.floor(br() * 8) * s;
      const bh = s * 22 + Math.floor(br() * 18) * s;
      px(bx, SIDEWALK_Y - 18 - bh, bw, bh, ["#B8C8D8","#C0C8D0","#A8B8C8"][Math.floor(br() * 3)]);
      bx += bw + s + Math.floor(br() * 3) * s;
    }

    // Front buildings
    const fr = seed(31);
    const roofs = ["#C0392B","#5B7FA5","#E67E22","#7F8C8D"];
    const walls = ["#E8D5C0","#D4E6F1","#F5E6CC","#E8E0D8"];
    bx = -10;
    while (bx < W + 60) {
      const ci = Math.floor(fr() * 4);
      const sm = fr() > 0.4;
      const bw = sm ? s * 10 + Math.floor(fr() * 6) * s : s * 8 + Math.floor(fr() * 5) * s;
      const bh = sm ? s * 8 + Math.floor(fr() * 6) * s : s * 14 + Math.floor(fr() * 10) * s;
      const by = SIDEWALK_Y - 18 - bh;
      px(bx, by, bw, bh, walls[ci]);
      if (sm) { for (let r = 0; r < bh * 0.4; r += s) px(bx + (bw - bw * (1 - r / (bh * 0.4) * 0.8)) / 2, by - r - s, bw * (1 - r / (bh * 0.4) * 0.8), s, roofs[ci]); }
      else px(bx - s, by - s, bw + s * 2, s * 2, roofs[ci]);
      // Door
      px(bx + bw / 2 - s, SIDEWALK_Y - 18 - s * 4, s * 2, s * 4, "#5D4037");
      // Windows
      const winRows = sm ? 1 : Math.floor((bh - s * 6) / (s * 5));
      for (let row = 0; row < winRows; row++)
        for (let wx = bx + s * 2; wx < bx + bw - s * 3; wx += s * 4)
          px(wx, by + s * 3 + row * s * 5, s * 2, s * 2, "#87CEEB");
      bx += bw + s * 2 + Math.floor(fr() * 4) * s;
    }

    // Grass + path + park
    px(0, SIDEWALK_Y - 18, W, 24, "#6ABF40");
    const gr = seed(77);
    for (let i = 0; i < 60; i++) px(Math.floor(gr() * W / s) * s, SIDEWALK_Y - 18 + Math.floor(gr() * 6) * s, s, s, gr() > 0.5 ? "#5BAF30" : "#7CCF50");
    px(0, SIDEWALK_Y + 4, W, s * 8, "#D4C4A0");
    px(0, SIDEWALK_Y + 4, W, s, "#C0B080");
    px(0, SIDEWALK_Y + 4 + s * 8, W, H, "#5DAF35");
    const gr2 = seed(44);
    for (let i = 0; i < 80; i++) px(Math.floor(gr2() * W / s) * s, SIDEWALK_Y + 4 + s * 8 + Math.floor(gr2() * ((H - SIDEWALK_Y - s * 8) / s)) * s, s, s, gr2() > 0.5 ? "#4E9F28" : "#6CC048");
    // Lake
    const lx = Math.floor(W * 0.55), ly = SIDEWALK_Y + 4 + s * 13;
    px(lx + s * 2, ly, s * 24, s * 10, "#4A90D0");
    px(lx, ly + s * 2, s * 28, s * 6, "#4A90D0");
    px(lx + s * 4, ly + s * 2, s * 20, s * 6, "#5AA0E0");
    px(lx + s * 6, ly + s * 3, s * 2, s, "#8AC0F0");
    px(lx + s * 12, ly + s * 4, s * 3, s, "#8AC0F0");
    // Flowers
    const fl = seed(33);
    const fcs = ["#FF6B6B","#FFD93D","#FF8ED4","#fff"];
    for (let i = 0; i < 12; i++) { px(Math.floor(fl() * W / s) * s, SIDEWALK_Y - 14 + Math.floor(fl() * 4) * s, s, s, fcs[Math.floor(fl() * 4)]); }

    // Trees
    const tr = seed(42);
    for (let i = 0; i < 10; i++) {
      const tx = tr() * W, th = 30 + tr() * 25;
      px(tx - s, SIDEWALK_Y - 18 - th, s * 2, th, "#8B6914");
      const gs = ["#2E8B57","#3CB371","#228B22","#27AE60"];
      for (let l = 0; l < 5; l++) {
        const lw = ((28 + tr() * 20) * (l + 2)) / 6;
        px(tx - lw / 2, SIDEWALK_Y - 18 - th - (5 - l) * s * 2, lw, s * 2.5, gs[l % 4]);
      }
    }

    // Decorative pixel people
    const pr = seed(123);
    for (let i = 0; i < 14; i++) {
      const ppx = 40 + pr() * (W - 80);
      const ppy = SIDEWALK_Y + 8 + pr() * 20;
      const pal = PALETTES[Math.floor(pr() * PALETTES.length)];
      const ps = 3;
      px(ppx - ps, ppy + 6 * ps, ps * 1.5, ps * 4, pal.pants);
      px(ppx + ps * 0.5, ppy + 6 * ps, ps * 1.5, ps * 4, pal.pants);
      px(ppx - ps * 1.5, ppy + 2 * ps, ps * 5, ps * 4.5, pal.shirt);
      px(ppx - ps, ppy - 4 * ps, ps * 4, ps * 5, pal.skin);
      px(ppx - ps, ppy - 5 * ps, ps * 4, ps * 2.5, pal.hair);
    }
  }

  // --- Browser-side file reading (drag & drop + file input) ---

  function extractTitle(content, filename) {
    const fm = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fm) {
      for (const line of fm[1].split("\n")) {
        if (line.startsWith("title:")) return line.split(":").slice(1).join(":").trim().replace(/^["']|["']$/g, "");
      }
    }
    const h1 = content.match(/^#\s+(.+)/m);
    if (h1) return h1[1].trim();
    return filename;
  }

  async function processFiles(fileList) {
    const folderStatus = document.getElementById("folder-status");
    const notes = [];
    for (const file of fileList) {
      if (!file.name.endsWith(".md")) continue;
      try {
        const content = await file.text();
        if (!content.trim()) continue;
        const title = extractTitle(content, file.name.replace(/\.md$/, ""));
        notes.push({
          id: notes.length,
          title,
          path: file.name,
          content,
          preview: content.slice(0, 500),
        });
      } catch (e) { continue; }
    }
    if (notes.length === 0) {
      folderStatus.textContent = "No .md files found.";
      folderStatus.className = "setup-status error";
      return;
    }
    // Append to existing notes (user can drop multiple batches)
    const existing = new Set(flaneurState.notes.map(n => n.title));
    for (const n of notes) {
      if (!existing.has(n.title)) {
        n.id = flaneurState.notes.length;
        flaneurState.notes.push(n);
      }
    }
    folderStatus.textContent = `${flaneurState.notes.length} notes ready.`;
    folderStatus.className = "setup-status";
    btnStart.disabled = false;
  }

  // Drag and drop
  const dropZone = document.getElementById("drop-zone");
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });
  dropZone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const items = e.dataTransfer.items;
    const files = [];
    // Handle both files and directories
    const entries = [];
    for (const item of items) {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) entries.push(entry);
      else if (item.kind === "file") files.push(item.getAsFile());
    }
    if (entries.length > 0) {
      await readEntries(entries, files);
    }
    await processFiles(files);
  });

  async function readEntries(entries, files) {
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise(r => entry.file(r));
        files.push(file);
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const subEntries = await new Promise(r => reader.readEntries(r));
        await readEntries(subEntries, files);
      }
    }
  }

  // File input fallback
  document.getElementById("file-input").addEventListener("change", async (e) => {
    await processFiles(e.target.files);
  });

  btnStart.addEventListener("click", () => {
    userApiKey = (document.getElementById("apikey-input") || {}).value || "";
    if (!userApiKey) { showStatus("API key required.", true); return; }
    if (flaneurState.notes.length === 0) { showStatus("Choose a folder first.", true); return; }
    showStatus(`${flaneurState.notes.length} notes. Letting them out...`);
    btnStart.disabled = true;
    setTimeout(() => {
      introOverlay.classList.add("hidden");
      document.getElementById("controls").classList.remove("hidden");
      launchStreet();
    }, 600);
  });

  function showStatus(msg, err) {
    setupStatus.textContent = msg;
    setupStatus.className = "setup-status" + (err ? " error" : "");
  }

  function showSetup() {
    if (cleanup) cleanup();
    introOverlay.classList.remove("hidden");
    document.getElementById("controls").classList.add("hidden");
    btnStart.disabled = false;
    setupStatus.textContent = "";
    drawSetupBackground();
  }


  // --- Palettes ---
  const PALETTES = [
    { shirt: "#6e8efb", pants: "#2c3e50", hair: "#3a2a1a", skin: "#f7c59f" },
    { shirt: "#e85d75", pants: "#34495e", hair: "#1a1a2e", skin: "#e8b88a" },
    { shirt: "#50c878", pants: "#2c3e50", hair: "#8b4513", skin: "#f7c59f" },
    { shirt: "#f7b267", pants: "#3d3d5c", hair: "#2d1b00", skin: "#d4a574" },
    { shirt: "#9b59b6", pants: "#2c3e50", hair: "#4a3728", skin: "#f0d5b8" },
    { shirt: "#1abc9c", pants: "#34495e", hair: "#0d0d0d", skin: "#e8b88a" },
    { shirt: "#e74c3c", pants: "#2c3e50", hair: "#654321", skin: "#f7c59f" },
    { shirt: "#3498db", pants: "#3d3d5c", hair: "#1a1a1a", skin: "#d4a574" },
    { shirt: "#f39c12", pants: "#2c3e50", hair: "#5c3317", skin: "#f0d5b8" },
    { shirt: "#2ecc71", pants: "#34495e", hair: "#3d2b1f", skin: "#e8b88a" },
    { shirt: "#e67e22", pants: "#2c3e50", hair: "#0d0d0d", skin: "#f7c59f" },
    { shirt: "#8e44ad", pants: "#3d3d5c", hair: "#4a2c0a", skin: "#d4a574" },
    { shirt: "#ff6b6b", pants: "#2c3e50", hair: "#2d1b00", skin: "#f0d5b8" },
    { shirt: "#4ecdc4", pants: "#34495e", hair: "#3a2a1a", skin: "#f7c59f" },
    { shirt: "#a8e6cf", pants: "#2c3e50", hair: "#1a1a2e", skin: "#e8b88a" },
  ];

  let cleanup = null;

  // Now draw the setup background (PALETTES is defined above)
  drawSetupBackground();
  let resumeWalk = null;

  // --- Global state across scenes ---
  let flaneurState = {
    currentScene: "street",
    notes: [],
    partyGuests: [],   // {noteIdx, title, palette, streetSpark: {title, text}}
    coffeeGuests: [],  // same + partySpark
  };

  function updatePartyButton() {
    const btn = document.getElementById("btn-party");
    const n = flaneurState.partyGuests.length;
    btn.textContent = n < 4 ? `Party (${n}/4 min)` : `Start Party (${n})`;
    btn.disabled = n < 4;
  }

  function updateCoffeeButton() {
    const btn = document.getElementById("btn-coffee");
    const n = flaneurState.coffeeGuests.length;
    btn.textContent = n < 2 ? `Coffee (${n}/2 min)` : `Start Coffee`;
    btn.disabled = n < 2;
  }

  async function launchStreet() {
    flaneurState.currentScene = "street";

    // Show/hide scene buttons
    document.getElementById("btn-party").classList.remove("hidden");
    document.getElementById("btn-coffee").classList.add("hidden");
    document.getElementById("btn-back-street").classList.add("hidden");
    document.getElementById("speed-control").classList.remove("hidden");
    updatePartyButton();

    const notes = flaneurState.notes;
    if (notes.length === 0) return;

    const canvas = document.getElementById("street-canvas");
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Street geometry
    const SIDEWALK_Y = H * 0.72; // where feet land
    const BUILDING_TOP = H * 0.25;
    const PX = 3; // pixel scale for people

    // Crowd — pick a random subset to be on screen
    let crowdSize = parseInt(document.getElementById("speed").value, 10);
    let people = [];
    let paused = false;
    let animFrame;
    let bumpPair = null; // { a, b, phase, timer, sparkText }
    let sparkPending = false;

    function spawnPeople() {
      const available = shuffle([...Array(notes.length).keys()]);
      people = [];
      for (let i = 0; i < Math.min(crowdSize, available.length); i++) {
        people.push(makePerson(available[i], i));
      }
    }

    function makePerson(noteIdx, slot) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      return {
        noteIdx,
        title: notes[noteIdx].title,
        x: dir > 0 ? -30 - Math.random() * 200 : W + 30 + Math.random() * 200,
        y: SIDEWALK_Y + (Math.random() - 0.5) * 30,
        speed: 0.3 + Math.random() * 0.5,
        dir,
        palette: PALETTES[noteIdx % PALETTES.length],
        frame: Math.floor(Math.random() * 100),
        stopped: false,
      };
    }

    function respawn(p) {
      const available = shuffle([...Array(notes.length).keys()]);
      // Pick a note not already on screen
      const onScreen = new Set(people.map((pp) => pp.noteIdx));
      let noteIdx = available.find((n) => !onScreen.has(n));
      if (noteIdx === undefined) noteIdx = available[0];

      p.noteIdx = noteIdx;
      p.title = notes[noteIdx].title;
      p.dir = Math.random() > 0.5 ? 1 : -1;
      p.x = p.dir > 0 ? -30 - Math.random() * 100 : W + 30 + Math.random() * 100;
      p.y = SIDEWALK_Y + (Math.random() - 0.5) * 30;
      p.speed = 0.3 + Math.random() * 0.5;
      p.palette = PALETTES[noteIdx % PALETTES.length];
      p.frame = 0;
      p.stopped = false;
    }

    spawnPeople();

    document.getElementById("speed").addEventListener("input", (e) => {
      crowdSize = parseInt(e.target.value, 10);
      while (people.length < crowdSize && people.length < notes.length) {
        const available = shuffle([...Array(notes.length).keys()]);
        const onScreen = new Set(people.map((p) => p.noteIdx));
        let noteIdx = available.find((n) => !onScreen.has(n));
        if (noteIdx === undefined) break;
        people.push(makePerson(noteIdx, people.length));
      }
      while (people.length > crowdSize) {
        const p = people.find((pp) => !pp.stopped);
        if (p) people.splice(people.indexOf(p), 1);
        else break;
      }
    });

    // --- Drawing (pixel art style) ---

    const P = 4; // global pixel size for scenery

    function makeSeeded(s) {
      return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    }

    function pxRect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
    }

    function drawSky() {
      // Pixel-banded sky
      const bands = ["#5B9BD5", "#6BA8DD", "#7CB5E5", "#8EC2ED", "#A0CFF5", "#B2DCFC"];
      const bandH = Math.ceil(SIDEWALK_Y / bands.length);
      for (let i = 0; i < bands.length; i++) {
        pxRect(0, i * bandH, W, bandH, bands[i]);
      }
    }

    function drawSun() {
      const sx = Math.floor(W * 0.82);
      const sy = Math.floor(H * 0.1);
      const s = P * 2;
      // Rays (pixel crosses)
      pxRect(sx - s * 5, sy - s * 0.5, s * 10, s, "#FFE87C");
      pxRect(sx - s * 0.5, sy - s * 5, s, s * 10, "#FFE87C");
      // Diagonal rays
      for (let i = -3; i <= 3; i++) {
        pxRect(sx + i * s * 1.2 - s * 0.5, sy + i * s * 1.2 - s * 0.5, s, s, "#FFE87C");
        pxRect(sx - i * s * 1.2 - s * 0.5, sy + i * s * 1.2 - s * 0.5, s, s, "#FFE87C");
      }
      // Sun body (pixel square)
      pxRect(sx - s * 2, sy - s * 2, s * 4, s * 4, "#FFD700");
      pxRect(sx - s * 3, sy - s * 1, s * 6, s * 2, "#FFD700");
      pxRect(sx - s * 1, sy - s * 3, s * 2, s * 6, "#FFD700");
    }

    function drawClouds() {
      const rand = makeSeeded(99);
      const stripeBottom = P * 2 + P * 11;
      for (let i = 0; i < 5; i++) {
        const cx = Math.floor(rand() * W);
        const cy = Math.floor(20 + rand() * H * 0.12);
        // Skip clouds that overlap the title stripe
        if (cy < stripeBottom + P * 4) { rand(); continue; }
        // Pixel cloud: stack of rectangles
        pxRect(cx, cy, P * 10, P * 2, "#fff");
        pxRect(cx + P * 2, cy - P * 2, P * 6, P * 2, "#fff");
        pxRect(cx - P * 2, cy + P * 2, P * 14, P * 2, "#fff");
        pxRect(cx + P * 4, cy - P * 3, P * 3, P, "#f0f0f0");
        // Shadow
        pxRect(cx - P, cy + P * 4, P * 12, P, "#d8e8f8");
      }
    }

    function drawSkyline() {
      const s = P;
      const baseY = SIDEWALK_Y - 18;

      // --- Skyscraper 1 (left side) ---
      const sk1x = Math.floor(W * 0.18);
      const sk1w = s * 12;
      const sk1h = s * 55;
      const sk1y = baseY - sk1h;

      pxRect(sk1x, sk1y, sk1w, sk1h, "#8A9AAA");
      pxRect(sk1x + sk1w - s * 2, sk1y, s * 2, sk1h, "#7A8A9A");
      // Tapered top
      pxRect(sk1x + s * 2, sk1y - s * 6, sk1w - s * 4, s * 6, "#8A9AAA");
      pxRect(sk1x + s * 4, sk1y - s * 10, sk1w - s * 8, s * 4, "#8A9AAA");
      // Spire
      pxRect(sk1x + sk1w / 2 - s * 0.5, sk1y - s * 18, s, s * 8, "#7A8A9A");
      pxRect(sk1x + sk1w / 2 - s, sk1y - s * 10, s * 2, s, "#7A8A9A");
      // Windows
      for (let wy = sk1y + s * 3; wy < baseY - s * 2; wy += s * 3) {
        for (let wx = sk1x + s * 1.5; wx < sk1x + sk1w - s * 1.5; wx += s * 2.5) {
          pxRect(wx, wy, s * 1.2, s * 1.8, "#A0B8D0");
        }
      }

      // --- Tower (centre-right) ---
      const twx = Math.floor(W * 0.55);
      const tww = s * 8;
      const twh = s * 48;
      const twy = baseY - twh;

      pxRect(twx, twy, tww, twh, "#9A8A7A");
      pxRect(twx + tww - s * 2, twy, s * 2, twh, "#8A7A6A");
      // Clock/observation section
      pxRect(twx - s * 2, twy + s * 2, tww + s * 4, s * 8, "#A89A8A");
      pxRect(twx - s, twy + s * 3, tww + s * 2, s * 6, "#B0A090");
      // Clock face
      pxRect(twx + tww / 2 - s * 2, twy + s * 4, s * 4, s * 4, "#F5F0E0");
      pxRect(twx + tww / 2 - s * 0.5, twy + s * 5, s, s * 2, "#333");
      pxRect(twx + tww / 2, twy + s * 6, s * 1.5, s * 0.5, "#333");
      // Pointed top
      pxRect(twx + s, twy - s * 4, tww - s * 2, s * 4, "#9A8A7A");
      pxRect(twx + s * 2, twy - s * 8, tww - s * 4, s * 4, "#9A8A7A");
      pxRect(twx + s * 3, twy - s * 10, tww - s * 6, s * 2, "#9A8A7A");
      // Spire
      pxRect(twx + tww / 2 - s * 0.5, twy - s * 16, s, s * 6, "#8A7A6A");
      // Flag
      pxRect(twx + tww / 2 + s * 0.5, twy - s * 16, s * 3, s * 2, "#C0392B");
      // Windows
      for (let wy = twy + s * 12; wy < baseY - s * 2; wy += s * 3.5) {
        for (let wx = twx + s * 1.5; wx < twx + tww - s; wx += s * 2) {
          pxRect(wx, wy, s, s * 2, "#B0C0D0");
        }
      }

      // --- Skyscraper 2 (right side, glass style) ---
      const sk2x = Math.floor(W * 0.78);
      const sk2w = s * 14;
      const sk2h = s * 50;
      const sk2y = baseY - sk2h;

      pxRect(sk2x, sk2y, sk2w, sk2h, "#7090B0");
      pxRect(sk2x + sk2w - s * 2, sk2y, s * 2, sk2h, "#6080A0");
      // Stepped top
      pxRect(sk2x + s * 2, sk2y - s * 6, sk2w - s * 4, s * 6, "#7090B0");
      pxRect(sk2x + s * 4, sk2y - s * 10, sk2w - s * 8, s * 4, "#7090B0");
      pxRect(sk2x + s * 5, sk2y - s * 14, sk2w - s * 10, s * 4, "#7090B0");
      // Antenna
      pxRect(sk2x + sk2w / 2 - s * 0.5, sk2y - s * 20, s, s * 6, "#506070");
      pxRect(sk2x + sk2w / 2 - s * 1.5, sk2y - s * 14, s * 3, s, "#506070");
      // Glass windows (dense grid)
      for (let wy = sk2y + s * 2; wy < baseY - s * 2; wy += s * 2.5) {
        for (let wx = sk2x + s; wx < sk2x + sk2w - s; wx += s * 2) {
          pxRect(wx, wy, s * 1.5, s * 1.8, "#80A8D0");
        }
      }
      // Horizontal bands
      for (let wy = sk2y; wy < baseY; wy += s * 8) {
        pxRect(sk2x, wy, sk2w, s * 0.5, "#6080A0");
      }
    }

    function drawBackBuildings() {
      const rand = makeSeeded(17);
      const s = P;
      const baseY = SIDEWALK_Y - 18;

      const colors = [
        { wall: "#B8C8D8", window: "#9AB0C8" },
        { wall: "#C0C8D0", window: "#A0B0C0" },
        { wall: "#A8B8C8", window: "#90A0B8" },
        { wall: "#B0C0D0", window: "#98A8C0" },
        { wall: "#C8D0D8", window: "#A8B8C8" },
      ];

      let bx = -30;
      while (bx < W + 60) {
        const c = colors[Math.floor(rand() * colors.length)];
        const bw = s * 8 + Math.floor(rand() * 8) * s;
        const bh = s * 22 + Math.floor(rand() * 18) * s;
        const by = baseY - bh;

        // Wall
        pxRect(bx, by, bw, bh, c.wall);
        // Shading
        pxRect(bx + bw - s * 2, by, s * 2, bh, shadeColor(c.wall, -10));

        // Flat roof
        pxRect(bx - s, by - s, bw + s * 2, s * 2, shadeColor(c.wall, -20));

        // Windows (smaller, more uniform)
        const winS = s * 1.5;
        for (let wy = by + s * 3; wy < baseY - s * 4; wy += s * 4) {
          for (let wx = bx + s * 2; wx < bx + bw - s * 2; wx += s * 3.5) {
            pxRect(wx, wy, winS, winS, c.window);
          }
        }

        // Occasional antenna/spire
        if (rand() > 0.7) {
          pxRect(bx + bw / 2 - s * 0.5, by - s * 6, s, s * 6, shadeColor(c.wall, -30));
          pxRect(bx + bw / 2 - s, by - s * 6, s * 2, s, shadeColor(c.wall, -25));
        }

        bx += bw + s + Math.floor(rand() * 3) * s;
      }
    }

    function drawBuildings() {
      const rand = makeSeeded(31);
      const s = P;

      // Houses and buildings across the background
      const colors = [
        { wall: "#E8D5C0", roof: "#C0392B", door: "#8B4513", window: "#87CEEB" },
        { wall: "#D4E6F1", roof: "#5B7FA5", door: "#5D4037", window: "#AED6F1" },
        { wall: "#F5E6CC", roof: "#E67E22", door: "#6D4C41", window: "#85C1E9" },
        { wall: "#E8E0D8", roof: "#7F8C8D", door: "#4E342E", window: "#A3D5F0" },
        { wall: "#FDE8D0", roof: "#C0392B", door: "#795548", window: "#90CAF9" },
        { wall: "#D5F5E3", roof: "#27AE60", door: "#5D4037", window: "#82E0AA" },
      ];

      let bx = -10;
      while (bx < W + 60) {
        const c = colors[Math.floor(rand() * colors.length)];
        const isSmall = rand() > 0.4; // houses vs buildings
        const bw = isSmall ? (s * 10 + Math.floor(rand() * 6) * s) : (s * 8 + Math.floor(rand() * 5) * s);
        const bh = isSmall ? (s * 8 + Math.floor(rand() * 6) * s) : (s * 14 + Math.floor(rand() * 10) * s);
        const baseY = SIDEWALK_Y - 18;
        const by = baseY - bh;

        // Wall
        pxRect(bx, by, bw, bh, c.wall);
        // Wall shading
        pxRect(bx + bw - s * 2, by, s * 2, bh, shadeColor(c.wall, -15));

        if (isSmall) {
          // Pitched roof (pixel triangle)
          const roofH = Math.floor(bh * 0.4);
          for (let r = 0; r < roofH; r += s) {
            const rw = bw - (r / roofH) * bw * 0.8;
            pxRect(bx + (bw - rw) / 2, by - r - s, rw, s, c.roof);
          }
          // Chimney
          if (rand() > 0.5) {
            pxRect(bx + bw * 0.7, by - roofH - s * 3, s * 2, s * 4, "#8B7355");
            pxRect(bx + bw * 0.7 - s * 0.5, by - roofH - s * 3, s * 3, s, "#7A6448");
          }
        } else {
          // Flat roof with edge
          pxRect(bx - s, by - s, bw + s * 2, s * 2, c.roof);
        }

        // Door
        const dw = s * 2;
        const dh = s * 4;
        pxRect(bx + bw / 2 - dw / 2, baseY - dh, dw, dh, c.door);
        // Doorknob
        pxRect(bx + bw / 2 + s * 0.5, baseY - dh / 2, s * 0.5, s * 0.5, "#FFD700");

        // Windows
        const winS = s * 2;
        const winGapX = s * 4;
        const winRows = isSmall ? 1 : Math.floor((bh - s * 6) / (s * 5));
        for (let row = 0; row < winRows; row++) {
          const wy = by + s * 3 + row * s * 5;
          for (let wx = bx + s * 2; wx < bx + bw - s * 3; wx += winGapX) {
            // Window frame
            pxRect(wx - s * 0.5, wy - s * 0.5, winS + s, winS + s, "#5D4037");
            // Glass
            pxRect(wx, wy, winS, winS, c.window);
            // Cross frame
            pxRect(wx + winS / 2 - s * 0.25, wy, s * 0.5, winS, "#5D4037");
            pxRect(wx, wy + winS / 2 - s * 0.25, winS, s * 0.5, "#5D4037");
          }
        }

        bx += bw + s * 2 + Math.floor(rand() * 4) * s;
      }
    }

    function shadeColor(hex, amt) {
      let r = parseInt(hex.slice(1, 3), 16) + amt;
      let g = parseInt(hex.slice(3, 5), 16) + amt;
      let b = parseInt(hex.slice(5, 7), 16) + amt;
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));
      return `rgb(${r},${g},${b})`;
    }

    function drawTitle() {
      // Hide title bar when intro overlay is visible
      if (!introOverlay.classList.contains("hidden")) return;

      const s = P;
      const stripeY = s * 2;
      const stripeH = s * 10;

      // Sky stripe behind title
      pxRect(0, stripeY, W, stripeH, "rgba(30,50,100,0.25)");
      pxRect(0, stripeY + stripeH, W, s, "rgba(30,50,100,0.1)");

      // LET THEM OUT title
      ctx.font = "bold 32px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const tx = s * 6;
      const ty = stripeY + stripeH / 2;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillText("LET THEM OUT", tx + 2, ty + 2);
      // Text
      ctx.fillStyle = "#fff";
      ctx.fillText("LET THEM OUT", tx, ty);

      // Tagline
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      const tagX = tx + ctx.measureText("LET THEM OUT").width + 20;
      ctx.font = "bold 32px 'Courier New', monospace";
      const titleW = ctx.measureText("LET THEM OUT").width;
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillText("let your notes mingle", tx + titleW + 20, ty);

      // Change folder button (top right, pixel style)
      const btnText = "CHANGE FOLDER";
      ctx.font = "bold 10px 'Courier New', monospace";
      const btnW = ctx.measureText(btnText).width + s * 4;
      const btnH = s * 5;
      const btnX = W - btnW - s * 4;
      const btnY = stripeY + (stripeH - btnH) / 2;

      // Button background
      pxRect(btnX, btnY, btnW, btnH, "rgba(255,255,255,0.2)");
      pxRect(btnX, btnY + btnH - s, btnW, s, "rgba(0,0,0,0.1)");
      // Border
      pxRect(btnX, btnY, btnW, s * 0.5, "rgba(255,255,255,0.3)");
      pxRect(btnX, btnY + btnH - s * 0.5, btnW, s * 0.5, "rgba(0,0,0,0.15)");
      pxRect(btnX, btnY, s * 0.5, btnH, "rgba(255,255,255,0.3)");
      pxRect(btnX + btnW - s * 0.5, btnY, s * 0.5, btnH, "rgba(0,0,0,0.15)");
      // Text
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(btnText, btnX + btnW / 2, btnY + btnH / 2);

      // Store button bounds for click detection
      drawTitle._btnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };
    }

    function drawTree(tx, treeH, canopyW) {
      const baseY = SIDEWALK_Y - 18;
      const s = P;

      // Trunk
      pxRect(tx - s, baseY - treeH, s * 2, treeH, "#8B6914");
      pxRect(tx - s * 0.5, baseY - treeH, s, treeH, "#9B7924");

      // Canopy — stacked pixel blocks (triangle-ish)
      const cTop = baseY - treeH;
      const layers = 5;
      const greens = ["#2E8B57", "#3CB371", "#228B22", "#27AE60"];
      for (let l = 0; l < layers; l++) {
        const lw = (canopyW * (l + 2)) / (layers + 1);
        const ly = cTop - (layers - l) * s * 2;
        const ci = l % greens.length;
        pxRect(tx - lw / 2, ly, lw, s * 2.5, greens[ci]);
        // Pixel variation
        if (l > 0 && l < layers - 1) {
          pxRect(tx - lw / 2 - s, ly + s, s, s, greens[(ci + 1) % greens.length]);
          pxRect(tx + lw / 2, ly + s, s, s, greens[(ci + 2) % greens.length]);
        }
      }
    }

    function drawTrees() {
      const rand = makeSeeded(42);
      for (let i = 0; i < 10; i++) {
        const tx = Math.floor(rand() * W);
        const treeH = 30 + Math.floor(rand() * 25);
        const canopyW = 28 + Math.floor(rand() * 20);
        drawTree(tx, treeH, canopyW);
      }
    }

    function drawGround() {
      const s = P;

      // Upper grass strip (behind buildings)
      pxRect(0, SIDEWALK_Y - 18, W, 24, "#6ABF40");
      const rand = makeSeeded(77);
      for (let i = 0; i < 80; i++) {
        const gx = Math.floor(rand() * W / s) * s;
        const gy = SIDEWALK_Y - 18 + Math.floor(rand() * 6) * s;
        pxRect(gx, gy, s, s, rand() > 0.5 ? "#5BAF30" : "#7CCF50");
      }

      // Footpath (where people walk)
      pxRect(0, SIDEWALK_Y + 4, W, s * 8, "#D4C4A0");
      pxRect(0, SIDEWALK_Y + 4, W, s, "#C0B080");
      const rand2 = makeSeeded(55);
      for (let i = 0; i < 50; i++) {
        const px = Math.floor(rand2() * W / s) * s;
        const py = SIDEWALK_Y + 5 + Math.floor(rand2() * 7) * s;
        pxRect(px, py, s, s, "#C8B890");
      }

      // Lower grass (park area)
      const parkY = SIDEWALK_Y + 4 + s * 8;
      pxRect(0, parkY, W, H - parkY, "#5DAF35");
      // Grass variation
      const rand4 = makeSeeded(44);
      for (let i = 0; i < 120; i++) {
        const gx = Math.floor(rand4() * W / s) * s;
        const gy = parkY + Math.floor(rand4() * ((H - parkY) / s)) * s;
        pxRect(gx, gy, s, s, rand4() > 0.5 ? "#4E9F28" : "#6CC048");
      }

      // Flowers in upper grass
      const rand3 = makeSeeded(33);
      const flowerColors = ["#FF6B6B", "#FFD93D", "#FF8ED4", "#fff"];
      for (let i = 0; i < 15; i++) {
        const fx = Math.floor(rand3() * W / s) * s;
        const fy = SIDEWALK_Y - 14 + Math.floor(rand3() * 4) * s;
        pxRect(fx, fy, s, s, flowerColors[Math.floor(rand3() * flowerColors.length)]);
        pxRect(fx, fy + s, s, s * 1.5, "#4A8030");
      }

      // Flowers in park
      const rand5 = makeSeeded(22);
      for (let i = 0; i < 20; i++) {
        const fx = Math.floor(rand5() * W / s) * s;
        const fy = parkY + s * 4 + Math.floor(rand5() * ((H - parkY - s * 10) / s)) * s;
        pxRect(fx, fy, s, s, flowerColors[Math.floor(rand5() * flowerColors.length)]);
        pxRect(fx, fy + s, s, s, "#3A8020");
      }

      // --- Lake ---
      const lakeX = Math.floor(W * 0.55);
      const lakeY = parkY + s * 5;
      const lakeW = s * 28;
      const lakeH = s * 10;

      // Lake body
      pxRect(lakeX + s * 2, lakeY, lakeW - s * 4, lakeH, "#4A90D0");
      pxRect(lakeX, lakeY + s * 2, lakeW, lakeH - s * 4, "#4A90D0");
      pxRect(lakeX + s, lakeY + s, lakeW - s * 2, lakeH - s * 2, "#4A90D0");
      // Lighter centre
      pxRect(lakeX + s * 4, lakeY + s * 2, lakeW - s * 8, lakeH - s * 4, "#5AA0E0");
      // Sparkle reflections
      pxRect(lakeX + s * 6, lakeY + s * 3, s * 2, s, "#8AC0F0");
      pxRect(lakeX + s * 12, lakeY + s * 4, s * 3, s, "#8AC0F0");
      pxRect(lakeX + s * 18, lakeY + s * 3, s * 2, s, "#8AC0F0");
      pxRect(lakeX + s * 9, lakeY + s * 6, s * 2, s, "#8AC0F0");
      // Shore pixels
      const rand6 = makeSeeded(66);
      for (let i = 0; i < 12; i++) {
        const sx = lakeX + Math.floor(rand6() * (lakeW / s)) * s;
        const sy = lakeY + (rand6() > 0.5 ? -s : lakeH);
        pxRect(sx, sy, s, s, "#C8B070");
      }

      // --- Bushes ---
      drawBush(W * 0.08, parkY + s * 3);
      drawBush(W * 0.25, parkY + s * 6);
      drawBush(W * 0.42, parkY + s * 2);
      drawBush(W * 0.72, parkY + s * 8);
      drawBush(W * 0.88, parkY + s * 4);
      drawBush(lakeX - s * 6, lakeY + s * 2);
      drawBush(lakeX + lakeW + s * 2, lakeY + s * 3);

      // --- Park bench ---
      const benchX = Math.floor(W * 0.3);
      const benchY = parkY + s * 3;
      // Seat
      pxRect(benchX, benchY, s * 8, s * 1.5, "#8B6914");
      // Back
      pxRect(benchX, benchY - s * 3, s * 8, s * 1.5, "#8B6914");
      pxRect(benchX + s, benchY - s * 3, s, s * 3, "#7A5A10");
      pxRect(benchX + s * 6, benchY - s * 3, s, s * 3, "#7A5A10");
      // Legs
      pxRect(benchX + s, benchY + s * 1.5, s, s * 2, "#555");
      pxRect(benchX + s * 6, benchY + s * 1.5, s, s * 2, "#555");
    }

    function drawBush(bx, by) {
      const s = P;
      const greens = ["#2D8040", "#3A9B50", "#268035", "#45A858"];
      // Main mass
      pxRect(bx, by, s * 5, s * 3, greens[0]);
      pxRect(bx - s, by + s, s * 7, s * 2, greens[1]);
      pxRect(bx + s, by - s, s * 3, s, greens[2]);
      // Detail pixels
      pxRect(bx - s, by, s, s, greens[3]);
      pxRect(bx + s * 5, by, s, s, greens[2]);
      pxRect(bx + s * 2, by - s, s, s, greens[3]);
      // Berry/flower
      pxRect(bx + s * 3, by + s, s, s, "#FF6B6B");
    }

    function drawStreetFurniture() {
      const s = P;
      const rand = makeSeeded(63);
      const footpathY = SIDEWALK_Y + 4;

      // Lamp posts
      for (let i = 0; i < 6; i++) {
        const lx = Math.floor(80 + rand() * (W - 160));
        // Skip if too close to another
        const postY = footpathY;

        // Pole
        pxRect(lx, postY - s * 14, s * 1.5, s * 14, "#444");
        // Lamp arm
        pxRect(lx - s * 2, postY - s * 14, s * 5.5, s * 1.5, "#444");
        // Lamp housing
        pxRect(lx - s * 2.5, postY - s * 15.5, s * 6.5, s * 2, "#666");
        // Light glow
        pxRect(lx - s * 2, postY - s * 13, s * 5, s, "rgba(255,240,150,0.3)");
        // Base
        pxRect(lx - s, postY - s, s * 3.5, s, "#333");
      }

      // Mailboxes
      const rand5 = makeSeeded(71);
      for (let i = 0; i < 3; i++) {
        const mx = Math.floor(100 + rand5() * (W - 200));
        const my = footpathY;

        // Post
        pxRect(mx, my - s * 5, s * 1.5, s * 5, "#666");
        // Box
        pxRect(mx - s * 1.5, my - s * 8, s * 5, s * 4, "#C0392B");
        // Top (rounded-ish)
        pxRect(mx - s, my - s * 9, s * 4, s, "#C0392B");
        // Slot
        pxRect(mx - s * 0.5, my - s * 6.5, s * 3, s * 0.5, "#1a1a1a");
        // Label
        pxRect(mx, my - s * 7.5, s * 2, s, "#FFD700");
      }
    }

    // Pets — little pixel animals that wander
    let pets = [];
    function spawnPets() {
      const rand = makeSeeded(91);
      const petTypes = ["dog", "cat", "dog", "cat", "dog"];
      pets = [];
      for (let i = 0; i < 4; i++) {
        pets.push({
          type: petTypes[i % petTypes.length],
          x: Math.floor(rand() * W),
          y: SIDEWALK_Y + 8 + Math.floor(rand() * 20),
          dir: rand() > 0.5 ? 1 : -1,
          speed: 0.15 + rand() * 0.25,
          frame: Math.floor(rand() * 100),
          color: ["#8B4513", "#D4A574", "#333", "#F5DEB3"][i % 4],
        });
      }
    }
    spawnPets();

    function updatePets() {
      for (const pet of pets) {
        pet.frame++;
        pet.x += pet.speed * pet.dir;
        if (pet.x > W + 30) { pet.x = -20; pet.dir = 1; }
        if (pet.x < -30) { pet.x = W + 20; pet.dir = -1; }
        // Occasionally change direction
        if (pet.frame % 300 === 0 && Math.random() > 0.6) {
          pet.dir *= -1;
        }
      }
    }

    function drawPets() {
      const s = PX * 0.7;
      for (const pet of pets) {
        const { x, y, dir, frame, color, type } = pet;
        const walk = Math.sin(frame * 0.2);

        if (type === "dog") {
          // Body
          pxRect(x - s * 3, y, s * 6, s * 3, color);
          // Head
          pxRect(dir > 0 ? x + s * 2 : x - s * 4, y - s * 1.5, s * 3, s * 3, color);
          // Ear
          pxRect(dir > 0 ? x + s * 3.5 : x - s * 3.5, y - s * 2.5, s * 1.5, s * 1.5, shadeColor(color, -30));
          // Eye
          pxRect(dir > 0 ? x + s * 3.5 : x - s * 2.5, y - s * 0.5, s * 0.8, s * 0.8, "#1a1a1a");
          // Nose
          pxRect(dir > 0 ? x + s * 4.5 : x - s * 3.5, y + s * 0.5, s * 0.8, s * 0.8, "#1a1a1a");
          // Legs
          const legW = walk * s * 0.8;
          pxRect(x - s * 2 + legW, y + s * 3, s, s * 2, shadeColor(color, -20));
          pxRect(x + s * 1.5 - legW, y + s * 3, s, s * 2, shadeColor(color, -20));
          // Tail
          const tailWag = Math.sin(frame * 0.3) * s;
          pxRect(dir > 0 ? x - s * 3.5 : x + s * 4, y - s + tailWag, s * 1, s * 2, color);
        } else {
          // Cat body
          pxRect(x - s * 2, y + s * 0.5, s * 4, s * 2.5, color);
          // Head
          pxRect(dir > 0 ? x + s * 1 : x - s * 3, y - s * 1, s * 2.5, s * 2.5, color);
          // Ears (triangles as pixels)
          pxRect(dir > 0 ? x + s * 1 : x - s * 2, y - s * 2, s, s, color);
          pxRect(dir > 0 ? x + s * 2.5 : x - s * 3, y - s * 2, s, s, color);
          // Ear insides
          pxRect(dir > 0 ? x + s * 1 : x - s * 2, y - s * 1.5, s * 0.5, s * 0.5, "#FFB6C1");
          pxRect(dir > 0 ? x + s * 2.5 : x - s * 3, y - s * 1.5, s * 0.5, s * 0.5, "#FFB6C1");
          // Eye
          pxRect(dir > 0 ? x + s * 2 : x - s * 2, y - s * 0.2, s * 0.6, s * 0.6, "#2ECC71");
          // Legs
          const legW = walk * s * 0.6;
          pxRect(x - s * 1.5 + legW, y + s * 3, s * 0.8, s * 1.5, shadeColor(color, -20));
          pxRect(x + s * 1 - legW, y + s * 3, s * 0.8, s * 1.5, shadeColor(color, -20));
          // Tail
          const tailCurl = Math.sin(frame * 0.15) * s * 1.5;
          pxRect(dir > 0 ? x - s * 2.5 : x + s * 3, y + tailCurl, s, s * 1.5, color);
        }
      }
    }

    function drawPerson(p) {
      const { x, y, palette, dir, frame, stopped } = p;
      const s = PX;
      const walk = stopped ? 0 : Math.sin(frame * 0.15);

      // Shadow
      pxRect(x - 2 * s, y + 10 * s, 6 * s, s, "rgba(0,0,0,0.12)");

      // Legs
      const legL = stopped ? 0 : walk * s * 1.2;
      const legR = stopped ? 0 : -walk * s * 1.2;
      pxRect(x - 1 * s, y + 6 * s, s * 1.5, s * 4, palette.pants);
      pxRect(x + 1.5 * s, y + 6 * s, s * 1.5, s * 4, palette.pants);
      // Shoes
      pxRect(x - 1.5 * s + legL, y + 9.5 * s, s * 2.5, s, "#333");
      pxRect(x + 1 * s + legR, y + 9.5 * s, s * 2.5, s, "#333");

      // Body
      pxRect(x - 2 * s, y + 2 * s, s * 6, s * 4.5, palette.shirt);

      // Arms
      const armSwing = stopped ? 0 : walk * s;
      pxRect(x - 3.5 * s, y + 2 * s + armSwing, s * 1.5, s * 3.5, palette.shirt);
      pxRect(x + 4 * s, y + 2 * s - armSwing, s * 1.5, s * 3.5, palette.shirt);
      // Hands
      pxRect(x - 3.5 * s, y + 5 * s + armSwing, s * 1.5, s, palette.skin);
      pxRect(x + 4 * s, y + 5 * s - armSwing, s * 1.5, s, palette.skin);

      // Neck
      pxRect(x, y + 0.5 * s, s * 2, s * 2, palette.skin);

      // Head
      pxRect(x - 1.5 * s, y - 4 * s, s * 5, s * 5, palette.skin);

      // Hair
      pxRect(x - 1.5 * s, y - 5 * s, s * 5, s * 2.5, palette.hair);
      if (dir > 0) {
        pxRect(x - 1.5 * s, y - 4 * s, s, s * 3, palette.hair);
      } else {
        pxRect(x + 2.5 * s, y - 4 * s, s, s * 3, palette.hair);
      }

      // Eyes
      if (dir > 0) {
        pxRect(x + 1 * s, y - 2 * s, s, s, "#1a1a2e");
        pxRect(x + 2.5 * s, y - 2 * s, s, s, "#1a1a2e");
      } else {
        pxRect(x - 0.5 * s, y - 2 * s, s, s, "#1a1a2e");
        pxRect(x + 1 * s, y - 2 * s, s, s, "#1a1a2e");
      }
    }

    function drawThoughtBubble(x, y, timer) {
      const s = P;
      // Animated dots leading up
      const bob = Math.sin(timer * 0.08) * 2;
      pxRect(x + s, y + s * 4 + bob, s * 1.5, s * 1.5, "rgba(255,255,255,0.7)");
      pxRect(x - s, y + s * 2 + bob * 0.7, s * 2, s * 2, "rgba(255,255,255,0.8)");
      // Main bubble
      const bw = s * 8;
      const bh = s * 5;
      const bx = x - bw / 2;
      const by = y - bh + bob * 0.5;
      pxRect(bx + s, by, bw - s * 2, bh, "rgba(255,255,255,0.9)");
      pxRect(bx, by + s, bw, bh - s * 2, "rgba(255,255,255,0.9)");
      // Animated dots inside (thinking)
      const dotPhase = Math.floor(timer * 0.06) % 3;
      for (let i = 0; i < 3; i++) {
        const alpha = i === dotPhase ? 1 : 0.3;
        pxRect(bx + s * 2 + i * s * 2, by + bh / 2 - s * 0.5, s, s, `rgba(100,100,120,${alpha})`);
      }
    }

    function drawSpeechBubble(x, y, title, idea, inviteLabel, tailAx, tailBx, tailY) {
      const s = P;
      ctx.font = "bold 12px -apple-system, sans-serif";
      const titleW = ctx.measureText(title).width;
      ctx.font = "11px -apple-system, sans-serif";
      const ideaW = ctx.measureText(idea).width;

      const padding = 14;
      const maxW = Math.min(320, W * 0.35);
      const contentW = Math.min(Math.max(titleW, ideaW) + padding * 2, maxW);

      // Word wrap the idea
      const lines = wrapText(ctx, idea, contentW - padding * 2);
      const lineH = 15;
      const titleH = title ? 20 : 0;
      const bh = padding * 2 + titleH + lines.length * lineH;
      const bw = contentW;

      // Position — clamp to screen
      let bx = Math.max(10, Math.min(x - bw / 2, W - bw - 10));
      let by = y - bh - s * 2;
      if (by < 50) by = 50;

      // Bubble body (pixel style)
      pxRect(bx + s, by, bw - s * 2, bh, "#fff");
      pxRect(bx, by + s, bw, bh - s * 2, "#fff");
      // Corners
      pxRect(bx + s, by + s, s, s, "#fff");
      pxRect(bx + bw - s * 2, by + s, s, s, "#fff");

      // Border
      pxRect(bx + s, by, bw - s * 2, 1, "#ddd");
      pxRect(bx + s, by + bh - 1, bw - s * 2, 1, "#ddd");
      pxRect(bx, by + s, 1, bh - s * 2, "#ddd");
      pxRect(bx + bw - 1, by + s, 1, bh - s * 2, "#ddd");

      // Speech tails pointing to both people
      if (tailAx != null && tailBx != null) {
        const tA = Math.max(bx + s * 2, Math.min(tailAx, bx + bw / 2 - s * 3));
        const tB = Math.max(bx + bw / 2 + s * 3, Math.min(tailBx, bx + bw - s * 2));
        // Left tail (person A)
        pxRect(tA - s * 1.5, by + bh, s * 3, s, "#fff");
        pxRect(tA - s, by + bh + s, s * 2, s, "#fff");
        pxRect(tA - s * 0.5, by + bh + s * 2, s * 1.5, s, "#fff");
        pxRect(tA, by + bh + s * 3, s, s, "#fff");
        pxRect(tA, by + bh + s * 4, s * 0.5, s, "#fff");
        pxRect(tA + s * 0.25, by + bh + s * 5, s * 0.5, s, "#fff");
        // Right tail (person B)
        pxRect(tB - s * 1.5, by + bh, s * 3, s, "#fff");
        pxRect(tB - s, by + bh + s, s * 2, s, "#fff");
        pxRect(tB - s * 0.5, by + bh + s * 2, s * 1.5, s, "#fff");
        pxRect(tB, by + bh + s * 3, s, s, "#fff");
        pxRect(tB, by + bh + s * 4, s * 0.5, s, "#fff");
        pxRect(tB + s * 0.25, by + bh + s * 5, s * 0.5, s, "#fff");
      } else {
        const tailX = Math.max(bx + s * 4, Math.min(x, bx + bw - s * 4));
        pxRect(tailX - s * 2, by + bh, s * 4, s, "#fff");
        pxRect(tailX - s, by + bh + s, s * 2, s, "#fff");
        pxRect(tailX - s * 0.5, by + bh + s * 2, s, s, "#fff");
      }

      // Title
      if (title) {
        ctx.font = "bold 12px -apple-system, sans-serif";
        ctx.fillStyle = "#1a1a2e";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(title, bx + padding, by + padding);
      }

      // Idea lines
      ctx.font = "11px -apple-system, sans-serif";
      ctx.fillStyle = "#555";
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], bx + padding, by + padding + titleH + i * lineH);
      }

      // Invite button — positioned below the text
      if (inviteLabel) {
        ctx.font = "bold 9px 'Courier New', monospace";
        const ibText = inviteLabel;
        const ibW = ctx.measureText(ibText).width + 16;
        const ibH = 20;
        const textBottom = by + padding + titleH + lines.length * lineH + 6;
        const ibX = bx + (bw - ibW) / 2;
        const ibY = textBottom;

        pxRect(ibX, ibY, ibW, ibH, "#2563eb");
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ibText, ibX + ibW / 2, ibY + ibH / 2);

        drawSpeechBubble._inviteBounds = { x: ibX, y: ibY, w: ibW, h: ibH };
      } else {
        drawSpeechBubble._inviteBounds = null;
      }
    }

    function wrapText(ctx, text, maxWidth) {
      const words = text.split(" ");
      const lines = [];
      let current = "";
      for (const word of words) {
        const test = current ? current + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    function drawNameTag(x, y, name, color) {
      ctx.font = "bold 11px -apple-system, sans-serif";
      const w = ctx.measureText(name).width + 14;
      const h = 22;
      const tx = x - w / 2 + PX;
      const ty = y - PX * 8;

      pxRect(tx, ty, w, h, "rgba(255,255,255,0.9)");
      pxRect(tx, ty + h, w, 1, "rgba(0,0,0,0.08)"); // shadow

      ctx.fillStyle = color || "rgba(80,80,100,0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name, x + PX, ty + h / 2);
    }

    // --- Bump / meeting logic ---

    function tryBump() {
      if (bumpPair || sparkPending) return;

      // Pick two random people who are reasonably close on X
      const candidates = people.filter((p) => p.x > 50 && p.x < W - 50 && !p.stopped);
      if (candidates.length < 2) return;

      // Find closest pair walking toward each other
      let bestDist = Infinity;
      let bestA = null, bestB = null;
      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
          const a = candidates[i], b = candidates[j];
          if (a.dir === b.dir) continue; // same direction, won't meet
          const dx = Math.abs(a.x - b.x);
          const dy = Math.abs(a.y - b.y);
          if (dy > 40) continue; // different lanes
          if (dx < bestDist && dx < 250) {
            bestDist = dx;
            bestA = a;
            bestB = b;
          }
        }
      }

      if (!bestA || !bestB) {
        // Force a bump: find two visible people and steer them at each other fast
        const visible = candidates.filter(p => p.x > 30 && p.x < W - 30);
        const picked = shuffle(visible.length >= 2 ? visible : candidates).slice(0, 2);
        if (picked.length < 2) return;
        const [a, b] = picked;
        a.dir = b.x > a.x ? 1 : -1;
        b.dir = a.x > b.x ? 1 : -1;
        const midY = (a.y + b.y) / 2;
        a.y = midY;
        b.y = midY;
        a.speed = 1.2;
        b.speed = 1.2;
        bestA = a;
        bestB = b;
      }

      bumpPair = { a: bestA, b: bestB, phase: "approaching", timer: 0 };
    }

    const CONVERSATIONAL_PREFIXES = [
      "What if we ",
      "How about this: ",
      "I know! It's all about ",
      "Hear me out... ",
      "Picture this: ",
      "OK so what if ",
      "Wait. What about ",
      "You know what would work? ",
      "This is wild but... ",
      "Think about it: ",
    ];

    async function triggerSpark(a, b) {
      sparkPending = true;

      // Hide the overlay card — we use speech bubbles now
      const overlay = document.getElementById("spark-overlay");
      overlay.className = "spark-hidden";

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const noteA = flaneurState.notes[a.noteIdx];
        const noteB = flaneurState.notes[b.noteIdx];
        const res = await fetch("/api/spark", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": userApiKey },
          body: JSON.stringify({
            a_title: noteA.title, a_content: (noteA.content || noteA.preview).slice(0, 1000),
            b_title: noteB.title, b_content: (noteB.content || noteB.preview).slice(0, 1000),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Pick a random conversational prefix
        const prefix = CONVERSATIONAL_PREFIXES[Math.floor(Math.random() * CONVERSATIONAL_PREFIXES.length)];
        // Lowercase the first char of the idea to flow with the prefix
        const ideaText = data.spark.charAt(0).toLowerCase() + data.spark.slice(1);

        bumpPair.sparkTitle = data.spark_title || "";
        bumpPair.sparkText = prefix + ideaText;
        bumpPair.speaker = Math.random() > 0.5 ? a : b;
      } catch (e) {
        bumpPair.sparkText = "Hmm... that one got away from us.";
        bumpPair.sparkTitle = "";
        bumpPair.speaker = a;
      }

      sparkPending = false;
    }

    // --- Update loop ---

    let bumpCooldown = 60; // first bump after ~1s
    const BUMP_INTERVAL = 120; // frames between bumps (~2s)

    function update() {
      for (const p of people) {
        if (p.stopped) continue;
        p.frame++;
        p.x += p.speed * p.dir;

        // Off screen? Respawn
        if ((p.dir > 0 && p.x > W + 60) || (p.dir < 0 && p.x < -60)) {
          respawn(p);
        }
      }

      // Bump logic
      if (bumpPair) {
        const { a, b } = bumpPair;
        const dx = Math.abs(a.x - b.x);

        if (bumpPair.phase === "approaching") {
          // Walk toward each other
          if (dx > 35) {
            // Keep walking normally
          } else {
            // They've met!
            a.stopped = true;
            b.stopped = true;
            a.dir = b.x > a.x ? 1 : -1;
            b.dir = a.x > b.x ? 1 : -1;
            bumpPair.phase = "talking";
            bumpPair.timer = 0;
            triggerSpark(a, b);
          }
        }

        if (bumpPair.phase === "talking") {
          bumpPair.timer++;
          if (bumpPair.timer > 900 && !sparkPending) {
            // Done talking, walk away
            bumpPair.phase = "dispersing";
            a.stopped = false;
            b.stopped = false;
            // Reverse directions
            a.dir = a.x < W / 2 ? -1 : 1;
            b.dir = b.x < W / 2 ? -1 : 1;
            if (a.dir === b.dir) b.dir *= -1;

            // Fade out spark
            const overlay = document.getElementById("spark-overlay");
            overlay.className = "spark-hidden";
            bumpPair = null;
            bumpCooldown = BUMP_INTERVAL;
          }
        }
      } else {
        bumpCooldown--;
        if (bumpCooldown <= 0 && !paused) {
          tryBump();
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      drawSky();
      drawClouds();
      drawSun();
      drawTitle();
      drawSkyline();
      drawBackBuildings();
      drawBuildings();
      drawGround();
      drawStreetFurniture();
      drawTrees();

      // Sort people by Y for depth
      const sorted = [...people].sort((a, b) => a.y - b.y);
      for (const p of sorted) {
        drawPerson(p);

        // Show name tag for everyone
        const isBumpA = bumpPair && bumpPair.phase === "talking" && p === bumpPair.a;
        const isBumpB = bumpPair && bumpPair.phase === "talking" && p === bumpPair.b;
        const tagColor = isBumpA ? "#2563eb" : isBumpB ? "#dc2626" : "rgba(80,80,100,0.6)";
        drawNameTag(p.x, p.y, truncate(p.title, 20), tagColor);
      }

      // Pets
      drawPets();

      // Thought bubbles while thinking, speech bubble when idea arrives
      if (bumpPair && bumpPair.phase === "talking") {
        const a = bumpPair.a;
        const b = bumpPair.b;

        if (!bumpPair.sparkText) {
          // Still thinking — show thought bubbles above both people
          drawThoughtBubble(a.x, a.y - PX * 10, bumpPair.timer);
          drawThoughtBubble(b.x, b.y - PX * 10, bumpPair.timer + 30);
        } else {
          // Idea arrived — speech bubble from one person
          const speaker = bumpPair.speaker || a;
          const inviteLabel = flaneurState.currentScene === "street" ? "INVITE TO PARTY"
            : flaneurState.currentScene === "party" ? "INVITE TO COFFEE" : null;
          const midX = (a.x + b.x) / 2;
          drawSpeechBubble(
            midX, Math.min(a.y, b.y) - PX * 40,
            bumpPair.sparkTitle || "",
            bumpPair.sparkText,
            bumpPair.invited ? null : inviteLabel,
            a.x, b.x, Math.min(a.y, b.y) - PX * 6
          );
        }
      }
    }

    function loop() {
      if (!paused) { update(); updatePets(); }
      draw();
      animFrame = requestAnimationFrame(loop);
    }

    // Controls
    const btnPause = document.getElementById("btn-pause");
    const btnSkip = document.getElementById("btn-skip");

    function onPause() {
      paused = !paused;
      btnPause.innerHTML = paused ? "&#9654;" : "&#9646;&#9646;";
    }

    function onSkip() {
      if (bumpPair) {
        bumpPair.a.stopped = false;
        bumpPair.b.stopped = false;
        bumpPair = null;
        document.getElementById("spark-overlay").className = "spark-hidden";
      }
      bumpCooldown = 0;
      sparkPending = false;
    }

    btnPause.addEventListener("click", onPause);
    btnSkip.addEventListener("click", onSkip);

    cleanup = () => {
      cancelAnimationFrame(animFrame);
      paused = true;
      btnPause.removeEventListener("click", onPause);
      btnSkip.removeEventListener("click", onSkip);
    };

    // Canvas click handler
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width / (window.devicePixelRatio || 1));
      const my = (e.clientY - rect.top) * (canvas.height / rect.height / (window.devicePixelRatio || 1));

      // Change folder button
      const b = drawTitle._btnBounds;
      if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        showSetup();
        return;
      }

      // Invite button in speech bubble
      const ib = drawSpeechBubble._inviteBounds;
      if (ib && mx >= ib.x && mx <= ib.x + ib.w && my >= ib.y && my <= ib.y + ib.h && bumpPair && bumpPair.sparkText) {
        if (flaneurState.currentScene === "street") {
          // Invite only the speaker to the party
          const person = bumpPair.speaker || bumpPair.a;
          const spark = { title: bumpPair.sparkTitle, text: bumpPair.sparkText };
          const already = new Set(flaneurState.partyGuests.map(g => g.noteIdx));
          if (!already.has(person.noteIdx)) {
            flaneurState.partyGuests.push({
              noteIdx: person.noteIdx, title: person.title, palette: person.palette, streetSpark: spark
            });
          }
          bumpPair.invited = true;
          bumpPair.timer = 800; // dismiss quickly
          updatePartyButton();
        } else if (flaneurState.currentScene === "party" && flaneurState.coffeeGuests.length < 2) {
          const a = bumpPair.a;
          const b2 = bumpPair.b;
          const spark = { title: bumpPair.sparkTitle, text: bumpPair.sparkText };
          const already = new Set(flaneurState.coffeeGuests.map(g => g.noteIdx));
          if (!already.has(a.noteIdx) && flaneurState.coffeeGuests.length < 2) {
            const guest = flaneurState.partyGuests.find(g => g.noteIdx === a.noteIdx) || { noteIdx: a.noteIdx, title: a.title, palette: a.palette, streetSpark: {} };
            flaneurState.coffeeGuests.push({ ...guest, partySpark: spark });
          }
          if (!already.has(b2.noteIdx) && flaneurState.coffeeGuests.length < 2) {
            const guest = flaneurState.partyGuests.find(g => g.noteIdx === b2.noteIdx) || { noteIdx: b2.noteIdx, title: b2.title, palette: b2.palette, streetSpark: {} };
            flaneurState.coffeeGuests.push({ ...guest, partySpark: spark });
          }
          bumpPair.invited = true;
          bumpPair.timer = 800; // dismiss quickly
          updateCoffeeButton();
        }
        drawSpeechBubble._inviteBounds = null;
      }
    });

    // Go
    loop();
  }

  // --- Party button handler ---
  document.getElementById("btn-party").addEventListener("click", () => {
    if (flaneurState.partyGuests.length < 3) return;
    if (cleanup) cleanup();
    launchParty();
  });

  // --- Coffee button handler ---
  document.getElementById("btn-coffee").addEventListener("click", () => {
    if (flaneurState.coffeeGuests.length < 2) return;
    if (cleanup) cleanup();
    launchCoffee();
  });

  // --- Back to street ---
  document.getElementById("btn-back-street").addEventListener("click", () => {
    if (cleanup) cleanup();
    flaneurState.partyGuests = [];
    flaneurState.coffeeGuests = [];
    document.getElementById("coffee-result").classList.add("hidden");
    launchStreet();
  });

  document.getElementById("btn-coffee-done").addEventListener("click", () => {
    if (cleanup) cleanup();
    flaneurState.partyGuests = [];
    flaneurState.coffeeGuests = [];
    document.getElementById("coffee-result").classList.add("hidden");
    launchStreet();
  });

  document.getElementById("btn-copy-idea").addEventListener("click", () => {
    const title = document.getElementById("coffee-title").textContent;
    const idea = document.getElementById("coffee-idea").textContent;
    navigator.clipboard.writeText(`${title}\n\n${idea}`);
    document.getElementById("btn-copy-idea").textContent = "Copied!";
    setTimeout(() => { document.getElementById("btn-copy-idea").textContent = "Copy idea"; }, 2000);
  });

  // =============================================
  // PARTY SCENE
  // =============================================
  async function launchParty() {
    flaneurState.currentScene = "party";

    // Show/hide buttons
    document.getElementById("btn-party").classList.add("hidden");
    document.getElementById("btn-coffee").classList.remove("hidden");
    document.getElementById("btn-back-street").classList.remove("hidden");
    document.getElementById("btn-music").classList.remove("hidden");
    document.getElementById("speed-control").classList.add("hidden");
    updateCoffeeButton();

    // --- Party music ---
    const partyAudio = new Audio("/party.mp3");
    partyAudio.loop = true;
    partyAudio.volume = 0.4;
    partyAudio.play().catch(() => {});

    const btnMusic = document.getElementById("btn-music");
    btnMusic.addEventListener("click", () => {
      if (partyAudio.paused) {
        partyAudio.play();
        btnMusic.textContent = "🔊";
      } else {
        partyAudio.pause();
        btnMusic.textContent = "🔇";
      }
    });

    const notes = flaneurState.notes;
    const canvas = document.getElementById("street-canvas");
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const PX = 12;
    const P = 4;

    // Room bounds
    const FLOOR_Y = H * 0.45;
    const FLOOR_BOTTOM = H * 0.85;
    const WALL_LEFT = W * 0.05;
    const WALL_RIGHT = W * 0.95;

    function pxRect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
    }

    function makeSeeded(s) {
      return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    }

    // Create people from party guests — their identity is now their street spark idea
    let people = flaneurState.partyGuests.map((guest, i) => ({
      noteIdx: guest.noteIdx,
      title: guest.streetSpark ? guest.streetSpark.title : guest.title,
      originalTitle: guest.title,
      palette: guest.palette,
      streetSpark: guest.streetSpark,
      x: WALL_LEFT + Math.random() * (WALL_RIGHT - WALL_LEFT),
      y: FLOOR_Y + Math.random() * (FLOOR_BOTTOM - FLOOR_Y),
      targetX: 0,
      targetY: 0,
      speed: 0.3 + Math.random() * 0.3,
      dir: 1,
      frame: Math.floor(Math.random() * 100),
      stopped: false,
      pauseTimer: 0,
    }));

    // Give each a random target
    for (const p of people) {
      p.targetX = WALL_LEFT + 40 + Math.random() * (WALL_RIGHT - WALL_LEFT - 80);
      p.targetY = FLOOR_Y + 10 + Math.random() * (FLOOR_BOTTOM - FLOOR_Y - 20);
    }

    let paused = false;
    let animFrame;
    let bumpPair = null;
    let sparkPending = false;
    let bumpCooldown = 90;
    const BUMP_INTERVAL = 150;

    const CONVERSATIONAL_PREFIXES = [
      "Building on that... ",
      "OK but what if we take it further: ",
      "That reminds me — ",
      "Yes! And also: ",
      "Wait I just connected something: ",
      "This changes everything: ",
    ];

    // --- Party drawing ---

    function drawRoom() {
      const s = P * 2.5; // scale up furniture to match bigger people

      // Wall — warm deep tone with subtle texture
      pxRect(0, 0, W, FLOOR_Y, "#2A1F1A");
      const rand = makeSeeded(50);
      for (let i = 0; i < 80; i++) {
        pxRect(Math.floor(rand() * W / s) * s, Math.floor(rand() * FLOOR_Y / s) * s, s, s, rand() > 0.5 ? "#2E2218" : "#26191A");
      }

      // Wainscoting / lower wall panel
      const panelY = FLOOR_Y * 0.6;
      pxRect(0, panelY, W, FLOOR_Y - panelY, "#221810");
      pxRect(0, panelY, W, s, "#3A2A1A"); // trim line
      pxRect(0, FLOOR_Y - s, W, s, "#3A2A1A"); // baseboard

      // Floor (hardwood)
      pxRect(0, FLOOR_Y, W, H - FLOOR_Y, "#4A3520");
      for (let fy = FLOOR_Y; fy < H; fy += s * 3) pxRect(0, fy, W, 1, "#3A2510");
      const rand2 = makeSeeded(60);
      for (let i = 0; i < 80; i++) pxRect(Math.floor(rand2() * W / s) * s, FLOOR_Y + Math.floor(rand2() * ((H - FLOOR_Y) / s)) * s, s, s, rand2() > 0.5 ? "#503A25" : "#443020");

      // Persian rug
      const rugX = W * 0.25, rugY = FLOOR_Y + (FLOOR_BOTTOM - FLOOR_Y) * 0.25;
      const rugW = W * 0.5, rugH = (FLOOR_BOTTOM - FLOOR_Y) * 0.55;
      pxRect(rugX, rugY, rugW, rugH, "#6B1818");
      pxRect(rugX + s, rugY + s, rugW - s * 2, rugH - s * 2, "#8B2020");
      pxRect(rugX + s * 3, rugY + s * 3, rugW - s * 6, rugH - s * 6, "#7B1A1A");
      pxRect(rugX + s * 5, rugY + s * 5, rugW - s * 10, rugH - s * 10, "#8B2525");
      // Rug pattern
      const rr = makeSeeded(88);
      for (let i = 0; i < 20; i++) {
        pxRect(rugX + s * 4 + rr() * (rugW - s * 8), rugY + s * 4 + rr() * (rugH - s * 8), s, s, rr() > 0.5 ? "#D4A050" : "#C08030");
      }

      // Window showing skyline
      const winX = W * 0.55, winY = H * 0.04, winW = W * 0.35, winH = panelY - H * 0.06;
      pxRect(winX - s * 2, winY - s * 2, winW + s * 4, winH + s * 4, "#3A2A1A");
      pxRect(winX - s, winY - s, winW + s * 2, winH + s * 2, "#4A3A2A");
      pxRect(winX, winY, winW, winH, "#0A0A1E");
      // Stars
      const rand3 = makeSeeded(13);
      for (let i = 0; i < 20; i++) pxRect(winX + rand3() * winW, winY + rand3() * winH * 0.5, s * 0.5, s * 0.5, "#fff");
      // Moon
      pxRect(winX + winW * 0.8, winY + winH * 0.15, s * 3, s * 3, "#F0E8D0");
      pxRect(winX + winW * 0.8 + s, winY + winH * 0.15, s * 2, s, "#F5F0E0");
      // Skyline
      const rand4 = makeSeeded(27);
      for (let i = 0; i < 10; i++) {
        const bx2 = winX + rand4() * (winW - s * 4);
        const bh2 = s * 4 + rand4() * s * 12;
        const bw2 = s * 2 + rand4() * s * 3;
        pxRect(bx2, winY + winH - bh2, bw2, bh2, "#151530");
        for (let wy = winY + winH - bh2 + s; wy < winY + winH - s; wy += s * 2)
          if (rand4() > 0.4) pxRect(bx2 + s * 0.5, wy, s, s, "#F0C040");
      }
      // Window cross bars
      pxRect(winX + winW / 2 - 1, winY, 2, winH, "#3A2A1A");
      pxRect(winX, winY + winH / 2 - 1, winW, 2, "#3A2A1A");
      // Curtains
      pxRect(winX - s * 2, winY - s * 2, s * 3, winH + s * 4, "#4A2030");
      pxRect(winX + winW - s, winY - s * 2, s * 3, winH + s * 4, "#4A2030");
      // Curtain rod
      pxRect(winX - s * 3, winY - s * 3, winW + s * 6, s, "#8B7355");

      // Paintings on wall
      // Abstract painting 1
      pxRect(W * 0.08, H * 0.06, s * 14, s * 10, "#3A2A1A");
      pxRect(W * 0.08 + s, H * 0.06 + s, s * 12, s * 8, "#1A3050");
      pxRect(W * 0.08 + s * 3, H * 0.06 + s * 2, s * 4, s * 3, "#C0392B");
      pxRect(W * 0.08 + s * 7, H * 0.06 + s * 4, s * 3, s * 2, "#F0C040");
      pxRect(W * 0.08 + s * 4, H * 0.06 + s * 5, s * 5, s * 2, "#2E8B57");

      // Portrait painting 2
      pxRect(W * 0.32, H * 0.05, s * 10, s * 12, "#4A3520");
      pxRect(W * 0.32 + s, H * 0.05 + s, s * 8, s * 10, "#2A3A4A");
      pxRect(W * 0.32 + s * 3, H * 0.05 + s * 2, s * 4, s * 4, "#E8C8A0");
      pxRect(W * 0.32 + s * 3, H * 0.05 + s * 6, s * 4, s * 3, "#C0392B");

      // Lamps — floor lamps with warm glow
      for (const lx of [W * 0.04, W * 0.96]) {
        // Lamp stand
        pxRect(lx - s * 0.5, FLOOR_Y - s * 18, s, s * 18, "#5A4A3A");
        pxRect(lx - s * 2, FLOOR_Y - s, s * 4, s, "#4A3A2A");
        // Shade (trapezoid-ish)
        pxRect(lx - s * 4, FLOOR_Y - s * 22, s * 8, s * 5, "#D4A050");
        pxRect(lx - s * 3, FLOOR_Y - s * 23, s * 6, s, "#E0B060");
        // Warm glow
        pxRect(lx - s * 10, FLOOR_Y - s * 25, s * 20, s * 16, "rgba(255,200,100,0.03)");
        pxRect(lx - s * 6, FLOOR_Y - s * 22, s * 12, s * 8, "rgba(255,200,100,0.05)");
      }

      // Wall sconces (warm glow)
      for (const lx of [W * 0.22, W * 0.45]) {
        pxRect(lx - s, panelY - s * 8, s * 2, s * 4, "#5A4A3A");
        pxRect(lx - s * 2, panelY - s * 10, s * 4, s * 2, "#D4A050");
        pxRect(lx - s * 4, panelY - s * 10, s * 8, s * 6, "rgba(255,200,100,0.04)");
      }

      // Plants
      // Tall plant (left side)
      const plx = W * 0.12, ply = FLOOR_Y;
      pxRect(plx - s * 2, ply - s * 4, s * 4, s * 4, "#8B5A2B"); // pot
      pxRect(plx - s * 3, ply - s * 4, s * 6, s, "#9B6A3B"); // pot rim
      pxRect(plx - s * 0.5, ply - s * 12, s, s * 8, "#2E6B30"); // stem
      pxRect(plx - s * 4, ply - s * 14, s * 3, s * 4, "#2E8B40");
      pxRect(plx + s, ply - s * 16, s * 3, s * 5, "#3CB350");
      pxRect(plx - s * 3, ply - s * 10, s * 2, s * 3, "#228B22");
      pxRect(plx + s * 2, ply - s * 11, s * 2, s * 3, "#27AE50");

      // Small plant (right side on shelf)
      const prx = W * 0.92, pry = FLOOR_Y;
      pxRect(prx - s, pry - s * 3, s * 3, s * 3, "#C0784A"); // pot
      pxRect(prx - s * 2, pry - s * 8, s * 2, s * 3, "#3CB371");
      pxRect(prx + s, pry - s * 7, s * 2, s * 2, "#2E8B57");
      pxRect(prx - s, pry - s * 6, s * 3, s * 2, "#228B22");

      // Record player
      const rpX = W * 0.82, rpY = FLOOR_Y - s * 2;
      pxRect(rpX, rpY, s * 12, s * 2, "#5A4030");
      pxRect(rpX + s * 2, rpY + s * 2, s, s * 6, "#4A3020");
      pxRect(rpX + s * 9, rpY + s * 2, s, s * 6, "#4A3020");
      pxRect(rpX + s, rpY - s * 3, s * 10, s * 3, "#2A2A2A");
      pxRect(rpX + s * 3, rpY - s * 2.5, s * 5, s * 2, "#111");
      pxRect(rpX + s * 5, rpY - s * 2, s, s, "#C0392B");
      pxRect(rpX + s * 9, rpY - s * 3, s, s * 2, "#888");
      pxRect(rpX + s * 7, rpY - s * 3, s * 3, s * 0.5, "#888");

      // Bookshelf (left wall)
      const bsx = W * 0.02, bsy = panelY + s * 2;
      pxRect(bsx, bsy, s * 12, s * (FLOOR_Y - panelY) / s - 4, "#3A2A1A");
      // Shelves
      for (let sy2 = bsy + s * 3; sy2 < FLOOR_Y - s * 3; sy2 += s * 5) {
        pxRect(bsx, sy2, s * 12, s, "#4A3A2A");
        // Books
        const bookR = makeSeeded(sy2);
        const bookColors = ["#C0392B","#2980B9","#27AE60","#8E44AD","#F39C12","#1ABC9C"];
        for (let bk = bsx + s; bk < bsx + s * 11; bk += s * 1.5 + bookR() * s) {
          const bkh = s * 3 + bookR() * s;
          pxRect(bk, sy2 - bkh, s * 1.2, bkh, bookColors[Math.floor(bookR() * bookColors.length)]);
        }
      }

      // Drinks table (centre-right)
      const dtx = W * 0.7, dty = FLOOR_Y;
      pxRect(dtx, dty - s * 6, s * 6, s, "#5A4030");
      pxRect(dtx + s * 2, dty - s * 5, s * 2, s * 5, "#4A3020");
      // Glasses on table
      pxRect(dtx + s, dty - s * 8, s * 1.5, s * 2, "#A0D0F0");
      pxRect(dtx + s * 3, dty - s * 7.5, s * 1.5, s * 1.5, "#F0C040");
    }

    function drawPartyTitle() {
      if (!introOverlay.classList.contains("hidden")) return;
      const s = P;
      pxRect(0, s * 2, W, s * 10, "rgba(0,0,0,0.3)");
      ctx.font = "bold 32px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillText("THE PARTY", s * 6 + 2, s * 7 + 2);
      ctx.fillStyle = "#F0C040";
      ctx.fillText("THE PARTY", s * 6, s * 7);
      ctx.font = "11px 'Courier New', monospace";
    }

    // Reuse drawing functions
    function drawPerson(p) {
      const { x, y, palette, dir, frame, stopped } = p;
      const s = PX;
      const walk = stopped ? 0 : Math.sin(frame * 0.15);
      pxRect(x - 2 * s, y + 10 * s, 6 * s, s, "rgba(0,0,0,0.12)");
      const legL = stopped ? 0 : walk * s * 1.2;
      const legR = stopped ? 0 : -walk * s * 1.2;
      pxRect(x - 1 * s, y + 6 * s, s * 1.5, s * 4, palette.pants);
      pxRect(x + 1.5 * s, y + 6 * s, s * 1.5, s * 4, palette.pants);
      pxRect(x - 1.5 * s + legL, y + 9.5 * s, s * 2.5, s, "#333");
      pxRect(x + 1 * s + legR, y + 9.5 * s, s * 2.5, s, "#333");
      pxRect(x - 2 * s, y + 2 * s, s * 6, s * 4.5, palette.shirt);
      const armSwing = stopped ? 0 : walk * s;
      pxRect(x - 3.5 * s, y + 2 * s + armSwing, s * 1.5, s * 3.5, palette.shirt);
      pxRect(x + 4 * s, y + 2 * s - armSwing, s * 1.5, s * 3.5, palette.shirt);
      pxRect(x - 3.5 * s, y + 5 * s + armSwing, s * 1.5, s, palette.skin);
      pxRect(x + 4 * s, y + 5 * s - armSwing, s * 1.5, s, palette.skin);
      pxRect(x, y + 0.5 * s, s * 2, s * 2, palette.skin);
      pxRect(x - 1.5 * s, y - 4 * s, s * 5, s * 5, palette.skin);
      pxRect(x - 1.5 * s, y - 5 * s, s * 5, s * 2.5, palette.hair);
      if (dir > 0) pxRect(x - 1.5 * s, y - 4 * s, s, s * 3, palette.hair);
      else pxRect(x + 2.5 * s, y - 4 * s, s, s * 3, palette.hair);
      if (dir > 0) {
        pxRect(x + 1 * s, y - 2 * s, s, s, "#1a1a2e");
        pxRect(x + 2.5 * s, y - 2 * s, s, s, "#1a1a2e");
      } else {
        pxRect(x - 0.5 * s, y - 2 * s, s, s, "#1a1a2e");
        pxRect(x + 1 * s, y - 2 * s, s, s, "#1a1a2e");
      }
    }

    function drawNameTag(x, y, name, color) {
      ctx.font = "bold 11px -apple-system, sans-serif";
      const w = ctx.measureText(name).width + 14;
      const h = 22;
      const tx = x - w / 2 + PX;
      const ty = y - PX * 8;
      pxRect(tx, ty, w, h, "rgba(0,0,0,0.5)");
      ctx.fillStyle = color || "rgba(255,255,200,0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name, x + PX, ty + h / 2);
    }

    function drawThoughtBubble(x, y, timer) {
      const s = P;
      const bob = Math.sin(timer * 0.08) * 2;
      pxRect(x + s, y + s * 4 + bob, s * 1.5, s * 1.5, "rgba(255,255,255,0.5)");
      pxRect(x - s, y + s * 2 + bob * 0.7, s * 2, s * 2, "rgba(255,255,255,0.6)");
      const bw = s * 8, bh = s * 5;
      const bx = x - bw / 2, by = y - bh + bob * 0.5;
      pxRect(bx + s, by, bw - s * 2, bh, "rgba(255,255,255,0.7)");
      pxRect(bx, by + s, bw, bh - s * 2, "rgba(255,255,255,0.7)");
      const dotPhase = Math.floor(timer * 0.06) % 3;
      for (let i = 0; i < 3; i++) {
        const alpha = i === dotPhase ? 1 : 0.3;
        pxRect(bx + s * 2 + i * s * 2, by + bh / 2 - s * 0.5, s, s, `rgba(100,100,120,${alpha})`);
      }
    }

    function drawSpeechBubble(x, y, title, idea, inviteLabel, tailAx, tailBx, tailY) {
      const s = P;
      ctx.font = "bold 12px -apple-system, sans-serif";
      const titleW = ctx.measureText(title).width;
      ctx.font = "11px -apple-system, sans-serif";
      const ideaW = ctx.measureText(idea).width;
      const padding = 14;
      const maxW = Math.min(320, W * 0.35);
      const contentW = Math.min(Math.max(titleW, ideaW) + padding * 2, maxW);
      const lines = wrapText(ctx, idea, contentW - padding * 2);
      const lineH = 15;
      const titleH = title ? 20 : 0;
      const bh = padding * 2 + titleH + lines.length * lineH + (inviteLabel ? 26 : 0);
      const bw = contentW;
      let bx = Math.max(10, Math.min(x - bw / 2, W - bw - 10));
      let by = y - bh - s * 2;
      if (by < 50) by = 50;
      pxRect(bx + s, by, bw - s * 2, bh, "#fff");
      pxRect(bx, by + s, bw, bh - s * 2, "#fff");
      pxRect(bx + s, by, bw - s * 2, 1, "#ddd");
      pxRect(bx + s, by + bh - 1, bw - s * 2, 1, "#ddd");
      pxRect(bx, by + s, 1, bh - s * 2, "#ddd");
      pxRect(bx + bw - 1, by + s, 1, bh - s * 2, "#ddd");
      if (tailAx != null && tailBx != null) {
        const tA = Math.max(bx + s * 2, Math.min(tailAx, bx + bw / 2 - s * 3));
        const tB = Math.max(bx + bw / 2 + s * 3, Math.min(tailBx, bx + bw - s * 2));
        pxRect(tA - s * 1.5, by + bh, s * 3, s, "#fff");
        pxRect(tA - s, by + bh + s, s * 2, s, "#fff");
        pxRect(tA - s * 0.5, by + bh + s * 2, s * 1.5, s, "#fff");
        pxRect(tA, by + bh + s * 3, s, s, "#fff");
        pxRect(tA, by + bh + s * 4, s * 0.5, s, "#fff");
        pxRect(tA + s * 0.25, by + bh + s * 5, s * 0.5, s, "#fff");
        pxRect(tB - s * 1.5, by + bh, s * 3, s, "#fff");
        pxRect(tB - s, by + bh + s, s * 2, s, "#fff");
        pxRect(tB - s * 0.5, by + bh + s * 2, s * 1.5, s, "#fff");
        pxRect(tB, by + bh + s * 3, s, s, "#fff");
        pxRect(tB, by + bh + s * 4, s * 0.5, s, "#fff");
        pxRect(tB + s * 0.25, by + bh + s * 5, s * 0.5, s, "#fff");
      } else {
        const tailX = Math.max(bx + s * 4, Math.min(x, bx + bw - s * 4));
        pxRect(tailX - s * 2, by + bh, s * 4, s, "#fff");
        pxRect(tailX - s, by + bh + s, s * 2, s, "#fff");
        pxRect(tailX - s * 0.5, by + bh + s * 2, s, s, "#fff");
      }
      if (title) {
        ctx.font = "bold 12px -apple-system, sans-serif";
        ctx.fillStyle = "#1a1a2e";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(title, bx + padding, by + padding);
      }
      ctx.font = "11px -apple-system, sans-serif";
      ctx.fillStyle = "#555";
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], bx + padding, by + padding + titleH + i * lineH);
      }
      if (inviteLabel) {
        ctx.font = "bold 9px 'Courier New', monospace";
        const ibW = ctx.measureText(inviteLabel).width + 16;
        const ibH = 20;
        const textBottom = by + padding + titleH + lines.length * lineH + 6;
        const ibX = bx + (bw - ibW) / 2;
        const ibY = textBottom;
        pxRect(ibX, ibY, ibW, ibH, "#2563eb");
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(inviteLabel, ibX + ibW / 2, ibY + ibH / 2);
        drawSpeechBubble._inviteBounds = { x: ibX, y: ibY, w: ibW, h: ibH };
      } else {
        drawSpeechBubble._inviteBounds = null;
      }
    }

    function wrapText(ctx, text, maxWidth) {
      const words = text.split(" ");
      const lines = [];
      let current = "";
      for (const word of words) {
        const test = current ? current + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word; }
        else current = test;
      }
      if (current) lines.push(current);
      return lines;
    }

    async function triggerPartySpark(a, b) {
      sparkPending = true;
      try {
        const noteA = flaneurState.notes[a.noteIdx] || {};
        const noteB = flaneurState.notes[b.noteIdx] || {};
        const res = await fetch("/api/spark-evolve", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": userApiKey },
          body: JSON.stringify({
            a_title: noteA.title, a_content: (noteA.content || noteA.preview || "").slice(0, 600),
            b_title: noteB.title, b_content: (noteB.content || noteB.preview || "").slice(0, 600),
            context: {
              scene: "party",
              a_street_spark: a.streetSpark || {},
              b_street_spark: b.streetSpark || {},
            }
          }),
        });
        const data = await res.json();
        const prefix = CONVERSATIONAL_PREFIXES[Math.floor(Math.random() * CONVERSATIONAL_PREFIXES.length)];
        const ideaText = data.spark.charAt(0).toLowerCase() + data.spark.slice(1);
        bumpPair.sparkTitle = data.spark_title || "";
        bumpPair.sparkText = prefix + ideaText;
        bumpPair.speaker = Math.random() > 0.5 ? a : b;
      } catch (e) {
        bumpPair.sparkText = "The vibe shifted before they could finish the thought.";
        bumpPair.sparkTitle = "";
        bumpPair.speaker = a;
      }
      sparkPending = false;
    }

    function tryBump() {
      if (bumpPair || sparkPending) return;
      const candidates = people.filter(p => !p.stopped);
      if (candidates.length < 2) return;
      let bestDist = Infinity, bestA = null, bestB = null;
      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
          const dx = Math.abs(candidates[i].x - candidates[j].x);
          const dy = Math.abs(candidates[i].y - candidates[j].y);
          const dist = dx + dy;
          if (dist < bestDist && dist < 80) {
            bestDist = dist;
            bestA = candidates[i];
            bestB = candidates[j];
          }
        }
      }
      if (bestA && bestB) {
        bumpPair = { a: bestA, b: bestB, phase: "approaching", timer: 0 };
      }
    }

    function update() {
      for (const p of people) {
        if (p.stopped) continue;
        p.frame++;

        // Wander toward target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) {
          p.pauseTimer++;
          if (p.pauseTimer > 60 + Math.random() * 120) {
            p.targetX = WALL_LEFT + 40 + Math.random() * (WALL_RIGHT - WALL_LEFT - 80);
            p.targetY = FLOOR_Y + 10 + Math.random() * (FLOOR_BOTTOM - FLOOR_Y - 20);
            p.pauseTimer = 0;
          }
        } else {
          p.x += (dx / dist) * p.speed;
          p.y += (dy / dist) * p.speed;
          p.dir = dx > 0 ? 1 : -1;
        }
      }

      if (bumpPair) {
        const { a, b } = bumpPair;
        const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        if (bumpPair.phase === "approaching") {
          // Steer toward each other
          const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
          a.targetX = midX - 15; a.targetY = midY;
          b.targetX = midX + 15; b.targetY = midY;
          if (dist < 40) {
            a.stopped = true; b.stopped = true;
            a.dir = b.x > a.x ? 1 : -1;
            b.dir = a.x > b.x ? 1 : -1;
            bumpPair.phase = "talking";
            bumpPair.timer = 0;
            triggerPartySpark(a, b);
          }
        }
        if (bumpPair && bumpPair.phase === "talking") {
          bumpPair.timer++;
          if (bumpPair.timer > 900 && !sparkPending) {
            a.stopped = false; b.stopped = false;
            a.targetX = WALL_LEFT + 40 + Math.random() * (WALL_RIGHT - WALL_LEFT - 80);
            a.targetY = FLOOR_Y + 10 + Math.random() * (FLOOR_BOTTOM - FLOOR_Y - 20);
            b.targetX = WALL_LEFT + 40 + Math.random() * (WALL_RIGHT - WALL_LEFT - 80);
            b.targetY = FLOOR_Y + 10 + Math.random() * (FLOOR_BOTTOM - FLOOR_Y - 20);
            bumpPair = null;
            bumpCooldown = BUMP_INTERVAL;
          }
        }
      } else {
        bumpCooldown--;
        if (bumpCooldown <= 0 && !paused) tryBump();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      drawRoom();
      drawPartyTitle();

      const sorted = [...people].sort((a, b) => a.y - b.y);
      for (const p of sorted) {
        drawPerson(p);
        const isBumpA = bumpPair && bumpPair.phase === "talking" && p === bumpPair.a;
        const isBumpB = bumpPair && bumpPair.phase === "talking" && p === bumpPair.b;
        const color = isBumpA ? "#F0C040" : isBumpB ? "#FF6B6B" : "rgba(255,255,200,0.5)";
        drawNameTag(p.x, p.y, truncate(p.title, 18), color);
      }

      if (bumpPair && bumpPair.phase === "talking") {
        if (!bumpPair.sparkText) {
          drawThoughtBubble(bumpPair.a.x, bumpPair.a.y - PX * 10, bumpPair.timer);
          drawThoughtBubble(bumpPair.b.x, bumpPair.b.y - PX * 10, bumpPair.timer + 30);
        } else {
          const speaker = bumpPair.speaker || bumpPair.a;
          const inviteLabel = flaneurState.coffeeGuests.length < 2 && !bumpPair.invited ? "INVITE TO COFFEE" : null;
          const midX = (bumpPair.a.x + bumpPair.b.x) / 2;
          drawSpeechBubble(midX, Math.min(bumpPair.a.y, bumpPair.b.y) - PX * 40, bumpPair.sparkTitle, bumpPair.sparkText, inviteLabel, bumpPair.a.x, bumpPair.b.x, Math.min(bumpPair.a.y, bumpPair.b.y) - PX * 6);
        }
      }
    }

    function loop() {
      if (!paused) update();
      draw();
      animFrame = requestAnimationFrame(loop);
    }

    const btnPause = document.getElementById("btn-pause");
    const btnSkip = document.getElementById("btn-skip");
    function onPause() { paused = !paused; btnPause.innerHTML = paused ? "&#9654;" : "&#9646;&#9646;"; }
    function onSkip() {
      if (bumpPair) { bumpPair.a.stopped = false; bumpPair.b.stopped = false; bumpPair = null; }
      bumpCooldown = 0; sparkPending = false;
    }
    btnPause.addEventListener("click", onPause);
    btnSkip.addEventListener("click", onSkip);

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width / dpr);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height / dpr);
      const ib = drawSpeechBubble._inviteBounds;
      if (ib && mx >= ib.x && mx <= ib.x + ib.w && my >= ib.y && my <= ib.y + ib.h && bumpPair && bumpPair.sparkText) {
        if (flaneurState.coffeeGuests.length < 2) {
          // Only invite the speaker to coffee
          const person = bumpPair.speaker || bumpPair.a;
          const spark = { title: bumpPair.sparkTitle, text: bumpPair.sparkText };
          const already = new Set(flaneurState.coffeeGuests.map(g => g.noteIdx));
          if (!already.has(person.noteIdx)) {
            const guest = flaneurState.partyGuests.find(g => g.noteIdx === person.noteIdx) || {};
            flaneurState.coffeeGuests.push({ ...guest, noteIdx: person.noteIdx, title: person.title, palette: person.palette, partySpark: spark });
          }
          bumpPair.invited = true;
          bumpPair.timer = 800; // dismiss quickly
          updateCoffeeButton();
          drawSpeechBubble._inviteBounds = null;
        }
      }
    });

    cleanup = () => {
      cancelAnimationFrame(animFrame);
      paused = true;
      btnPause.removeEventListener("click", onPause);
      btnSkip.removeEventListener("click", onSkip);
      partyAudio.pause();
      partyAudio.currentTime = 0;
      document.getElementById("btn-music").classList.add("hidden");
    };

    loop();
  }

  // =============================================
  // COFFEE SCENE
  // =============================================
  async function launchCoffee() {
    flaneurState.currentScene = "coffee";

    document.getElementById("btn-party").classList.add("hidden");
    document.getElementById("btn-coffee").classList.add("hidden");
    document.getElementById("btn-back-street").classList.remove("hidden");
    document.getElementById("speed-control").classList.add("hidden");
    document.getElementById("btn-pause").classList.add("hidden");
    document.getElementById("btn-skip").classList.add("hidden");

    const canvas = document.getElementById("street-canvas");
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const PX = 4;
    const P = 4;
    const FACE = Math.floor(Math.min(W * 0.04, H * 0.06)); // faces fill most of screen
    const guestA = flaneurState.coffeeGuests[0];
    const guestB = flaneurState.coffeeGuests[1];

    function pxRect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
    }

    function makeSeeded(s) {
      return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    }

    // Scene elements
    const TABLE_X = W * 0.5;
    const TABLE_Y = H * 0.6;
    const personAx = W * 0.28;
    const personBx = W * 0.72;
    const faceY = H * 0.38;

    let timer = 0;
    let sparkText = null;
    let sparkTitle = null;
    let animFrame;

    function drawCafe() {
      const s = P;

      // Wall
      pxRect(0, 0, W, H * 0.6, "#F5E6D0");
      // Wall texture
      const rand = makeSeeded(80);
      for (let i = 0; i < 40; i++) {
        pxRect(Math.floor(rand() * W / s) * s, Math.floor(rand() * H * 0.6 / s) * s, s, s, "#EEDEc5");
      }

      // Window (left side)
      const winX = W * 0.05, winY = H * 0.08, winW = W * 0.25, winH = H * 0.35;
      pxRect(winX - s, winY - s, winW + s * 2, winH + s * 2, "#8B7355");
      pxRect(winX, winY, winW, winH, "#B0D8F0");
      // Sunlight glow
      pxRect(winX, winY, winW, winH * 0.3, "rgba(255,240,200,0.15)");
      // Window cross
      pxRect(winX + winW / 2 - 1, winY, 2, winH, "#8B7355");
      pxRect(winX, winY + winH / 2 - 1, winW, 2, "#8B7355");

      // Plant on sill
      pxRect(winX + winW - s * 6, winY + winH - s, s * 5, s, "#8B7355"); // sill
      // Pot
      pxRect(winX + winW - s * 5, winY + winH - s * 4, s * 3, s * 3, "#C0784A");
      // Leaves
      pxRect(winX + winW - s * 6, winY + winH - s * 7, s * 2, s * 3, "#2E8B57");
      pxRect(winX + winW - s * 4, winY + winH - s * 8, s * 2, s * 4, "#3CB371");
      pxRect(winX + winW - s * 3, winY + winH - s * 6, s * 2, s * 2, "#228B22");

      // Framed picture (right wall)
      pxRect(W * 0.72, H * 0.1, s * 12, s * 9, "#5A4030");
      pxRect(W * 0.72 + s, H * 0.1 + s, s * 10, s * 7, "#6A8090");

      // Exposed brick accent (right)
      for (let by = 0; by < H * 0.6; by += s * 3) {
        for (let bx = W * 0.88; bx < W; bx += s * 5) {
          pxRect(bx + ((by / (s * 3)) % 2 === 0 ? 0 : s * 2.5), by, s * 4, s * 2, "#A0705A");
          pxRect(bx + ((by / (s * 3)) % 2 === 0 ? 0 : s * 2.5), by + s * 2, s * 4, s * 0.5, "#8A6048");
        }
      }

      // Floor
      pxRect(0, H * 0.6, W, H * 0.4, "#D4B896");
      for (let fy = H * 0.6; fy < H; fy += s * 4) {
        pxRect(0, fy, W, 1, "#C0A880");
      }

      // Table
      pxRect(TABLE_X - s * 12, TABLE_Y, s * 24, s * 3, "#8B6914");
      pxRect(TABLE_X - s * 10, TABLE_Y + s, s * 20, s, "#9B7924");
      // Table legs
      pxRect(TABLE_X - s * 10, TABLE_Y + s * 3, s * 2, s * 10, "#7A5A10");
      pxRect(TABLE_X + s * 8, TABLE_Y + s * 3, s * 2, s * 10, "#7A5A10");

      // Coffee cups
      for (const cx of [TABLE_X - s * 5, TABLE_X + s * 3]) {
        pxRect(cx, TABLE_Y - s * 2, s * 3, s * 2, "#fff");
        pxRect(cx + s * 3, TABLE_Y - s * 1.5, s, s, "#fff"); // handle
        // Coffee
        pxRect(cx + s * 0.5, TABLE_Y - s * 1.5, s * 2, s, "#5A3A1A");
        // Steam
        if (timer % 40 < 20) {
          pxRect(cx + s, TABLE_Y - s * 3 - Math.sin(timer * 0.1) * 2, s * 0.5, s, "rgba(200,200,200,0.3)");
          pxRect(cx + s * 1.5, TABLE_Y - s * 4 - Math.sin(timer * 0.1 + 1) * 2, s * 0.5, s, "rgba(200,200,200,0.2)");
        }
      }

      // Title
      const stripeY = s * 2;
      pxRect(0, stripeY, W, s * 10, "rgba(100,70,40,0.2)");
      ctx.font = "bold 32px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillText("COFFEE", s * 6 + 2, s * 7 + 2);
      ctx.fillStyle = "#5A3A1A";
      ctx.fillText("COFFEE", s * 6, s * 7);
    }

    function drawFace(x, y, palette, dir, thinking) {
      const s = FACE;

      // Shoulders / top of body
      pxRect(x - s * 5, y + s * 5, s * 10, s * 6, palette.shirt);
      // Neck
      pxRect(x - s * 1.5, y + s * 3, s * 3, s * 3, palette.skin);

      // Head — big and round-ish
      pxRect(x - s * 4, y - s * 5, s * 8, s * 9, palette.skin);
      pxRect(x - s * 5, y - s * 4, s * 10, s * 7, palette.skin);
      pxRect(x - s * 3, y - s * 6, s * 6, s, palette.skin);

      // Hair
      pxRect(x - s * 5, y - s * 6, s * 10, s * 3, palette.hair);
      pxRect(x - s * 4, y - s * 7, s * 8, s * 2, palette.hair);
      pxRect(x - s * 3, y - s * 8, s * 6, s, palette.hair);
      // Side hair
      if (dir > 0) {
        pxRect(x - s * 5, y - s * 5, s * 1.5, s * 5, palette.hair);
      } else {
        pxRect(x + s * 3.5, y - s * 5, s * 1.5, s * 5, palette.hair);
      }

      // Eyes — big and expressive
      const eyeY = y - s * 1.5;
      if (dir > 0) {
        // Left eye white
        pxRect(x - s * 2, eyeY - s * 0.5, s * 2.5, s * 2, "#fff");
        // Right eye white
        pxRect(x + s * 0.5, eyeY - s * 0.5, s * 2.5, s * 2, "#fff");
        // Pupils
        pxRect(x - s * 0.5, eyeY, s * 1.2, s * 1.2, "#1a1a2e");
        pxRect(x + s * 1.5, eyeY, s * 1.2, s * 1.2, "#1a1a2e");
        // Pupil highlight
        pxRect(x - s * 0.3, eyeY - s * 0.2, s * 0.5, s * 0.5, "#fff");
        pxRect(x + s * 1.7, eyeY - s * 0.2, s * 0.5, s * 0.5, "#fff");
      } else {
        pxRect(x - s * 1.5, eyeY - s * 0.5, s * 2.5, s * 2, "#fff");
        pxRect(x + s * -0.5 + s, eyeY - s * 0.5, s * 2.5, s * 2, "#fff");
        pxRect(x - s * 0.8, eyeY, s * 1.2, s * 1.2, "#1a1a2e");
        pxRect(x + s * 0.8, eyeY, s * 1.2, s * 1.2, "#1a1a2e");
        pxRect(x - s * 0.6, eyeY - s * 0.2, s * 0.5, s * 0.5, "#fff");
        pxRect(x + s * 1.0, eyeY - s * 0.2, s * 0.5, s * 0.5, "#fff");
      }

      // Eyebrows
      if (thinking) {
        // Raised / curious eyebrows
        pxRect(x - s * 2.5, eyeY - s * 2.5, s * 3, s * 0.8, palette.hair);
        pxRect(x + s * 0.5, eyeY - s * 2.8, s * 3, s * 0.8, palette.hair);
      } else {
        pxRect(x - s * 2.5, eyeY - s * 2, s * 3, s * 0.8, palette.hair);
        pxRect(x + s * 0.5, eyeY - s * 2, s * 3, s * 0.8, palette.hair);
      }

      // Nose
      pxRect(x - s * 0.3, y + s * 0.5, s * 0.8, s * 1.5, shadeColor(palette.skin, -15));

      // Mouth
      if (thinking) {
        // Slight 'o' shape — thinking
        pxRect(x - s * 0.8, y + s * 2.5, s * 1.5, s * 0.8, "#c0392b");
      } else {
        // Smile
        pxRect(x - s * 1.5, y + s * 2.2, s * 3, s * 0.8, "#c0392b");
        pxRect(x - s * 2, y + s * 2, s * 0.8, s * 0.5, "#c0392b");
        pxRect(x + s * 1.5, y + s * 2, s * 0.8, s * 0.5, "#c0392b");
      }

      // Ears
      pxRect(x - s * 5.5, y - s * 2, s * 1.5, s * 2.5, palette.skin);
      pxRect(x + s * 4, y - s * 2, s * 1.5, s * 2.5, palette.skin);

      // Cheek blush
      pxRect(x - s * 3.5, y + s * 0.5, s * 1.5, s, "rgba(255,150,150,0.25)");
      pxRect(x + s * 2, y + s * 0.5, s * 1.5, s, "rgba(255,150,150,0.25)");
    }

    function shadeColor(hex, amt) {
      let r = parseInt(hex.slice(1, 3), 16) + amt;
      let g = parseInt(hex.slice(3, 5), 16) + amt;
      let b = parseInt(hex.slice(5, 7), 16) + amt;
      return `rgb(${Math.max(0,Math.min(255,r))},${Math.max(0,Math.min(255,g))},${Math.max(0,Math.min(255,b))})`;
    }

    // Trigger the deep conversation
    async function triggerCoffee() {
      try {
        const noteA = flaneurState.notes[guestA.noteIdx] || {};
        const noteB = flaneurState.notes[guestB.noteIdx] || {};
        const res = await fetch("/api/spark-evolve", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": userApiKey },
          body: JSON.stringify({
            a_title: noteA.title, a_content: (noteA.content || noteA.preview || "").slice(0, 400),
            b_title: noteB.title, b_content: (noteB.content || noteB.preview || "").slice(0, 400),
            context: {
              scene: "coffee",
              a_street_spark: guestA.streetSpark || {},
              b_street_spark: guestB.streetSpark || {},
              a_party_spark: guestA.partySpark || {},
              b_party_spark: guestB.partySpark || {},
            }
          }),
        });
        const data = await res.json();
        sparkTitle = data.spark_title || "";
        sparkText = data.spark;
      } catch (e) {
        sparkTitle = "Lost in thought";
        sparkText = "Sometimes the best ideas need another cup.";
      }
    }

    // Start conversation after 3 seconds
    let conversationStarted = false;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      drawCafe();

      // Draw people
      const isThinking = conversationStarted && !sparkText;
      drawFace(personAx, faceY, guestA.palette, 1, isThinking);
      drawFace(personBx, faceY, guestB.palette, -1, !isThinking && !!sparkText);

      // Name tags
      ctx.font = "bold 12px -apple-system, sans-serif";
      const tagA = truncate(guestA.title, 20);
      const tagB = truncate(guestB.title, 20);
      const twA = ctx.measureText(tagA).width + 14;
      const twB = ctx.measureText(tagB).width + 14;
      const tagY = faceY - FACE * 10;
      pxRect(personAx - twA / 2, tagY, twA, 24, "rgba(255,255,255,0.9)");
      pxRect(personBx - twB / 2, tagY, twB, 24, "rgba(255,255,255,0.9)");
      ctx.fillStyle = "#2563eb";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tagA, personAx, tagY + 12);
      ctx.fillStyle = "#dc2626";
      ctx.fillText(tagB, personBx, tagY + 12);

      // Thought bubbles while thinking — above each big face
      if (conversationStarted && !sparkText) {
        const s = P * 1.5;
        const bob = Math.sin(timer * 0.08) * 3;
        for (const fx of [personAx, personBx]) {
          pxRect(fx + s, faceY - FACE * 10 + s * 3 + bob, s * 2, s * 2, "rgba(255,255,255,0.6)");
          pxRect(fx - s, faceY - FACE * 10 + s + bob * 0.7, s * 2.5, s * 2.5, "rgba(255,255,255,0.7)");
          const bw = s * 8, bh = s * 5;
          const bx2 = fx - bw / 2, by2 = faceY - FACE * 10 - bh + bob * 0.5;
          pxRect(bx2 + s, by2, bw - s * 2, bh, "rgba(255,255,255,0.85)");
          pxRect(bx2, by2 + s, bw, bh - s * 2, "rgba(255,255,255,0.85)");
          const dotPhase = Math.floor(timer * 0.06) % 3;
          for (let i = 0; i < 3; i++)
            pxRect(bx2 + s * 2 + i * s * 2, by2 + bh / 2 - s * 0.5, s, s, `rgba(100,100,120,${i === dotPhase ? 1 : 0.3})`);
        }
      }

      // Show result when ready
      if (sparkText && timer > 240) {
        document.getElementById("coffee-title").textContent = sparkTitle;
        document.getElementById("coffee-idea").textContent = sparkText;
        document.getElementById("coffee-result").classList.remove("hidden");
      }
    }

    function loop() {
      timer++;
      if (timer === 180 && !conversationStarted) {
        conversationStarted = true;
        triggerCoffee();
      }
      draw();
      animFrame = requestAnimationFrame(loop);
    }

    cleanup = () => {
      cancelAnimationFrame(animFrame);
      document.getElementById("btn-pause").classList.remove("hidden");
      document.getElementById("btn-skip").classList.remove("hidden");
    };

    loop();
  }

  // --- Helpers ---

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + "..." : str;
  }
})();
