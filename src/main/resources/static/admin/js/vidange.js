// ── State ──
let vidangesData = [];
let vehiculesData = [];
let currentEditId = null;
let currentPage = 0;
let pageSize = 5;

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
async function loadVidangeStats() {
    try {
        const res = await fetch('/api/vidanges/stats');
        if (res.ok) {
            const data = await res.json();
            const statVals = document.querySelectorAll('.stat-val');
            if (statVals.length >= 4) {
                statVals[0].textContent = data.total ?? 0;
                statVals[1].textContent = data.ajour ?? 0;
                statVals[2].textContent = data.bientot ?? 0;
                statVals[3].textContent = data.retard ?? 0;
            }
            return true;
        }
    } catch (err) {
        console.warn('Fallback KPI calculation from loaded data:', err);
    }
    return false;
}

async function loadVidanges(page = 0) {
    currentPage = page;
    const searchInput = document.querySelector('.search-bar input');
    const query = searchInput ? searchInput.value.trim() : '';
    const statusSelect = document.getElementById('statusFilter') || document.querySelector('.form-select-custom');
    const statusFilter = statusSelect ? statusSelect.value : 'all';

    let url = `/api/vidanges?page=${page}&size=${pageSize}`;
    if (query) {
        url = `/api/vidanges/search?query=${encodeURIComponent(query)}&page=${page}&size=${pageSize}`;
    }
    if (statusFilter && statusFilter !== 'all') {
        url += `&status=${encodeURIComponent(statusFilter)}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            vidangesData = data.content || [];
            let filtered = vidangesData;
            if (statusFilter && statusFilter !== 'all') {
                const statusMap = { ajour: 'À jour', bientot: 'Bientôt', retard: 'En retard' };
                const expectedLabel = statusMap[statusFilter];
                if (expectedLabel) {
                    filtered = vidangesData.filter(v => getStatusFromVidange(v) === expectedLabel);
                }
            }
            renderVidangesTable(filtered);
            renderPagination(data);
            const statsLoaded = await loadVidangeStats();
            if (!statsLoaded) {
                updateKPIs(vidangesData);
            }
        }
    } catch (err) {
        console.error('Error loading vidanges:', err);
    }
}

function renderPagination(data) {
    const container = document.getElementById('paginationContainer');
    const summary = document.getElementById('paginationSummary');
    if (!container || !summary) return;

    container.innerHTML = '';
    const totalPages = data.totalPages;
    const totalElements = data.totalElements;
    const start = data.totalElements === 0 ? 0 : data.number * data.size + 1;
    const end = Math.min(start + data.size - 1, totalElements);

    summary.textContent = totalElements > 0
        ? `Affichage de ${start} à ${end} sur ${totalElements} vidanges`
        : 'Aucune vidange à afficher';

    if (totalPages <= 1) return;

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-icon ${data.first ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => loadVidanges(data.number - 1);
    container.appendChild(prevBtn);

    // Pages
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= data.number - 1 && i <= data.number + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-icon ${i === data.number ? 'active' : ''}`;
            pageBtn.style.width = '32px';
            pageBtn.textContent = i + 1;
            pageBtn.onclick = () => loadVidanges(i);
            container.appendChild(pageBtn);
        } else if (i === 1 || i === totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            container.appendChild(dots);
        }
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = `btn-icon ${data.last ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => loadVidanges(data.number + 1);
    container.appendChild(nextBtn);
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

        // Provider name from entity or fallback
        const providerName = v.fournisseur ? v.fournisseur.nomFournisseur : (v.actionsMenees || '-');

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
                    <button class="btn-icon" title="Supprimer" style="color: #dc3545 !important;" onclick="deleteVidangeById(${v.id})"><i class="bi bi-trash"></i></button>
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

let currentVidange = null;

// ── View Vidange ──
function viewVidangeById(id) {
    const v = vidangesData.find(x => x.id === id);
    if (!v) return;
    currentVidange = v;
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
    
    // Fournisseur display
    let providerText = '-';
    if (v.fournisseur) {
        providerText = v.fournisseur.nomFournisseur + (v.fournisseur.ville ? ` (${v.fournisseur.ville})` : '');
    }
    document.getElementById('viewGarage').textContent = providerText;

    const statusClass = getStatusBadgeClass(status);
    document.getElementById('viewStatus').innerHTML = `<span class="badge-status ${statusClass}">${status}</span>`;

    currentEditId = id;
    openModal('viewOilChangeModal');
}

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
    
    // Fournisseur
    if (v.fournisseur) {
        document.getElementById('editTypeFournisseur').value = v.fournisseur.typeFournisseur;
        populateFournisseurSelects('editTypeFournisseur', 'editFournisseurSelect');
        document.getElementById('editFournisseurSelect').value = v.fournisseur.idFournisseur;
    } else {
        document.getElementById('editTypeFournisseur').value = '';
        populateFournisseurSelects('editTypeFournisseur', 'editFournisseurSelect');
        document.getElementById('editFournisseurSelect').value = '';
    }

    // Show "Voir Dépenses" button and set redirect
    const goToExpensesBtn = document.getElementById('goToExpensesBtn');
    if (goToExpensesBtn) {
        goToExpensesBtn.style.display = 'block';
        goToExpensesBtn.onclick = (e) => {
            e.preventDefault();
            const ref = `Vidange #${v.id}`;
            window.location.href = `/admin/depenses?source=${encodeURIComponent(ref)}`;
        };
    }

    openModal('editOilChangeModal');
}

