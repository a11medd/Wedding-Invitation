const sharp = require('sharp');
const fs = require('fs');

async function recolorToOlive(inputPath) {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    // Map average base paper luminance (~52) to #323D2E (50, 61, 46)
    out[i]     = Math.min(255, Math.round(y * (50 / 52)));
    out[i + 1] = Math.min(255, Math.round(y * (61 / 52) * 1.08));
    out[i + 2] = Math.min(255, Math.round(y * (46 / 52)));
    if (info.channels === 4) {
      out[i + 3] = data[i + 3];
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } });
}

async function buildAll() {
  const W = 768;
  const H = 1376;

  console.log('1. Recoloring base envelope to olive...');
  const oliveEnvBuf = await (await recolorToOlive('src/assets/burgundy-envelope.jpg'))
    .jpeg({ quality: 96 })
    .toBuffer();
  fs.writeFileSync('src/assets/olive-envelope.jpg', oliveEnvBuf);

  console.log('2. Recoloring interior to olive...');
  const oliveInteriorBuf = await (await recolorToOlive('src/assets/burgundy-interior.jpg'))
    .resize(W, H, { fit: 'cover' })
    .jpeg({ quality: 96 })
    .toBuffer();
  fs.writeFileSync('src/assets/olive-interior.jpg', oliveInteriorBuf);

  // 3. Flap Masks:
  // In burgundy-envelope.jpg:
  // - Left flap: triangular, extends across center to x = 430 so it sits under the right tab with no seam gap!
  const leftFlapMaskSvg = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,0 430,688 0,${H}" fill="#fff" />
    </svg>
  `);

  // - Right flap: tab extends to x = 385 at center y = 688
  const rightFlapMaskSvg = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <path d="M ${W},0 L 400,615 Q 385,688 400,760 L ${W},${H} Z" fill="#fff" />
    </svg>
  `);

  console.log('3. Cutting left flap...');
  await sharp(oliveEnvBuf)
    .ensureAlpha()
    .composite([{ input: leftFlapMaskSvg, top: 0, left: 0, blend: 'dest-in' }])
    .png()
    .toFile('src/assets/envelope-left-flap.png');

  console.log('4. Cutting right flap...');
  await sharp(oliveEnvBuf)
    .ensureAlpha()
    .composite([{ input: rightFlapMaskSvg, top: 0, left: 0, blend: 'dest-in' }])
    .png()
    .toFile('src/assets/envelope-right-flap.png');

  console.log('5. Creating envelope-back.jpg as complete luxury interior lining...');
  // Add subtle inner vignette/shadow along top and bottom to create natural depth
  const depthSvg = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#000" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="botShadow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#000" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#000" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="180" fill="url(#topShadow)" />
      <rect x="0" y="${H - 180}" width="${W}" height="180" fill="url(#botShadow)" />
    </svg>
  `);

  await sharp(oliveInteriorBuf)
    .composite([{ input: depthSvg, top: 0, left: 0, blend: 'over' }])
    .jpeg({ quality: 95 })
    .toFile('src/assets/envelope-back.jpg');

  console.log('All assets successfully built!');
}

buildAll().catch(console.error);
