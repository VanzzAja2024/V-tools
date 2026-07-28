// --- FUNGSI TOMBOL START KE SALURAN WHATSAPP ---
function startApp() {
    // Simpan status bahwa pengguna sudah menekan start/follow
    localStorage.setItem('hasStarted', 'true');
    
    // Ganti tautan di bawah ini dengan link Saluran WhatsApp Anda yang sebenarnya
    const whatsappChannelLink = "https://whatsapp.com/channel/0029VatTAQm7T8bP8Vhwqs3L"; 
    
    // Membuka saluran WhatsApp di tab/aplikasi baru
    window.open(whatsappChannelLink, '_blank');
    
    // Langsung masuk ke dashboard aplikasi
    checkLoginState();
}

function checkLoginState() {
    const hasStarted = localStorage.getItem('hasStarted');
    
    if (hasStarted === 'true') {
        document.getElementById('authPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('dashboardPage').classList.add('hidden');
    }
}

function lockApp() {
    // Menghapus status agar kembali ke halaman tombol Start jika diinginkan
    localStorage.removeItem('hasStarted');
    checkLoginState();
}

window.onload = function() {
    checkLoginState();
};

// --- NAVIGASI TAB ---
function switchTab(tabName) {
    const tiktokSec = document.getElementById('tiktokSection');
    const bgSec = document.getElementById('bgremoverSection');
    const buttons = document.querySelectorAll('.tab-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (tabName === 'tiktok') {
        tiktokSec.classList.remove('hidden');
        bgSec.classList.add('hidden');
        buttons[0].classList.add('active');
    } else {
        tiktokSec.classList.add('hidden');
        bgSec.classList.remove('hidden');
        buttons[1].classList.add('active');
    }
}

// --- FITUR 1: TIKTOK DOWNLOADER (TikWM API) ---
async function downloadVideo() {
    const urlInput = document.getElementById('urlInput').value.trim();
    const loading = document.getElementById('loadingTiktok');
    const result = document.getElementById('resultTiktok');
    const errorMsg = document.getElementById('errorTiktok');
    const downloadLink = document.getElementById('downloadLink');
    const videoTitle = document.getElementById('videoTitle');
    const videoPreview = document.getElementById('videoPreview');

    result.classList.add('hidden');
    errorMsg.classList.add('hidden');
    videoPreview.pause();
    videoPreview.src = "";

    if (!urlInput || !urlInput.includes('tiktok.com')) {
        showTiktokError("Silakan masukkan tautan TikTok yang valid!");
        return;
    }

    loading.classList.remove('hidden');

    try {
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(urlInput)}`);
        const resJson = await response.json();
        
        loading.classList.add('hidden');

        if (resJson.code !== 0 || !resJson.data) {
            showTiktokError("Gagal mengambil video. Pastikan tautan benar.");
            return;
        }

        const videoData = resJson.data;
        const downloadUrl = "https://www.tikwm.com" + videoData.play;

        videoTitle.textContent = videoData.title || "Video TikTok Tanpa Watermark";
        downloadLink.href = downloadUrl;
        videoPreview.src = downloadUrl;
        videoPreview.classList.remove('hidden');
        result.classList.remove('hidden');

    } catch (err) {
        loading.classList.add('hidden');
        showTiktokError("Terjadi kesalahan jaringan saat menghubungi server TikTok.");
    }
}

function showTiktokError(msg) {
    const err = document.getElementById('errorTiktok');
    err.textContent = msg;
    err.classList.remove('hidden');
}

// --- FITUR 2: HAPUS BACKGROUND (Remove.bg API) ---
async function removeBackground() {
    const fileInput = document.getElementById('imageInput');
    const loading = document.getElementById('loadingBg');
    const result = document.getElementById('resultBg');
    const errorMsg = document.getElementById('errorBg');
    const imagePreview = document.getElementById('imagePreview');
    const downloadImgLink = document.getElementById('downloadImgLink');

    result.classList.add('hidden');
    errorMsg.classList.add('hidden');

    if (fileInput.files.length === 0) {
        showBgError("Pilih atau unggah file gambar terlebih dahulu!");
        return;
    }

    const file = fileInput.files[0];
    loading.classList.remove('hidden');

    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': '2ojdAyn5iV1fkhdjcPbc9Wnd'
            },
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.errors ? errData.errors[0].title : "Gagal memproses gambar.");
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        imagePreview.src = imageUrl;
        downloadImgLink.href = imageUrl;
        
        loading.classList.add('hidden');
        result.classList.remove('hidden');

    } catch (err) {
        loading.classList.add('hidden');
        showBgError("Gagal: " + (err.message || "Periksa koneksi atau batas kuota API Remove.bg Anda."));
    }
}

function showBgError(msg) {
    const err = document.getElementById('errorBg');
    err.textContent = msg;
    err.classList.remove('hidden');
}