async function saveOilChange() {
    const form = document.getElementById('oilChangeForm');
    const vehiculeId = document.getElementById('addVehiculeSelect').value;
    const dateInput = document.getElementById('addDate').value;
    const oilType = document.getElementById('addOilType').value;
    const km = document.getElementById('addKm').value;
    const cost = document.getElementById('addCost').value;
    const fournisseurId = document.getElementById('addFournisseurSelect').value;

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
        fournisseur: fournisseurId ? { idFournisseur: parseInt(fournisseurId) } : null,
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
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Vidange enregistrée avec succès');
        } else {
            if (window.showToast) window.showToast('Erreur lors de l\'enregistrement', 'error');
            else alert('Erreur lors de l\'enregistrement');
        }
    } catch (err) {
        console.error(err);
        if (window.showToast) window.showToast('Erreur lors de l\'enregistrement', 'error');
        else alert('Erreur lors de l\'enregistrement');
    }
}

async function updateOilChange() {
    if (!currentEditId) return;

    const vehiculeId = document.getElementById('editVehicle').value;
    const dateInput = document.getElementById('editDate').value;
    const oilType = document.getElementById('editOilType');
    const km = document.getElementById('editKm').value;
    const cost = document.getElementById('editCost').value;
    const fournisseurId = document.getElementById('editFournisseurSelect').value;

    const payload = {
        vehicule: vehiculeId ? { id: parseInt(vehiculeId) } : null,
        dateIntervention: dateInput || null,
        typeHuile: oilType ? oilType.options[oilType.selectedIndex].text : null,
        kilometrageAuMoment: km ? parseInt(km) : null,
        coutTotal: cost ? parseFloat(cost) : 0,
        fournisseurId: fournisseurId || null
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
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Vidange mise à jour avec succès');
        } else {
            if (window.showToast) window.showToast('Erreur lors de la mise à jour', 'error');
            else alert('Erreur lors de la mise à jour');
        }
    } catch (err) {
        console.error(err);
        if (window.showToast) window.showToast('Erreur lors de la mise à jour', 'error');
        else alert('Erreur lors de la mise à jour');
    }
}

// ── Delete Vidange ──
let vidangeToDelete = null;

function deleteVidangeById(id) {
    vidangeToDelete = id;
    openModal('deleteVidangeModal');
}

function submitDeleteVidange() {
    if (!vidangeToDelete) return;
    fetch(`/api/vidanges/${vidangeToDelete}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur lors de la suppression');
            closeModal('deleteVidangeModal');
            loadVidanges();
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Vidange supprimée avec succès');
        })
        .catch(err => {
            console.error(err);
            if (window.showToast) window.showToast('Erreur lors de la suppression', 'error');
            else alert('Erreur lors de la suppression');
        });
}

// ── Search & Filter ──
function setupSearchAndFilter() {
    const searchInput = document.querySelector('.search-bar input');
    const statusSelect = document.querySelector('.form-select-custom');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            loadVidanges(0);
        });
    }
    if (statusSelect) {
        statusSelect.addEventListener('change', () => {
            loadVidanges(0);
        });
    }
}

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

let allFournisseurs = [];

async function loadFournisseurs() {
    try {
        const res = await fetch('/admin/fournisseur/all');
        if (!res.ok) throw new Error('Erreur chargement fournisseurs');
        allFournisseurs = await res.json();
        
        populateFournisseurSelects('addTypeFournisseur', 'addFournisseurSelect');
        populateFournisseurSelects('editTypeFournisseur', 'editFournisseurSelect');
    } catch (err) {
        console.error('Erreur chargement fournisseurs:', err);
    }
}

function populateFournisseurSelects(typeSelectId, fournisseurSelectId) {
    const typeSelect = document.getElementById(typeSelectId);
    const fournisseurSelect = document.getElementById(fournisseurSelectId);
    if (!fournisseurSelect) return;
    
    const selectedType = typeSelect ? typeSelect.value : '';
    fournisseurSelect.innerHTML = '<option value="">Choisir un fournisseur...</option>';
    
    const filtered = selectedType ? allFournisseurs.filter(f => f.typeFournisseur === selectedType) : allFournisseurs;
    
    filtered.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.idFournisseur;
        // Label format: Name (City) - [Type]
        const cityInfo = f.ville ? ` (${f.ville})` : '';
        const typeInfo = ` - [${f.typeFournisseur}]`;
        opt.textContent = `${f.nomFournisseur}${cityInfo}${typeInfo}`;
        fournisseurSelect.appendChild(opt);
    });
}

// Add event listeners for type change
document.getElementById('addTypeFournisseur')?.addEventListener('change', function() {
    populateFournisseurSelects('addTypeFournisseur', 'addFournisseurSelect');
});

document.getElementById('editTypeFournisseur')?.addEventListener('change', function() {
    populateFournisseurSelects('editTypeFournisseur', 'editFournisseurSelect');
});

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
    await loadVehicules();
    await loadFournisseurs();
    await loadVidanges();
    setupSearchAndFilter();
});
