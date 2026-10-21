const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 1. Copy official CIMA logo from image.png to assets and public
const logoSrc = path.join(__dirname, '..', 'image.png');
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(__dirname, '..', 'src', 'assets', 'cima-logo.png'));
  fs.copyFileSync(logoSrc, path.join(__dirname, '..', 'public', 'cima-logo.png'));
  console.log('✓ CIMA Logo copied to src/assets/cima-logo.png and public/cima-logo.png');
}

// 2. Process montacargas 3D.png to remove the faux checkerboard background
const forkliftSrc = path.join(__dirname, '..', 'src', 'assets', 'montacargas 3D.png');
if (fs.existsSync(forkliftSrc)) {
  const buf = fs.readFileSync(forkliftSrc);
  const W = buf.readUInt32BE(16);
  const H = buf.readUInt32BE(20);

  // Read palette
  const plteIdx = buf.indexOf(Buffer.from('PLTE'));
  const plteLen = buf.readUInt32BE(plteIdx - 4);
  const plte = buf.slice(plteIdx + 4, plteIdx + 4 + plteLen);
  const palette = [];
  for (let i = 0; i < plteLen / 3; i++) {
    palette.push([plte[i * 3], plte[i * 3 + 1], plte[i * 3 + 2]]);
  }

  // Read IDAT
  let idat = [];
  let pos = 8;
  while (pos < buf.length) {
    let len = buf.readUInt32BE(pos);
    let type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  let dec = zlib.inflateSync(Buffer.concat(idat));

  // Build raw index grid
  const grid = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      grid[y * W + x] = dec[y * (W + 1) + 1 + x];
    }
  }

  // Flood-fill / connected components for background:
  // A pixel belongs to the checkerboard if its palette index matches the 15x15 checker pattern:
  // (Math.floor(x/15) + Math.floor(y/15)) % 2 === 0 ? 7 : 0
  const isCheckerTile = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const val = grid[y * W + x];
      const isEven = ((Math.floor(x / 15) + Math.floor(y / 15)) % 2 === 0);
      const expected = isEven ? 7 : 0;
      if (val === expected) {
        isCheckerTile[y * W + x] = 1;
      }
    }
  }

  // Flood fill from all outer edges to mark all connected checkerboard pixels
  const isBackground = new Uint8Array(W * H);
  const queue = [];

  // Seed boundary
  for (let x = 0; x < W; x++) {
    if (isCheckerTile[x]) { isBackground[x] = 1; queue.push(x); }
    const bottom = (H - 1) * W + x;
    if (isCheckerTile[bottom]) { isBackground[bottom] = 1; queue.push(bottom); }
  }
  for (let y = 0; y < H; y++) {
    const left = y * W;
    if (isCheckerTile[left]) { isBackground[left] = 1; queue.push(left); }
    const right = y * W + (W - 1);
    if (isCheckerTile[right]) { isBackground[right] = 1; queue.push(right); }
  }

  // Also seed known opening areas inside the forklift cabin/cage:
  // (Top cabin window area ~ x: 670, y: 180)
  // (Between roll cage front pillars ~ x: 550, y: 150)
  // (Between mast chains and rails ~ x: 420, y: 180)
  const innerSeeds = [
    [670, 180], [670, 250], [550, 150], [550, 220], [600, 300],
    [420, 180], [420, 250], [480, 200], [480, 280], [380, 220],
    [780, 180], [780, 250], [780, 320], [820, 350], [330, 520],
    [250, 560], [180, 580], [120, 600], [50, 620], [150, 625],
    [220, 630], [280, 630], [350, 630], [420, 630], [600, 635],
    [700, 635], [800, 635], [880, 630]
  ];
  for (const [sx, sy] of innerSeeds) {
    if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
      const idx = sy * W + sx;
      if (isCheckerTile[idx] && !isBackground[idx]) {
        isBackground[idx] = 1;
        queue.push(idx);
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % W;
    const cy = Math.floor(curr / W);

    const neighbors = [
      cx - 1 + cy * W,
      cx + 1 + cy * W,
      cx + (cy - 1) * W,
      cx + (cy + 1) * W
    ];

    if (cx > 0 && isCheckerTile[neighbors[0]] && !isBackground[neighbors[0]]) {
      isBackground[neighbors[0]] = 1;
      queue.push(neighbors[0]);
    }
    if (cx < W - 1 && isCheckerTile[neighbors[1]] && !isBackground[neighbors[1]]) {
      isBackground[neighbors[1]] = 1;
      queue.push(neighbors[1]);
    }
    if (cy > 0 && isCheckerTile[neighbors[2]] && !isBackground[neighbors[2]]) {
      isBackground[neighbors[2]] = 1;
      queue.push(neighbors[2]);
    }
    if (cy < H - 1 && isCheckerTile[neighbors[3]] && !isBackground[neighbors[3]]) {
      isBackground[neighbors[3]] = 1;
      queue.push(neighbors[3]);
    }
  }

  // Create RGBA scanlines
  const rgbaScanlines = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    const rowOffset = y * (1 + W * 4);
    rgbaScanlines[rowOffset] = 0; // Filter 0
    for (let x = 0; x < W; x++) {
      const idx = grid[y * W + x];
      const rgb = palette[idx];
      const pxOffset = rowOffset + 1 + x * 4;

      if (isBackground[y * W + x] === 1) {
        rgbaScanlines[pxOffset] = 0;
        rgbaScanlines[pxOffset + 1] = 0;
        rgbaScanlines[pxOffset + 2] = 0;
        rgbaScanlines[pxOffset + 3] = 0;
      } else {
        rgbaScanlines[pxOffset] = rgb[0];
        rgbaScanlines[pxOffset + 1] = rgb[1];
        rgbaScanlines[pxOffset + 2] = rgb[2];
        rgbaScanlines[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rgbaScanlines, { level: 9 });

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);

    let crc = 0xFFFFFFFF;
    for (let i = 0; i < typeAndData.length; i++) {
      crc ^= typeAndData[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
      }
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const pngOut = Buffer.concat([
    header,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ]);

  const targetAsset = path.join(__dirname, '..', 'src', 'assets', 'montacargas-cutout.png');
  const targetPublic = path.join(__dirname, '..', 'public', 'montacargas-cutout.png');
  fs.writeFileSync(targetAsset, pngOut);
  fs.writeFileSync(targetPublic, pngOut);
  console.log(`✓ Forklift cutout saved (${W}x${H}) to ${targetAsset} and ${targetPublic}`);
}
