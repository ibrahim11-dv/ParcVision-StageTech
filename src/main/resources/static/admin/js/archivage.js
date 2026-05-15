// ═══════════════════════════════════════════════════════
//  ParcVision — Archivage JS  (API-backed)
// ═══════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────
let rootId        = null;          // DB id of "/"  root folder
let currentStack  = [];            // [{ id, nom, chemin }, …] — navigation stack
let filesToUpload = [];            // staged File objects
let deleteCallback = null;         // for custom delete confirmation modal
let currentSort    = 'nomFichier';
let currentDir     = 'asc';
let currentPreviewDoc = null;      // Track doc for printing

// ── API helpers ───────────────────────────────────────────
const API = '/api/archivage';

async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
    }
    // 204 / empty body
    if (res.status === 204 || res.headers.get('content-length') === '0') return null;
    return res.json();
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupProfilePopup();
    setupModals();
    setupGlobalSearch();
    setupSorting();
    setupPrint();
    setupScanner();
    setupActionButtons();

    try {
        const root = await apiFetch(`${API}/root`);
        rootId = root.id;
        currentStack = [{ id: root.id, nom: '/', chemin: '/' }];
        await refreshGrid();
    } catch (e) {
        showError('Impossible de charger l\'arborescence : ' + e.message);
    }
});

function setupPrint() {
    const printBtn = document.getElementById('printBtn');
    if (!printBtn) return;

    printBtn.addEventListener('click', () => {
        if (!currentPreviewDoc) return;
        const viewUrl = `${API}/documents/${currentPreviewDoc.id}/view`;
        const mime = currentPreviewDoc.typeMime || '';

        if (mime === 'application/pdf') {
            const iframe = document.querySelector('#previewContent iframe');
            if (iframe) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } else {
                window.open(viewUrl, '_blank');
            }
        } else if (mime.startsWith('image/')) {
            const win = window.open('', '_blank');
            win.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;"><img src="${viewUrl}" style="max-width:100%;max-height:100%;" onload="window.print();window.close();"></body></html>`);
            win.document.close();
        } else {
            const content = document.getElementById('previewContent').innerHTML;
            const win = window.open('', '_blank');
            win.document.write(`<html><head><title>${currentPreviewDoc.nomFichier}</title></head><body>${content}<script>window.print();window.close();<\/script></body></html>`);
            win.document.close();
        }
    });
}

function setupSorting() {
    const sortMenu = document.getElementById('sortMenu');
    if (!sortMenu) return;

    sortMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Update state
            currentSort = item.dataset.sort;
            currentDir  = item.dataset.dir;

            // UI update
            sortMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Refresh
            await refreshGrid();
        });
    });
}

// ── Current folder ────────────────────────────────────────
function currentFolderId() {
    return currentStack[currentStack.length - 1].id;
}

// ── Navigate ──────────────────────────────────────────────
async function navigateTo(id, nom, chemin) {
    // Find if already in stack (going back)
    const idx = currentStack.findIndex(s => s.id === id);
    if (idx !== -1) {
        currentStack = currentStack.slice(0, idx + 1);
    } else {
        currentStack.push({ id, nom, chemin });
    }
    await refreshGrid();
}

// ── Refresh grid + breadcrumbs + tree ─────────────────────
async function refreshGrid() {
    renderBreadcrumbs();
    try {
        // Folders are usually sorted by name
        const folderSort = (currentSort === 'nomFichier') ? 'nom' : 'nom';
        
        const [folders, docs] = await Promise.all([
            apiFetch(`${API}/${currentFolderId()}/dossiers?sortBy=${folderSort}&direction=${currentDir}`),
            apiFetch(`${API}/${currentFolderId()}/documents?sortBy=${currentSort}&direction=${currentDir}`)
        ]);
        renderGrid(folders, docs);
        await refreshTree();
    } catch (e) {
        showError('Erreur lors du chargement : ' + e.message);
    }
}

// ── Breadcrumbs ───────────────────────────────────────────
function renderBreadcrumbs() {
    const el = document.getElementById('breadcrumbs');
    el.innerHTML = '';
    currentStack.forEach((node, idx) => {
        const isLast = idx === currentStack.length - 1;
        if (idx > 0) {
            const sep = document.createElement('i');
            sep.className = 'bi bi-chevron-right';
            sep.style.cssText = 'font-size:.7rem;color:var(--gray-400);';
            el.appendChild(sep);
        }
        const item = document.createElement('div');
        item.className = 'breadcrumb-item' + (isLast ? ' active' : '');
        if (isLast) {
            item.textContent = node.nom;
        } else {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = node.nom;
            a.onclick = e => { e.preventDefault(); navigateTo(node.id, node.nom, node.chemin); };
            item.appendChild(a);
        }
        el.appendChild(item);
    });
}

