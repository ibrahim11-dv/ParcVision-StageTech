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

// Form submissions (Demo)
document.getElementById('entrepriseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Enregistré avec succès';
    btn.classList.replace('btn-primary', 'btn-success');
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.replace('btn-success', 'btn-primary');
    }, 3000);
});
