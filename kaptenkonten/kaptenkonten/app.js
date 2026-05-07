// ===================== STATE =====================
let selectedPlatform = 'Instagram';
let selectedTone = 'Santai & Friendly';
let selectedAdsPlatform = 'facebook';
let selectedFormat = 'Primary Text (teks utama iklan feed)';
let selectedObjective = 'penjualan langsung';

// ===================== MODE TABS =====================
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const mode = tab.dataset.mode;
    document.getElementById('captionMode').style.display = mode === 'caption' ? 'block' : 'none';
    document.getElementById('adsMode').style.display = mode === 'ads' ? 'block' : 'none';
  });
});

// ===================== CAPTION MODE =====================
document.querySelectorAll('.platform-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPlatform = btn.dataset.platform;
  });
});

document.querySelectorAll('.tone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTone = btn.dataset.tone;
  });
});

document.getElementById('captionTopic').addEventListener('input', function () {
  document.getElementById('captionCharCount').textContent = this.value.length;
});

document.getElementById('captionBtn').addEventListener('click', generateCaptions);

async function generateCaptions() {
  const topic = document.getElementById('captionTopic').value.trim();
  if (!topic) { showError('captionResults', 'Tolong isi deskripsi konten dulu ya!'); return; }

  const emoji = document.getElementById('emojiSelect').value;
  const hashtag = document.getElementById('hashtagSelect').value;
  const btn = document.getElementById('captionBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Generating...';
  showLoading('captionResults', 'AI sedang menulis 3 caption terbaik untukmu...');

  const prompt = `Kamu adalah copywriter Indonesia yang ahli membuat caption media sosial yang engaging dan viral.

Buat TEPAT 3 variasi caption untuk ${selectedPlatform} dengan ketentuan:
- Topik/Produk: ${topic}
- Tone/gaya: ${selectedTone}
- Bahasa: Indonesia yang natural dan tidak kaku
- ${emoji}
- ${hashtag}

Format output HARUS persis seperti ini (jangan tambah penjelasan lain):
CAPTION 1:
[isi caption pertama]

CAPTION 2:
[isi caption kedua]

CAPTION 3:
[isi caption ketiga]

Buat setiap caption unik, berbeda pendekatan, dan benar-benar siap pakai. Sesuaikan panjang caption dengan karakteristik platform ${selectedPlatform}.`;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || 'Server error'); }
    const data = await response.json();
    const captions = parseSections(data.text, 'CAPTION');
    if (captions.length === 0) { showError('captionResults', 'Gagal memparse caption. Coba lagi ya!'); }
    else { renderCards('captionResults', captions, `${selectedPlatform} · ${selectedTone}`, 'Variasi'); }
  } catch (err) {
    showError('captionResults', 'Terjadi kesalahan: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-sparkles"></i> Generate 3 Caption Sekarang';
  }
}

// ===================== ADS MODE =====================
document.querySelectorAll('.ads-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ads-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    selectedAdsPlatform = tab.dataset.ads;

    // Show/hide options
    document.querySelectorAll('.ads-options').forEach(o => o.classList.remove('active'));
    document.getElementById(selectedAdsPlatform + 'Options').classList.add('active');

    // Reset format to first active
    const firstFormat = document.querySelector(`#${selectedAdsPlatform}Options .format-btn`);
    if (firstFormat) {
      document.querySelectorAll(`#${selectedAdsPlatform}Options .format-btn`).forEach(b => b.classList.remove('active'));
      firstFormat.classList.add('active');
      selectedFormat = firstFormat.dataset.format;
    }
  });
});

document.querySelectorAll('.format-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const parentOptions = btn.closest('.ads-options');
    parentOptions.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFormat = btn.dataset.format;
  });
});

document.querySelectorAll('.obj-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedObjective = btn.dataset.obj;
  });
});

document.getElementById('adsBtn').addEventListener('click', generateAds);

