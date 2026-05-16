// ══════════════════════════════════════════
// conducteur.js – CRUD complet + stats + upload + thème
// ══════════════════════════════════════════

/* ───── GESTION DU THÈME SOMBRE ───── */
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
document.addEventListener('click', function (e) {
    const row = document.getElementById('profileRow');
    const popup = document.getElementById('profilePopup');
    if (!row || !popup) return;
    if (row.contains(e.target)) {
        popup.classList.toggle('show');
    } else {
        popup.classList.remove('show');
    }
});

/* ───── UPLOAD DRAG & DROP ───── */
function setupUploadArea(uploadArea, fileInput, previewImg) {
    if (!uploadArea || !fileInput || !previewImg) return;
    uploadArea.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        uploadArea.addEventListener(event, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    ['dragenter', 'dragover'].forEach(event => {
        uploadArea.addEventListener(event, () => uploadArea.classList.add('dragover'));
    });
    ['dragleave', 'drop'].forEach(event => {
        uploadArea.addEventListener(event, () => uploadArea.classList.remove('dragover'));
    });
    uploadArea.addEventListener('drop', async (e) => {
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file, fileInput, previewImg, uploadArea);
    });
    fileInput.addEventListener('change', function () {
        if (this.files[0]) handleFile(this.files[0], fileInput, previewImg, uploadArea);
    });
}

function handleFile(file, fileInput, previewImg, uploadArea) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
        previewImg.src = reader.result;
        previewImg.style.display = 'block';
        uploadArea.querySelector('i').style.display = 'none';
        uploadArea.querySelector('span').style.display = 'none';
    };
    reader.readAsDataURL(file);
    // Transférer le fichier dans l'input pour que FormData le capture
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
}

/* ───── AUTHENTIFICATION ───── */
function getToken() {
    return localStorage.getItem('token');
}
function authHeaders() {
    return {
        'Authorization': 'Bearer ' + getToken(),
        'Content-Type': 'application/json'
    };
}

/* ───── VARIABLES GLOBALES ───── */
let currentPage = 0;
let pageSize = 6;
let currentSearch = '';
let currentStatut = '';

