// scripts/convert-to-webp.js
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const groups = {
  srcAssets: [
    'src/assets/hero-juice.png',
    'src/assets/pure-juice.jpg',
    'src/assets/cleanse-juice.jpeg',
    'src/assets/wellness-shot.jpg',
    'src/assets/chooseImage.jpg',
    'src/assets/events.jpeg',
    'src/assets/desktopheroimage.jpg',
    'src/assets/tiktok-1.jpg',
    'src/assets/tiktok-2.jpg',
    'src/assets/tiktok-3.jpg',
    'src/assets/tiktok-4.jpg'
  ],
  publicImages: [
    'public/images/berryfull.jpg',
    'public/images/bundle1.jpeg',
    'public/images/bundle2.jpeg',
    'public/images/bundle3.jpeg',
    'public/images/bundle4.jpeg',
    'public/images/cut-fruits.jpg',
    'public/images/cutFruit1.jpeg',
    'public/images/cutFruit2.jpeg',
    'public/images/cutFruit3.jpeg',
    'public/images/cutFruit4.jpeg',
    'public/images/cutsfull.jpg',
    'public/images/events.jpg',
    'public/images/flavor1.jpg',
    'public/images/flavor2.jpg',
    'public/images/flavor3.jpg',
    'public/images/flavor4.jpg',
    'public/images/gift-packs.jpg',
    'public/images/gift1.jpeg',
    'public/images/gift2.jpeg',
    'public/images/gift3.jpeg',
    'public/images/gift4.jpeg',
    'public/images/greenfull.jpg',
    'public/images/homefruit.avif',
    'public/images/orange.jpg',
    'public/images/orangefull.jpg',
    'public/images/smoothie1.jpeg',
    'public/images/smoothie2.jpeg',
    'public/images/smoothie3.jpeg',
    'public/images/smoothie4.jpeg',
    'public/images/smoothies.jpg',
    'public/images/trofull.jpg'
  ]
};

const supportedExt = ['.png', '.jpg', '.jpeg', '.avif', '.webp'];

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function convertFile(inputPath, quality = 80) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!supportedExt.includes(ext)) {
    console.warn(`skipping unsupported extension: ${inputPath}`);
    return { status: 'skipped', path: inputPath, reason: 'unsupported extension' };
  }

  const out = inputPath.replace(/\.(png|jpe?g|jpeg|avif|webp)$/i, '.webp');

  try {
    await sharp(inputPath).webp({ quality }).toFile(out);
    return { status: 'converted', input: inputPath, output: out };
  } catch (err) {
    return { status: 'error', path: inputPath, error: err };
  }
}

(async () => {
  const results = [];
  for (const [groupName, list] of Object.entries(groups)) {
    console.log(`\n--- processing group: ${groupName} (${list.length} items) ---`);
    for (const rel of list) {
      const input = path.resolve(rel);
      const exists = await fileExists(input);
      if (!exists) {
        console.warn(`missing: ${rel} (skipping)`);
        results.push({ status: 'missing', path: rel });
        continue;
      }

      const res = await convertFile(input, 80);
      if (res.status === 'converted') {
        console.log(`converted: ${path.relative(process.cwd(), res.input)} -> ${path.relative(process.cwd(), res.output)}`);
      } else if (res.status === 'skipped') {
        console.warn(`skipped: ${res.path} (${res.reason})`);
      } else {
        console.error(`error converting ${res.path}:`, res.error);
      }
      results.push(res);
    }
  }

  const summary = results.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {}
  );

  console.log('\n--- conversion summary ---');
  Object.entries(summary).forEach(([k, v]) => console.log(`${k}: ${v}`));
  console.log('Done.');
})();
