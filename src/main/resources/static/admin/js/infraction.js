/* ═════════════════════════════════════════════════════
   infraction.js – CRUD Infractions + Stats + Thème + Pagination
   Harmonisé avec vehicule.js / assurance.js
   ═════════════════════════════════════════════════════ */

// ── AUTH ──
function getToken() { return localStorage.getItem('token') || sessionStorage.getItem('token'); }
function authHeaders() { return { 'Authorization': 'Bearer ' + getToken() }; }

// ── STATE ──
let allInfractions = [];
let infractionIdToEdit = null;
let filtered = [];
let currentPage = 0;
const pageSize = 6;
let idToDelete = null;

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
    chargerSelects();
    chargerInfractions();

    // Bouton suppression dans le modal de confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (!idToDelete) return;
        try {
            const res = await fetch(`/api/infractions/${idToDelete}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('Erreur suppression');
            idToDelete = null;
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            await chargerInfractions();
            if (window.loadSidebarStats) window.loadSidebarStats();
            showSuccess('Supprimé', 'L\'infraction a été supprimée.');
        } catch (e) {
            alert('Erreur: ' + e.message);
        }
    });

    // Recherche
    document.getElementById('searchInput').addEventListener('input', debounce(() => {
        filtrerInfractions();
    }, 300));
});

// ── SIDEBAR ──
let sidebarMini = false;
function toggleSidebar() {
    sidebarMini = !sidebarMini;
    document.getElementById('sidebar').classList.toggle('mini', sidebarMini);
    document.getElementById('main').classList.toggle('mini', sidebarMini);
    document.getElementById('collapseIcon').className = sidebarMini ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
}

// ── CHARGER LES DONNÉES DES SELECTS ──
async function chargerSelects() {
    try {
        const headers = authHeaders();
        // Véhicules
        const resVeh = await fetch('/api/vehicules?page=0&size=999', { headers });
        if (resVeh.ok) {
            const data = await resVeh.json();
            const selVeh = document.getElementById('vehiculeId');
            data.content.forEach(v => {
                selVeh.innerHTML += `<option value="${v.id}">${v.immatriculation} — ${v.marque}</option>`;
            });
        }
        // Conducteurs
        const resCond = await fetch('/api/conducteurs?page=0&size=999', { headers });
        if (resCond.ok) {
            const data = await resCond.json();
            const selCond = document.getElementById('conducteurId');
            data.content.forEach(c => {
                const u = c.utilisateur || {};
                const nom = u.nom || c.nom || '';
                const prenom = u.prenom || c.prenom || '';
                const display = (nom || prenom) ? `${nom} ${prenom}`.trim() : `Conducteur #${c.id}`;
                selCond.innerHTML += `<option value="${c.id}">${display}</option>`;
            });
        }
        // Missions (si l'API existe)
        const resMiss = await fetch('/api/missions?page=0&size=999', { headers });
        if (resMiss.ok) {
            const data = await resMiss.json();
            const selMiss = document.getElementById('missionId');
            data.content.forEach(m => {
                selMiss.innerHTML += `<option value="${m.id}">${m.reference || 'Mission #' + m.id}</option>`;
            });
        }
    } catch (e) {
        console.error('Erreur chargement sélecteurs:', e);
    }
}

// ── CHARGER INFRACTIONS ──
async function chargerInfractions() {
    try {
        const res = await fetch('/api/infractions?page=0&size=9999', { headers: authHeaders() });
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();

        allInfractions = data.content.map(i => ({
            ...i,
            vehiculeLabel: i.vehicule ? i.vehicule.immatriculation : '—',
            conducteurLabel: i.conducteur
                ? (i.conducteur.utilisateur
                    ? `${i.conducteur.utilisateur.nom || ''} ${i.conducteur.utilisateur.prenom || ''}`.trim()
                    : `${i.conducteur.nom || ''} ${i.conducteur.prenom || ''}`.trim()
            ) || `Conducteur #${i.conducteur.id}`
                : '—',
            missionLabel: i.mission ? (i.mission.reference || '#' + i.mission.id) : '—',
        }));

        filtrerInfractions();
        mettreAJourKPI();
    } catch (e) {
        console.error('Erreur chargement infractions:', e);
    }
}

// ── KPI ──
function mettreAJourKPI() {
    let total = allInfractions.length;
    let payees = 0;
    let montantTotal = 0;
    allInfractions.forEach(i => {
        if (isPayee(i)) payees++;
        if (i.montant) montantTotal += parseFloat(i.montant);
    });
    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-payees').textContent = payees;
    document.getElementById('kpi-non-payees').textContent = total - payees;
    document.getElementById('kpi-montant').textContent =
        montantTotal.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
    const nbEl = document.getElementById('nb-total-infractions');
    if (nbEl) nbEl.textContent = total;
}

// ── FILTRE ──
function filtrerInfractions() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    filtered = allInfractions.filter(i => {
        return !search ||
            (i.categorie || '').toLowerCase().includes(search) ||
            (i.description || '').toLowerCase().includes(search) ||
            (i.vehiculeLabel || '').toLowerCase().includes(search) ||
            (i.conducteurLabel || '').toLowerCase().includes(search);
    });
    currentPage = 0;
    afficherPage();
}

