// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
}

function saveRepair() {
    // Logique de sauvegarde fictive
    alert('Réparation enregistrée avec succès !');
    closeModal('addRepairModal');
}

function viewRepair(plate, model, date, garage, desc, cost, status) {
    document.getElementById('viewVehicle').textContent = `${model} (${plate})`;
    document.getElementById('viewDate').textContent = date;
    document.getElementById('viewGarage').textContent = garage;
    document.getElementById('viewDescription').textContent = desc;
    document.getElementById('viewCost').textContent = cost;
    
    let statusClass = 'status-encours';
    if(status === 'Terminé') statusClass = 'status-termine';
    if(status === 'En attente') statusClass = 'status-attente';
    
    document.getElementById('viewStatus').innerHTML = `<span class="badge-status ${statusClass}">${status}</span>`;
    
    openModal('viewRepairModal');
}

function editRepair(plate, model, date, garage, desc, cost, status) {
    document.getElementById('editVehicle').value = `${plate} (${model})`;
    document.getElementById('editDate').value = date;
    document.getElementById('editGarage').value = garage;
    document.getElementById('editDescription').value = desc;
    document.getElementById('editCost').value = cost;
    document.getElementById('editStatus').value = status;
    
    openModal('editRepairModal');
}

function updateRepair() {
    alert('Réparation mise à jour avec succès !');
    closeModal('editRepairModal');
}

function deleteRepair() {
    if(confirm('Êtes-vous sûr de vouloir supprimer cette réparation ?')) {
        alert('Réparation supprimée !');
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
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
        }
    });
}
