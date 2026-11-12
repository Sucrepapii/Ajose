import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'qr-codes');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const targets = [
  {
    name: 'ajose-website-qr',
    url: 'https://ajose.ng',
    title: 'Àjọṣe Official Website',
  },
  {
    name: 'ajose-signup-qr',
    url: 'https://ajose.ng/signup',
    title: 'Àjọṣe Free Registration & Sign Up',
  },
];

const styles = [
  {
    suffix: '', // default brand emerald
    dark: '#0A5C36', // Brand emerald
    light: '#FFFFFF',
    label: 'Brand Emerald',
  },
  {
    suffix: '-dark',
    dark: '#0D3B1E', // Dark Forest
    light: '#FFFFFF',
    label: 'Dark Forest',
  },
  {
    suffix: '-classic',
    dark: '#000000', // Standard Black for maximum print contrast
    light: '#FFFFFF',
    label: 'Classic High Contrast Black',
  },
];

async function generateAll() {
  const generated = [];

  for (const target of targets) {
    for (const style of styles) {
      const baseFilename = `${target.name}${style.suffix}`;
      const pngPath = path.join(outDir, `${baseFilename}.png`);
      const svgPath = path.join(outDir, `${baseFilename}.svg`);

      // 1. High-Res PNG (1024x1024)
      await QRCode.toFile(pngPath, target.url, {
        width: 1024,
        margin: 2,
        color: {
          dark: style.dark,
          light: style.light,
        },
        errorCorrectionLevel: 'H', // High error correction (30% redundancy)
      });

      // 2. Vector SVG (crisp for print/banners)
      const svgString = await QRCode.toString(target.url, {
        type: 'svg',
        margin: 2,
        color: {
          dark: style.dark,
          light: style.light,
        },
        errorCorrectionLevel: 'H',
      });
      fs.writeFileSync(svgPath, svgString, 'utf-8');

      // 3. Data URL for inlining
      const dataUrl = await QRCode.toDataURL(target.url, {
        width: 512,
        margin: 2,
        color: {
          dark: style.dark,
          light: style.light,
        },
        errorCorrectionLevel: 'H',
      });

      generated.push({
        name: baseFilename,
        targetTitle: target.title,
        url: target.url,
        styleLabel: style.label,
        pngPath: `/qr-codes/${baseFilename}.png`,
        svgPath: `/qr-codes/${baseFilename}.svg`,
        dataUrl,
      });

      console.log(`Generated: ${baseFilename}.png & ${baseFilename}.svg`);
    }
  }

  // Also write a JSON manifest for easily referencing
  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(generated, null, 2),
    'utf-8'
  );

  console.log('Successfully generated all QR codes!');
}

generateAll().catch(console.error);
