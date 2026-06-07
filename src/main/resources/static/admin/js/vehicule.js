// vehicule.js – CRUD véhicules + stats + upload multiples + thème (harmonisé conducteur)

/* ───── GESTION DES MODALS PERSONNALISÉES ───── */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

/* ───── AUTHENTIFICATION ───── */
function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
    return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' };
}

/* ───── VARIABLES GLOBALES ───── */
let currentPage = 0, pageSize = 5, currentSearch = '', currentStatut = '';
let idToDelete = null;

/* ───── INITIALISATION ───── */
document.addEventListener('DOMContentLoaded', () => {
    // Fermeture des modals en cliquant sur l'overlay
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

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
                bootstrap.Modal.getInstance(document.getElementById('addVehicleModal')).hide();
                chargerVehicules();
                chargerStats();
                e.target.reset();
                document.getElementById('imagePreviewContainer').innerHTML = '';
                showSuccess('Véhicule ajouté', 'Le nouveau véhicule a été enregistré avec succès.');
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
                bootstrap.Modal.getInstance(document.getElementById('editVehicleModal')).hide();
                chargerVehicules();
                chargerStats();
                showSuccess('Modification réussie', 'Les informations du véhicule ont été mises à jour.');
            } else {
                const err = await res.json();
                alert(err.error || 'Erreur');
            }
        } catch (err) { alert('Erreur réseau'); }
        btn.innerHTML = 'Enregistrer les modifications';
        btn.disabled = false;
    });

    // Confirmation suppression
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!idToDelete) return;
            const res = await fetch(`/api/vehicules/${idToDelete}`, { method: 'DELETE', headers: authHeaders() });
            if (res.ok) {
                closeModal('confirmDeleteModal');
                chargerVehicules();
                chargerStats();
                showSuccess('Supprimé', 'Le véhicule a été supprimé.');
            } else {
                const err = await res.json();
                alert(err.error || 'Erreur');
            }
            idToDelete = null;
        });
    }
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

/* ───── HELPERS MODALS ───── */
function showSuccess(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    new bootstrap.Modal(document.getElementById('successModal')).show();
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
                <div style="display:flex;gap:5px">
                    <button class="btn-icon" title="Voir dÃ©tails" onclick="ouvrirDetailVehicule(${v.id})"><i class="bi bi-eye text-primary"></i></button>
                    <button class="btn-icon" title="Modifier" onclick="ouvrirModification(${v.id})"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn-icon" title="Supprimer" onclick="supprimerVehicule(${v.id}, '${v.immatriculation}')"><i class="bi bi-trash" style="color:#ef4444"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ───── PAGINATION (avec IDs unifiés) ───── */
function afficherPagination(data) {
    const container = document.getElementById('pagination-container');   // id unifié
    const summary = document.getElementById('pagination-info');             // id unifié
    if (!container || !summary) return;

    container.innerHTML = '';
    const totalPages = data.totalPages;
    const totalElements = data.totalElements;
    const start = data.totalElements === 0 ? 0 : data.number * data.size + 1;
    const end = Math.min(start + data.size - 1, totalElements);

    summary.textContent = totalElements > 0 
        ? `Affichage de ${start} à ${end} sur ${totalElements} véhicules`
        : 'Aucun véhicule à afficher';

    if (totalPages <= 1) return;

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-icon ${data.first ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => {
        currentPage = data.number - 1;
        chargerVehicules();
    };
    container.appendChild(prevBtn);

    // Pages
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= data.number - 1 && i <= data.number + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-icon ${i === data.number ? 'active' : ''}`;
            pageBtn.style.width = '32px';
            pageBtn.textContent = i + 1;
            pageBtn.onclick = () => {
                currentPage = i;
                chargerVehicules();
            };
            container.appendChild(pageBtn);
        } else if (i === 1 || i === totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            dots.style.color = 'var(--text-muted)';
            container.appendChild(dots);
        }
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = `btn-icon ${data.last ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => {
        currentPage = data.number + 1;
        chargerVehicules();
    };
    container.appendChild(nextBtn);
}

/* ───── SUPPRESSION ───── */
async function supprimerVehicule(id, immat) {
    idToDelete = id;
    document.getElementById('deleteConfirmText').textContent = `Voulez-vous vraiment supprimer définitivement le véhicule ${immat} ?`;
    openModal('confirmDeleteModal');
}

/* ───── DÉTAILS ───── */
async function ouvrirDetailVehicule(id) {
    const res = await fetch(`/api/vehicules/${id}`, { headers: authHeaders() });
    if (!res.ok) return;
    const v = await res.json();
    document.getElementById('det-immat').textContent = v.immatriculation;
    document.getElementById('det-marque').textContent = v.marque + ' ' + v.model;
    document.getElementById('det-type').textContent = v.typeVehicule;
    document.getElementById('det-statut').textContent = v.statutVehicule;
    document.getElementById('det-carb').textContent = v.carburant || '-';
    document.getElementById('det-km').textContent = v.kilometrageActuel ? v.kilometrageActuel + ' km' : '-';
    document.getElementById('det-charge').textContent = v.capaciteChargeKg ? v.capaciteChargeKg + ' kg' : '-';
    document.getElementById('det-mise').textContent = v.dateMiseCirculation || '-';
    document.getElementById('det-assur').textContent = v.dateExpirationAssurance || '-';
    document.getElementById('det-visite').textContent = v.dateProchainControleTechnique || '-';
    
    // Images
    const container = document.getElementById('det-images');
    container.innerHTML = '';
    if (v.imagesUrls) {
        const urls = v.imagesUrls.split(',');
        urls.forEach(url => {
            if(url.trim()){
                const img = document.createElement('img');
                img.src = url.trim().startsWith('/') ? url.trim() : '/' + url.trim();
                img.style.width = '100px';
                img.style.height = '70px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '6px';
                img.style.border = '1px solid var(--border-color)';
                container.appendChild(img);
            }
        });
    } else {
        container.innerHTML = '<span class="text-muted">Aucune image</span>';
    }

    // Documents
    const docs = document.getElementById('det-docs');
    docs.innerHTML = '';
    if (v.scanCarteGriseUrl) {
        docs.innerHTML += `<a href="/api/files?path=${v.scanCarteGriseUrl}" target="_blank" class="btn btn-sm btn-outline-secondary me-2"><i class="bi bi-file-earmark-pdf"></i> Carte Grise</a>`;
    }
    if (v.scanAssuranceUrl) {
        docs.innerHTML += `<a href="/api/files?path=${v.scanAssuranceUrl}" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="bi bi-file-earmark-pdf"></i> Assurance</a>`;
    }
    if (!v.scanCarteGriseUrl && !v.scanAssuranceUrl) {
        docs.innerHTML = '<span class="text-muted">Aucun document attachÃ©</span>';
    }

    new bootstrap.Modal(document.getElementById('detailVehicleModal')).show();
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