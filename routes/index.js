const express  = require('express');
const router   = express.Router();
const siteData = require('../data/siteData');
const lop6Data = require('../data/lop6Data');

/* ── Mind-map SVG helper ── */
function renderMindmap(mm, accentColor) {
  const branches = mm.branches;
  const totalBranches = branches.length;
  // layout: center at (300, middle), branches spread left & right
  const W = 680, centerX = 300, centerR = 54;
  // split branches: left half left side, right half right side
  const leftBranches  = branches.slice(0, Math.ceil(totalBranches / 2));
  const rightBranches = branches.slice(Math.ceil(totalBranches / 2));

  const rowH = 90;
  const totalH = Math.max(leftBranches.length, rightBranches.length, 1) * rowH + 80;
  const centerY = totalH / 2;

  let svg = `<svg class="mindmap-svg" viewBox="0 0 ${W} ${totalH}" xmlns="http://www.w3.org/2000/svg">`;

  function branchColor(c) {
    return c || accentColor || '#ff7a1a';
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function drawBranch(branch, bx, by, side) {
    const col = branchColor(branch.color);
    const nodeW = 160, nodeH = 36;
    const nx = side === 'left' ? bx - nodeW : bx;

    // branch label box
    svg += `<rect x="${nx}" y="${by - nodeH/2}" width="${nodeW}" height="${nodeH}" rx="9" fill="${hexToRgba(col, 0.13)}" stroke="${col}" stroke-width="1.5"/>`;
    svg += `<text x="${nx + nodeW/2}" y="${by + 1}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="12" font-weight="700" fill="${col}">${branch.label}</text>`;

    // line from center to branch
    const lineX1 = side === 'left' ? centerX - centerR : centerX + centerR;
    const lineX2 = side === 'left' ? nx + nodeW : nx;
    svg += `<path d="M${lineX1} ${centerY} C${(lineX1+lineX2)/2} ${centerY} ${(lineX1+lineX2)/2} ${by} ${lineX2} ${by}" fill="none" stroke="${col}" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>`;

    // children
    if (branch.children && branch.children.length) {
      const childW = 150, childH = 28, childGap = 34;
      const totalChildH = branch.children.length * childGap;
      const startChildY = by - totalChildH / 2 + childGap / 2;
      branch.children.forEach((child, ci) => {
        const cy2 = startChildY + ci * childGap;
        const cx2 = side === 'left' ? nx - childW - 12 : nx + nodeW + 12;
        const lineEndX = side === 'left' ? cx2 + childW : cx2;
        const lineStartX = side === 'left' ? nx : nx + nodeW;
        svg += `<line x1="${lineStartX}" y1="${by}" x2="${lineEndX}" y2="${cy2}" stroke="${col}" stroke-width="1" opacity="0.35"/>`;
        svg += `<rect x="${cx2}" y="${cy2 - childH/2}" width="${childW}" height="${childH}" rx="7" fill="white" stroke="${col}" stroke-width="1" opacity="0.7"/>`;
        const shortChild = child.length > 22 ? child.substring(0,22)+'…' : child;
        svg += `<text x="${cx2 + childW/2}" y="${cy2 + 1}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="10.5" fill="#444">${shortChild}</text>`;
      });
    }
  }

  // Draw left branches
  const leftStep = totalH / (leftBranches.length + 1);
  leftBranches.forEach((branch, i) => {
    const by = leftStep * (i + 1);
    drawBranch(branch, centerX - 80, by, 'left');
  });

  // Draw right branches
  const rightStep = totalH / (rightBranches.length + 1);
  rightBranches.forEach((branch, i) => {
    const by = rightStep * (i + 1);
    drawBranch(branch, centerX + 80, by, 'right');
  });

  // Center node (drawn last so it's on top)
  const label = mm.center.length > 18 ? mm.center.substring(0,18)+'…' : mm.center;
  svg += `<ellipse cx="${centerX}" cy="${centerY}" rx="${centerR}" ry="28" fill="${accentColor || '#ff7a1a'}" />`;
  svg += `<text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="11.5" font-weight="800" fill="white">${label}</text>`;

  svg += '</svg>';
  return svg;
}


router.get('/', (req, res) => {
  res.render('index', { pageTitle: 'Trang chủ', data: { ...siteData, lop6Chapters: lop6Data.chapters } });
});

router.get('/games/dien-bien-phu', (req, res) => {
  res.render('games/dien-bien-phu', {
    pageTitle: 'Điện Biên Phủ 1954 – Game Lịch Sử',
    brand: siteData.brand
  });
});

router.get('/games/ai-la-nhan-vat', (req, res) => {
  res.render('games/ai-la-nhan-vat', {
    pageTitle: 'Ai là nhân vật? – Game Đoán Lịch Sử',
    brand: siteData.brand
  });
});

router.get('/games/flashcard', (req, res) => {
  res.render('games/flashcard', {
    pageTitle: 'Flashcard Quizlet – Ôn Lịch Sử',
    brand: siteData.brand
  });
});

router.get('/lop6/bai/:number', (req, res) => {
  const number = parseInt(req.params.number);
  let lesson = null, chapter = null;
  let allLessons = [];

  // Gom tất cả bài theo thứ tự
  lop6Data.chapters.forEach(ch => {
    ch.lessons.forEach(l => {
      allLessons.push({ ...l, chapterId: ch.id });
    });
  });

  // Tìm bài theo số
  const idx = allLessons.findIndex(l => l.number === number);
  if (idx === -1) return res.status(404).render('404', { pageTitle: '404', brand: siteData.brand });

  lesson = allLessons[idx];
  chapter = lop6Data.chapters.find(ch => ch.id === lesson.chapterId);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  res.render('grades/bai', {
    pageTitle: `Bài ${lesson.number}. ${lesson.title} – Lịch sử 6`,
    brand: siteData.brand,
    lesson,
    chapter,
    prevLesson,
    nextLesson,
    allChapters: lop6Data.chapters,
    currentYear: new Date().getFullYear()
  });
});

router.get('/lop6', (req, res) => {
  res.render('grades/lop6', {
    pageTitle: 'Lịch sử 6 – Kết nối tri thức',
    brand: siteData.brand,
    chapters: lop6Data.chapters,
    meta: lop6Data.meta,
    renderMindmap
  });
});
router.get('/luoc-su', (req, res) => {
  res.render('luoc-su', {
    pageTitle: 'Lược sử Việt Nam – Trạm Sử Meta',
    brand: siteData.brand
  });
});
module.exports = router;
