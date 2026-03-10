/*
 Simple client-side ID card generator that draws to an HTML5 canvas.
 - No server required.
 - You can host this on GitHub Pages.
*/

const canvas = document.getElementById('idCanvas');
const ctx = canvas.getContext('2d');

const fullNameInput = document.getElementById('fullName');
const universityInput = document.getElementById('university');
const yearInput = document.getElementById('year');
const dobInput = document.getElementById('dob');
const idInput = document.getElementById('idNumber');
const photoInput = document.getElementById('photoInput');

const generateBtn = document.getElementById('generateBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const resetBtn = document.getElementById('resetBtn');

let uploadedImage = null;

photoInput.addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) { uploadedImage = null; return; }
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = () => { uploadedImage = img; };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(f);
});

function drawId() {
  // Clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Background
  const w = canvas.width, h = canvas.height;
  // Background gradient
  const g = ctx.createLinearGradient(0,0,w,0);
  g.addColorStop(0, '#0b6b5a');
  g.addColorStop(1, '#0f9a7f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // White card area
  const margin = 40;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, margin, margin, w - 2*margin, h - 2*margin, 18, true, false);

  // Left photo box
  const photoBoxX = margin + 30;
  const photoBoxY = margin + 40;
  const photoBoxW = 260;
  const photoBoxH = 340;

  // draw photo frame
  ctx.fillStyle = '#f2f2f2';
  roundRect(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 12, true, false);
  // inner border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ddd';
  roundRect(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 12, false, true);

  // If uploaded image, draw it cropped to box
  if (uploadedImage) {
    // cover-fit logic
    const img = uploadedImage;
    const sw = img.width, sh = img.height;
    const dw = photoBoxW, dh = photoBoxH;
    const r = Math.max(dw/sw, dh/sh);
    const sx = Math.max(0, (sw - dw/r)/2);
    const sy = Math.max(0, (sh - dh/r)/2);
    ctx.save();
    // clip to rounded rect
    roundedClip(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 12);
    ctx.drawImage(img, sx, sy, sw - 2*sx, sh - 2*sy, photoBoxX, photoBoxY, dw, dh);
    ctx.restore();
  } else {
    // placeholder text
    ctx.fillStyle = '#999';
    ctx.font = '16px sans-serif';
    ctx.fillText('Upload photo', photoBoxX + 20, photoBoxY + photoBoxH/2);
  }

  // Right side: text
  const textX = photoBoxX + photoBoxW + 40;
  const textY = photoBoxY + 10;

  // Logo area (top-right)
  const logoW = 160, logoH = 80;
  const logoX = w - margin - logoW - 20;
  const logoY = margin + 30;
  ctx.fillStyle = '#0b6b5a';
  roundRect(ctx, logoX, logoY, logoW, logoH, 8, false, true);
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#0b6b5a';
  ctx.fillText('PALSC', logoX + 12, logoY + 32);
  ctx.font = '12px sans-serif';
  ctx.fillText('Pan-African Law Students Confederation', logoX + 12, logoY + 52);

  // Member details
  ctx.fillStyle = '#111';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText(fullNameInput.value || 'Full Name', textX, textY + 70);

  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText((universityInput.value || 'University of Example').toUpperCase(), textX, textY + 110);

  // small details box at lower-right
  ctx.font = '16px monospace';
  ctx.fillStyle = '#0b6b5a';
  const detailsY = photoBoxY + photoBoxH - 10;
  ctx.fillText('ID: ' + (idInput.value || 'PALSC-0000'), textX, detailsY - 30);
  ctx.fillStyle = '#333';
  ctx.fillText('DOB: ' + (dobInput.value || 'YYYY-MM-DD'), textX, detailsY);
  ctx.fillText('Year: ' + (yearInput.value || '----'), textX + 260, detailsY);

  // small footer strip
  ctx.fillStyle = '#0b6b5a';
  ctx.fillRect(margin, h - margin - 50, w - 2*margin, 50);
  ctx.fillStyle = '#fff';
  ctx.font = '14px sans-serif';
  ctx.fillText('Member ID — Pan-African Law Students Confederation', margin + 18, h - margin - 22);
}

// Helper to draw rounded rect
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Clip to rounded rect
function roundedClip(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.clip();
}

generateBtn.addEventListener('click', () => {
  drawId();
});

// Download PNG
downloadPngBtn.addEventListener('click', () => {
  drawId();
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = (idInput.value || 'palsc-id') + '.png';
  a.click();
});

// Download PDF via jsPDF
downloadPdfBtn.addEventListener('click', async () => {
  drawId();
  // use jspdf
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [canvas.width, canvas.height]
  });
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save((idInput.value || 'palsc-id') + '.pdf');
});

// reset handler
resetBtn.addEventListener('click', () => {
  uploadedImage = null;
  setTimeout(drawId, 50);
});

// initial draw
drawId();
