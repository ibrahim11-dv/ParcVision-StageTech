// vehicule.js – CRUD véhicules + stats + upload multiples + thème (harmonisé conducteur)

/* ───── GESTION DU THÈME SOMBRE (identique conducteur) ───── */
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('Theme saved:', saved, 'Prefers dark:', prefersDark);
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
document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            toggleTheme();
        });
    }
});

/* ───── PROFILE POPUP ───── */
document.addEventListener('click', e => {
    const row = document.getElementById('profileRow');
    const popup = document.getElementById('profilePopup');
    if (!row || !popup) return;
    if (row.contains(e.target)) popup.classList.toggle('show');
    else popup.classList.remove('show');
});

/* ───── AUTHENTIFICATION ───── */
function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
    return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' };
}

/* ───── VARIABLES GLOBALES ───── */
let currentPage = 0, pageSize = 6, currentSearch = '', currentStatut = '';

/* ───── INITIALISATION ───── */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    chargerStats();
    chargerVehicules();

    document.getElementById('vehSearch').addEventListener('input', debounce(() => {
        currentSearch = document.getElementById('vehSearch').value;
        currentPage = 0;
        chargerVehicules();
    }, 300));
    document.getElementById('vehFilter').addEventListener('change', e => {
        currentStatut = e.target.value === 'all' ? '' : e.target.value;
        currentPage = 0;
        chargerVehicules();
    });

    setupUploadArea('vehicleUploadArea', 'vehicleImagesInput', 'imagePreviewContainer');
    setupUploadArea('editVehicleUploadArea', 'editVehicleImagesInput', 'editImagePreviewContainer');

    // Formulaire ajout
    document.getElementById('addVehicleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.querySelector('button[form="addVehicleForm"]');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        btn.disabled = true;
        const formData = new FormData(e.target);
        try {
            const res = await fetch('/api/vehicules', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + getToken() },
                body: formData
            });
            if (res.ok) {
                alert('Véhicule ajouté');
                bootstrap.Modal.getInstance(document.getElementById('addVehicleModal')).hide();
                chargerVehicules();
                chargerStats();
                e.target.reset();
                document.getElementById('imagePreviewContainer').innerHTML = '';
            } else {
                const err = await res.json();
                alert(err.error || 'Erreur');
            }
        } catch (err) { alert('Erreur réseau'); }
        btn.innerHTML = 'Enregistrer le véhicule';
        btn.disabled = false;
    });

    // Formulaire modification
    document.getElementById('editVehicleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-vehicle-id').value;
        const btn = document.querySelector('button[form="editVehicleForm"]');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        btn.disabled = true;
        const formData = new FormData(e.target);
        try {
            const res = await fetch(`/api/vehicules/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + getToken() },
                body: formData
            });
            if (res.ok) {
                alert('Modifications enregistrées');
                bootstrap.Modal.getInstance(document.getElementById('editVehicleModal')).hide();
                chargerVehicules();
                chargerStats();
            } else {
                const err = await res.json();
                alert(err.error || 'Erreur');
            }
        } catch (err) { alert('Erreur réseau'); }
        btn.innerHTML = 'Enregistrer les modifications';
        btn.disabled = false;
    });
});

/* ───── STATISTIQUES ───── */
async function chargerStats() {
    const res = await fetch('/api/vehicules/stats', { headers: authHeaders() });
    if (!res.ok) return;
    const s = await res.json();
    document.getElementById('kpi-total-veh').textContent = s.total || 0;
    document.getElementById('kpi-dispo-veh').textContent = s.disponible || 0;
    document.getElementById('kpi-mission-veh').textContent = s.mission || 0;
    document.getElementById('kpi-maintenance-veh').textContent = s.maintenance || 0;
}

/* ───── LISTE VÉHICULES ───── */
async function chargerVehicules() {
    let url = `/api/vehicules?page=${currentPage}&size=${pageSize}`;
    if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
    if (currentStatut) url += `&statut=${currentStatut}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return;
    const page = await res.json();
    afficherVehicules(page.content);
    afficherPagination(page);
}

function afficherVehicules(vehicules) {
    const tbody = document.getElementById('vehicules-tbody');
    tbody.innerHTML = '';
    if (vehicules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun véhicule</td></tr>';
        return;
    }
    vehicules.forEach(v => {
        const images = v.imagesUrls ? v.imagesUrls.split(',') : [];
        const firstImage = images[0] && images[0].trim() !== '' ? images[0].trim() : null;

        let imgHtml;
        if (firstImage) {
            const cleanPath = firstImage.startsWith('/') ? firstImage : '/' + firstImage;
            imgHtml = `<img src="${cleanPath}" width="50" height="36" style="object-fit:cover;border-radius:6px;border:1px solid var(--border-color)" onerror="this.style.display='none'">`;
        } else {
            imgHtml = '<div class="profile-av bg-light text-primary" style="width:40px;height:30px;border-radius:6px"><i class="bi bi-truck"></i></div>';
        }

        const statutClass = v.statutVehicule === 'DISPONIBLE' ? 'prio-faible' : (v.statutVehicule === 'EN_MISSION' ? 'prio-normale' : 'prio-haute');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${imgHtml}</td>
            <td><b>${v.immatriculation}</b></td>
            <td>${v.marque} ${v.model}</td>
            <td>${v.typeVehicule}</td>
            <td><span class="prio-badge ${statutClass}">${v.statutVehicule.replace('_', ' ')}</span></td>
            <td>
                <button class="btn-icon" onclick="ouvrirModification(${v.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn-icon" onclick="supprimerVehicule(${v.id}, '${v.immatriculation}')"><i class="bi bi-trash" style="color:#ef4444"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ───── PAGINATION (avec IDs unifiés) ───── */
function afficherPagination(page) {
    const container = document.getElementById('pagination-container');   // id unifié
    const info = document.getElementById('pagination-info');             // id unifié
    container.innerHTML = '';
    for (let i = 0; i < page.totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-ghost';
        btn.style.padding = '6px 14px';
        btn.textContent = i + 1;
        if (i === page.number) { btn.style.background = 'var(--accent)'; btn.style.color = 'white'; }
        btn.addEventListener('click', () => { currentPage = i; chargerVehicules(); });
        container.appendChild(btn);
    }
    if (info) {
        const debut = page.number * page.size + 1;
        const fin = Math.min((page.number + 1) * page.size, page.totalElements);
        info.textContent = `Affichage de ${debut} à ${fin} sur ${page.totalElements} véhicules`;
    }
}

/* ───── SUPPRESSION ───── */
async function supprimerVehicule(id, immat) {
    if (!confirm(`Supprimer le véhicule ${immat} ?`)) return;
    const res = await fetch(`/api/vehicules/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) { chargerVehicules(); chargerStats(); }
    else { const err = await res.json(); alert(err.error || 'Erreur'); }
}

/* ───── MODIFICATION ───── */
async function ouvrirModification(id) {
    const res = await fetch(`/api/vehicules/${id}`, { headers: authHeaders() });
    if (!res.ok) return;
    const v = await res.json();
    document.getElementById('edit-vehicle-id').value = v.id;
    document.getElementById('edit-immatriculation').value = v.immatriculation;
    document.getElementById('edit-marque').value = v.marque;
    document.getElementById('edit-model').value = v.model;
    document.getElementById('edit-kilometrageActuel').value = v.kilometrageActuel || '';
    document.getElementById('edit-capaciteChargeKg').value = v.capaciteChargeKg || '';
    document.getElementById('edit-carburant').value = v.carburant || '';
    document.getElementById('edit-dateExpirationAssurance').value = v.dateExpirationAssurance || '';
    document.getElementById('edit-dateProchainControleTechnique').value = v.dateProchainControleTechnique || '';
    document.getElementById('edit-dateMiseCirculation').value = v.dateMiseCirculation || '';
    document.getElementById('edit-typeVehicule').value = v.typeVehicule;
    document.getElementById('edit-statutVehicule').value = v.statutVehicule;
    document.getElementById('editVehicleForm').querySelector('input[name="imagesVehicule"]').value = '';
    document.getElementById('editImagePreviewContainer').innerHTML = '';
    new bootstrap.Modal(document.getElementById('editVehicleModal')).show();
}

/* ───── UPLOAD ───── */
function setupUploadArea(areaId, inputId, previewContainerId) {
    const area = document.getElementById(areaId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewContainerId);
    if (!area || !input || !preview) return;
    area.addEventListener('click', () => input.click());
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => area.addEventListener(event, e => e.preventDefault()));
    area.addEventListener('drop', e => { input.files = e.dataTransfer.files; afficherPreviews(input.files, preview); });
    input.addEventListener('change', () => afficherPreviews(input.files, preview));
}

function afficherPreviews(files, container) {
    container.innerHTML = '';
    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '80px'; img.style.height = '60px'; img.style.objectFit = 'cover'; img.style.margin = '4px';
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.openMobile = () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
};
window.closeMobile = () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
};