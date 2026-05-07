// ===================== STATE =====================
let selectedPlatform = 'Instagram';
let selectedTone = 'Santai & Friendly';
let selectedAdsPlatform = 'facebook';
let selectedObjective = 'penjualan langsung';

const adsFormats = {
  facebook: [
    { label: 'Primary Text', value: 'Primary Text (teks utama iklan feed Facebook)' },
    { label: 'Headline + Desc', value: 'Headline dan Description singkat untuk link ad' },
    { label: 'Carousel Copy', value: 'Copy untuk setiap slide carousel Facebook Ads' },
    { label: 'Video Script', value: 'Skrip video iklan Facebook 30-60 detik' },
  ],
  tiktok: [
    { label: 'Hook + Script', value: 'Opening hook kuat + skrip video 15-30 detik TikTok' },
    { label: 'UGC Style', value: 'Skrip gaya konten organik user-generated TikTok' },
    { label: 'Trending Sound', value: 'Skrip yang cocok dengan audio trending TikTok' },
    { label: 'TopView', value: 'Skrip iklan full-screen TopView TikTok' },
  ],
  google: [
    { label: 'Search Ad (RSA)', value: 'Responsive Search Ad: 5 headline maks 30 karakter + 3 description maks 90 karakter' },
    { label: 'Display Ad', value: 'Display Ad: judul pendek + deskripsi untuk banner' },
    { label: 'Performance Max', value: 'Performance Max: headline, long headline, dan description' },
  ],
  snack: [
    { label: 'Native Video', value: 'Skrip video native SnackVideo 15-30 detik' },
    { label: 'Hashtag Challenge', value: 'Copy hashtag challenge untuk engagement SnackVideo' },
    { label: 'Splash Ad', value: 'Teks iklan layar penuh splash screen SnackVideo' },
  ],
};

let selectedFormat = adsFormats.facebook[0].value;

// ===================== MODE SWITCHING =====================
document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    document.getElementById('captionMode').style.display = mode === 'caption' ? 'block' : 'none';
    document.getElementById('adsMode').style.display = mode === 'ads' ? 'block' : 'none';
    document.getElementById('adsPlatformNav').style.display = mode === 'ads' ? 'block' : 'none';
  });
});

// ===================== CAPTION: PLATFORM =====================
document.querySelectorAll('.chip[data-platform]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chip[data-platform]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPlatform = btn.dataset.platform;
  });
});

// ===================== CAPTION: TONE =====================
document.querySelectorAll('.tone-chip[data-tone]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tone-chip[data-tone]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTone = btn.dataset.tone;
  });
});

// ===================== CAPTION: CHAR COUNT =====================
document.getElementById('captionTopic').addEventListener('input', function () {
  document.getElementById('captionCharCount').textContent = this.value.length;
});

// ===================== CAPTION: GENERATE =====================
document.getElementById('captionBtn').addEventListener('click', generateCaptions);

async function generateCaptions() {
  const topic = document.getElementById('captionTopic').value.trim();
  if (!topic) { showError('captionResults', 'Tolong isi deskripsi konten dulu ya!'); return; }

  const emoji = document.getElementById('emojiSelect').value;
  const hashtag = document.getElementById('hashtagSelect').value;
  const btn = document.getElementById('captionBtn');
  setLoading(btn, true, 'captionBtn');
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
    const text = await callAPI(prompt);
    const items = parseSections(text, 'CAPTION');
    if (!items.length) showError('captionResults', 'Gagal memparse caption. Coba lagi!');
    else renderResults('captionResults', items, `${selectedPlatform} · ${selectedTone}`);
  } catch (e) {
    showError('captionResults', 'Terjadi kesalahan: ' + e.message);
  } finally {
    setLoading(btn, false, 'captionBtn', '<i class="ti ti-sparkles"></i> Generate Caption Sekarang');
  }
}

// ===================== ADS: PLATFORM =====================
document.querySelectorAll('.sidebar-platform').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-platform').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAdsPlatform = btn.dataset.ads;
    renderFormatChips(selectedAdsPlatform);
    const names = { facebook: 'Facebook Ads', tiktok: 'TikTok Ads', google: 'Google Ads', snack: 'SnackVideo Ads' };
    document.getElementById('adsPanelTitle').textContent = names[selectedAdsPlatform];
  });
});

