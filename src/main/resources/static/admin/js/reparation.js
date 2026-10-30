// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
}

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
    window.addEventListener('message', function (event) {
        if (event.data === 'theme-dark') {
            document.body.classList.add('dark');
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
        }
    });
}
//Back-end

//count :
// Statistique :
function fetchStats() {
    fetch("/admin/reparation/stats")
        .then(res => res.json())
        .then(data => {
            const elements = document.getElementsByClassName('total_reparation');
            for (let el of elements) {
                el.textContent = data.total_reparation || 0;
            }
            document.getElementById('EnCours').textContent = data.EnCours || 0;
            document.getElementById('Budget').textContent = data.Budget ? data.Budget.toLocaleString() : 0;
            document.getElementById('urgences').textContent = data.urgences || 0;
        })
        .catch(err => console.error("Erreur stats:", err));
}

// Centralized fetch function
function fetchReparations(page = 0) {
    fetch('/admin/reparation?page=' + page)
        .then(res => res.json())
        .then(data => {
            renderTableau(data);
            renderPagination(data);
        });
}

//Chercher
document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.trim();
    fetch('/admin/reparation/search?immat=' + query + '&page=0')
        .then(res => res.json())
        .then(data => {
            renderTableau(data);
            renderPagination(data);
        });
});

//find by statur :
document.getElementById('statutFilter').addEventListener('change', function () {
    const statut = this.value;
    if (statut === 'all') {
        fetchReparations(0);
    } else {
        fetch('/admin/reparation/filterByStatut?statut=' + statut + '&page=0')
            .then(res => res.json())
            .then(data => {
                renderTableau(data);
                renderPagination(data);
            });
    }
});

//Les buttons !
let currentRepair = null;

//Pour remplir le panier d informations quand on clique sur button eye
function openViewModal(a) {
    currentRepair = a;
    const vText = a.vehicule ? `${a.vehicule.immatriculation} ${a.vehicule.model || ''}` : '-';
    document.getElementById('viewVehicle').textContent = vText;
    document.getElementById('viewDate').textContent = a.dateIntervention || '-';
    document.getElementById('viewGarage').textContent = a.fournisseur ? a.fournisseur.nomFournisseur : (a.garagePrestataire || '-');
    document.getElementById('viewDescription').textContent = a.descriptionPanne || '-';
    document.getElementById('viewCost').textContent = (a.coutTotal ?? 0) + ' DH';
    document.getElementById('viewStatus').textContent = a.statut || '-';
    document.getElementById('viewEstPaye').textContent = a.estPaye ? 'Oui' : 'Non';
    document.getElementById('viewDatePayement').textContent = a.datePayement ? a.datePayement : '-';

    openModal('viewRepairModal');
}
//button de suppression :
let repairToDelete = null;

function deleteReparation(id) {
    repairToDelete = id;
    openModal('deleteRepairModal');
}

function submitDeleteRepair() {
    if (!repairToDelete) return;
    fetch('/admin/reparation/delete/' + repairToDelete, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur suppression');
            closeModal('deleteRepairModal');
            fetchReparations(0);
            fetchStats();
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Réparation supprimée avec succès');
        })
        .catch(err => {
            if (window.showToast) window.showToast('Erreur : ' + err.message, 'error');
            else alert('Erreur : ' + err.message);
        });
}
//button de modification :
//methode openEditModel et subEditModel !
function goToExpense() {
    const id = document.getElementById('editRepairModal').dataset.reparationId;
    if (!id) return;
    const sourceCustom = "Reparation #" + id;
    window.location.href = "/admin/depenses?source=" + encodeURIComponent(sourceCustom);
}