// ── Grid rendering ────────────────────────────────────────
function renderGrid(folders, docs) {
    const grid = document.getElementById('explorerGrid');
    grid.innerHTML = '';

    if (folders.length === 0 && docs.length === 0) {
        grid.innerHTML = `
            <div id="emptyState">
                <i class="bi bi-folder2-open"></i>
                <p class="title">Ce dossier est vide</p>
                <p class="sub">Créez un nouveau dossier ou ajoutez des fichiers.</p>
            </div>`;
        return;
    }

    folders.forEach(folder => {
        const item = document.createElement('div');
        item.className = 'explorer-item';
        item.innerHTML = `
            <div class="item-actions">
                <div class="item-action-btn danger" title="Supprimer"
                     onclick="event.stopPropagation(); confirmDeleteFolder(${folder.id}, '${escHtml(folder.nom)}')">
                    <i class="bi bi-trash3"></i>
                </div>
            </div>
            <div class="explorer-item-icon icon-folder"><i class="bi bi-folder-fill"></i></div>
            <div class="explorer-item-name">${escHtml(folder.nom)}</div>
            <div class="explorer-item-info">
                ${folder.nombreSousDossiers} dossier${folder.nombreSousDossiers !== 1 ? 's' : ''}
                · ${folder.nombreDocuments} fichier${folder.nombreDocuments !== 1 ? 's' : ''}
            </div>`;
        item.ondblclick = () => navigateTo(folder.id, folder.nom, folder.chemin);
        item.onclick    = () => selectItem(item);
        grid.appendChild(item);
    });

    docs.forEach(doc => {
        const fi = getFileIcon(doc.nomFichier);
        const item = document.createElement('div');
        item.className = 'explorer-item';
        item.innerHTML = `
            <div class="item-actions">
                <div class="item-action-btn" title="Imprimer"
                     onclick="event.stopPropagation(); printFile(${doc.id}, '${doc.typeMime}', '${escHtml(doc.nomFichier)}')">
                    <i class="bi bi-printer"></i>
                </div>
                <div class="item-action-btn danger" title="Supprimer"
                     onclick="event.stopPropagation(); confirmDeleteDoc(${doc.id}, '${escHtml(doc.nomFichier)}')">
                    <i class="bi bi-trash3"></i>
                </div>
            </div>
            <div class="explorer-item-icon ${fi.cls}"><i class="bi ${fi.icon}"></i></div>
            <div class="explorer-item-name">${escHtml(doc.nomFichier)}</div>
            <div class="explorer-item-info">${formatSize(doc.taille)}</div>`;
        item.onclick    = () => selectItem(item);
        item.ondblclick = () => openPreview(doc);
        grid.appendChild(item);
    });
}

function selectItem(el) {
    document.querySelectorAll('.explorer-item.selected').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
}

// ── Preview ───────────────────────────────────────────────
function openPreview(doc) {
    currentPreviewDoc = doc; // Track for printing
    const modal = document.getElementById('previewModal');
    const title = document.getElementById('previewTitle');
    const icon  = document.getElementById('previewIcon');
    const content = document.getElementById('previewContent');
    const download = document.getElementById('downloadBtn');
    
    const size  = document.getElementById('previewSize');
    const date  = document.getElementById('previewDate');
    const desc  = document.getElementById('previewDesc');

    const fi = getFileIcon(doc.nomFichier);
    const viewUrl = `${API}/documents/${doc.id}/view`;

    title.textContent = doc.nomFichier;
    icon.className = `bi ${fi.icon} ${fi.cls}`;
    download.href = viewUrl;
    
    size.textContent = formatSize(doc.taille);
    date.textContent = new Date(doc.dateUpload).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    desc.textContent = doc.description || 'Pas de description disponible.';

    content.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';

    // Simple heuristic for preview type
    const mime = doc.typeMime || '';
    if (mime.startsWith('image/')) {
        content.innerHTML = `<img src="${viewUrl}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:var(--shadow-md);">`;
    } else if (mime === 'application/pdf') {
        content.innerHTML = `<iframe src="${viewUrl}" style="width:100%; height:100%; border:none; border-radius:4px;"></iframe>`;
    } else if (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/javascript') {
        // For text files, try to fetch and show
        fetch(viewUrl).then(r => r.text()).then(t => {
            content.innerHTML = `<pre class="bg-white p-3 w-100 h-100 border rounded" style="margin:0; overflow:auto; font-size:0.85rem;">${escHtml(t)}</pre>`;
        }).catch(() => {
            content.innerHTML = `<div class="text-center"><i class="bi bi-file-earmark-text fs-1 text-muted"></i><p class="mt-2">Aperçu non disponible</p></div>`;
        });
    } else {
        content.innerHTML = `
            <div class="text-center p-5">
                <i class="bi ${fi.icon} display-1 text-muted"></i>
                <p class="mt-3 fw-medium">L'aperçu n'est pas disponible pour ce type de fichier.</p>
            </div>`;
    }

    openModal('previewModal');
}