function renderFormatChips(platform) {
  const container = document.getElementById('formatChips');
  const formats = adsFormats[platform];
  container.innerHTML = formats.map((f, i) =>
    `<button class="tone-chip ${i === 0 ? 'active' : ''}" data-format="${f.value}">${f.label}</button>`
  ).join('');
  selectedFormat = formats[0].value;
  container.querySelectorAll('.tone-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tone-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFormat = btn.dataset.format;
    });
  });
}

// Init formats
renderFormatChips('facebook');

// ===================== ADS: OBJECTIVE =====================
document.querySelectorAll('.tone-chip[data-obj]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tone-chip[data-obj]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedObjective = btn.dataset.obj;
  });
});

// ===================== ADS: GENERATE =====================
document.getElementById('adsBtn').addEventListener('click', generateAds);

async function generateAds() {
  const product = document.getElementById('adsProduct').value.trim();
  const desc = document.getElementById('adsDesc').value.trim();
  const cta = document.getElementById('adsCTA').value.trim();
  if (!product) { showError('adsResults', 'Tolong isi nama produk dulu ya!'); return; }

  const names = { facebook: 'Facebook Ads', tiktok: 'TikTok Ads', google: 'Google Ads', snack: 'SnackVideo Ads' };
  const platformName = names[selectedAdsPlatform];
  const btn = document.getElementById('adsBtn');
  setLoading(btn, true, 'adsBtn');
  showLoading('adsResults', `AI sedang membuat ${platformName} copy terbaik...`);

  const prompt = `Kamu adalah senior copywriter dan digital ads specialist Indonesia yang ahli membuat iklan yang convert tinggi.

Buat TEPAT 3 variasi ads copy untuk ${platformName} dengan detail berikut:
- Produk/Layanan: ${product}
- Detail produk: ${desc || 'tidak disebutkan, buat yang general dan persuasif'}
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

Pastikan setiap copy unik, berbeda pendekatan, sesuai karakteristik ${platformName}, mengandung elemen persuasif (pain point, benefit, urgency, CTA), dan siap langsung digunakan.`;

  try {
    const text = await callAPI(prompt);
    const items = parseSections(text, 'COPY');
    if (!items.length) showError('adsResults', 'Gagal memparse copy. Coba lagi!');
    else renderResults('adsResults', items, `${platformName} · ${selectedObjective}`);
  } catch (e) {
    showError('adsResults', 'Terjadi kesalahan: ' + e.message);
  } finally {
    setLoading(btn, false, 'adsBtn', '<i class="ti ti-sparkles"></i> Generate Ads Copy Sekarang');
  }
}

// ===================== HELPERS =====================
async function callAPI(prompt) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Server error'); }
  const data = await res.json();
  return data.text;
}

function parseSections(text, keyword) {
  const parts = text.split(new RegExp(`${keyword} \\d+:`, 'i')).filter(s => s.trim());
  return parts.map(p => p.trim()).filter(Boolean);
}

function renderResults(containerId, items, badge) {
  const labels = ['Variasi 1', 'Variasi 2', 'Variasi 3'];
  document.getElementById(containerId).innerHTML = `
    <div class="result-header">
      <div class="result-title">Siap dipakai ✦</div>
      <div class="result-badge">${badge}</div>
    </div>
    ${items.map((c, i) => `
      <div class="result-card">
        <div class="result-card-label">${labels[i] || 'Variasi ' + (i+1)}</div>
        <div class="result-card-text" id="rc-${containerId}-${i}">${escapeHtml(c)}</div>
        <div class="result-card-actions">
          <button class="copy-btn" onclick="copyResult('${containerId}', ${i}, this)">
            <i class="ti ti-copy"></i> Salin
          </button>
        </div>
      </div>
    `).join('')}
  `;
}

function copyResult(containerId, idx, btn) {
  const text = document.getElementById(`rc-${containerId}-${idx}`).textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<i class="ti ti-check"></i> Tersalin!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<i class="ti ti-copy"></i> Salin'; }, 2000);
  });
}

function setLoading(btn, isLoading, id, resetHTML) {
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader-2"></i> Generating...';
  } else {
    btn.disabled = false;
    btn.innerHTML = resetHTML;
  }
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
