// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ── Backend Integration ──

const API_BASE = "/admin/depannage-api";

function fetchStats() {
    fetch(`${API_BASE}/stats`)
        .then(res => res.json())
        .then(data => {
            const stats = document.querySelectorAll('.stat-val');
            if (stats.length >= 3) {
                stats[0].textContent = data.total || 0;
                stats[1].textContent = data.enCours || 0;
                stats[2].innerHTML = `${(data.frais || 0).toLocaleString()} <small>DH</small>`;
            }
        })
        .catch(err => console.error("Error fetching stats:", err));
}

fetchStats();

function fetchDepannages(page = 0) {
    const query = document.querySelector('.search-bar input').value.trim();
    const statut = document.querySelector('select.form-select-custom').value;

    let url = `${API_BASE}?page=${page}`;
    if (query) {
        url = `${API_BASE}/search?query=${query}&page=${page}`;
    } else if (statut && statut !== 'all') {
        url = `${API_BASE}/filter?statut=${statut}&page=${page}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderTableau(data);
            renderPagination(data, (p) => fetchDepannages(p));
        })
        .catch(err => console.error("Error fetching depannages:", err));
}

fetchDepannages(0);

async function loadVehicles() {
    try {
        const res = await fetch('/api/vehicules/all');
        if (!res.ok) throw new Error('Erreur chargement véhicules');
        const vehicules = await res.json();
        
        const selects = ['addVehiculeSelect', 'e_veh'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = '<option value="">Sélectionner un véhicule</option>';
                vehicules.forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v.id;
                    opt.textContent = `${v.immatriculation} (${v.marque} ${v.model})`;
                    select.appendChild(opt);
                });
            }
        });
    } catch (err) {
        console.error('Erreur chargement véhicules:', err);
    }
}

loadVehicles();

// Search and Filter Listeners
document.querySelector('.search-bar input').addEventListener('input', () => fetchDepannages(0));
document.querySelector('select.form-select-custom').addEventListener('change', () => fetchDepannages(0));

// ── Delete Depannage ──
let depannageToDelete = null;

function openDeleteModal(id) {
    depannageToDelete = id;
    openModal('deleteDepanageModal');
}

function submitDeleteDepannage() {
    if (!depannageToDelete) return;

    fetch(`${API_BASE}/delete/${depannageToDelete}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error("Erreur suppression");
        closeModal('deleteDepanageModal');
        fetchDepannages(0);
        fetchStats();
    })
    .catch(err => alert(err.message));
}

