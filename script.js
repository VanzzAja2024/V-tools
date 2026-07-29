document.addEventListener("DOMContentLoaded", function () {
    const authPage = document.getElementById("authPage");
    const dashboardPage = document.getElementById("dashboardPage");
    const btnStart = document.getElementById("btnStart");
    const btnLogout = document.getElementById("btnLogout");

    const tabTiktok = document.getElementById("tabTiktok");
    const tabBg = document.getElementById("tabBg");
    const tiktokSection = document.getElementById("tiktokSection");
    const bgremoverSection = document.getElementById("bgremoverSection");

    const btnProcessTiktok = document.getElementById("btnProcessTiktok");
    const btnProcessBg = document.getElementById("btnProcessBg");

    // 1. Cek Status Login saat halaman dibuka
    function checkState() {
        const started = localStorage.getItem("appStarted");
        if (started === "true") {
            if (authPage) authPage.classList.add("hidden");
            if (dashboardPage) dashboardPage.classList.remove("hidden");
        } else {
            if (authPage) authPage.classList.remove("hidden");
            if (dashboardPage) dashboardPage.classList.add("hidden");
        }
    }

    checkState();

    // 2. Tombol Start
    if (btnStart) {
        btnStart.addEventListener("click", function () {
            localStorage.setItem("appStarted", "true");
            window.open("https://whatsapp.com/channel/0029VatTAQm7T8bP8Vhwqs3L", "_blank");
            checkState();
        });
    }

    // 3. Tombol Logout / Keluar
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("appStarted");
            checkState();
        });
    }

    // 4. Navigasi Tab
    if (tabTiktok && tabBg) {
        tabTiktok.addEventListener("click", function () {
            tabTiktok.classList.add("active");
            tabBg.classList.remove("active");
            tiktokSection.classList.remove("hidden");
            bgremoverSection.classList.add("hidden");
        });

        tabBg.addEventListener("click", function () {
            tabBg.classList.add("active");
            tabTiktok.classList.remove("active");
            bgremoverSection.classList.remove("hidden");
            tiktokSection.classList.add("hidden");
        });
    }

    // 5. Tombol Proses
    if (btnProcessTiktok) {
        btnProcessTiktok.addEventListener("click", downloadVideo);
    }

    if (btnProcessBg) {
        btnProcessBg.addEventListener("click", removeBackground);
    }
});

// --- FITUR 1: TIKTOK DOWNLOADER ---
async function downloadVideo() {
    const urlInput = document.getElementById("urlInput").value.trim();
    const loading = document.getElementById("loadingTiktok");
    const result = document.getElementById("resultTiktok");
    const errorMsg = document.getElementById("errorTiktok");
    const downloadLink = document.getElementById("downloadLink");
    const videoTitle = document.getElementById("videoTitle");
    const videoPreview = document.getElementById("videoPreview");

    result.classList.add("hidden");
    errorMsg.classList.add("hidden");
    videoPreview.pause();
    videoPreview.src = "";

    if (!urlInput || !urlInput.includes("tiktok.com")) {
        showTiktokError("Masukkan tautan TikTok yang valid!");
        return;
    }

    loading.classList.remove("hidden");

    try {
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(urlInput)}`);
        const resJson = await response.json();
        
        loading.classList.add("hidden");

        if (resJson.code !== 0 || !resJson.data) {
            showTiktokError("Gagal mengambil video. Periksa kembali tautan Anda.");
            return;
        }

        const videoData = resJson.data;
        let downloadUrl = videoData.play;
        if (downloadUrl && !downloadUrl.startsWith("http")) {
            downloadUrl = "https://www.tikwm.com" + downloadUrl;
        }

        videoTitle.textContent = videoData.title || "Video TikTok Tanpa Watermark";
        videoPreview.src = downloadUrl;
        videoPreview.classList.remove("hidden");
        result.classList.remove("hidden");

        downloadLink.href = downloadUrl;
        downloadLink.setAttribute("target", "_blank");
        downloadLink.onclick = function (e) {
            e.preventDefault();
            downloadLink.textContent = "⏳ Memproses...";
            
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.target = "_blank";
            a.setAttribute("download", "tiktok_video.mp4");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => {
                downloadLink.textContent = "💾 Simpan Video";
            }, 1500);
        };

    } catch (err) {
        loading.classList.add("hidden");
        showTiktokError("Terjadi kesalahan jaringan.");
    }
}

function showTiktokError(msg) {
    const err = document.getElementById("errorTiktok");
    err.textContent = msg;
    err.classList.remove("hidden");
}

// --- FITUR 2: HAPUS BACKGROUND ---
async function removeBackground() {
    const fileInput = document.getElementById("imageInput");
    const loading = document.getElementById("loadingBg");
    const result = document.getElementById("resultBg");
    const errorMsg = document.getElementById("errorBg");
    const imagePreview = document.getElementById("imagePreview");
    const downloadImgLink = document.getElementById("downloadImgLink");

    result.classList.add("hidden");
    errorMsg.classList.add("hidden");

    if (fileInput.files.length === 0) {
        showBgError("Pilih file gambar terlebih dahulu!");
        return;
    }

    const file = fileInput.files[0];
    loading.classList.remove("hidden");

    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    try {
        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
                "X-Api-Key": "2ojdAyn5iV1fkhdjcPbc9Wnd"
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
        
        loading.classList.add("hidden");
        result.classList.remove("hidden");

    } catch (err) {
        loading.classList.add("hidden");
        showBgError("Gagal: " + (err.message || "Periksa koneksi atau batas kuota API."));
    }
}

function showBgError(msg) {
    const err = document.getElementById("errorBg");
    err.textContent = msg;
    err.classList.remove("hidden");
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
