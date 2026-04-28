// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
}

function saveOilChange() {
    alert('Vidange enregistrée avec succès !');
    closeModal('addOilChangeModal');
}

function viewOilChange(plate, model, date, oilType, km, nextKm, cost, garage, status) {
    document.getElementById('viewVehicle').textContent = `${model} (${plate})`;
    document.getElementById('viewDate').textContent = date;
    document.getElementById('viewOilType').textContent = oilType;
    document.getElementById('viewKm').textContent = km;
    document.getElementById('viewNextKm').textContent = nextKm;
    document.getElementById('viewCost').textContent = cost;
    document.getElementById('viewGarage').textContent = garage;
    
    let statusClass = 'status-ajour';
    if(status === 'Bientôt') statusClass = 'status-bientot';
    if(status === 'En retard') statusClass = 'status-retard';
    
    document.getElementById('viewStatus').innerHTML = `<span class="badge-status ${statusClass}">${status}</span>`;
    
    openModal('viewOilChangeModal');
}

function editOilChange(plate, model, date, oilType, km, nextKm, cost, garage, status) {
    document.getElementById('editVehicle').value = `${plate} (${model})`;
    document.getElementById('editDate').value = date;
    document.getElementById('editOilType').value = oilType;
    document.getElementById('editKm').value = km;
    document.getElementById('editNextKm').value = nextKm;
    document.getElementById('editCost').value = cost;
    document.getElementById('editGarage').value = garage;
    document.getElementById('editStatus').value = status;
    
    openModal('editOilChangeModal');
}

function updateOilChange() {
    alert('Vidange mise à jour avec succès !');
    closeModal('editOilChangeModal');
}

function deleteOilChange() {
    if(confirm('Êtes-vous sûr de vouloir supprimer cette vidange ?')) {
        alert('Vidange supprimée !');
    }
}

// ── Profile popup ──
const profileRow = document.getElementById('profileRow');
const profilePopup = document.getElementById('profilePopup');
if (profileRow) {
    profileRow.addEventListener('click', e => {
        e.stopPropagation();
        if (profilePopup) profilePopup.classList.toggle('show');
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

// Close modal on overlay click
document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
});

// Embedded / iframe mode
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
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
        }
    });
}