// ── AFFICHAGE DE LA PAGE (tableau) ──
function afficherPage() {
    const tbody = document.getElementById('infractions-tbody');
    const debut = currentPage * pageSize;
    const fin = debut + pageSize;
    const page = filtered.slice(debut, fin);

    if (filtered.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="9" class="text-center text-muted py-4">Aucune infraction trouvée</td></tr>';
    } else {
        tbody.innerHTML = '';
        page.forEach(i => {
            tbody.innerHTML += `<tr>
                <td><b style="color:var(--primary)">#${i.id}</b></td>
                <td><b>${formatDate(i.dateCommis)}</b></td>
                <td>${i.vehiculeLabel}</td>
                <td>${i.conducteurLabel}</td>
                <td>${i.missionLabel}</td>
                <td><span class="badge-statut badge-gray">${i.categorie || '—'}</span></td>
                <td><span style="color:var(--red); font-weight:600">${i.montant ? parseFloat(i.montant).toFixed(2) + ' MAD' : '—'}</span></td>
                <td>${formatDate(i.dateLimitePaiement)}</td>
                <td>
                    <div style="display:flex;gap:5px">
                        <button class="btn-icon" title="Voir détails" onclick="voirDetail(${i.id})"><i class="bi bi-eye text-primary"></i></button>
                        <button class="btn-icon" title="Modifier" onclick="modifierInfraction(${i.id})"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn-icon" title="Supprimer" onclick="confirmerSuppression(${i.id}, '${(i.categorie || 'cette infraction').replace(/'/g, "\\'")}')"><i class="bi bi-trash" style="color:#ef4444"></i></button>
                    </div>
                </td>
            </tr>`;
        });
    }

    // Pagination (même structure que vehicule.js)
    afficherPagination({
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
        number: currentPage,
        size: pageSize,
        first: currentPage === 0,
        last: currentPage === Math.ceil(filtered.length / pageSize) - 1
    });
}

