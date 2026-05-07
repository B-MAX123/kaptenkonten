let selectedPlatform = 'Instagram';
let selectedTone = 'Santai & Friendly';

// Platform selection
document.querySelectorAll('.platform-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPlatform = btn.dataset.platform;
  });
});

// Tone selection
document.querySelectorAll('.tone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTone = btn.dataset.tone;
  });
});

// Char counter
document.getElementById('topicInput').addEventListener('input', function () {
  document.getElementById('charCount').textContent = this.value.length;
});

// Generate button
document.getElementById('generateBtn').addEventListener('click', generateCaptions);

async function generateCaptions() {
  const topic = document.getElementById('topicInput').value.trim();
  if (!topic) {
    showError('Tolong isi deskripsi konten dulu ya!');
    return;
  }

  const emoji = document.getElementById('emojiSelect').value;
  const hashtag = document.getElementById('hashtagSelect').value;
  const btn = document.getElementById('generateBtn');

  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Generating...';
  showLoading();

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
    // Kirim ke backend kita (bukan langsung ke Anthropic)
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Server error');
    }

    const data = await response.json();
    const captions = parseCaptions(data.text);

    if (captions.length === 0) {
      showError('Gagal memparse caption. Coba lagi ya!');
    } else {
      renderCaptions(captions);
    }
  } catch (err) {
    showError('Terjadi kesalahan: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-sparkles"></i> Generate 3 Caption Sekarang';
  }
}

function parseCaptions(text) {
  const captions = [];
  const parts = text.split(/CAPTION \d+:/i).filter(s => s.trim());
  parts.forEach(part => {
    const clean = part.trim();
    if (clean) captions.push(clean);
  });
  return captions;
}

function renderCaptions(captions) {
  const labels = ['Variasi 1', 'Variasi 2', 'Variasi 3'];
  const html = `
    <div class="result-header">
      <div class="result-title">Caption siap pakai ✨</div>
      <div class="result-badge">${selectedPlatform} · ${selectedTone}</div>
    </div>
    ${captions.map((c, i) => `
      <div class="caption-card">
        <div class="caption-number">${labels[i] || 'Variasi ' + (i + 1)}</div>
        <div class="caption-text" id="cap-${i}">${escapeHtml(c)}</div>
        <div class="caption-actions">
          <button class="action-btn" onclick="copyCaption(${i}, this)">
            <i class="ti ti-copy"></i> Salin
          </button>
        </div>
      </div>
    `).join('')}
  `;
  document.getElementById('results').innerHTML = html;
}

function copyCaption(idx, btn) {
  const text = document.getElementById('cap-' + idx).textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<i class="ti ti-check"></i> Tersalin!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<i class="ti ti-copy"></i> Salin';
    }, 2000);
  });
}

function showLoading() {
  document.getElementById('results').innerHTML = `
    <div class="loading-state">
      <div class="loading-dots">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <div class="loading-text">AI sedang menulis 3 caption terbaik untukmu...</div>
    </div>`;
}

function showError(msg) {
  document.getElementById('results').innerHTML = `<div class="error-msg">${msg}</div>`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
