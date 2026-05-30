/* ═════════════════════════════════════════════════════
   assurance.js – CRUD Assurances + Stats + Thème + Pagination
   Alignement sur vehicule.js
   ═════════════════════════════════════════════════════ */

// ── AUTH ──
function getToken() { return localStorage.getItem('token') || sessionStorage.getItem('token'); }
function authHeaders() { return { 'Authorization': 'Bearer ' + getToken() }; }

// ── STATE ──
let allAssurances = [];
let assuranceIdToEdit = null;
let filtered = [];
let currentPage = 0;
const pageSize = 6;          // comme vehicule.js
let idToDelete = null;

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    chargerVehicules();
    chargerAssurances();

    // Profile popup (identique)
    document.getElementById('profileRow').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('profilePopup').classList.toggle('show');
    });
    document.addEventListener('click', () => document.getElementById('profilePopup').classList.remove('show'));

    // Thème
    document.getElementById('themeToggleBtn').addEventListener('click', e => {
        e.preventDefault();
        toggleTheme();
        document.getElementById('profilePopup').classList.remove('show');
    });

    // Suppression
    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (!idToDelete) return;
        try {
            const res = await fetch(`/api/assurances/${idToDelete}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error('Erreur suppression');
            idToDelete = null;
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            await chargerAssurances();
            showSuccess('Supprimé', 'L\'assurance a été supprimée.');
        } catch (e) { alert(e.message); }
    });

    // Recherche et filtre
    document.getElementById('searchInput').addEventListener('input', debounce(() => {
        filtrerAssurances();
    }, 300));
    document.getElementById('statutFilter').addEventListener('change', () => {
        filtrerAssurances();
    });
});

// ── THEME (identique vehicule.js) ──
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        updateThemeUI(true);
    } else {
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-bs-theme', 'light');
        updateThemeUI(false);
    }
}
function updateThemeUI(isDark) {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    if (icon) icon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    if (text) text.textContent = isDark ? 'Mode clair' : 'Mode sombre';
}
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

// ── SIDEBAR ──
let sidebarMini = false;
function toggleSidebar() {
    sidebarMini = !sidebarMini;
    document.getElementById('sidebar').classList.toggle('mini', sidebarMini);
    document.getElementById('main').classList.toggle('mini', sidebarMini);
    document.getElementById('collapseIcon').className = sidebarMini ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
}
window.openMobile = () => { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').style.display = 'block'; };
window.closeMobile = () => { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; };

// ── CHARGER VÉHICULES ──
async function chargerVehicules() {
    try {
        const res = await fetch('/api/vehicules?page=0&size=999', { headers: authHeaders() });
        if (!res.ok) return;
        const page = await res.json();
        const sel = document.getElementById('vehiculeId');
        page.content.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = `${v.immatriculation} — ${v.marque} ${v.model}`;
            sel.appendChild(opt);
        });
    } catch(e) { console.error(e); }
}

// ── CHARGER ASSURANCES ──
async function chargerAssurances() {
    try {
        const res = await fetch('/api/assurances?page=0&size=9999', { headers: authHeaders() });
        if (!res.ok) throw new Error('Erreur');
        const data = await res.json();
        allAssurances = data.content.map(a => ({
            ...a,
            vehiculeLabel: a.vehicule ? `${a.vehicule.immatriculation} — ${a.vehicule.marque}` : '—',
            vehiculeId: a.vehicule ? a.vehicule.id : null
        }));
        filtrerAssurances();
        mettreAJourKPI();
    } catch(e) { console.error(e); }
}

// ── KPI ──
function mettreAJourKPI() {
    const today = new Date();
    const soon = new Date(); soon.setDate(soon.getDate() + 30);
    let actif = 0, bientot = 0, expire = 0;
    allAssurances.forEach(a => {
        const exp = new Date(a.dateExpiration);
        if (exp < today) expire++;
        else if (exp <= soon) bientot++;
        else actif++;
    });
    document.getElementById('kpi-total').textContent = allAssurances.length;
    document.getElementById('kpi-actif').textContent = actif;
    document.getElementById('kpi-bientot').textContent = bientot;
    document.getElementById('kpi-expire').textContent = expire;
    document.getElementById('nb-total-assurances').textContent = allAssurances.length;
}

// ── FILTRE ──
function filtrerAssurances() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const statut = document.getElementById('statutFilter').value;
    const today = new Date();
    const soon = new Date(); soon.setDate(soon.getDate() + 30);

    filtered = allAssurances.filter(a => {
        const matchSearch = !search ||
            (a.vehiculeLabel || '').toLowerCase().includes(search) ||
            (a.nomPrestataire || '').toLowerCase().includes(search);

        let aStatut = 'ACTIF';
        const exp = new Date(a.dateExpiration);
        if (exp < today) aStatut = 'EXPIRE';
        else if (exp <= soon) aStatut = 'BIENTOT';

        const matchStatut = !statut || aStatut === statut;
        return matchSearch && matchStatut;
    });

    currentPage = 0;
    afficherPage();
}

function afficherPage() {
    const tbody = document.getElementById('assurances-tbody');
    const debut = currentPage * pageSize;
    const fin = debut + pageSize;
    const page = filtered.slice(debut, fin);
    const today = new Date();
    const soon = new Date(); soon.setDate(soon.getDate() + 30);

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted py-4">Aucune assurance trouvée</td></tr>';
    } else {
        tbody.innerHTML = '';
        page.forEach(a => {
            const exp = new Date(a.dateExpiration);
            let statutClass, statutLabel, barClass;
            if (exp < today) { statutClass = 'badge-expired'; statutLabel = 'Expiré'; barClass = 'exp'; }
            else if (exp <= soon) { statutClass = 'badge-soon'; statutLabel = 'Bientôt'; barClass = 'soon'; }
            else { statutClass = 'badge-active'; statutLabel = 'Actif'; barClass = 'ok'; }

            const total = new Date(a.dateDebut);
            const totalDays = Math.max(1, (exp - total) / 86400000);
            const elapsed = Math.max(0, (today - total) / 86400000);
            const pct = Math.min(100, Math.round((elapsed / totalDays) * 100));

            tbody.innerHTML += `<tr>
                <td><b style="color:var(--primary)">#${a.id}</b></td>
                <td><b>${a.vehiculeLabel || '-'}</b></td>
                <td>${a.nomPrestataire || '-'}</td>
                <td>${formatType(a.typeAssurance)}</td>
                <td>${formatDate(a.dateDebut)}</td>
                <td><b>${formatDate(a.dateExpiration)}</b></td>
                <td>${a.montant ? a.montant + ' MAD' : '-'}</td>
                <td>${a.datePaiement ? formatDate(a.datePaiement) : '-'}</td>
                <td>${a.estPayee ? '<span class="badge-statut badge-active">OUI</span>' : '<span class="badge-statut badge-expired">NON</span>'}</td>
                <td><div class="expiry-bar-wrap"><div class="expiry-bar ${barClass}" style="width:${pct}%"></div></div><small style="font-size:.7rem;color:var(--gray-400)">${pct}%</small></td>
                <td><span class="badge-statut ${statutClass}">${statutLabel}</span></td>
                <td>
                    <div style="display:flex;gap:5px">
                        <button class="btn-icon" title="Voir détails" onclick="voirDetail(${a.id})"><i class="bi bi-eye text-primary"></i></button>
                        <button class="btn-icon" title="Modifier" onclick="modifierAssurance(${a.id})"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn-icon" title="Supprimer" onclick="confirmerSuppression(${a.id}, '${a.nomPrestataire}')"><i class="bi bi-trash" style="color:#ef4444"></i></button>
                    </div>
                </td>
            </tr>`;
        });
    }

    // Pagination (identique à vehicule.js)
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

// ── MODAL AJOUT / MODIF ──
function ouvrirAjout() {
    assuranceIdToEdit = null;
    document.getElementById('assuranceForm').reset();
    document.getElementById('assuranceModalTitle').textContent = 'Nouvelle Assurance';
    new bootstrap.Modal(document.getElementById('assuranceModal')).show();
}

function modifierAssurance(id) {
    const a = allAssurances.find(x => x.id == id);
    if (!a) return;
    assuranceIdToEdit = a.id;
    document.getElementById('assuranceModalTitle').textContent = 'Modifier Assurance';
    document.getElementById('vehiculeId').value = a.vehiculeId || '';
    document.getElementById('typeAssurance').value = a.typeAssurance || '';
    document.getElementById('nomPrestataire').value = a.nomPrestataire || '';
    document.getElementById('dateDebut').value = a.dateDebut || '';
    document.getElementById('dateExpiration').value = a.dateExpiration || '';
    document.getElementById('nombreMois').value = a.nombreMois || '';
    document.getElementById('montant').value = a.montant || '';
    document.getElementById('attestation').value = '';
    new bootstrap.Modal(document.getElementById('assuranceModal')).show();
}

async function sauvegarderAssurance() {
    const vehiculeId = document.getElementById('vehiculeId').value;
    const typeAssurance = document.getElementById('typeAssurance').value;
    const nomPrestataire = document.getElementById('nomPrestataire').value.trim();
    const dateDebut = document.getElementById('dateDebut').value;
    const dateExpiration = document.getElementById('dateExpiration').value;
    const fileInput = document.getElementById('attestation');

    if (!vehiculeId || !typeAssurance || !nomPrestataire || !dateDebut || !dateExpiration) {
        alert('Veuillez remplir tous les champs obligatoires (*).');
        return;
    }

    const formData = new FormData();
    if (assuranceIdToEdit) formData.append('id', assuranceIdToEdit);
    formData.append('vehiculeId', vehiculeId);
    formData.append('typeAssurance', typeAssurance);
    formData.append('nomPrestataire', nomPrestataire);
    formData.append('dateDebut', dateDebut);
    formData.append('dateExpiration', dateExpiration);
    formData.append('nombreMois', document.getElementById('nombreMois').value || 0);
    formData.append('montant', document.getElementById('montant').value || 0);
    if (fileInput && fileInput.files.length > 0) formData.append('attestation', fileInput.files[0]);

    try {
        const headers = authHeaders();
        delete headers['Content-Type'];
        const url = assuranceIdToEdit ? `/api/assurances/${assuranceIdToEdit}` : '/api/assurances';
        const method = assuranceIdToEdit ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers, body: formData });
        if (!res.ok) { const err = await res.text(); throw new Error(err); }
        bootstrap.Modal.getInstance(document.getElementById('assuranceModal')).hide();
        await chargerAssurances();
        showSuccess('Enregistré', 'L\'assurance a été enregistrée.');
    } catch(e) { alert(e.message); }
}

// ── VOIR DÉTAIL ──
function voirDetail(id) {
    const a = allAssurances.find(x => x.id == id);
    if (!a) return;

    document.getElementById('detailContent').innerHTML = `
        <div class="row g-3">
            <div class="col-md-6"><small class="text-muted">Véhicule</small><div class="fw-bold">${a.vehiculeLabel || '—'}</div></div>
            <div class="col-md-6"><small class="text-muted">Prestataire</small><div class="fw-bold">${a.nomPrestataire || '—'}</div></div>
            <div class="col-md-6"><small class="text-muted">Type</small><div>${formatType(a.typeAssurance)}</div></div>
            <div class="col-md-6"><small class="text-muted">Montant</small><div class="fw-bold text-primary">${a.montant ? a.montant + ' MAD' : '—'}</div></div>
            <div class="col-md-6"><small class="text-muted">Date de début</small><div>${formatDate(a.dateDebut)}</div></div>
            <div class="col-md-6"><small class="text-muted">Date d'expiration</small><div class="text-danger fw-bold">${formatDate(a.dateExpiration)}</div></div>
            <div class="col-md-6"><small class="text-muted">Date de paiement</small><div>${formatDate(a.datePaiement)}</div></div>
            <div class="col-md-6"><small class="text-muted">Statut de paiement</small>
                <div class="mt-1">${a.estPayee ? '<span class="badge-statut badge-active">Payée</span>' : '<span class="badge-statut badge-expired">Non payée</span>'}</div>
            </div>
            <div class="col-12 mt-3"><div class="border-top pt-2"></div></div>
            <div class="col-md-12"><small class="text-muted">Fichier d'attestation</small>
                <div class="mt-1">${a.attestationUrl ? '<a href="/api/files?path=' + a.attestationUrl + '" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-earmark-arrow-down"></i> Voir l\'attestation</a>' : '—'}</div>
            </div>
        </div>`;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
}
function confirmerSuppression(id, prestataire) {
    idToDelete = id;
    document.getElementById('deleteText').textContent = `Supprimer l'assurance ${prestataire} —`;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

function showSuccess(title, msg) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = msg;
    new bootstrap.Modal(document.getElementById('successModal')).show();
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'; }
function isPayee(a) { return a.estPayee === true || a.estPayee === 1 || a.estPayee === '1' || String(a.estPayee).toLowerCase() === 'true'; }
function formatType(t) { const map = { TOUS_RISQUES: 'Tous Risques', TIERS: 'Tiers', TIERS_ETENDU: 'Tiers Étendu', AU_TIERS: 'Au Tiers' }; return map[t] || t || '—'; }

function debounce(func, wait) {
    let timeout;
    return function (...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); };
}