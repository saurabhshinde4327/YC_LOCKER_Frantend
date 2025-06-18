const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [192, 512];
const ICON_COLOR = '#2563eb'; // Blue-600 from Tailwind

async function generateIcons() {
  // Create icons directory if it doesn't exist
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate a square SVG with "YCIS" text
  const svgBuffer = Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="${ICON_COLOR}"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold" font-size="120" fill="white">YCIS</text>
    </svg>
  `);

  // Generate icons for each size
  for (const size of ICON_SIZES) {
    await sharp(svgBuffer)
      .resize(size, size)
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
  }

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 