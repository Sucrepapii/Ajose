import fs from 'fs';
import path from 'path';

const bgPath = path.resolve('public', 'marketing', 'architectural-qr-bg.jpg');
const qrPath = path.resolve('public', 'qr-codes', 'ajose-signup-qr-classic.png');

const bgBase64 = fs.readFileSync(bgPath).toString('base64');
const qrBase64 = fs.readFileSync(qrPath).toString('base64');

const W = 1080;
const H = 1350;

const qrBoxSize = 480;
const qrBoxX = (W - qrBoxSize) / 2; // 300
const qrBoxY = 270;
const frameRadius = 40;

// Broken frame with gap at top
// gapWidth = ~260, gapLeft = 410, gapRight = 670
const gapLeft = 410;
const gapRight = 670;

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bottomVignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="45%" stop-color="#050E09" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#020604" stop-opacity="0.96" />
    </linearGradient>
    <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&amp;display=swap');
    text {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }
  </style>

  <!-- 1. Architectural Dusk Backdrop -->
  <image href="data:image/jpeg;base64,${bgBase64}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" />

  <!-- 2. Dark Vignette Gradients for Contrast -->
  <rect x="0" y="0" width="${W}" height="280" fill="url(#topVignette)" />
  <rect x="0" y="420" width="${W}" height="930" fill="url(#bottomVignette)" />

  <!-- 3. Top-Right Brand Signature -->
  <g text-anchor="end" fill="#FFFFFF">
    <text x="1016" y="80" font-size="26" font-weight="900" letter-spacing="2">ÀJỌṢE</text>
    <text x="1016" y="104" font-size="12" font-weight="700" letter-spacing="3" fill="#A7F3D0">ROTATIONAL WEALTH</text>
    <text x="1016" y="122" font-size="11" font-weight="600" letter-spacing="2" fill="rgba(255,255,255,0.7)">PEER-TO-PEER THRIFT</text>
  </g>

  <!-- 4. Center 'SCAN ME' Frame with Top Cutout -->
  <path d="
    M ${gapRight} ${qrBoxY}
    H ${qrBoxX + qrBoxSize - frameRadius}
    A ${frameRadius} ${frameRadius} 0 0 1 ${qrBoxX + qrBoxSize} ${qrBoxY + frameRadius}
    V ${qrBoxY + qrBoxSize - frameRadius}
    A ${frameRadius} ${frameRadius} 0 0 1 ${qrBoxX + qrBoxSize - frameRadius} ${qrBoxY + qrBoxSize}
    H ${qrBoxX + frameRadius}
    A ${frameRadius} ${frameRadius} 0 0 1 ${qrBoxX} ${qrBoxY + qrBoxSize - frameRadius}
    V ${qrBoxY + frameRadius}
    A ${frameRadius} ${frameRadius} 0 0 1 ${qrBoxX + frameRadius} ${qrBoxY}
    H ${gapLeft}
  " fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" />

  <!-- 'SCAN ME' Cutout Text -->
  <text x="540" y="${qrBoxY + 12}" text-anchor="middle" font-size="44" font-weight="900" letter-spacing="3" fill="#FFFFFF">SCAN ME</text>

  <!-- 5. Inner Solid White Card & QR Code -->
  <rect x="330" y="310" width="420" height="420" rx="28" fill="#FFFFFF" filter="url(#cardShadow)" />
  <image href="data:image/png;base64,${qrBase64}" x="350" y="330" width="380" height="380" />

  <!-- 6. Typography & Invitation Copy -->
  <g text-anchor="middle" fill="#FFFFFF">
    <text x="540" y="825" font-size="50" font-weight="900" letter-spacing="-0.5">Àjọṣe Wealth Circles</text>
    <text x="540" y="885" font-size="32" font-weight="500" fill="rgba(255,255,255,0.92)">You are cordially invited to build disciplined</text>
    <text x="540" y="935" font-size="34" font-weight="800" fill="#FFFFFF">and LASTING WEALTH</text>

    <!-- Bottom CTA -->
    <text x="540" y="1255" font-size="20" font-weight="800" letter-spacing="3" fill="#FFFFFF">SCAN THE QR CODE TO GET STARTED</text>
    <text x="540" y="1290" font-size="13" font-weight="600" letter-spacing="1.5" fill="#34D399">WWW.AJOSE.NG • ZERO HIDDEN FEES • AUTOMATED ROTATION</text>
  </g>
</svg>`;

fs.writeFileSync(path.resolve('public', 'marketing', 'ajose-scan-me-poster.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.resolve('C:\\Users\\icmas\\.gemini\\antigravity\\brain\\0143c250-4fe0-47e9-972c-42476a8f8a6d', 'ajose-scan-me-poster.svg'), svgContent, 'utf-8');

console.log('SVG Poster generated successfully at 1080x1350!');
