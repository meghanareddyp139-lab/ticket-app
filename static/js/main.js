/* ── Department Config ───────────────────────────────── */
const DEPT_CONFIG = {
  'Technical Support': {
    icon: '🔧', color: '#6c63ff',
    desc: 'Hardware, software, drivers, installations, and technical troubleshooting for all devices.'
  },
  'Billing and Payments': {
    icon: '💳', color: '#f59e0b',
    desc: 'Invoice queries, payment issues, refunds, subscription management and billing corrections.'
  },
  'Account Management': {
    icon: '🔐', color: '#22d3ee',
    desc: 'Password resets, account access, profile updates, permissions and security issues.'
  },
  'Software Installation': {
    icon: '💾', color: '#34d399',
    desc: 'Installing, updating and configuring software, licenses, and enterprise applications.'
  },
  'Network and Connectivity': {
    icon: '📡', color: '#a78bfa',
    desc: 'VPN, Wi-Fi, internet connectivity, firewall, remote access and network configuration.'
  },
  'Hardware Support': {
    icon: '🖥️', color: '#f87171',
    desc: 'Physical device issues including monitors, keyboards, printers, and peripheral devices.'
  },
  'Data Recovery': {
    icon: '🗄️', color: '#fb923c',
    desc: 'Lost files, backup restoration, corrupted data, storage issues and recovery solutions.'
  },
  'Security and Compliance': {
    icon: '🛡️', color: '#4ade80',
    desc: 'Virus/malware issues, data protection, compliance requirements and security incidents.'
  }
};

const DEFAULT_DEPT = { icon: '🏢', color: '#6c63ff', desc: 'General IT support and ticket routing.' };

function getDeptConfig(name) {
  for (const [key, val] of Object.entries(DEPT_CONFIG)) {
    if (name && name.toLowerCase().includes(key.toLowerCase().split(' ')[0].toLowerCase())) return val;
  }
  return DEPT_CONFIG[name] || DEFAULT_DEPT;
}