/* ───── INITIALISATION AU CHARGEMENT ───── */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // Upload zone pour l'ajout
    setupUploadArea(
        document.getElementById('profileUploadArea'),
        document.getElementById('profileImageInput'),
        document.getElementById('profilePreview')
    );
    // Upload zone pour l'édition
    setupUploadArea(
        document.getElementById('editUploadArea'),
        document.getElementById('editPhotoInput'),
        document.getElementById('editProfilePreview')
    );

    chargerStats();
    chargerConducteurs();

    // Recherche et filtre
    const searchInput = document.getElementById('condSearch');
    const filterSelect = document.getElementById('condFilter');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentSearch = searchInput.value;
            currentPage = 0;
            chargerConducteurs();
        }, 300));
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            currentStatut = filterSelect.value === 'all' ? '' : filterSelect.value.toUpperCase();
            currentPage = 0;
            chargerConducteurs();
        });
    }

    // Soumission AJOUT
    const addForm = document.getElementById('addDriverForm');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.querySelector('button[form="addDriverForm"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enregistrement...';
            btn.disabled = true;
            try {
                const res = await fetch('/api/conducteurs', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + getToken() },
                    body: new FormData(addForm)
                });
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addDriverModal'));
                    modal.hide();
                    chargerConducteurs();
                    chargerStats();
                    addForm.reset();
                    showSuccess('Conducteur ajouté', 'Le nouveau conducteur a été enregistré avec succès.');
                } else {
                    const err = await res.json();
                    alert(err.error || 'Erreur lors de l\'ajout');
                }
            } catch (err) {
                alert('Erreur réseau');
            }
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        });
    }

    // Soumission MODIFICATION
    const editForm = document.getElementById('editDriverForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const btn = document.querySelector('button[form="editDriverForm"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enregistrement...';
            btn.disabled = true;
            try {
                const res = await fetch(`/api/conducteurs/${id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': 'Bearer ' + getToken() },
                    body: new FormData(editForm)
                });
                if (res.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('editDriverModal')).hide();
                    chargerConducteurs();
                    chargerStats();
                    showSuccess('Modification réussie', 'Les informations du conducteur ont été mises à jour.');
                } else {
                    const err = await res.json();
                    alert(err.error || 'Erreur modification');
                }
            } catch (err) {
                alert('Erreur réseau');
            }
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        });
    }
});

/* ───── CHARGER STATISTIQUES ───── */
async function chargerStats() {
    const res = await fetch('/api/conducteurs/stats', { headers: authHeaders() });
    if (!res.ok) return;
    const stats = await res.json();
    console.log('Conducteur Stats:', stats);
    setText('kpi-total', stats.total || 0);
    setText('kpi-dispo', stats.disponible || 0);
    setText('kpi-mission', stats.mission || 0);
    setText('kpi-conge', stats.conge || 0);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/* ───── HELPER SUCCESS MODAL ───── */
function showSuccess(title, message) {
    const titleEl = document.getElementById('successTitle');
    const msgEl = document.getElementById('successMessage');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

/* ───── CHARGER LISTE CONDUCTEURS ───── */
async function chargerConducteurs() {
    let url = `/api/conducteurs?page=${currentPage}&size=${pageSize}`;
    if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
    if (currentStatut) url += `&statut=${currentStatut}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            alert("Session expirée ou non autorisée. Veuillez vous reconnecter.");
            window.location.href = '/login';
        } else {
            alert("Erreur lors du chargement des conducteurs.");
        }
        return;
    }
    const page = await res.json();
    afficherConducteurs(page.content);
    afficherPagination(page);
}

function afficherConducteurs(liste) {
    const tbody = document.getElementById('conducteurs-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    console.log('Affichage de la liste:', liste);

    if (!liste || liste.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun conducteur trouvé</td></tr>';
        return;
    }
    liste.forEach(c => {
        try {
            const u = c.utilisateur;
            if (!u) {
                console.warn('Conducteur sans utilisateur:', c);
                return;
            }
            const tr = document.createElement('tr');
            const photoUrl = c.photoProfileUrl 
                ? (c.photoProfileUrl.startsWith('http') ? c.photoProfileUrl : '/' + c.photoProfileUrl)
                : null;

            const avatarStyle = photoUrl
                ? `background-image: url('${photoUrl}'); background-size: cover; background-position: center;`
                : `background: #e2e8f0; color: #94a3b8; display: flex; align-items: center; justify-content: center;`;
            
            // Silhouette style "FB/Insta"
            const placeholderSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>`;
            const avatarContent = photoUrl ? '' : placeholderSvg;

            tr.innerHTML = `
                <td>
                    <div class="profile-av" style="width:34px;height:34px;border-radius:9px;font-size:0.75rem; ${avatarStyle}">
                        ${avatarContent}
                    </div>
                </td>
                <td><b style="color:var(--text-main);">${u.prenom || ''} ${u.nom || ''}</b></td>
                <td>${u.email || ''}</td>
                <td>${u.telephone || ''}</td>
                <td><span class="prio-badge ${statutClass(c.statut)}">${statutLabel(c.statut || 'DISPONIBLE')}</span></td>
                <td>
                    <div style="display:flex;gap:5px">
                        <button class="btn-icon" title="Modifier" onclick="ouvrirModification(${c.id})">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-icon" title="Supprimer" onclick="supprimerConducteur(${c.id}, '${(u.prenom || '')} ${(u.nom || '')}')">
                            <i class="bi bi-trash" style="color:#ef4444"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        } catch (err) {
            console.error('Erreur lors du rendu d\'un conducteur:', err, c);
        }
    });
}


function statutClass(statut) {
    if (statut === 'DISPONIBLE') return 'prio-faible';
    if (statut === 'EN_MISSION') return 'prio-normale';
    return 'prio-haute';
}
function statutLabel(statut) {
    return statut.replace('_', ' ');
}

/* ───── PAGINATION ───── */
function afficherPagination(page) {
    const info = document.getElementById('pagination-info');
    const container = document.getElementById('pagination-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < page.totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-ghost';
        btn.style.padding = '6px 14px';
        btn.style.fontSize = '.8rem';
        btn.textContent = i + 1;
        if (i === page.number) {
            btn.style.background = 'var(--accent)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--accent)';
        }
        btn.addEventListener('click', () => {
            currentPage = i;
            chargerConducteurs();
        });
        container.appendChild(btn);
    }
    if (info) {
        const debut = page.number * page.size + 1;
        const fin = Math.min((page.number + 1) * page.size, page.totalElements);
        info.textContent = `Affichage de ${debut} à ${fin} sur ${page.totalElements} conducteurs`;
    }
}

/* ───── SUPPRESSION ───── */
let idToDelete = null;

async function supprimerConducteur(id, nom) {
    idToDelete = id;
    const textEl = document.getElementById('deleteConfirmText');
    if (textEl) textEl.textContent = `Voulez-vous vraiment supprimer définitivement ${nom} ?`;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    modal.show();
}

// Handler pour le bouton de confirmation dans le modal
document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (!idToDelete) return;
            const modalEl = document.getElementById('confirmDeleteModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            
            try {
                const res = await fetch(`/api/conducteurs/${idToDelete}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + getToken() }
                });
                if (res.ok) {
                    if (modal) modal.hide();
                    chargerConducteurs();
                    chargerStats();
                    showSuccess('Supprimé', 'Le conducteur a été supprimé.');
                } else {
                    const err = await res.json();
                    alert(err.error || 'Erreur suppression');
                }
            } catch (err) {
                alert('Erreur réseau');
            }
            idToDelete = null;
        });
    }
});

/* ───── MODIFICATION (REMPLIR LE MODAL) ───── */
async function ouvrirModification(id) {
    const res = await fetch(`/api/conducteurs/${id}`, { headers: authHeaders() });
    if (!res.ok) return;
    const c = await res.json();
    document.getElementById('edit-id').value = c.id;
    document.getElementById('edit-nom').value = c.utilisateur.nom;
    document.getElementById('edit-prenom').value = c.utilisateur.prenom;
    document.getElementById('edit-dateNaissance').value = c.utilisateur.dateNaissance || '';
    document.getElementById('edit-email').value = c.utilisateur.email;
    document.getElementById('edit-telephone').value = c.utilisateur.telephone;
    document.getElementById('edit-cin').value = c.utilisateur.cin || '';
    document.getElementById('edit-motDePasse').value = '';
    document.getElementById('edit-numeroPermis').value = c.numeroPermis;
    document.getElementById('edit-dateValiditePermis').value = c.dateValiditePermis;
    document.getElementById('edit-dateEmbauche').value = c.dateEmbauche || '';
    document.getElementById('edit-statut').value = c.statut;

    // Réinitialiser la prévisualisation de la photo (si présente)
    const preview = document.getElementById('editProfilePreview');
    if (preview) {
        if (c.photoProfileUrl) {
            preview.src = '/' + c.photoProfileUrl;
            preview.style.display = 'block';
            document.querySelector('#editUploadArea i').style.display = 'none';
            document.querySelector('#editUploadArea span').style.display = 'none';
        } else {
            preview.src = '';
            preview.style.display = 'none';
            document.querySelector('#editUploadArea i').style.display = '';
            document.querySelector('#editUploadArea span').style.display = '';
        }
    }

    new bootstrap.Modal(document.getElementById('editDriverModal')).show();
}

/* ───── HELPER DEBOUNCE ───── */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/* ───── MOBILE SIDEBAR ───── */
window.openMobile = function () {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
};
window.closeMobile = function () {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
};