function renderTableau(data) {
    const tbody = document.getElementById('depanageTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const content = data.content || [];

    if (content.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px;">Aucun dépannage trouvé</td></tr>`;
        return;
    }

    content.forEach(d => {
        const statutClass = getStatutClass(d.statut);
        
        tbody.innerHTML += `
            <tr class="hist-row">
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="profile-av bg-light text-primary" style="width: 36px; height: 36px; border-radius: 8px;"><i class="bi bi-truck"></i></div>
                        <b class="mission-id" style="color:var(--text-main);">${d.vehicule?.immatriculation || 'N/A'}</b>
                    </div>
                </td>
                <td><span style="font-weight:500;">Conducteur N/A</span></td>
                <td><span class="mission-date">${d.dateIntervention || 'N/A'}</span></td>
                <td><span class="mission-dist">${d.lieuPanne || 'N/A'}</span></td>
                <td><span class="mission-dist">${d.descriptionPanne || 'N/A'}</span></td>
                <td><span class="prio-badge ${statutClass}">${d.statut || 'N/A'}</span></td>
                <td>
                    <div style="display:flex;gap:5px">
                        <button class="btn-icon" title="Voir" onclick="openViewModal(${JSON.stringify(d).replace(/"/g, '&quot;')})"><i class="bi bi-eye"></i></button>
                        <button class="btn-icon" title="Modifier" onclick="openEditModal(${JSON.stringify(d).replace(/"/g, '&quot;')})"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn-icon" title="Supprimer" style="color: #dc3545 !important;" onclick="openDeleteModal(${d.id})"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderPagination(data, callback) {
    const container = document.getElementById('paginationContainer');
    const summary = document.getElementById('paginationSummary');
    if (!container || !summary) return;

    container.innerHTML = '';
    const totalPages = data.totalPages || 0;
    const currentPage = data.number || 0;
    const totalElements = data.totalElements || 0;
    const size = data.size || 5;
    const start = currentPage * size + 1;
    const end = Math.min(start + size - 1, totalElements);

    summary.textContent = totalElements > 0 
        ? `Affichage de ${start} à ${end} sur ${totalElements} interventions`
        : 'Aucune intervention à afficher';

    if (totalPages <= 1) return;

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-icon ${currentPage === 0 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => callback(currentPage - 1);
    container.appendChild(prevBtn);

    // Pages
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-icon ${i === currentPage ? 'active' : ''}`;
            pageBtn.style.width = '32px';
            pageBtn.textContent = i + 1;
            pageBtn.onclick = () => callback(i);
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
    nextBtn.className = `btn-icon ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.onclick = () => callback(currentPage + 1);
    container.appendChild(nextBtn);
}

function getStatutClass(statut) {
    switch (statut?.toLowerCase()) {
        case 'termine':
        case 'terminé': return 'prio-faible'; // Green in CSS usually
        case 'encours':
        case 'en cours': return 'prio-normale'; // Blue
        case 'attente':
        case 'en attente': return 'prio-moyenne'; // Orange
        default: return 'prio-normale';
    }
}

let currentDepannage = null;

function openViewModal(d) {
    currentDepannage = d;
    document.getElementById('v_veh').textContent = d.vehicule?.immatriculation || 'N/A';
    document.getElementById('v_drv').textContent = 'Conducteur N/A';
    document.getElementById('v_date').textContent = d.dateIntervention || 'N/A';
    document.getElementById('v_loc').textContent = d.lieuPanne || 'N/A';
    document.getElementById('v_mot').textContent = d.descriptionPanne || 'N/A';
    document.getElementById('v_sta').innerHTML = `<span class="badge-status">${d.statut || 'N/A'}</span>`;
    openModal('viewDepanageModal');
}

function openEditModal(d) {
    document.getElementById('editDepanageModal').dataset.id = d.id;
    document.getElementById('e_veh').value = d.vehicule?.immatriculation || '';
    document.getElementById('e_date').value = d.dateIntervention || '';
    document.getElementById('e_loc').value = d.lieuPanne || '';
    document.getElementById('e_mot').value = d.descriptionPanne || '';
    document.getElementById('e_sta').value = d.statut || 'encours';

    // Show "Voir Dépenses" button and set redirect
    const goToExpensesBtn = document.getElementById('goToExpensesBtn');
    if (goToExpensesBtn) {
        goToExpensesBtn.style.display = 'block';
        goToExpensesBtn.onclick = (e) => {
            e.preventDefault();
            const ref = `Dépannage #${d.id}`;
            window.location.href = `/admin/depenses?source=${encodeURIComponent(ref)}`;
        };
    }
    
    openModal('editDepanageModal');
}

function updateDepanage() {
    const id = document.getElementById('editDepanageModal').dataset.id;
    const body = {
        statut: document.getElementById('e_sta').value,
        lieuPanne: document.getElementById('e_loc').value,
        descriptionPanne: document.getElementById('e_mot').value,
        // coutTotal could be added if input exists
    };

    fetch(`${API_BASE}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => {
        if (!res.ok) throw new Error("Erreur mise à jour");
        return res.json();
    })
    .then(() => {
        closeModal('editDepanageModal');
        fetchDepannages(0);
        fetchStats();
    })
    .catch(err => alert(err.message));
}

function saveDepanage() {
    const vehiculeId = document.getElementById('addVehiculeSelect').value;
    if (!vehiculeId) {
        alert("Veuillez sélectionner un véhicule");
        return;
    }

    const body = {
        statut: document.querySelector('#addDepanageModal select').value,
        lieuPanne: document.querySelector('#addDepanageModal input[type="text"]').value,
        descriptionPanne: document.querySelector('#addDepanageModal textarea').value,
        vehicule: { id: parseInt(vehiculeId) } 
    };

    fetch(`${API_BASE}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => {
        if (!res.ok) throw new Error("Erreur ajout");
        return res.json();
    })
    .then(() => {
        closeModal('addDepanageModal');
        fetchDepannages(0);
        fetchStats();
    })
    .catch(err => alert(err.message));
}
