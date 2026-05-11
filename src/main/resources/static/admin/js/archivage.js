// ═══════════════════════════════════════════════════════
//  ParcVision — Archivage JS  (API-backed)
// ═══════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────
let rootId        = null;          // DB id of "/"  root folder
let currentStack  = [];            // [{ id, nom, chemin }, …] — navigation stack
let filesToUpload = [];            // staged File objects
let deleteCallback = null;         // for custom delete confirmation modal

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

    try {
        const root = await apiFetch(`${API}/root`);
        rootId = root.id;
        currentStack = [{ id: root.id, nom: '/', chemin: '/' }];
        await refreshGrid();
    } catch (e) {
        showError('Impossible de charger l\'arborescence : ' + e.message);
    }
});

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
        const [folders, docs] = await Promise.all([
            apiFetch(`${API}/${currentFolderId()}/dossiers`),
            apiFetch(`${API}/${currentFolderId()}/documents`)
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
    const grid   = document.getElementById('explorerGrid');
    const filter = document.getElementById('filterInput').value.toLowerCase();
    grid.innerHTML = '';

    const fFiltered = folders.filter(f => f.nom.toLowerCase().includes(filter));
    const dFiltered = docs.filter(d => d.nomFichier.toLowerCase().includes(filter));

    if (fFiltered.length === 0 && dFiltered.length === 0) {
        grid.innerHTML = `
            <div id="emptyState">
                <i class="bi bi-folder2-open"></i>
                <p class="title">Ce dossier est vide</p>
                <p class="sub">Créez un nouveau dossier ou ajoutez des fichiers.</p>
            </div>`;
        return;
    }

    fFiltered.forEach(folder => {
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

    dFiltered.forEach(doc => {
        const fi = getFileIcon(doc.nomFichier);
        const item = document.createElement('div');
        item.className = 'explorer-item';
        item.innerHTML = `
            <div class="item-actions">
                <div class="item-action-btn danger" title="Supprimer"
                     onclick="event.stopPropagation(); confirmDeleteDoc(${doc.id}, '${escHtml(doc.nomFichier)}')">
                    <i class="bi bi-trash3"></i>
                </div>
            </div>
            <div class="explorer-item-icon ${fi.cls}"><i class="bi ${fi.icon}"></i></div>
            <div class="explorer-item-name">${escHtml(doc.nomFichier)}</div>
            <div class="explorer-item-info">${formatSize(doc.taille)}</div>`;
        item.onclick = () => selectItem(item);
        grid.appendChild(item);
    });
}

function selectItem(el) {
    document.querySelectorAll('.explorer-item.selected').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
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

// ── Create folder ─────────────────────────────────────────
document.getElementById('btnNewFolder').addEventListener('click', () => {
    document.getElementById('newFolderName').value = '';
    document.getElementById('newFolderName').style.borderColor = '';
    const cur = currentStack[currentStack.length - 1];
    document.getElementById('folderModalLocationText').textContent = cur.chemin;
    openModal('folderModal');
    setTimeout(() => document.getElementById('newFolderName').focus(), 120);
});

document.getElementById('createFolderBtn').addEventListener('click', createFolder);
document.getElementById('newFolderName').addEventListener('keydown', e => {
    if (e.key === 'Enter') createFolder();
});

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

// Set up the listener for the confirm button
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (deleteCallback) deleteCallback();
});

// ── Upload files ──────────────────────────────────────────
document.getElementById('btnUploadDoc').addEventListener('click', () => {
    filesToUpload = [];
    renderFileQueue();
    const cur = currentStack[currentStack.length - 1];
    document.getElementById('uploadModalLocation').textContent = cur.chemin;
    openModal('uploadModal');
});

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');

dropzone.addEventListener('dragover',  e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', ()  => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    addFilesToQueue(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => {
    addFilesToQueue(fileInput.files);
    fileInput.value = '';
});

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

document.getElementById('uploadBtn').addEventListener('click', async () => {
    if (filesToUpload.length === 0) {
        dropzone.style.borderColor = '#ef4444';
        setTimeout(() => dropzone.style.borderColor = '', 1500);
        return;
    }

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
});

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