// ── Tree ──────────────────────────────────────────────────
async function refreshTree() {
    const container = document.getElementById('folderTree');
    container.innerHTML = '';
    if (!rootId) return;
    const rootNode = { id: rootId, nom: '/', chemin: '/' };
    const el = await buildTreeNode(rootNode, 0);
    container.appendChild(el);
}

async function buildTreeNode(node, depth) {
    const wrapper = document.createElement('div');
    const isActive = currentFolderId() === node.id;

    let children = [];
    try { children = await apiFetch(`${API}/${node.id}/dossiers`); } catch (_) {}

    const hasChildren = children.length > 0;
    const isExpanded  = currentStack.some(s => s.id === node.id);

    const row = document.createElement('div');
    row.className = 'tree-node-row' + (isActive ? ' active' : '') + (isExpanded && hasChildren ? ' open-children' : '');
    row.style.paddingLeft = `${10 + depth * 14}px`;

    row.innerHTML = `
        <i class="bi ${isActive ? 'bi-folder2-open' : 'bi-folder2'} folder-icon"></i>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(node.nom)}</span>
        ${hasChildren ? `<i class="bi bi-chevron-right chevron" style="font-size:.7rem;margin-left:auto;flex-shrink:0;"></i>` : ''}
    `;

    const childrenEl = document.createElement('div');
    childrenEl.className = 'tree-children' + (isExpanded ? ' open' : '');

    row.onclick = async (e) => {
        e.stopPropagation();
        if (hasChildren) {
            childrenEl.classList.toggle('open');
            row.classList.toggle('open-children');
        }
        await navigateTo(node.id, node.nom, node.chemin);
    };

    wrapper.appendChild(row);

    if (hasChildren) {
        for (const child of children) {
            childrenEl.appendChild(await buildTreeNode(child, depth + 1));
        }
        wrapper.appendChild(childrenEl);
    }

    return wrapper;
}

// ── Filter (re-renders with cached data) ──────────────────
let _lastFolders = [], _lastDocs = [];
async function filterItems() {
    try {
        const [f, d] = await Promise.all([
            apiFetch(`${API}/${currentFolderId()}/dossiers`),
            apiFetch(`${API}/${currentFolderId()}/documents`)
        ]);
        _lastFolders = f; _lastDocs = d;
    } catch (_) {}
    renderGrid(_lastFolders, _lastDocs);
}