/* ── Navbar scroll effect ────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Animate particles ───────────────────────────────── */
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 80 + 20;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%; top:${Math.random() * 100}%;
      animation-delay:${Math.random() * 8}s;
      animation-duration:${6 + Math.random() * 8}s;
      opacity:${Math.random() * 0.12 + 0.03};
    `;
    container.appendChild(p);
  }
}

/* ── Character counter ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  createParticles();

  const ta = document.getElementById('ticketText');
  ta.addEventListener('input', () => {
    document.getElementById('charCount').textContent = ta.value.length;
  });

  loadMetrics();
  buildDeptGrid();
  initMap();
});

/* ── Fill example text ───────────────────────────────── */
function fillExample(text) {
  const ta = document.getElementById('ticketText');
  ta.value = text;
  document.getElementById('charCount').textContent = text.length;
  ta.focus();
}

/* ── Classify ticket ─────────────────────────────────── */
async function classifyTicket() {
  const text = document.getElementById('ticketText').value.trim();
  if (!text) {
    shake(document.getElementById('ticketText'));
    return;
  }

  const language = document.getElementById('ticketLanguage').value;

  const btn      = document.getElementById('classifyBtn');
  const btnText  = document.getElementById('btnText');
  const btnLoad  = document.getElementById('btnLoader');
  btnText.classList.add('hidden');
  btnLoad.classList.remove('hidden');
  btn.disabled = true;

  try {
    const res  = await fetch('/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });
    const data = await res.json();
    data.language = language;
    showResult(data);
  } catch (e) {
    alert('Error connecting to the AI server. Please try again.');
  } finally {
    btnText.classList.remove('hidden');
    btnLoad.classList.add('hidden');
    btn.disabled = false;
  }
}

function showResult(data) {
  document.getElementById('resultPlaceholder').classList.add('hidden');
  const output = document.getElementById('resultOutput');
  output.classList.remove('hidden');

  const cfg = getDeptConfig(data.department);

  // Department card
  document.getElementById('deptIcon').textContent  = cfg.icon;
  document.getElementById('deptName').textContent  = data.department;
  document.getElementById('confBadge').textContent = data.confidence.toFixed(1) + '%';
  document.getElementById('deptCard').classList.add('classified');

  // Style confidence badge by score
  const badge = document.getElementById('confBadge');
  if (data.confidence >= 70) badge.style.cssText = 'background:rgba(52,211,153,.15);border:1.5px solid rgba(52,211,153,.3);color:#34d399;font-size:1.3rem;font-weight:800;padding:10px 18px;border-radius:10px;';
  else if (data.confidence >= 40) badge.style.cssText = 'background:rgba(251,191,36,.15);border:1.5px solid rgba(251,191,36,.3);color:#fbbf24;font-size:1.3rem;font-weight:800;padding:10px 18px;border-radius:10px;';
  else badge.style.cssText = 'background:rgba(248,113,113,.15);border:1.5px solid rgba(248,113,113,.3);color:#f87171;font-size:1.3rem;font-weight:800;padding:10px 18px;border-radius:10px;';

  // ── Language badge ───────────────────────────────────────
  let langBadge = document.getElementById('langBadge');
  if (!langBadge) {
    langBadge = document.createElement('div');
    langBadge.id = 'langBadge';
    langBadge.className = 'lang-badge';
    document.getElementById('deptCard').querySelector('.dept-info').appendChild(langBadge);
  }
  langBadge.innerHTML = `🌐 ${data.language || 'English'}`;

  // ── Dept description line ────────────────────────────────
  let deptDesc = document.getElementById('deptDesc');
  if (!deptDesc) {
    deptDesc = document.createElement('div');
    deptDesc.id = 'deptDesc';
    deptDesc.style.cssText = 'font-size:0.88rem;color:#94a3b8;margin-top:6px;line-height:1.5;';
    document.getElementById('deptCard').appendChild(deptDesc);
  }
  deptDesc.textContent = cfg.desc;

  // ── "View Department" button ─────────────────────────────
  let viewBtn = document.getElementById('viewDeptBtn');
  if (!viewBtn) {
    viewBtn = document.createElement('button');
    viewBtn.id = 'viewDeptBtn';
    viewBtn.style.cssText = `
      margin-top:14px; width:100%; padding:11px 0;
      background:linear-gradient(135deg,${cfg.color}22,${cfg.color}11);
      border:1.5px solid ${cfg.color}55; border-radius:10px;
      color:${cfg.color}; font-size:0.9rem; font-weight:600;
      cursor:pointer; transition:all 0.2s; font-family:Inter,sans-serif;
      letter-spacing:0.02em;
    `;
    viewBtn.onmouseenter = () => { viewBtn.style.background = `linear-gradient(135deg,${cfg.color}44,${cfg.color}22)`; };
    viewBtn.onmouseleave = () => { viewBtn.style.background = `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`; };
    document.getElementById('deptCard').parentElement.appendChild(viewBtn);
  }
  viewBtn.textContent = `${cfg.icon}  View ${data.department} Department  ↓`;
  viewBtn.style.borderColor = cfg.color + '55';
  viewBtn.style.color = cfg.color;
  viewBtn.onclick = () => scrollToDept(data.department, cfg.color);

  // Probability bars — show real model % per issue type
  const bars = document.getElementById('probBars');
  bars.innerHTML = '';

  const topProbs = data.all_probs.slice(0, 6);

  // Use raw model probabilities as the label (true % per class)
  // Normalize bar WIDTH to max so visual differences are clear even when values are close
  const maxProb = topProbs[0].prob; // already sorted descending

  topProbs.forEach((item, idx) => {
    const isTop    = idx === 0;
    const rawPct   = item.prob.toFixed(1);                        // real model % label
    const barWidth = ((item.prob / maxProb) * 100).toFixed(1);   // bar fill scaled to max
    bars.innerHTML += `
      <div class="prob-bar-row">
        <div class="prob-bar-label">
          <span>${getDeptConfig(item.label).icon} ${item.label}</span>
          <span>${rawPct}%</span>
        </div>
        <div class="prob-bar-track">
          <div class="prob-bar-fill ${isTop ? 'top' : ''}" style="width:0%" data-width="${barWidth}%"></div>
        </div>
      </div>`;
  });

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.prob-bar-fill').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 80);

  // Highlight matching dept card in Departments section (non-scrolling)
  highlightDeptCard(data.department, cfg.color);

  // Scroll to result
  output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Highlight the matched dept card ─────────────────── */
function highlightDeptCard(name, color) {
  // Clear previous highlights
  document.querySelectorAll('.dept-card').forEach(c => {
    c.classList.remove('dept-selected', 'dept-matched');
    c.style.borderTopColor = 'rgba(255,255,255,0.07)';
    c.style.borderTopWidth = '1px';
    c.style.boxShadow = '';
    c.style.transform = '';
  });

  // Find and highlight matched card
  const card = document.querySelector(`.dept-card[data-dept="${name}"]`);
  if (card) {
    card.classList.add('dept-selected', 'dept-matched');
    card.style.borderTopColor = color;
    card.style.borderTopWidth = '3px';
    card.style.boxShadow = `0 0 0 2px ${color}55, 0 12px 40px ${color}44`;
    card.style.transform = 'translateY(-4px)';
    selectedDept = name;
  }
}

/* ── Scroll to dept card and pulse ───────────────────── */
function scrollToDept(name, color) {
  const card = document.querySelector(`.dept-card[data-dept="${name}"]`);
  const section = document.getElementById('departments');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (card) {
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Pulse animation
      card.style.transition = 'box-shadow 0.15s, transform 0.15s';
      card.style.transform = 'translateY(-8px) scale(1.03)';
      card.style.boxShadow = `0 0 0 3px ${color}88, 0 20px 60px ${color}66`;
      setTimeout(() => {
        card.style.transform = 'translateY(-4px) scale(1)';
        card.style.boxShadow = `0 0 0 2px ${color}55, 0 12px 40px ${color}44`;
      }, 250);
    }, 500);
  }
}

function shake(el) {
  el.style.animation = 'none';
  el.style.borderColor = '#f87171';
  setTimeout(() => { el.style.borderColor = ''; }, 1000);
}

/* ── Load & Render Metrics ───────────────────────────── */
async function loadMetrics() {
  try {
    const res  = await fetch('/metrics');
    const data = await res.json();

    // Hero stats
    animateNumber('statPrecision', data.precision, '%');
    animateNumber('statRecall',    data.recall,    '%');
    animateNumber('statF1',        data.f1,        '%');

    // Analytics section
    animateNumber('mPrecision', data.precision, '%');
    animateNumber('mRecall',    data.recall,    '%');
    animateNumber('mF1',        data.f1,        '%');

    setTimeout(() => {
      animateBar('barPrecision', data.precision);
      animateBar('barRecall',    data.recall);
      animateBar('barF1',        data.f1);
    }, 300);

    // Best card
    const b = data.best;
    document.getElementById('bestBody').innerHTML = `
      <div class="best-name">${getDeptConfig(b.name).icon} ${b.name}</div>
      <div class="best-stats">
        <div class="best-kpi"><div class="best-kpi-val">${b.precision}%</div><div class="best-kpi-lbl">Precision</div></div>
        <div class="best-kpi"><div class="best-kpi-val">${b.recall}%</div><div class="best-kpi-lbl">Recall</div></div>
        <div class="best-kpi"><div class="best-kpi-val">${b.f1}%</div><div class="best-kpi-lbl">F1-Score</div></div>
      </div>`;

    // Per-class table
    const tbody = document.getElementById('metricsBody');
    tbody.innerHTML = data.per_class
      .sort((a, b_) => b_.f1 - a.f1)
      .map(row => {
        const cfg   = getDeptConfig(row.name);
        const isBest = row.name === b.name;
        return `<tr class="${isBest ? 'best-row' : ''}">
          <td>${cfg.icon} ${row.name} ${isBest ? '🏆' : ''}</td>
          <td>${row.precision}%</td>
          <td>${row.recall}%</td>
          <td>
            <div class="f1-bar">
              <span>${row.f1}%</span>
              <div class="f1-mini-bar"><div class="f1-mini-fill" style="width:${row.f1}%"></div></div>
            </div>
          </td>
          <td>${row.support.toLocaleString()}</td>
        </tr>`;
      }).join('');
  } catch (e) {
    console.error('Failed to load metrics:', e);
  }
}

function animateNumber(id, target, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = target / 60;
  const interval = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start.toFixed(1) + suffix;
    if (start >= target) clearInterval(interval);
  }, 16);
}

function animateBar(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = pct + '%';
}

/* ── Toast notification ──────────────────────────────── */
function showToast(msg, color = '#6c63ff') {
  let toast = document.getElementById('dept-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dept-toast';
    toast.style.cssText = `
      position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(100px);
      background:#1e1e2e; border:1.5px solid ${color}55;
      color:#fff; padding:14px 28px; border-radius:14px;
      font-family:Inter,sans-serif; font-size:0.95rem; font-weight:500;
      box-shadow:0 8px 32px rgba(0,0,0,.4); z-index:9999;
      transition:transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.3s;
      opacity:0; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.borderColor = color + '88';
  toast.style.boxShadow = `0 8px 32px ${color}33`;
  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    toast.style.opacity = '0';
  }, 2800);
}

