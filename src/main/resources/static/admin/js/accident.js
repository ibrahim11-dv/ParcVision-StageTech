// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
}

function downloadImage(url, filename) {
    if (!url) return;
    
    // For data URLs (newly added files), they can be downloaded directly
    if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'photo_accident.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
    }
    
    // For server resources, use fetch to get Blob so that the download attribute works reliably
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob();
        })
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || url.substring(url.lastIndexOf('/') + 1) || 'photo_accident.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
            // Fallback: open in new tab
            window.open(url, '_blank');
        });
}

function openLightbox(src) {
    const lightboxImg = document.getElementById('lightboxImage');
    const downloadBtn = document.getElementById('lightboxDownloadBtn');
    if (lightboxImg) {
        lightboxImg.src = src;
    }
    if (downloadBtn) {
        downloadBtn.onclick = (e) => {
            e.stopPropagation();
            downloadImage(src);
        };
    }
    openModal('lightboxModal');
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
        
        ['vehicule', 'editVehicule'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = '<option value="">Sélectionnez un véhicule</option>';
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

async function loadDrivers() {
    try {
        const res = await fetch('/api/conducteurs/all');
        if (!res.ok) throw new Error('Erreur chargement conducteurs');
        const conducteurs = await res.json();
        
        ['conducteur', 'editConducteur'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = '<option value="">Sélectionnez un conducteur</option>';
                conducteurs.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    const user = c.utilisateur || {};
                    opt.textContent = `${user.nom || ''} ${user.prenom || ''}`.trim();
                    select.appendChild(opt);
                });
            }
        });
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
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Accident supprimé avec succès');
        })
        .catch(err => {
            if (window.showToast) window.showToast('Erreur : ' + err.message, 'error');
            else alert('Erreur : ' + err.message);
        });
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
    const size = data.size || 5;
    const start = currentPage * size + 1;
    const end = Math.min(start + size - 1, totalElements);

    summary.textContent = totalElements > 0 
        ? `Affichage de ${start} à ${end} sur ${totalElements} accidents`
        : 'Aucun accident à afficher';

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

let addSelectedFiles = [];
let editSelectedFiles = [];
let editDeletedPhotos = [];

function setupMultiUploadArea(uploadAreaId, fileInputId, previewContainerId, filesArray) {
    const uploadArea = document.getElementById(uploadAreaId);
    const fileInput = document.getElementById(fileInputId);
    const previewContainer = document.getElementById(previewContainerId);

    if (!uploadArea || !fileInput || !previewContainer) return;

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

    uploadArea.addEventListener('drop', e => {
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files, filesArray, previewContainer);
    });

    fileInput.addEventListener('change', function () {
        const files = Array.from(this.files);
        handleFiles(files, filesArray, previewContainer);
        fileInput.value = ''; // Reset input so same file can be selected again
    });
}

