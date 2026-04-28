// Profile popup
document.getElementById('profileRow').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profilePopup').classList.toggle('show');
});
document.addEventListener('click', () => {
    document.getElementById('profilePopup').classList.remove('show');
});

// Theme toggle functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        updateThemeUI(true);
    } else {
        document.body.classList.remove('dark');
        updateThemeUI(false);
    }
}

function updateThemeUI(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (isDark) {
        themeIcon.className = 'bi bi-sun';
        themeText.textContent = 'Mode clair';
    } else {
        themeIcon.className = 'bi bi-moon-stars';
        themeText.textContent = 'Mode sombre';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

document.getElementById('themeToggleBtn').addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
    document.getElementById('profilePopup').classList.remove('show');
});

initTheme();

// Mobile sidebar functions
window.openMobile = function() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
};
window.closeMobile = function() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
};

// Drag & Drop logic for Conducteur Profile Photo
const uploadArea = document.getElementById('profileUploadArea');
const fileInput = document.getElementById('profileImageInput');
const previewImg = document.getElementById('profilePreview');
const placeholderIcon = uploadArea.querySelector('i');
const placeholderText = uploadArea.querySelector('span');

uploadArea.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
});

uploadArea.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        handleFile(this.files[0]);
    }
});

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            previewImg.src = reader.result;
            previewImg.style.display = 'block';
            placeholderIcon.style.display = 'none';
            placeholderText.style.display = 'none';
        }
    }
}