function setupActionButtons() {
    const btnNewFolder = document.getElementById('btnNewFolder');
    if (btnNewFolder) {
        btnNewFolder.addEventListener('click', () => {
            if (currentStack.length === 0) return;
            document.getElementById('newFolderName').value = '';
            document.getElementById('newFolderName').style.borderColor = '';
            const cur = currentStack[currentStack.length - 1];
            document.getElementById('folderModalLocationText').textContent = cur.chemin;
            openModal('folderModal');
            setTimeout(() => document.getElementById('newFolderName').focus(), 120);
        });
    }

    const createFolderBtn = document.getElementById('createFolderBtn');
    if (createFolderBtn) {
        createFolderBtn.addEventListener('click', createFolder);
    }

    const newFolderName = document.getElementById('newFolderName');
    if (newFolderName) {
        newFolderName.addEventListener('keydown', e => {
            if (e.key === 'Enter') createFolder();
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (deleteCallback) deleteCallback();
        });
    }

    const btnUploadDoc = document.getElementById('btnUploadDoc');
    if (btnUploadDoc) {
        btnUploadDoc.addEventListener('click', () => {
            if (currentStack.length === 0) return;
            filesToUpload = [];
            renderFileQueue();
            const cur = currentStack[currentStack.length - 1];
            document.getElementById('uploadModalLocation').textContent = cur.chemin;
            openModal('uploadModal');
        });
    }

    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover',  e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', ()  => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', e => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            addFilesToQueue(e.dataTransfer.files);
        });
    }

    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            addFilesToQueue(fileInput.files);
            fileInput.value = '';
        });
    }

    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            if (filesToUpload.length === 0) {
                const dz = document.getElementById('dropzone');
                if (dz) {
                    dz.style.borderColor = '#ef4444';
                    setTimeout(() => dz.style.borderColor = '', 1500);
                }
                return;
            }
            performUpload();
        });
    }
}
// ── Create folder ─────────────────────────────────────────
async function createFolder() {
    const nameInput = document.getElementById('newFolderName');
    const nom = nameInput.value.trim();
    if (!nom) { nameInput.style.borderColor = '#ef4444'; nameInput.focus(); return; }
    if (/[\/\\*?<>]/.test(nom)) {
        nameInput.style.borderColor = '#ef4444';
        showError('Nom invalide : évitez / \\ * ? < >'); return;
    }
    nameInput.style.borderColor = '';

    try {
        const btn = document.getElementById('createFolderBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Création…';

        await apiFetch(`${API}/${currentFolderId()}/dossiers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom })
        });

        closeModal('folderModal');
        await refreshGrid();
    } catch (e) {
        showError(e.message);
    } finally {
        const btn = document.getElementById('createFolderBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-folder-check me-1"></i>Créer le dossier';
    }
}

// ── Delete folder ─────────────────────────────────────────
function confirmDeleteFolder(id, nom) {
    document.getElementById('deleteConfirmTitle').textContent = `Supprimer le dossier "${nom}" ?`;
    document.getElementById('deleteConfirmMessage').textContent = "Tout le contenu de ce dossier sera définitivement supprimé (sous-dossiers et fichiers).";
    
    deleteCallback = async () => {
        const btn = document.getElementById('confirmDeleteBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Suppression…';
        try {
            await apiFetch(`${API}/dossiers/${id}`, { method: 'DELETE' });
            closeModal('deleteConfirmModal');
            await refreshGrid();
        } catch (e) { showError(e.message); }
        finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-trash3 me-1"></i>Supprimer';
        }
    };
    openModal('deleteConfirmModal');
}

// ── Delete document ───────────────────────────────────────
function confirmDeleteDoc(id, nom) {
    document.getElementById('deleteConfirmTitle').textContent = `Supprimer le fichier "${nom}" ?`;
    document.getElementById('deleteConfirmMessage').textContent = "Ce document sera définitivement supprimé des archives.";
    
    deleteCallback = async () => {
        const btn = document.getElementById('confirmDeleteBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Suppression…';
        try {
            await apiFetch(`${API}/documents/${id}`, { method: 'DELETE' });
            closeModal('deleteConfirmModal');
            await refreshGrid();
        } catch (e) { showError(e.message); }
        finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-trash3 me-1"></i>Supprimer';
        }
    };
    openModal('deleteConfirmModal');
}


function addFilesToQueue(fileList) {
    Array.from(fileList).forEach(f => {
        if (!filesToUpload.find(x => x.name === f.name)) filesToUpload.push(f);
    });
    renderFileQueue();
}

function renderFileQueue() {
    const queue = document.getElementById('fileQueue');
    const label = document.getElementById('fileCountLabel');
    queue.innerHTML = '';
    if (filesToUpload.length === 0) { label.textContent = ''; return; }
    label.textContent = `${filesToUpload.length} fichier${filesToUpload.length > 1 ? 's' : ''} sélectionné${filesToUpload.length > 1 ? 's' : ''}`;
    filesToUpload.forEach((f, idx) => {
        const fi = getFileIcon(f.name);
        const item = document.createElement('div');
        item.className = 'file-queue-item';
        item.innerHTML = `
            <i class="bi ${fi.icon} file-icon ${fi.cls}"></i>
            <span class="file-name" title="${escHtml(f.name)}">${escHtml(f.name)}</span>
            <span class="file-size">${formatSize(f.size)}</span>
            <i class="bi bi-x-circle remove-file" data-idx="${idx}"></i>`;
        queue.appendChild(item);
    });
    queue.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', () => {
            filesToUpload.splice(parseInt(btn.dataset.idx), 1);
            renderFileQueue();
        });
    });
}

async function performUpload() {

    const description = document.getElementById('addFileDescription')?.value || '';
    const formData = new FormData();
    filesToUpload.forEach(f => formData.append('files', f));
    formData.append('description', description);

    // 1. Close modal immediately for a "fast" feel
    closeModal('uploadModal');
    
    // 2. Show "Saving" toast
    const uploadToast = showToast(`<i class="bi bi-hourglass-split"></i> Enregistrement de ${filesToUpload.length} fichier(s)...`, 'info', 0);
    
    // 3. Clear queue
    filesToUpload = [];

    try {
        await apiFetch(`${API}/${currentFolderId()}/upload`, {
            method: 'POST',
            body: formData
        });
        
        // 4. Update UI
        uploadToast.remove();
        showToast('<i class="bi bi-check-circle-fill"></i> Fichiers enregistrés. OCR en cours...', 'success');
        await refreshGrid();
    } catch (e) {
        uploadToast.remove();
        showToast('Erreur upload : ' + e.message, 'error');
    }
}

// ── Utility functions ─────────────────────────────────────
function getFileIcon(name) {
    const ext = (name || '').split('.').pop().toLowerCase();
    const map = {
        pdf:  { icon: 'bi-file-earmark-pdf-fill',   cls: 'icon-pdf'     },
        doc:  { icon: 'bi-file-earmark-word-fill',   cls: 'icon-word'    },
        docx: { icon: 'bi-file-earmark-word-fill',   cls: 'icon-word'    },
        xls:  { icon: 'bi-file-earmark-excel-fill',  cls: 'icon-excel'   },
        xlsx: { icon: 'bi-file-earmark-excel-fill',  cls: 'icon-excel'   },
        ppt:  { icon: 'bi-file-earmark-ppt-fill',    cls: 'icon-ppt'     },
        pptx: { icon: 'bi-file-earmark-ppt-fill',    cls: 'icon-ppt'     },
        jpg:  { icon: 'bi-file-earmark-image-fill',  cls: 'icon-image'   },
        jpeg: { icon: 'bi-file-earmark-image-fill',  cls: 'icon-image'   },
        png:  { icon: 'bi-file-earmark-image-fill',  cls: 'icon-image'   },
        gif:  { icon: 'bi-file-earmark-image-fill',  cls: 'icon-image'   },
        zip:  { icon: 'bi-file-earmark-zip-fill',    cls: 'icon-archive' },
        rar:  { icon: 'bi-file-earmark-zip-fill',    cls: 'icon-archive' },
        mp4:  { icon: 'bi-file-earmark-play-fill',   cls: 'icon-video'   },
        txt:  { icon: 'bi-file-earmark-text-fill',   cls: ''             },
    };
    return map[ext] || { icon: 'bi-file-earmark-fill', cls: '' };
}

function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showError(msg) {
    showToast(msg, 'error');
}

function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">${message}</div>
    `;
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }
    return toast;
}

// ── Modal helpers ─────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function setupModals() {
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() { closeModal(this.id); });
    });
}