function handleFiles(files, filesArray, previewContainer) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    imageFiles.forEach(file => {
        filesArray.push(file);
        
        const reader = new FileReader();
        reader.onload = e => {
            const thumb = document.createElement('div');
            thumb.className = 'preview-thumb';
            thumb.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="cursor: pointer;">
                <button type="button" class="download-btn" title="Télécharger"><i class="bi bi-download"></i></button>
                <button type="button" class="delete-btn"><i class="bi bi-trash"></i></button>
            `;
            
            thumb.querySelector('img').addEventListener('click', () => {
                openLightbox(e.target.result);
            });
            
            thumb.querySelector('.download-btn').addEventListener('click', (ev) => {
                ev.stopPropagation();
                downloadImage(e.target.result, file.name);
            });
            
            thumb.querySelector('.delete-btn').addEventListener('click', (ev) => {
                ev.stopPropagation();
                const index = filesArray.indexOf(file);
                if (index > -1) {
                    filesArray.splice(index, 1);
                }
                thumb.remove();
            });
            
            previewContainer.appendChild(thumb);
        };
        reader.readAsDataURL(file);
    });
}

function cleanPhotoUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    const index = url.indexOf('uploads/');
    if (index !== -1) {
        return '/' + url.substring(index);
    }
    return url.startsWith('/') ? url : '/' + url;
}

function renderExistingPhotosForEdit(photosUrl) {
    const container = document.getElementById('editExistingPhotos');
    if (!container) return;
    container.innerHTML = '';
    editDeletedPhotos = [];
    
    if (!photosUrl || photosUrl.length === 0) {
        container.innerHTML = '<span class="text-muted" style="font-size:0.85rem">Aucune photo enregistrée</span>';
        return;
    }
    
    photosUrl.forEach(url => {
        const fullUrl = cleanPhotoUrl(url);
        const thumb = document.createElement('div');
        thumb.className = 'preview-thumb';
        thumb.innerHTML = `
            <img src="${fullUrl}" alt="Photo" style="cursor: pointer;">
            <button type="button" class="download-btn" title="Télécharger"><i class="bi bi-download"></i></button>
            <button type="button" class="delete-btn"><i class="bi bi-trash"></i></button>
        `;
        
        thumb.querySelector('img').addEventListener('click', () => {
            openLightbox(fullUrl);
        });
        
        thumb.querySelector('.download-btn').addEventListener('click', (ev) => {
            ev.stopPropagation();
            downloadImage(fullUrl);
        });
        
        thumb.querySelector('.delete-btn').addEventListener('click', (ev) => {
            ev.stopPropagation();
            editDeletedPhotos.push(url);
            thumb.remove();
        });
        
        container.appendChild(thumb);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMultiUploadArea('addPhotosUploadArea', 'addPhotosInput', 'addPhotosPreview', addSelectedFiles);
    setupMultiUploadArea('editPhotosUploadArea', 'editPhotosInput', 'editPhotosPreview', editSelectedFiles);
});

let currentAccident = null;

function openViewModal(a) {
    currentAccident = a;
    const values = document.querySelectorAll('#viewModal .view-detail-value');
    values[0].textContent = (a.vehicule?.immatriculation || '') + ' ' + (a.vehicule?.model || '');
    values[1].textContent = (a.conducteur?.utilisateur?.nom || '') + ' ' + (a.conducteur?.utilisateur?.prenom || '');
    values[2].textContent = a.dateIntervention + ' - ' + a.lieu;
    values[3].textContent = a.contexte;
    values[4].textContent = a.gravite;
    values[5].textContent = (a.budgetEstime || 0).toLocaleString() + ' DH';
    values[6].textContent = a.descriptionPanne || '';

    // Rendu des photos dans la galerie
    const gallery = document.getElementById('viewPhotosGallery');
    if (gallery) {
        gallery.innerHTML = '';
        if (a.photosUrl && a.photosUrl.length > 0) {
            a.photosUrl.forEach(url => {
                const fullUrl = cleanPhotoUrl(url);
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `
                    <img src="${fullUrl}" alt="Photo de l'accident">
                    <button type="button" class="download-btn-overlay" title="Télécharger">
                        <i class="bi bi-download"></i>
                    </button>
                `;
                
                item.addEventListener('click', () => {
                    openLightbox(fullUrl);
                });
                
                item.querySelector('.download-btn-overlay').addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    downloadImage(fullUrl);
                });
                
                gallery.appendChild(item);
            });
        } else {
            gallery.innerHTML = '<span class="text-muted" style="font-size:0.85rem">Aucune photo disponible</span>';
        }
    }

    openModal('viewModal');
}

function openEditModal(a) {
    if (!a) return;
    currentAccident = a;
    document.getElementById('editModal').dataset.accidentId = a.id;
    if (document.getElementById('editVehicule')) {
        document.getElementById('editVehicule').value = a.vehicule?.id || '';
    }
    if (document.getElementById('editConducteur')) {
        document.getElementById('editConducteur').value = a.conducteur?.id || '';
    }
    if (document.getElementById('editTime')) {
        let dt = a.dateIntervention || '';
        if (dt && dt.length === 10) dt += 'T00:00';
        document.getElementById('editTime').value = dt;
    }
    if (document.getElementById('editLieu')) {
        document.getElementById('editLieu').value = a.lieu || '';
    }
    if (document.getElementById('editContexte')) {
        document.getElementById('editContexte').value = a.contexte || 'en-mission';
    }
    if (document.getElementById('editGravite')) {
        document.getElementById('editGravite').value = a.gravite || 'mineur';
    }
    if (document.getElementById('editDescription')) {
        document.getElementById('editDescription').value = a.descriptionPanne || '';
    }
    document.getElementById('statutSelectEdit').value = a.etat || 'En expertise';
    document.getElementById('budgetInputEdit').value = a.budgetEstime ?? '';
    document.getElementById('notesTextarea').value = a.notes || '';
    
    // Reset new photos
    editSelectedFiles = [];
    document.getElementById('editPhotosPreview').innerHTML = '';
    
    // Render existing photos
    renderExistingPhotosForEdit(a.photosUrl);

    // Show "Voir Dépenses" button and set redirect
    const goToExpensesBtn = document.getElementById('goToExpensesBtn');
    if (goToExpensesBtn) {
        goToExpensesBtn.style.display = 'block';
        goToExpensesBtn.onclick = (e) => {
            e.preventDefault();
            const ref = `Accident #${a.id}`;
            window.location.href = `/admin/depenses?source=${encodeURIComponent(ref)}`;
        };
    }
    
    openModal('editModal');
}

