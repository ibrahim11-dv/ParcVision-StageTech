// Modal Management
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modals on overlay click
document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function() {
        closeModal(this.id);
    });
});

// Tree View Navigation Logic
function toggleTree(element, id) {
    const subList = document.getElementById(id + '-sub');
    const toggle = element.querySelector('.tree-toggle');
    const icon = element.querySelector('i:first-child');

    if (subList) {
        const isShowing = subList.classList.toggle('show');
        
        if (toggle) {
            toggle.classList.toggle('open', isShowing);
        }

        // Toggle folder icon open/closed
        if (icon && icon.classList.contains('bi-folder')) {
            if (isShowing) {
                icon.className = 'bi bi-folder2-open';
            } else {
                icon.className = 'bi bi-folder';
            }
        }
    }

    // Active state
    document.querySelectorAll('.tree-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
}

// Profile Popup (from accident.js logic)
const profileRow = document.getElementById('profileRow');
const profilePopup = document.getElementById('profilePopup');

if (profileRow && profilePopup) {
    profileRow.addEventListener('click', (e) => {
        e.stopPropagation();
        profilePopup.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        profilePopup.classList.remove('show');
    });
}

// Theme Toggle Integration
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        updateThemeUI(true);
    }
}

function updateThemeUI(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon && themeText) {
        if (isDark) {
            themeIcon.className = 'bi bi-sun';
            themeText.textContent = 'Mode clair';
        } else {
            themeIcon.className = 'bi bi-moon-stars';
            themeText.textContent = 'Mode sombre';
        }
    }
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeUI(isDark);
    });
}

initTheme();
