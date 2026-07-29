// --- FUNGSI TOMBOL START ---
function startApp() {
    localStorage.setItem('hasStarted', 'true');
    
    // Trik aman membuka link di tab baru tanpa diblokir browser HP
    const link = document.createElement('a');
    link.href = "https://whatsapp.com/channel/0029VatTAQm7T8bP8Vhwqs3L";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Langsung pindah ke dashboard
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (authPage && dashboardPage) {
        authPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
    }
}

function checkLoginState() {
    const hasStarted = localStorage.getItem('hasStarted');
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');

    if (!authPage || !dashboardPage) return;

    if (hasStarted === 'true') {
        authPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
    } else {
        authPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
    }
}

function lockApp() {
    localStorage.removeItem('hasStarted');
    checkLoginState();
}

// Menjalankan pengecekan saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    checkLoginState();
});

window.addEventListener('pageshow', function() {
    checkLoginState();
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        checkLoginState();
    }
});

// --- NAVIGASI TAB ---
function switchTab(tabName) {
    const tiktokSec = document.getElementById('tiktokSection');
    const bgSec = document.getElementById('bgremoverSection');
    const buttons = document.querySelectorAll('.tab-btn');

    if (!tiktokSec || !bgSec) return;

    buttons.forEach(btn => btn.classList.remove('active'));

    if (tabName === 'tiktok') {
        tiktokSec.classList.remove('hidden');
        bgSec.classList.add('hidden');
        if (buttons[0]) buttons[0].classList.add('active');
    } else {
        tiktokSec.classList.add('hidden');
        bgSec.classList.remove('hidden');
        if (buttons[1]) buttons[1].classList.add('active');
    }
}

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
                alert("Gagal mengunduh otomatis, silakan tekan lama pada video preview lalu pilih 'Download video'.");
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
                alert("Gagal mengunduh otomatis, silakan tekan lama pada video preview lalu pilih 'Download video'.");
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
                alert("Gagal mengunduh otomatis, silakan tekan lama pada video preview lalu pilih 'Download video'.");
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
        
        // Tampilkan preview video
        videoPreview.src = downloadUrl;
        videoPreview.classList.remove('hidden');
        result.classList.remove('hidden');

        // Mengubah tombol agar langsung mendownload file otomatis di halaman yang sama
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
                alert("Gagal mengunduh otomatis, silakan tekan lama pada video preview lalu pilih 'Download video'.");
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
        
        // Tampilkan preview video
        videoPreview.src = downloadUrl;
        videoPreview.classList.remove('hidden');
        result.classList.remove('hidden');

        // Mengubah tombol agar langsung mendownload file otomatis di halaman yang sama
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
                alert("Gagal mengunduh otomatis, silakan tekan lama pada video preview lalu pilih 'Download video'.");
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

        // Memaksa download langsung di halaman yang sama menggunakan Blob
        downloadLink.onclick = async function(e) {
            e.preventDefault();
            try {
                const vidResponse = await fetch(downloadUrl);
                const blob = await vidResponse.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'tiktok_video.mp4';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (err) {
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
        
        // Menggunakan atribut download agar langsung mengunduh di halaman yang sama
        downloadLink.href = downloadUrl;
        downloadLink.setAttribute('download', 'tiktok_video.mp4');
        downloadLink.removeAttribute('target'); // Menghapus _blank agar tidak buka tab baru

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
