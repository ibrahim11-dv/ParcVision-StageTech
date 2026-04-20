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

// Drag & Drop logic for Vehicule Images
const uploadArea = document.getElementById('vehicleUploadArea');
const fileInput = document.getElementById('vehicleImages');
const previewContainer = document.getElementById('imagePreviewContainer');
let uploadedFiles = [];
let mainImageIndex = 0;

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
    handleFiles(this.files);
});

function handleDrop(e) {
    const dt = e.dataTransfer;
    handleFiles(dt.files);
}

function handleFiles(files) {
    [...files].forEach(file => {
        if (file.type.startsWith('image/')) {
            uploadedFiles.push(file);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function() {
                renderPreviews();
            }
        }
    });
}

function renderPreviews() {
    previewContainer.innerHTML = '';
    uploadedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            const isMain = index === mainImageIndex;
            const div = document.createElement('div');
            div.className = `preview-item ${isMain ? 'main-image' : ''}`;
            div.innerHTML = `
                <img src="${reader.result}" alt="preview">
                <span class="badge-main">Principale</span>
                <button type="button" class="btn-remove" onclick="removeImage(event, ${index})"><i class="bi bi-x"></i></button>
                <button type="button" class="btn-set-main" onclick="setMainImage(event, ${index})">Définir principale</button>
            `;
            previewContainer.appendChild(div);
        }
    });
}

window.removeImage = function(e, index) {
    e.stopPropagation();
    uploadedFiles.splice(index, 1);
    if (mainImageIndex === index) {
        mainImageIndex = 0;
    } else if (mainImageIndex > index) {
        mainImageIndex--;
    }
    renderPreviews();
}

window.setMainImage = function(e, index) {
    e.stopPropagation();
    mainImageIndex = index;
    renderPreviews();
}
