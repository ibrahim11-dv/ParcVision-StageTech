// ── State ──
let vidangesData = [];
let vehiculesData = [];
let currentEditId = null;

// ── Modal functions ──
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ── Static fallback data (shown when no real data in DB) ──


// ── API Calls ──
async function loadVidanges() {
    try {
        const response = await fetch('/api/vidanges');
        if (response.ok) {
            const apiData = await response.json();
            if (apiData.length > 0) {
                vidangesData = apiData;
            } else {
                vidangesData = staticVidanges;
            }
        } else {
            vidangesData = staticVidanges;
        }
    } catch (err) {
        console.error('Error loading vidanges:', err);
        vidangesData = staticVidanges;
    }
    renderVidangesTable(vidangesData);
    updateKPIs(vidangesData);
}

async function loadVehicules() {
    try {
        const response = await fetch('/api/vehicules/all');
        if (response.ok) {
            vehiculesData = await response.json();
            populateVehiculeDropdowns();
        }
    } catch (err) {
        console.error('Error loading vehicules:', err);
    }
}

function populateVehiculeDropdowns() {
    const addSelect = document.getElementById('addVehiculeSelect');
    const editSelect = document.getElementById('editVehicle');
    if (addSelect) {
        addSelect.innerHTML = '<option value="">Sélectionner un véhicule</option>';
        vehiculesData.forEach(v => {
            addSelect.innerHTML += `<option value="${v.id}">${v.immatriculation} (${v.marque} ${v.model})</option>`;
        });
    }
    if (editSelect) {
        editSelect.innerHTML = '';
        vehiculesData.forEach(v => {
            editSelect.innerHTML += `<option value="${v.id}">${v.immatriculation} (${v.marque} ${v.model})</option>`;
        });
    }
}

function getStatusFromVidange(v) {
    // Simple status logic based on kilometrage
    if (!v.vehicule || !v.kilometrageAuMoment) return 'À jour';
    const currentKm = v.vehicule.kilometrageActuel || v.kilometrageAuMoment;
    const nextKm = v.kilometrageAuMoment + 10000; // default next vidange interval
    const remaining = nextKm - currentKm;
    if (remaining <= 0) return 'En retard';
    if (remaining <= 2000) return 'Bientôt';
    return 'À jour';
}

function getStatusClass(status) {
    if (status === 'En retard') return 'prio-haute';
    if (status === 'Bientôt') return 'prio-normale';
    return 'prio-faible';
}

