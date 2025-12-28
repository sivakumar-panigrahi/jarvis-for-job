import sharp from 'sharp';
import fs from 'fs';
import pngToIco from 'png-to-ico';

async function gen() {
  const svgPath = 'public/favicon.svg';
  const outPng = 'public/favicon-32.png';
  const outIco = 'public/favicon.ico';

  if (!fs.existsSync(svgPath)) {
    console.error('SVG source not found:', svgPath);
    process.exit(1);
  }

  const svg = fs.readFileSync(svgPath);

  // Generate 32x32 PNG
  await sharp(svg).resize(32, 32).png().toFile(outPng);
  console.log('Wrote', outPng);

  // Convert PNG to ICO (provide file path)
  const icoBuffer = await pngToIco([outPng]);
  fs.writeFileSync(outIco, icoBuffer);
  console.log('Wrote', outIco);
}

gen().catch(err => {
  console.error(err);
  process.exit(1);
});