/* ── Build department grid ───────────────────────────── */
let selectedDept = null;

function buildDeptGrid() {
  const grid = document.getElementById('deptGrid');
  const entries = Object.entries(DEPT_CONFIG);
  grid.innerHTML = entries.map(([name, cfg]) => `
    <div class="dept-card" style="--dept-color:${cfg.color}" data-dept="${name}">
      <div class="dept-card-icon">${cfg.icon}</div>
      <div class="dept-card-name">${name}</div>
      <div class="dept-card-desc">${cfg.desc}</div>
      <div class="dept-card-tag"
           style="background:${cfg.color}22;color:${cfg.color};border-color:${cfg.color}44;cursor:pointer;"
           onclick="selectDept(event,'${name}','${cfg.color}','${cfg.icon}')">
        ● Active
      </div>
    </div>`).join('');

  // Add top border color per card
  document.querySelectorAll('.dept-card').forEach((card, i) => {
    const color = Object.values(DEPT_CONFIG)[i]?.color || '#6c63ff';
    card.style.setProperty('--dept-color', color);
    card.addEventListener('mouseenter', () => {
      card.style.borderTopColor = color;
      card.style.borderTopWidth = '3px';
    });
    card.addEventListener('mouseleave', () => {
      if (card.dataset.dept !== selectedDept) {
        card.style.borderTopColor = 'rgba(255,255,255,0.07)';
        card.style.borderTopWidth = '1px';
      }
    });
  });
}

