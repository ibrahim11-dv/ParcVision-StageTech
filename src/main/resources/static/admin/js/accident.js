// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Logic for "Irréparable" status budget
    const statutSelect = document.getElementById('statutSelectEdit');
    const budgetInput = document.getElementById('budgetInputEdit');

    if (statutSelect && budgetInput) {
        statutSelect.addEventListener('change', function () {
            if (this.value === 'Épave') {
                budgetInput.type = 'text';
                budgetInput.value = 'Pas de budget (Épave)';
                budgetInput.disabled = true;
                budgetInput.style.backgroundColor = 'var(--gray-100)';
                budgetInput.style.color = 'var(--gray-400)';
                budgetInput.style.fontWeight = '600';
            } else {
                budgetInput.type = 'number';
                budgetInput.disabled = false;
                budgetInput.style.backgroundColor = '';
                budgetInput.style.color = '';
                budgetInput.style.fontWeight = 'normal';
                if (budgetInput.value === 'Pas de budget (Épave)') budgetInput.value = 35000;
            }
        });
    }

    // Logic for "Très Grave" gravity budget in Add Modal
    const graviteSelectAdd = document.getElementById('graviteSelectAdd');
    const budgetInputAdd = document.getElementById('budgetInputAdd');

    if (graviteSelectAdd && budgetInputAdd) {
        graviteSelectAdd.addEventListener('change', function () {
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
                if (budgetInputAdd.value === 'Pas de budget (Épave)') budgetInputAdd.value = '';
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
            updateThemeUI(true);
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
            updateThemeUI(false);
        }
    });
}

// ── Backend Integration ──

const API_BASE = "/admin";

// Fetch Stats
function fetchStats() {
    fetch(`${API_BASE}/stats`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('totalAccidents').textContent = data.totalAccidents || 0;
            document.getElementById('enReparation').textContent = data.enReparation || 0;
            document.getElementById('budgetTotal').textContent = (data.budgetTotal || 0).toLocaleString() + ' DH';
        })
        .catch(err => console.error("Error fetching stats:", err));
}

// Initial stats load
fetchStats();

// Centralized fetch function for Accidents
function fetchAccidents(page = 0) {
    const query = document.getElementById('searchInput').value.trim();
    const etat = document.getElementById('etat').value;

    let url = `${API_BASE}/list?page=${page}`;
    if (query) {
        url = `${API_BASE}/search?query=${query}&page=${page}`;
    } else if (etat && etat !== 'all') {
        url = `${API_BASE}/findByEtat?etat=${etat}&page=${page}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderTableau(data);
            renderPagination(data, (p) => fetchAccidents(p));
        })
        .catch(err => console.error("Error fetching accidents:", err));
}

async function loadVehicles() {
    try {
        const res = await fetch('/api/vehicules/all');
        if (!res.ok) throw new Error('Erreur chargement véhicules');
        const vehicules = await res.json();
        
        const select = document.getElementById('vehicule');
        if (select) {
            select.innerHTML = '<option value="">Sélectionnez un véhicule</option>';
            vehicules.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.id;
                opt.textContent = `${v.immatriculation} (${v.marque} ${v.model})`;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Erreur chargement véhicules:', err);
    }
}

async function loadDrivers() {
    try {
        const res = await fetch('/api/conducteurs/all');
        if (!res.ok) throw new Error('Erreur chargement conducteurs');
        const conducteurs = await res.json();
        
        const select = document.getElementById('conducteur');
        if (select) {
            select.innerHTML = '<option value="">Sélectionnez un conducteur</option>';
            conducteurs.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                const user = c.utilisateur || {};
                opt.textContent = `${user.nom} ${user.prenom}`;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Erreur chargement conducteurs:', err);
    }
}

// Initial load
fetchAccidents(0);
loadVehicles();
loadDrivers();

// Search listener
document.getElementById('searchInput').addEventListener('input', function () {
    fetchAccidents(0);
});

// Filter listener
document.getElementById('etat').addEventListener('change', function () {
    fetchAccidents(0);
});

// ── Delete Accident ──
let accidentToDelete = null;

function openDeleteModal(id) {
    accidentToDelete = id;
    openModal('deleteModal');
}

function submitDeleteAccident() {
    if (!accidentToDelete) return;

    fetch(`${API_BASE}/delete/${accidentToDelete}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur lors de la suppression');
            closeModal('deleteModal');
            fetchAccidents(0);
            fetchStats();
        })
        .catch(err => alert('Erreur : ' + err.message));
}

