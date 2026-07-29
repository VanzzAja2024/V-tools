document.addEventListener('DOMContentLoaded', function() {
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const startBtn = document.getElementById('startBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tiktokSection = document.getElementById('tiktokSection');
    const bgremoverSection = document.getElementById('bgremoverSection');
    const processTiktokBtn = document.getElementById('processTiktokBtn');
    const processBgBtn = document.getElementById('processBgBtn');

    // Cek Status Login
    function updateViewState() {
        const hasStarted = localStorage.getItem('hasStarted');
        if (hasStarted === 'true') {
            authPage.classList.add('hidden');
            dashboardPage.classList.remove('hidden');
        } else {
            authPage.classList.remove('hidden');
            dashboardPage.classList.add('hidden');
        }
    }

    updateViewState();

    // Tombol Start
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            localStorage.setItem('hasStarted', 'true');
            
            // Buka WhatsApp di tab baru secara aman
            window.open("https://whatsapp.com/channel/0029VatTAQm7T8bP8Vhwqs3L", "_blank");
            
            updateViewState();
        });
    }

    // Tombol Kunci Kembali (Logout)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('hasStarted');
            updateViewState();
        });
    }

    // Navigasi Tab
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const target = this.getAttribute('data-tab');
            if (target === 'tiktok') {
                tiktokSection.classList.remove('hidden');
                bgremoverSection.classList.add('hidden');
            } else {
                tiktokSection.classList.add('hidden');
                bgremoverSection.classList.remove('hidden');
            }
        });
    });

    // Tombol Proses TikTok
    if (processTiktokBtn) {
        processTiktokBtn.addEventListener('click', downloadVideo);
    }

    // Tombol Proses Remove Background
    if (processBgBtn) {
        processBgBtn.addEventListener('click', removeBackground);
    }
});

// --- FITUR 1: TIKTOK DOWNLOADER ---
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
        let downloadUrl = videoData.play;
        if (downloadUrl && !downloadUrl.startsWith('http')) {
            downloadUrl = "https://www.tikwm.com" + downloadUrl;
        }

        videoTitle.textContent = videoData.title || "Video TikTok Tanpa Watermark";
        videoPreview.src = downloadUrl;
        videoPreview.classList.remove('hidden');
        result.classList.remove('hidden');

        downloadLink.href = downloadUrl;
        downloadLink.setAttribute('target', '_blank');
        downloadLink.onclick = function(e) {
            e.preventDefault();
            downloadLink.textContent = "⏳ Memproses Unduhan...";
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.target = '_blank';
            a.setAttribute('download', 'tiktok_video.mp4');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => {
                downloadLink.textContent = "💾 Simpan Video ke Perangkat";
            }, 1500);
        };

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

// --- FITUR 2: HAPUS BACKGROUND ---
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
    loading.classList.add('hidden');

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
        let downloadUrl = videoData.play;
        if (downloadUrl && !downloadUrl.startsWith('http')) {
            downloadUrl = "https://www.tikwm.com" + downloadUrl;
        }

        videoTitle.textContent = videoData.title || "Video TikTok Tanpa Watermark";
        videoPreview.src = downloadUrl;
        videoPreview.classList.remove('hidden');
        result.classList.remove('hidden');

        // Menggunakan sistem pemicu download stabil untuk mode Aplikasi & Web
        downloadLink.href = downloadUrl;
        downloadLink.setAttribute('target', '_blank');
        downloadLink.onclick = function(e) {
            e.preventDefault();
            downloadLink.textContent = "⏳ Memproses Unduhan...";
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.target = '_blank';
            a.setAttribute('download', 'tiktok_video.mp4');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => {
                downloadLink.textContent = "💾 Simpan Video ke Perangkat";
            }, 1500);
        };

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
        let downloadUrl = videoData.play;
        if (downloadUrl && !downloadUrl.startsWith('http')) {
            downloadUrl = "https://www.tikwm.com" + downloadUrl;
        }

        videoTitle.textContent = videoData.title || "Video TikTok Tanpa Watermark";
        videoPreview.src = downloadUrl;
        videoPreview.classList.remove('hidden');
        result.classList.remove('hidden');

        downloadLink.removeAttribute('href');
        downloadLink.style.cursor = 'pointer';
        downloadLink.onclick = async function(e) {
            e.preventDefault();
            downloadLink.textContent = "⏳ Sedang mengunduh...";
            
            try {
                const vidResponse = await fetch(downloadUrl);
                const blob = await vidResponse.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'tiktok_no_watermark.mp4';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
                
                downloadLink.textContent = "💾 Simpan Video ke Perangkat";
            } catch (err) {
                downloadLink.textContent = "💾 Simpan Video ke Perangkat";
                window.open(downloadUrl, '_blank');
            }
        };

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
