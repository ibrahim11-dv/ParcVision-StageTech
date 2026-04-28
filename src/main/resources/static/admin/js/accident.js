function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            this.classList.remove('active');
        });
    });

    // Logic for "Irréparable" status budget
    const statutSelect = document.getElementById('statutSelect');
    const budgetInput = document.getElementById('budgetInput');
    
    if(statutSelect && budgetInput) {
        statutSelect.addEventListener('change', function() {
            if (this.value === 'irreparable') {
                budgetInput.type = 'text';
                budgetInput.value = 'Pas de budget (Épave)';
                budgetInput.disabled = true;
                // Optional visual cue
                budgetInput.style.backgroundColor = 'var(--gray-100)';
                budgetInput.style.color = 'var(--gray-400)';
                budgetInput.style.fontWeight = '600';
            } else {
                budgetInput.type = 'number';
                budgetInput.disabled = false;
                budgetInput.style.backgroundColor = '';
                budgetInput.style.color = '';
                budgetInput.style.fontWeight = 'normal';
                if(budgetInput.value === 'Pas de budget (Épave)') budgetInput.value = 35000; // Reset to default example
            }
        });
    }

    // Logic for "Très Grave" gravity budget in Add Modal
    const graviteSelectAdd = document.getElementById('graviteSelectAdd');
    const budgetInputAdd = document.getElementById('budgetInputAdd');
    
    if(graviteSelectAdd && budgetInputAdd) {
        graviteSelectAdd.addEventListener('change', function() {
            if (this.value === 'tres-grave') {
                budgetInputAdd.type = 'text';
                budgetInputAdd.value = 'Pas de budget (Épave)';
                budgetInputAdd.disabled = true;
                budgetInputAdd.style.backgroundColor = 'var(--gray-100)';
                budgetInputAdd.style.color = 'var(--gray-400)';
                budgetInputAdd.style.fontWeight = '600';
            } else {
                budgetInputAdd.type = 'number';
                budgetInputAdd.disabled = false;
                budgetInputAdd.style.backgroundColor = '';
                budgetInputAdd.style.color = '';
                budgetInputAdd.style.fontWeight = 'normal';
                if(budgetInputAdd.value === 'Pas de budget (Épave)') budgetInputAdd.value = ''; 
            }
        });
    }
});

// ── Profile popup ──
const profileRow = document.getElementById('profileRow');
const profilePopup = document.getElementById('profilePopup');
if (profileRow) {
    profileRow.addEventListener('click', e => {
        e.stopPropagation();
        profilePopup.classList.toggle('show');
    });
}
document.addEventListener('click', () => {
    if (profilePopup) profilePopup.classList.remove('show');
});

// ── Theme toggle ──
function updateThemeUI(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (!themeIcon || !themeText) return;
    if (isDark) {
        themeIcon.className = 'bi bi-sun';
        themeText.textContent = 'Mode clair';
    } else {
        themeIcon.className = 'bi bi-moon-stars';
        themeText.textContent = 'Mode sombre';
    }
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    document.body.classList.toggle('dark', isDark);
    updateThemeUI(isDark);
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', e => {
        e.preventDefault();
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeUI(isDark);
        if (profilePopup) profilePopup.classList.remove('show');
    });
}

initTheme();

// ── Embedded / iframe mode ──
if (window.self !== window.top || new URLSearchParams(window.location.search).get('embedded') === 'true') {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'none';

    const mainEl = document.querySelector('.main');
    if (mainEl) {
        mainEl.style.marginLeft = '0';
        mainEl.style.padding = '30px';
        mainEl.style.paddingTop = '30px';
    }

    // Sync theme from parent dashboard
    window.addEventListener('message', function(event) {
        if (event.data === 'theme-dark') {
            document.body.classList.add('dark');
            updateThemeUI(true);
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
            updateThemeUI(false);
        }
    });
}