function getStatusBadgeClass(status) {
    if (status === 'En retard') return 'status-retard';
    if (status === 'Bientôt') return 'status-bientot';
    return 'status-ajour';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatKm(km) {
    if (!km) return '-';
    return Number(km).toLocaleString('fr-FR') + ' km';
}

function renderVidangesTable(data) {
    const tbody = document.querySelector('.table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">
            <i class="bi bi-droplet" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
            Aucune vidange enregistrée
        </td></tr>`;
        return;
    }

    data.forEach(v => {
        const vehicule = v.vehicule || {};
        const immat = vehicule.immatriculation || '-';
        const model = (vehicule.marque || '') + ' ' + (vehicule.model || '');
        const status = getStatusFromVidange(v);
        const statusClass = getStatusClass(status);
        const currentKm = vehicule.kilometrageActuel || v.kilometrageAuMoment || 0;
        const nextKm = (v.kilometrageAuMoment || 0) + 10000;
        const iconClass = (vehicule.marque && vehicule.marque.toLowerCase().includes('camion')) ? 'bi-truck' : 'bi-car-front';
        const textColorClass = status === 'En retard' ? 'text-danger' : 'text-primary';

        const row = document.createElement('tr');
        row.className = 'hist-row';
        row.innerHTML = `
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div class="profile-av bg-light ${textColorClass}" style="width: 36px; height: 36px; border-radius: 8px;"><i class="bi ${iconClass}"></i></div>
                    <div>
                        <b class="mission-id" style="color:var(--text-main); display:block; line-height:1.2;">${immat}</b>
                        <span class="mission-dist" style="font-size:0.75rem;">${model.trim()}</span>
                    </div>
                </div>
            </td>
            <td><span class="mission-date">${formatDate(v.dateIntervention)}</span></td>
            <td><span style="font-weight:500;">${v.typeHuile || '-'}</span></td>
            <td><span class="mission-dist">${formatKm(currentKm)}</span></td>
            <td><b style="color:var(--text-main);">${formatKm(nextKm)}</b></td>
            <td><span class="prio-badge ${statusClass}">${status}</span></td>
            <td>
                <div style="display:flex;gap:5px">
                    <button class="btn-icon" title="Voir" onclick="viewVidangeById(${v.id})"><i class="bi bi-eye"></i></button>
                    <button class="btn-icon" title="Modifier" onclick="editVidangeById(${v.id})"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn-icon" title="Supprimer" onclick="deleteVidangeById(${v.id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateKPIs(data) {
    const total = data.length;
    let ajour = 0, bientot = 0, retard = 0;
    data.forEach(v => {
        const status = getStatusFromVidange(v);
        if (status === 'À jour') ajour++;
        else if (status === 'Bientôt') bientot++;
        else if (status === 'En retard') retard++;
    });
    const statVals = document.querySelectorAll('.stat-val');
    if (statVals.length >= 4) {
        statVals[0].textContent = total;
        statVals[1].textContent = ajour;
        statVals[2].textContent = bientot;
        statVals[3].textContent = retard;
    }
}

// ── View Vidange ──
function viewVidangeById(id) {
    const v = vidangesData.find(x => x.id === id);
    if (!v) return;
    const vehicule = v.vehicule || {};
    const model = (vehicule.marque || '') + ' ' + (vehicule.model || '');
    const immat = vehicule.immatriculation || '-';
    const status = getStatusFromVidange(v);
    const nextKm = (v.kilometrageAuMoment || 0) + 10000;

    document.getElementById('viewVehicle').textContent = `${model.trim()} (${immat})`;
    document.getElementById('viewDate').textContent = formatDate(v.dateIntervention);
    document.getElementById('viewOilType').textContent = v.typeHuile || '-';
    document.getElementById('viewKm').textContent = formatKm(v.kilometrageAuMoment);
    document.getElementById('viewNextKm').textContent = formatKm(nextKm);
    document.getElementById('viewCost').textContent = v.coutTotal ? v.coutTotal + ' DH' : '-';
    document.getElementById('viewGarage').textContent = v.actionsMenees || '-';

    const statusClass = getStatusBadgeClass(status);
    document.getElementById('viewStatus').innerHTML = `<span class="badge-status ${statusClass}">${status}</span>`;

    currentEditId = id;
    openModal('viewOilChangeModal');
}

// ── Edit Vidange ──
function editVidangeById(id) {
    const v = vidangesData.find(x => x.id === id);
    if (!v) return;
    currentEditId = id;

    const vehicule = v.vehicule || {};
    const editVehicle = document.getElementById('editVehicle');
    if (editVehicle && vehicule.id) {
        editVehicle.value = vehicule.id;
    }
    document.getElementById('editDate').value = v.dateIntervention || '';
    // Set oil type select
    const editOilType = document.getElementById('editOilType');
    if (editOilType && v.typeHuile) {
        for (let i = 0; i < editOilType.options.length; i++) {
            if (editOilType.options[i].text === v.typeHuile) {
                editOilType.selectedIndex = i;
                break;
            }
        }
    }
    document.getElementById('editKm').value = v.kilometrageAuMoment || '';
    document.getElementById('editNextKm').value = (v.kilometrageAuMoment || 0) + 10000;
    document.getElementById('editCost').value = v.coutTotal || '';
    document.getElementById('editGarage').value = v.actionsMenees || '';

    openModal('editOilChangeModal');
}

// ── Save new Vidange ──
async function saveOilChange() {
    const form = document.getElementById('oilChangeForm');
    const vehiculeId = document.getElementById('addVehiculeSelect').value;
    const dateInput = document.getElementById('addDate').value;
    const oilType = document.getElementById('addOilType').value;
    const km = document.getElementById('addKm').value;
    const cost = document.getElementById('addCost').value;
    const garage = document.getElementById('addGarage').value;

    if (!vehiculeId) {
        alert('Veuillez sélectionner un véhicule');
        return;
    }

    const payload = {
        vehicule: { id: parseInt(vehiculeId) },
        dateIntervention: dateInput || null,
        typeHuile: oilType,
        kilometrageAuMoment: km ? parseInt(km) : null,
        coutTotal: cost ? parseFloat(cost) : 0,
        actionsMenees: garage || null,
        descriptionPanne: 'Vidange'
    };

    try {
        const response = await fetch('/api/vidanges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            closeModal('addOilChangeModal');
            form.reset();
            await loadVidanges();
        } else {
            alert('Erreur lors de l\'enregistrement');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur lors de l\'enregistrement');
    }
}

// ── Update Vidange ──
async function updateOilChange() {
    if (!currentEditId) return;

    const vehiculeId = document.getElementById('editVehicle').value;
    const dateInput = document.getElementById('editDate').value;
    const oilType = document.getElementById('editOilType');
    const km = document.getElementById('editKm').value;
    const cost = document.getElementById('editCost').value;
    const garage = document.getElementById('editGarage').value;

    const payload = {
        vehicule: vehiculeId ? { id: parseInt(vehiculeId) } : null,
        dateIntervention: dateInput || null,
        typeHuile: oilType ? oilType.options[oilType.selectedIndex].text : null,
        kilometrageAuMoment: km ? parseInt(km) : null,
        coutTotal: cost ? parseFloat(cost) : 0,
        actionsMenees: garage || null
    };

    try {
        const response = await fetch(`/api/vidanges/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            closeModal('editOilChangeModal');
            await loadVidanges();
        } else {
            alert('Erreur lors de la mise à jour');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur lors de la mise à jour');
    }
}

// ── Delete Vidange ──
async function deleteVidangeById(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidange ?')) return;
    try {
        const response = await fetch(`/api/vidanges/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            await loadVidanges();
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression');
    }
}

function deleteOilChange() {
    if (currentEditId) {
        deleteVidangeById(currentEditId);
    }
}

// ── Search & Filter ──
function setupSearchAndFilter() {
    const searchInput = document.querySelector('.search-bar input');
    const statusSelect = document.querySelector('.form-select-custom');

    function filterData() {
        const searchTerm = (searchInput ? searchInput.value : '').toLowerCase();
        const statusFilter = statusSelect ? statusSelect.value : 'all';

        let filtered = vidangesData.filter(v => {
            const vehicule = v.vehicule || {};
            const immat = (vehicule.immatriculation || '').toLowerCase();
            const marque = (vehicule.marque || '').toLowerCase();
            const model = (vehicule.model || '').toLowerCase();
            const matchSearch = !searchTerm || immat.includes(searchTerm) || marque.includes(searchTerm) || model.includes(searchTerm);

            const status = getStatusFromVidange(v);
            let matchStatus = true;
            if (statusFilter === 'ajour') matchStatus = status === 'À jour';
            else if (statusFilter === 'bientot') matchStatus = status === 'Bientôt';
            else if (statusFilter === 'retard') matchStatus = status === 'En retard';

            return matchSearch && matchStatus;
        });

        renderVidangesTable(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', filterData);
    if (statusSelect) statusSelect.addEventListener('change', filterData);
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
    window.addEventListener('message', function (event) {
        if (event.data === 'theme-dark') {
            document.body.classList.add('dark');
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
        }
    });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
    await loadVehicules();
    await loadVidanges();
    setupSearchAndFilter();
});