function renderTableau(data) {
    const id_tab = document.getElementById('conductors');
    id_tab.innerHTML = '';

    const content = data.content || [];

    if (content.length === 0) {
        id_tab.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; font-size:18px;">
                    Aucun accident trouvé
                </td>
            </tr>
        `;
        return;
    }

    content.forEach(a => {
        const statutStyle = getStatutStyle(a.etat);
        const budget = a.budgetEstime ? a.budgetEstime.toLocaleString() + ' DH' : '0 DH';
        const graviteClass = getGraviteClass(a.gravite);
        
        const user = a.conducteur?.utilisateur || {nom: 'Inconnu', prenom: ''};
        const nom = user.nom;
        const prenom = user.prenom;
        const initiales = (nom.charAt(0) + (prenom.charAt(0) || '')).toUpperCase();

        id_tab.innerHTML += `
            <tr class="hist-row">
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="profile-av bg-light text-primary" 
                             style="width:36px;height:36px;border-radius:8px;">
                            <i class="bi bi-truck"></i>
                        </div>
                        <div>
                            <b class="mission-id" 
                                style="color:var(--text-main);display:block;line-height:1.2;">
                                ${a.vehicule?.immatriculation || 'N/A'}
                            </b>
                            <span class="mission-dist" style="font-size:0.75rem;">
                                ${a.vehicule?.model || ''}
                            </span>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="profile-av" 
                             style="width:30px;height:30px;border-radius:50%;font-size:0.7rem; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center;">
                            ${initiales}
                        </div>
                        <span style="font-size:0.85rem;font-weight:500;">
                            ${nom} ${prenom}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="mission-date">${a.dateIntervention}</div>
                    <div class="mission-dist" style="font-size:0.75rem;">${a.lieu}</div>
                </td>
                <td>
                    <span class="prio-badge ${graviteClass}">${a.gravite}</span>
                </td>
                <td>
                    <span style="font-family:'Outfit',sans-serif;font-weight:600;">
                        ${budget}
                    </span>
                </td>
                <td>
                    <span class="prio-badge" style="${statutStyle}">${a.etat}</span>
                </td>
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
                        <button class="btn-icon" title="Supprimer" style="color: #dc3545 !important;"
                            onclick="openDeleteModal(${a.id})">
                            <i class="bi bi-trash"></i>
                        </button>
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
    const size = data.size || 3;
    const start = currentPage * size + 1;
    const end = Math.min((currentPage + 1) * size, totalElements);

    summary.textContent = `Affichage de ${totalElements === 0 ? 0 : start} à ${end} sur ${totalElements} accidents`;

    const btnPrev = document.createElement('button');
    btnPrev.className = 'btn-ghost';
    btnPrev.style.padding = '6px 12px';
    btnPrev.style.fontSize = '.8rem';
    btnPrev.innerHTML = '<i class="bi bi-chevron-left"></i>';
    btnPrev.disabled = currentPage === 0;
    btnPrev.onclick = () => callback(currentPage - 1);
    container.appendChild(btnPrev);

    for (let i = 0; i < totalPages; i++) {
        const btnPage = document.createElement('button');
        btnPage.className = 'btn-ghost';
        btnPage.style.padding = '6px 14px';
        btnPage.style.fontSize = '.8rem';
        btnPage.textContent = i + 1;
        if (i === currentPage) {
            btnPage.style.background = 'var(--accent)';
            btnPage.style.color = 'white';
            btnPage.style.borderColor = 'var(--accent)';
        }
        btnPage.onclick = () => callback(i);
        container.appendChild(btnPage);
    }

    const btnNext = document.createElement('button');
    btnNext.className = 'btn-ghost';
    btnNext.style.padding = '6px 12px';
    btnNext.style.fontSize = '.8rem';
    btnNext.innerHTML = '<i class="bi bi-chevron-right"></i>';
    btnNext.disabled = currentPage === totalPages - 1 || totalPages === 0;
    btnNext.onclick = () => callback(currentPage + 1);
    container.appendChild(btnNext);
}

function getGraviteClass(gravite) {
    switch (gravite?.toLowerCase()) {
        case 'tres-grave':
        case 'très grave':
        case 'majeur': return 'prio-haute';
        case 'moyenne': return 'prio-normale';
        case 'mineur':
        case 'légère': return 'prio-basse';
        default: return 'prio-normale';
    }
}

function getStatutStyle(etat) {
    switch (etat) {
        case 'Épave': return 'background:rgba(31,41,55,0.1); color:#1f2937;';
        case 'En expertise': return 'background:rgba(245,158,11,0.1); color:#f59e0b;';
        case 'En réparation':
        case 'Réparation': return 'background:rgba(59,130,246,0.1); color:#3b82f6;';
        case 'Réparé': return 'background:rgba(16,185,129,0.1); color:#10b981;';
        default: return 'background:rgba(107,114,128,0.1); color:#6b7280;';
    }
}

function openViewModal(a) {
    const values = document.querySelectorAll('#viewModal .view-detail-value');
    values[0].textContent = (a.vehicule?.immatriculation || '') + ' ' + (a.vehicule?.model || '');
    values[1].textContent = (a.conducteur?.utilisateur?.nom || '') + ' ' + (a.conducteur?.utilisateur?.prenom || '');
    values[2].textContent = a.dateIntervention + ' - ' + a.lieu;
    values[3].textContent = a.contexte;
    values[4].textContent = a.gravite;
    values[5].textContent = (a.budgetEstime || 0).toLocaleString() + ' DH';
    values[6].textContent = a.descriptionPanne || '';

    openModal('viewModal');
}

function openEditModal(a) {
    document.getElementById('editModal').dataset.accidentId = a.id;
    document.getElementById('statutSelectEdit').value = a.etat || 'En expertise';
    document.getElementById('budgetInputEdit').value = a.budgetEstime || '';
    document.getElementById('notesTextarea').value = a.notes || '';
    openModal('editModal');
}

function submitEditModal() {
    const id = document.getElementById('editModal').dataset.accidentId;
    const body = {
        etat: document.getElementById('statutSelectEdit').value,
        budgetEstime: document.getElementById('budgetInputEdit').value,
        notes: document.getElementById('notesTextarea').value
    };

    fetch(`${API_BASE}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur mise à jour');
            return res.json();
        })
        .then(() => {
            closeModal('editModal');
            fetchAccidents(0);
            fetchStats();
        })
        .catch(err => alert('Erreur : ' + err.message));
}

function submitAddModal() {
    const vehiculeId = document.getElementById("vehicule").value;
    const conducteurId = document.getElementById("conducteur").value;
    const time = document.getElementById("time").value;
    const lieu = document.getElementById("lieu").value;
    const contexte = document.getElementById("contexte").value;
    const gravite = document.getElementById("graviteSelectAdd").value;
    const statut = document.getElementById("statutSelectAdd").value;
    const budget = document.getElementById("budgetInputAdd").value;
    const description = document.getElementById("description").value;

    if (!vehiculeId || !conducteurId || !time || !lieu) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
    }

    const body = {
        vehicule: { id: parseInt(vehiculeId) },
        dateIntervention: time,
        descriptionPanne: description,
        lieu: lieu,
        contexte: contexte,
        gravite: gravite,
        budgetEstime: parseFloat(budget) || 0,
        etat: statut,
        conducteur: { id: parseInt(conducteurId) }
    };

    fetch(`${API_BASE}/Add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text) });
            return res.json();
        })
        .then(() => {
            closeModal('addModal');
            // Reset form
            document.getElementById("vehicule").value = "";
            document.getElementById("conducteur").value = "";
            document.getElementById("time").value = "";
            document.getElementById("lieu").value = "";
            document.getElementById("description").value = "";
            
            fetchAccidents(0);
            fetchStats();
        })
        .catch(err => alert('Erreur : ' + err.message));
}