function selectDept(event, name, color, icon) {
  event.stopPropagation();

  // Deselect all cards
  document.querySelectorAll('.dept-card').forEach(c => {
    c.classList.remove('dept-selected');
    c.style.borderTopColor = 'rgba(255,255,255,0.07)';
    c.style.borderTopWidth = '1px';
    c.style.boxShadow = '';
  });

  // Highlight selected card
  const card = document.querySelector(`.dept-card[data-dept="${name}"]`);
  if (card) {
    card.classList.add('dept-selected');
    card.style.borderTopColor = color;
    card.style.borderTopWidth = '3px';
    card.style.boxShadow = `0 0 0 2px ${color}44, 0 8px 32px ${color}33`;
  }

  selectedDept = name;

  // Show toast
  showToast(`${icon} ${name} — Scroll down to classify your ticket!`, color);

  // Scroll to classify section and focus textarea
  const classifySection = document.getElementById('classify');
  if (classifySection) {
    setTimeout(() => {
      classifySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const ta = document.getElementById('ticketText');
        if (ta) ta.focus();
      }, 700);
    }, 300);
  }
}

/* ── Leaflet Map ─────────────────────────────────────── */
let map, markers = [];

const LOCATIONS = [
  { lat: 28.6139, lng: 77.2090, name: 'New Delhi HQ',       addr: 'Connaught Place, New Delhi' },
  { lat: 19.0760, lng: 72.8777, name: 'Mumbai Office',      addr: 'BKC, Mumbai' },
  { lat: 12.9716, lng: 77.5946, name: 'Bengaluru Tech Hub', addr: 'MG Road, Bengaluru' },
  { lat: 17.3850, lng: 78.4867, name: 'Hyderabad Center',   addr: 'HITEC City, Hyderabad' },
];

function initMap() {
  map = L.map('map', { zoomControl: true, scrollWheelZoom: false })
         .setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#6c63ff,#22d3ee);
      transform:rotate(-45deg);border:3px solid #fff;
      box-shadow:0 4px 16px rgba(108,99,255,.5);
    "></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36]
  });

  LOCATIONS.forEach((loc, i) => {
    const marker = L.marker([loc.lat, loc.lng], { icon })
      .addTo(map)
      .bindPopup(`<b style='font-family:Inter,sans-serif'>${loc.name}</b><br/><span style='color:#64748b;font-size:.85rem'>${loc.addr}</span>`);
    markers.push(marker);
    if (i === 0) marker.openPopup();
  });
}

function focusLocation(el) {
  document.querySelectorAll('.location-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const lat = parseFloat(el.dataset.lat);
  const lng = parseFloat(el.dataset.lng);
  map.flyTo([lat, lng], 13, { duration: 1.5 });
  const idx = [...el.parentElement.children].indexOf(el);
  if (markers[idx]) markers[idx].openPopup();
}

/* ── Classify on Enter (Ctrl+Enter) ─────────────────── */
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') classifyTicket();
});