function submitEditModal() {
    const id = document.getElementById('editModal').dataset.accidentId;
    const formData = new FormData();
    
    const editVeh = document.getElementById('editVehicule')?.value;
    const editCond = document.getElementById('editConducteur')?.value;
    const editTime = document.getElementById('editTime')?.value;
    const editLieu = document.getElementById('editLieu')?.value;
    const editContexte = document.getElementById('editContexte')?.value;
    const editGravite = document.getElementById('editGravite')?.value;
    const editDescription = document.getElementById('editDescription')?.value;

    if (editVeh) formData.append("vehiculeId", editVeh);
    if (editCond) formData.append("conducteurId", editCond);
    if (editTime) formData.append("dateIntervention", editTime);
    if (editLieu !== undefined) formData.append("lieu", editLieu);
    if (editContexte) formData.append("contexte", editContexte);
    if (editGravite) formData.append("gravite", editGravite);
    if (editDescription !== undefined) formData.append("descriptionPanne", editDescription);

    formData.append("etat", document.getElementById('statutSelectEdit').value);
    const budgetVal = document.getElementById('budgetInputEdit').value;
    formData.append("budgetEstime", isNaN(parseFloat(budgetVal)) ? 0 : parseFloat(budgetVal));
    formData.append("notes", document.getElementById('notesTextarea').value);
    
    editDeletedPhotos.forEach(url => {
        formData.append("deletedPhotos", url);
    });
    
    editSelectedFiles.forEach(file => {
        formData.append("photos", file);
    });

    const btn = document.querySelector('#editModal button.btn-primary');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Mise à jour...';
    btn.disabled = true;

    fetch(`${API_BASE}/update/${id}`, {
        method: 'PUT',
        body: formData
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur mise à jour');
            return res.json();
        })
        .then(() => {
            closeModal('editModal');
            fetchAccidents(0);
            fetchStats();
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Accident mis à jour avec succès');
            editSelectedFiles = [];
            editDeletedPhotos = [];
            document.getElementById('editPhotosPreview').innerHTML = '';
        })
        .catch(err => {
            if (window.showToast) window.showToast('Erreur : ' + err.message, 'error');
            else alert('Erreur : ' + err.message);
        })
        .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        });
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

    const formData = new FormData();
    formData.append("vehiculeId", vehiculeId);
    formData.append("conducteurId", conducteurId);
    formData.append("dateIntervention", time);
    formData.append("descriptionPanne", description);
    formData.append("lieu", lieu);
    formData.append("contexte", contexte);
    formData.append("gravite", gravite);
    formData.append("etat", statut);
    formData.append("budgetEstime", parseFloat(budget) || 0);

    addSelectedFiles.forEach(file => {
        formData.append("photos", file);
    });

    const btn = document.querySelector('#addModal button.btn-primary');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Enregistrement...';
    btn.disabled = true;

    fetch(`${API_BASE}/Add`, {
        method: 'POST',
        body: formData
    })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text) });
            return res.json();
        })
        .then(() => {
            closeModal('addModal');
            document.getElementById("vehicule").value = "";
            document.getElementById("conducteur").value = "";
            document.getElementById("time").value = "";
            document.getElementById("lieu").value = "";
            document.getElementById("description").value = "";
            
            addSelectedFiles = [];
            document.getElementById('addPhotosPreview').innerHTML = '';

            fetchAccidents(0);
            fetchStats();
            if (window.loadSidebarStats) window.loadSidebarStats();
            if (window.showToast) window.showToast('Accident déclaré avec succès');
        })
        .catch(err => {
            if (window.showToast) window.showToast('Erreur : ' + err.message, 'error');
            else alert('Erreur : ' + err.message);
        })
        .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        });
}