function openEditModal(a) {
    if (!a) return;
    currentRepair = a;
    // Stocker l'id de la réparation
    document.getElementById('editRepairModal').dataset.reparationId = a.id;

    // Pré-remplir les champs avec les valeurs actuelles
    if (a.vehicule && document.getElementById('editVehicle')) {
        document.getElementById('editVehicle').value = a.vehicule.id;
    }
    document.getElementById('editDate').value = a.dateIntervention || '';
    
    // Fournisseur
    if (a.fournisseur) {
        document.getElementById('editTypeFournisseur').value = a.fournisseur.typeFournisseur || '';
        populateFournisseurSelects('editTypeFournisseur', 'editFournisseurSelect');
        document.getElementById('editFournisseurSelect').value = a.fournisseur.idFournisseur;
    } else {
        document.getElementById('editTypeFournisseur').value = '';
        populateFournisseurSelects('editTypeFournisseur', 'editFournisseurSelect');
        document.getElementById('editFournisseurSelect').value = '';
    }

    document.getElementById('editDescription').value = a.descriptionPanne || '';
    document.getElementById('editCost').value = a.coutTotal ?? '';
    document.getElementById('editStatus').value = a.statut || 'encours';

    // Ouvrir le modal
    openModal('editRepairModal');
}

function submitEditModal() {
    const id = document.getElementById('editRepairModal').dataset.reparationId;//recupere l id de la ligne ou il a clique
    const vehId = document.getElementById('editVehicle') ? document.getElementById('editVehicle').value : null;
    //recupere les donnes
    const body = {
        vehiculeId: vehId,
        vehicule: vehId ? { id: parseInt(vehId) } : null,
        dateIntervention: document.getElementById('editDate').value,
        fournisseurId: document.getElementById('editFournisseurSelect').value,
        descriptionPanne: document.getElementById('editDescription').value,
        coutTotal: document.getElementById('editCost').value,
        statut: document.getElementById('editStatus').value
    };

    fetch('/admin/reparation/update/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur mise à jour');
            return res.json();
        })
        .then(() => {
            closeModal('editRepairModal');
            fetchReparations(0);
            fetchStats();
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Réparation mise à jour avec succès');
        })
        .catch(err => {
            if (window.showToast) window.showToast('Erreur : ' + err.message, 'error');
            else alert('Erreur : ' + err.message);
        });
}

function saveRepair() {
    const body = {
        vehicule: { id: parseInt(document.getElementById('vehicule').value) },
        dateIntervention: document.getElementById('date').value,
        fournisseur: document.getElementById('addFournisseurSelect').value ? { idFournisseur: parseInt(document.getElementById('addFournisseurSelect').value) } : null,
        descriptionPanne: document.getElementById('description').value,
        coutTotal: document.getElementById('cout').value,
        statut: document.getElementById('statut').value
    }
    fetch('/admin/reparation/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur');
            return res.json();
        })
        .then(() => {
            closeModal('addRepairModal');
            fetchReparations(0);
            fetchStats();
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Réparation ajoutée avec succès');
        })
        .catch(err => {
            if (window.showToast) window.showToast('Erreur : ' + err.message, 'error');
            else alert('Erreur : ' + err.message);
        });
}