// ── Profile popup ─────────────────────────────────────────
function setupProfilePopup() {
    document.getElementById('profileRow').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('profilePopup').classList.toggle('show');
    });
    document.addEventListener('click', () =>
        document.getElementById('profilePopup').classList.remove('show')
    );
}

// ── Theme ─────────────────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    document.body.classList.toggle('dark', isDark);
    updateThemeUI(isDark);

    document.getElementById('themeToggleBtn').addEventListener('click', e => {
        e.preventDefault();
        const d = document.body.classList.toggle('dark');
        localStorage.setItem('theme', d ? 'dark' : 'light');
        updateThemeUI(d);
        document.getElementById('profilePopup').classList.remove('show');
    });
}

function updateThemeUI(isDark) {
    document.getElementById('themeIcon').className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    document.getElementById('themeText').textContent  = isDark ? 'Mode clair' : 'Mode sombre';
}

// ── Global Search with Suggestions ────────────────────────
function setupGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const suggestionsBox = document.getElementById('searchSuggestions');
    let debounceTimer;
    let selectedIdx = -1;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const q = input.value.trim();
        if (q.length < 2) {
            hideSuggestions();
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const results = await apiFetch(`${API}/search?q=${encodeURIComponent(q)}`);
                renderSuggestions(results, q);
            } catch (e) {
                console.error('Search error:', e);
            }
        }, 300);
    });

    input.addEventListener('keydown', (e) => {
        const items = suggestionsBox.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = Math.max(selectedIdx - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            if (selectedIdx >= 0 && items[selectedIdx]) {
                items[selectedIdx].click();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!document.getElementById('globalSearchWrapper').contains(e.target)) {
            hideSuggestions();
        }
    });

    function updateSelection(items) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIdx);
            if (i === selectedIdx) item.scrollIntoView({ block: 'nearest' });
        });
    }

    function renderSuggestions(results, query) {
        suggestionsBox.innerHTML = '';
        selectedIdx = -1;

        if (results.length === 0) {
            suggestionsBox.innerHTML = '<div id="emptySuggestions">Aucun résultat trouvé pour "' + escHtml(query) + '"</div>';
        } else {
            results.forEach(res => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                
                const icon = res.type === 'FOLDER' ? 'bi-folder-fill' : getFileIcon(res.name).icon;
                const iconClass = res.type === 'FOLDER' ? 'folder' : 'file';
                const matchBadgeClass = res.matchType === 'NAME' ? 'match-name' : 'match-content';
                const matchLabel = res.matchType === 'NAME' ? 'Nom' : 'Contenu';

                let contextHtml = '';
                if (res.matchType === 'CONTENT' && res.context) {
                    const highlighted = highlightMatch(res.context, query);
                    contextHtml = `<div class="suggestion-context">${highlighted}</div>`;
                }

                item.innerHTML = `
                    <div class="suggestion-icon ${iconClass}"><i class="bi ${icon}"></i></div>
                    <div class="suggestion-content">
                        <div class="d-flex align-items-center gap-2">
                            <span class="suggestion-name">${highlightMatch(res.name, query)}</span>
                            <span class="suggestion-match-type ${matchBadgeClass}">${matchLabel}</span>
                        </div>
                        <div class="suggestion-path">
                            <i class="bi bi-folder2-open"></i> ${escHtml(res.chemin || '/')}
                        </div>
                        ${contextHtml}
                    </div>
                `;

                item.onclick = () => {
                    input.value = '';
                    hideSuggestions();
                    navigateTo(res.dossierId, res.dossierNom, res.chemin);
                    // If it's a file, maybe highlight it in the grid later? 
                    // For now just navigate to its parent folder.
                };
                suggestionsBox.appendChild(item);
            });
        }
        suggestionsBox.classList.add('active');
    }

    function hideSuggestions() {
        suggestionsBox.classList.remove('active');
        selectedIdx = -1;
    }

    function highlightMatch(text, query) {
        if (!query) return escHtml(text);
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return escHtml(text).replace(regex, '<mark>$1</mark>');
    }
}