async function generateAds() {
  const product = document.getElementById('adsProduct').value.trim();
  const desc = document.getElementById('adsDesc').value.trim();
  const cta = document.getElementById('adsCTA').value.trim();

  if (!product) { showError('adsResults', 'Tolong isi nama produk dulu ya!'); return; }

  const platformNames = { facebook: 'Facebook Ads', tiktok: 'TikTok Ads', google: 'Google Ads', snack: 'SnackVideo Ads' };
  const platformName = platformNames[selectedAdsPlatform];

  const btn = document.getElementById('adsBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Generating...';
  showLoading('adsResults', `AI sedang membuat ${platformName} copy terbaik untukmu...`);

  const prompt = `Kamu adalah senior copywriter dan digital ads specialist Indonesia yang ahli membuat iklan yang convert tinggi.

Buat TEPAT 3 variasi ads copy untuk ${platformName} dengan detail berikut:
- Produk/Layanan: ${product}
- Detail produk: ${desc || 'tidak disebutkan, buat yang general'}
- Format iklan: ${selectedFormat}
- Tujuan iklan: ${selectedObjective}
- CTA: ${cta || 'sesuaikan dengan tujuan iklan'}
- Bahasa: Indonesia yang natural, persuasif, dan sesuai platform

Format output HARUS persis seperti ini (jangan tambah penjelasan lain):
COPY 1:
[isi ads copy pertama lengkap sesuai format yang diminta]

COPY 2:
[isi ads copy kedua lengkap sesuai format yang diminta]

COPY 3:
[isi ads copy ketiga lengkap sesuai format yang diminta]

Pastikan setiap copy:
- Unik dan berbeda pendekatan
- Sesuai karakteristik dan batasan ${platformName}
- Mengandung elemen persuasif yang tepat (pain point, benefit, social proof, urgency, CTA)
- Siap langsung digunakan sebagai iklan`;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || 'Server error'); }
    const data = await response.json();
    const copies = parseSections(data.text, 'COPY');
    if (copies.length === 0) { showError('adsResults', 'Gagal memparse ads copy. Coba lagi ya!'); }
    else { renderCards('adsResults', copies, `${platformName} · ${selectedObjective}`, 'Variasi'); }
  } catch (err) {
    showError('adsResults', 'Terjadi kesalahan: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-sparkles"></i> Generate Ads Copy Sekarang';
  }
}

// ===================== HELPERS =====================
function parseSections(text, keyword) {
  const results = [];
  const parts = text.split(new RegExp(`${keyword} \\d+:`, 'i')).filter(s => s.trim());
  parts.forEach(part => { const clean = part.trim(); if (clean) results.push(clean); });
  return results;
}

function renderCards(containerId, items, badge, label) {
  const html = `
    <div class="result-header">
      <div class="result-title">Siap dipakai ✨</div>
      <div class="result-badge">${badge}</div>
    </div>
    ${items.map((c, i) => `
      <div class="caption-card">
        <div class="caption-number">${label} ${i + 1}</div>
        <div class="caption-text" id="item-${containerId}-${i}">${escapeHtml(c)}</div>
        <div class="caption-actions">
          <button class="action-btn" onclick="copyItem('${containerId}', ${i}, this)">
            <i class="ti ti-copy"></i> Salin
          </button>
        </div>
      </div>
    `).join('')}
  `;
  document.getElementById(containerId).innerHTML = html;
}

function copyItem(containerId, idx, btn) {
  const text = document.getElementById(`item-${containerId}-${idx}`).textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<i class="ti ti-check"></i> Tersalin!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<i class="ti ti-copy"></i> Salin'; }, 2000);
  });
}

function showLoading(containerId, msg) {
  document.getElementById(containerId).innerHTML = `
    <div class="loading-state">
      <div class="loading-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <div class="loading-text">${msg}</div>
    </div>`;
}

function showError(containerId, msg) {
  document.getElementById(containerId).innerHTML = `<div class="error-msg">${msg}</div>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