// ── PAGINATION (copie de vehicule.js) ──
function afficherPagination(data) {
    const container = document.getElementById('pagination-container');
    const info = document.getElementById('pagination-info');
    if (!container || !info) return;
    container.innerHTML = '';
    const totalPages = data.totalPages;
    const totalElements = data.totalElements;
    const start = data.totalElements === 0 ? 0 : data.number * data.size + 1;
    const end = Math.min(start + data.size - 1, totalElements);
    info.textContent = totalElements > 0
        ? `Affichage de ${start} à ${end} sur ${totalElements}`
        : '0 résultat';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-icon ${data.first ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => { currentPage = data.number - 1; afficherPage(); };
    container.appendChild(prevBtn);

    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= data.number - 1 && i <= data.number + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-icon ${i === data.number ? 'active' : ''}`;
            pageBtn.style.width = '32px';
            pageBtn.textContent = i + 1;
            pageBtn.onclick = () => { currentPage = i; afficherPage(); };
            container.appendChild(pageBtn);
        } else if (i === 1 || i === totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            dots.style.color = 'var(--text-muted)';
            container.appendChild(dots);
        }
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = `btn-icon ${data.last ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => { currentPage = data.number + 1; afficherPage(); };
    container.appendChild(nextBtn);
}

// ── MODAL AJOUT ──
function ouvrirAjout() {
    infractionIdToEdit = null;
    document.getElementById('infractionForm').reset();
    document.getElementById('infractionModalTitle').textContent = 'Nouvelle Infraction';
    const btnExpense = document.getElementById('btnGoToExpense');
    if (btnExpense) btnExpense.style.display = 'none';
    new bootstrap.Modal(document.getElementById('infractionModal')).show();
}

// ── MODAL MODIFICATION ──
function modifierInfraction(id) {
    const i = allInfractions.find(x => x.id == id);
    if (!i) return;

    infractionIdToEdit = i.id;
    document.getElementById('infractionModalTitle').textContent = 'Modifier Infraction';

    document.getElementById('categorie').value = i.categorie || '';
    document.getElementById('dateCommis').value = i.dateCommis || '';
    document.getElementById('dateLimitePaiement').value = i.dateLimitePaiement || '';
    document.getElementById('montant').value = i.montant || '';
    document.getElementById('description').value = i.description || '';

    document.getElementById('vehiculeId').value = i.vehicule ? i.vehicule.id : '';
    document.getElementById('conducteurId').value = i.conducteur ? i.conducteur.id : '';
    document.getElementById('missionId').value = i.mission ? i.mission.id : '';
    document.getElementById('fichier').value = '';

    const btnExpense = document.getElementById('btnGoToExpense');
    if (btnExpense) btnExpense.style.display = '';

    new bootstrap.Modal(document.getElementById('infractionModal')).show();
}

function goToExpense() {
    if (!infractionIdToEdit) {
        alert('Veuillez d\'abord enregistrer cette infraction avant d\'accéder à sa dépense.');
        return;
    }
    const sourceCustom = 'Infraction #' + infractionIdToEdit;
    window.location.href = '/admin/depenses?source=' + encodeURIComponent(sourceCustom);
}

// ── SAUVEGARDER (AJOUT/MODIFICATION) ──
async function sauvegarderInfraction() {
    const categorie = document.getElementById('categorie').value.trim();
    const dateCommis = document.getElementById('dateCommis').value;
    const dateLimitePaiement = document.getElementById('dateLimitePaiement').value;
    const montant = document.getElementById('montant').value;
    const fileInput = document.getElementById('fichier');

    if (!categorie || !dateCommis || !dateLimitePaiement || !montant) {
        alert('Veuillez remplir tous les champs obligatoires (*).');
        return;
    }

    const formData = new FormData();
    if (infractionIdToEdit) {
        formData.append('id', infractionIdToEdit);
    }
    formData.append('categorie', categorie);
    formData.append('dateCommis', dateCommis);
    formData.append('dateLimitePaiement', dateLimitePaiement);
    formData.append('montant', montant);
    formData.append('description', document.getElementById('description').value.trim());

    if (document.getElementById('vehiculeId').value) formData.append('vehiculeId', document.getElementById('vehiculeId').value);
    if (document.getElementById('conducteurId').value) formData.append('conducteurId', document.getElementById('conducteurId').value);
    if (document.getElementById('missionId').value) formData.append('missionId', document.getElementById('missionId').value);

    if (fileInput && fileInput.files.length > 0) {
        formData.append('fichier', fileInput.files[0]);
    }

    try {
        const headers = authHeaders();
        delete headers['Content-Type'];

        const url = infractionIdToEdit
            ? `/api/infractions/${infractionIdToEdit}`
            : '/api/infractions';
        const method = infractionIdToEdit ? 'PUT' : 'POST';

        const res = await fetch(url, { method, headers, body: formData });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Erreur sauvegarde');
        }

        bootstrap.Modal.getInstance(document.getElementById('infractionModal')).hide();
        await chargerInfractions();
        if (window.loadSidebarStats) window.loadSidebarStats();
        showSuccess('Enregistré !', 'L\'infraction a été enregistrée avec succès.');
    } catch (e) {
        alert('Erreur: ' + e.message);
    }
}

// ── VOIR DÉTAIL ──
function voirDetail(id) {
    const i = allInfractions.find(x => x.id == id);
    if (!i) return;

    document.getElementById('detailContent').innerHTML = `
        <div class="row g-3">
            <div class="col-md-4"><small class="text-muted">Véhicule</small><div class="fw-bold">${i.vehiculeLabel}</div></div>
            <div class="col-md-4"><small class="text-muted">Conducteur</small><div class="fw-bold">${i.conducteurLabel}</div></div>
            <div class="col-md-4"><small class="text-muted">Mission</small><div class="fw-bold">${i.missionLabel}</div></div>
            <div class="col-12 mt-3"><div class="border-top pt-2"></div></div>
            <div class="col-md-6"><small class="text-muted">Catégorie</small><div class="fw-bold">${i.categorie}</div></div>
            <div class="col-md-6"><small class="text-muted">Montant</small><div class="fw-bold text-danger">${i.montant ? i.montant + ' MAD' : '—'}</div></div>
            <div class="col-md-6"><small class="text-muted">Date de l'infraction</small><div>${formatDate(i.dateCommis)}</div></div>
            <div class="col-md-6"><small class="text-muted">Date limite de paiement</small><div>${formatDate(i.dateLimitePaiement)}</div></div>
            <div class="col-12"><small class="text-muted">Description</small><div class="border p-2 rounded mt-1" style="background-color: var(--bg-body); color: var(--text-main);">${i.description || '<i>Aucune description</i>'}</div></div>
            <div class="col-12 mt-3"><div class="border-top pt-2"></div></div>
            <div class="col-md-6"><small class="text-muted">Statut de paiement</small>
                <div class="mt-1">${isPayee(i) ? '<span class="badge-statut badge-active">Payée</span>' : '<span class="badge-statut badge-expired">Non payée</span>'}</div>
            </div>
            <div class="col-md-6"><small class="text-muted">Fichier joint</small>
                <div class="mt-1">${i.fichierInfractionUrl ? `<a href="/api/files?path=${i.fichierInfractionUrl}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-earmark-arrow-down"></i> Voir le fichier</a>` : '—'}</div>
            </div>
        </div>`;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
}

// ── SUPPRESSION ──
function confirmerSuppression(id, categorie) {
    idToDelete = id;
    document.getElementById('deleteText').textContent = `Voulez-vous vraiment supprimer l'infraction "${categorie}" ?`;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

// ── HELPERS ──
function showSuccess(title, msg) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = msg;
    new bootstrap.Modal(document.getElementById('successModal')).show();
}

function formatDate(d) {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isPayee(i) {
    const value = i.estPayee ?? i.est_payee;
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