// ── Scanner Integration ──────────────────────────────────
function setupScanner() {
    const btn = document.getElementById('btnScanDoc');
    if (!btn) return;

    btn.addEventListener('click', () => {
        showToast('<i class="bi bi-printer"></i> Recherche du scanner...', 'info');
        
        // Simulation de la connexion au matériel
        setTimeout(() => {
            openModal('scanModal');
        }, 800);
    });

    document.getElementById('confirmScanBtn').addEventListener('click', async () => {
        closeModal('scanModal');
        showToast('<i class="bi bi-hourglass-split"></i> Numérisation en cours... Veuillez patienter.', 'info');
        
        // Simulation de la numérisation et de l'upload
        setTimeout(async () => {
            try {
                const dummyBlob = new Blob(["Document numérisé"], { type: 'text/plain' });
                const scanName = `Scan_${new Date().toISOString().slice(0,10)}_${Math.floor(Math.random()*1000)}.pdf`;
                const dummyFile = new File([dummyBlob], scanName, { type: 'application/pdf' });

                const formData = new FormData();
                formData.append('files', dummyFile);
                formData.append('description', 'Document ajouté via scanner local');

                await apiFetch(`${API}/${currentFolderId()}/upload`, {
                    method: 'POST',
                    body: formData
                });

                showToast('<i class="bi bi-check-circle-fill"></i> Document numérisé et archivé !', 'success');
                await refreshGrid();
            } catch (e) {
                showError('Erreur scanner : ' + e.message);
            }
        }, 3000);
    });
}