function renderPagination(data) {
    const container = document.getElementById('paginationContainer');
    const summary = document.getElementById('paginationSummary');
    if (!container || !summary) return;

    container.innerHTML = '';
    const totalPages = data.totalPages || 0;
    const currentPage = data.number || 0; // 0-indexed
    const totalElements = data.totalElements || 0;
    const size = data.size || 5;
    const start = currentPage * size + 1;
    const end = Math.min(start + size - 1, totalElements);

    summary.textContent = totalElements > 0
        ? `Affichage de ${start} à ${end} sur ${totalElements} réparations`
        : 'Aucune réparation à afficher';

    if (totalPages <= 1) return;

    // Button Previous
    const btnPrev = document.createElement('button');
    btnPrev.className = `btn-icon ${currentPage === 0 ? 'disabled' : ''}`;
    btnPrev.innerHTML = '<i class="bi bi-chevron-left"></i>';
    btnPrev.disabled = currentPage === 0;
    btnPrev.onclick = () => fetchReparations(currentPage - 1);
    container.appendChild(btnPrev);

    // Page Numbers
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const btnPage = document.createElement('button');
            btnPage.className = `btn-icon ${i === currentPage ? 'active' : ''}`;
            btnPage.style.width = '32px';
            btnPage.textContent = i + 1;
            btnPage.onclick = () => fetchReparations(i);
            container.appendChild(btnPage);
        } else if (i === 1 || i === totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            container.appendChild(dots);
        }
    }

    // Button Next
    const btnNext = document.createElement('button');
    btnNext.className = `btn-icon ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    btnNext.innerHTML = '<i class="bi bi-chevron-right"></i>';
    btnNext.disabled = currentPage === totalPages - 1;
    btnNext.onclick = () => fetchReparations(currentPage + 1);
    container.appendChild(btnNext);
}

//affichage du liste des reparations
function renderTableau(data) {
    const id_tab = document.getElementById('reparationsTableBody');
    id_tab.innerHTML = '';

    if (!data.content || data.content.length === 0) {
        id_tab.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding:40px; font-size:18px;">
                    Aucune réparation trouvée
                </td>
            </tr>
            `;
        return;
    }

    data.content.forEach(a => {
        const cout = a.coutTotal ? a.coutTotal.toLocaleString() + ' DH' : '-';
        const statutStyle = getStatutStyle(a.statut);
        const estPayeBadge = a.estPaye
            ? `<span class="badge-status status-paye">Payé</span>`
            : `<span class="badge-status status-nonpaye">Impayé</span>`;
        const datePayementVal = a.datePayement ? a.datePayement : '-';

        const providerName = a.fournisseur ? a.fournisseur.nomFournisseur : (a.garagePrestataire || '-');

        id_tab.innerHTML += `
            <tr class="hist-row">
                <td><b style="color:var(--primary)">#${a.id}</b></td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="profile-av bg-light text-primary" 
                             style="width:36px;height:36px;border-radius:8px;">
                            <i class="bi bi-truck"></i>
                        </div>
                        <div>
                            <b class="mission-id" 
                               style="color:var(--text-main);display:block;line-height:1.2;">
                               ${a.vehicule.immatriculation}
                            </b>
                            <span class="mission-dist" style="font-size:0.75rem;">
                                ${a.vehicule.model}
                            </span>
                        </div>
                    </div>
                </td>
                <td>${a.dateIntervention}</td>
                <td>${providerName}</td>
                <td>${a.descriptionPanne}</td>
                <td>${cout}</td>
                <td>${estPayeBadge}</td>
                <td>${datePayementVal}</td>
                <td><span class="prio-badge" style="${statutStyle}">${a.statut}</span></td>
                <td>
                    <div style="display:flex;gap:5px">
                        <button class="btn-icon" title="Voir détails"
                            onclick="openViewModal(${JSON.stringify(a).replace(/"/g, '&quot;')})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn-icon" title="Modifier"
                            onclick="openEditModal(${JSON.stringify(a).replace(/"/g, '&quot;')})">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-icon" title="Supprimer" style="color:red"
                            onclick="deleteReparation(${a.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
    });
}

function getStatutStyle(statut) {
    switch (statut) {
        case 'termine':
        case 'Terminé':
            return 'background:rgba(16,185,129,0.1); color:#10b981;';
        case 'encours':
        case 'En cours':
            return 'background:rgba(59,130,246,0.1); color:#3b82f6;';
        case 'attente':
        case 'En attente':
            return 'background:rgba(245,158,11,0.1); color:#f59e0b;';
        default:
            return 'background:rgba(107,114,128,0.1); color:#6b7280;';
    }
}

async function loadVehicles() {
    try {
        const res = await fetch('/api/vehicules/all');
        if (!res.ok) throw new Error('Erreur chargement véhicules');
        const vehicules = await res.json();

        const selects = ['vehicule', 'editVehicle'];
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

// Initialisation
loadVehicles();
loadFournisseurs();
fetchReparations(0);
fetchStats();




