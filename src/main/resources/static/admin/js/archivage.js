// ═══════════════════════════════════════════════════════
//  ParcVision — Archivage JS
//  Pure client-side recursive folder + file explorer
// ═══════════════════════════════════════════════════════

// ── Data Model ──────────────────────────────────────────
let fsData = {
    root: {
        id: 'root',
        name: '/',
        type: 'folder',
        children: [],   // sub-folder ids
        files: [],      // { id, name, size, mime, addedAt }
        parentId: null
    },
    nodes: {}
};
fsData.nodes['root'] = fsData.root;

let currentPath = ['root'];
let filesToUpload = [];

// ── Helpers ──────────────────────────────────────────────
function uid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function currentNode() {
    return fsData.nodes[currentPath[currentPath.length - 1]];
}

function pathLabel(nodeId) {
    if (nodeId === 'root') return '/';
    const parts = [];
    let n = fsData.nodes[nodeId];
    while (n && n.id !== 'root') { parts.unshift(n.name); n = fsData.nodes[n.parentId]; }
    return '/' + parts.join('/');
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
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

// ── Modal helpers ─────────────────────────────────────────
function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ── Breadcrumbs ───────────────────────────────────────────
function renderBreadcrumbs() {
    const el = document.getElementById('breadcrumbs');
    el.innerHTML = '';
    currentPath.forEach((nodeId, idx) => {
        const node = fsData.nodes[nodeId];
        const isLast = idx === currentPath.length - 1;

        if (idx > 0) {
            const sep = document.createElement('i');
            sep.className = 'bi bi-chevron-right';
            sep.style.cssText = 'font-size:0.7rem;color:var(--gray-400);';
            el.appendChild(sep);
        }

        const item = document.createElement('div');
        item.className = 'breadcrumb-item' + (isLast ? ' active' : '');

        if (isLast) {
            item.textContent = node.name;
        } else {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = node.name;
            a.onclick = (e) => { e.preventDefault(); navigateTo(nodeId); };
            item.appendChild(a);
        }
        el.appendChild(item);
    });
}

// ── Navigate ──────────────────────────────────────────────
function navigateTo(nodeId) {
    const newPath = [];
    let n = fsData.nodes[nodeId];
    while (n) { newPath.unshift(n.id); n = n.parentId ? fsData.nodes[n.parentId] : null; }
    currentPath = newPath;
    renderAll();
}

// ── Tree ──────────────────────────────────────────────────
function renderTree() {
    const container = document.getElementById('folderTree');
    container.innerHTML = '';
    container.appendChild(buildTreeNode('root'));
}

function buildTreeNode(nodeId) {
    const node = fsData.nodes[nodeId];
    const wrapper = document.createElement('div');

    const row = document.createElement('div');
    const isActive = currentPath[currentPath.length - 1] === nodeId;
    const hasChildren = node.children.length > 0;
    const isExpanded = currentPath.includes(nodeId);

    row.className = 'tree-node-row' +
        (isActive ? ' active' : '') +
        (isExpanded && hasChildren ? ' open-children' : '');
    row.dataset.nodeId = nodeId;

    row.innerHTML = `
        <i class="bi ${isActive ? 'bi-folder2-open' : 'bi-folder2'} folder-icon"></i>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${node.name}</span>
        ${hasChildren ? `<i class="bi bi-chevron-right chevron"></i>` : ''}
    `;

    row.onclick = (e) => {
        e.stopPropagation();
        if (hasChildren) {
            const childEl = wrapper.querySelector('.tree-children');
            if (childEl) {
                childEl.classList.toggle('open');
                row.classList.toggle('open-children');
            }
        }
        navigateTo(nodeId);
    };

    wrapper.appendChild(row);

    if (hasChildren) {
        const childrenEl = document.createElement('div');
        childrenEl.className = 'tree-children' + (isExpanded ? ' open' : '');
        node.children.forEach(childId => {
            childrenEl.appendChild(buildTreeNode(childId));
        });
        wrapper.appendChild(childrenEl);
    }

    return wrapper;
}

// ── Grid ──────────────────────────────────────────────────
function renderGrid() {
    const grid = document.getElementById('explorerGrid');
    const node = currentNode();
    const filter = document.getElementById('filterInput').value.toLowerCase();
    grid.innerHTML = '';

    const folders = node.children
        .map(id => fsData.nodes[id])
        .filter(n => n.name.toLowerCase().includes(filter));

    const files = node.files
        .filter(f => f.name.toLowerCase().includes(filter));

    if (folders.length === 0 && files.length === 0) {
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
                     onclick="event.stopPropagation(); deleteFolder('${folder.id}')">
                    <i class="bi bi-trash3"></i>
                </div>
            </div>
            <div class="explorer-item-icon icon-folder"><i class="bi bi-folder-fill"></i></div>
            <div class="explorer-item-name">${folder.name}</div>
            <div class="explorer-item-info">
                ${folder.children.length} dossier${folder.children.length !== 1 ? 's' : ''}
                · ${folder.files.length} fichier${folder.files.length !== 1 ? 's' : ''}
            </div>`;
        item.ondblclick = () => navigateTo(folder.id);
        item.onclick = () => selectItem(item);
        grid.appendChild(item);
    });

    files.forEach(file => {
        const fi = getFileIcon(file.name);
        const item = document.createElement('div');
        item.className = 'explorer-item';
        item.innerHTML = `
            <div class="item-actions">
                <div class="item-action-btn danger" title="Supprimer"
                     onclick="event.stopPropagation(); deleteFile('${file.id}')">
                    <i class="bi bi-trash3"></i>
                </div>
            </div>
            <div class="explorer-item-icon ${fi.cls}"><i class="bi ${fi.icon}"></i></div>
            <div class="explorer-item-name">${file.name}</div>
            <div class="explorer-item-info">${formatSize(file.size)}</div>`;
        item.onclick = () => selectItem(item);
        grid.appendChild(item);
    });
}

function selectItem(el) {
    document.querySelectorAll('.explorer-item.selected').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
}

// ── Delete ────────────────────────────────────────────────
function deleteFolder(id) {
    if (!confirm(`Supprimer le dossier "${fsData.nodes[id].name}" et tout son contenu ?`)) return;
    const parent = fsData.nodes[fsData.nodes[id].parentId];
    parent.children = parent.children.filter(c => c !== id);
    deleteFolderRecursive(id);
    renderAll();
}

function deleteFolderRecursive(id) {
    const node = fsData.nodes[id];
    node.children.forEach(childId => deleteFolderRecursive(childId));
    delete fsData.nodes[id];
}

function deleteFile(id) {
    const node = currentNode();
    node.files = node.files.filter(f => f.id !== id);
    renderAll();
}

// ── Create Folder ─────────────────────────────────────────
document.getElementById('btnNewFolder').addEventListener('click', () => {
    document.getElementById('newFolderName').value = '';
    document.getElementById('folderModalLocationText').textContent =
        pathLabel(currentPath[currentPath.length - 1]);
    openModal('folderModal');
    setTimeout(() => document.getElementById('newFolderName').focus(), 120);
});

document.getElementById('createFolderBtn').addEventListener('click', createFolder);
document.getElementById('newFolderName').addEventListener('keydown', e => {
    if (e.key === 'Enter') createFolder();
});

function createFolder() {
    const nameInput = document.getElementById('newFolderName');
    const name = nameInput.value.trim();

    if (!name) {
        nameInput.style.borderColor = '#ef4444';
        nameInput.focus();
        return;
    }
    if (/[\/\\*?<>]/.test(name)) {
        nameInput.style.borderColor = '#ef4444';
        alert('Nom invalide : évitez les caractères spéciaux.');
        return;
    }
    nameInput.style.borderColor = '';

    const parentNode = currentNode();
    const duplicate = parentNode.children.some(
        cid => fsData.nodes[cid].name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
        nameInput.style.borderColor = '#f59e0b';
        alert(`Un dossier "${name}" existe déjà ici.`);
        return;
    }

    const id = uid();
    fsData.nodes[id] = { id, name, type: 'folder', children: [], files: [], parentId: parentNode.id };
    parentNode.children.push(id);

    closeModal('folderModal');
    renderAll();
}

// ── Upload Files ──────────────────────────────────────────
document.getElementById('btnUploadDoc').addEventListener('click', () => {
    filesToUpload = [];
    renderFileQueue();
    document.getElementById('uploadModalLocation').textContent =
        pathLabel(currentPath[currentPath.length - 1]);
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
        if (!filesToUpload.find(x => x.name === f.name)) {
            filesToUpload.push(f);
        }
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
            <span class="file-name" title="${f.name}">${f.name}</span>
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

document.getElementById('uploadBtn').addEventListener('click', () => {
    if (filesToUpload.length === 0) {
        dropzone.style.borderColor = '#ef4444';
        setTimeout(() => dropzone.style.borderColor = '', 1500);
        return;
    }
    const node = currentNode();
    filesToUpload.forEach(f => {
        node.files.push({
            id: uid(), name: f.name, size: f.size,
            mime: f.type, addedAt: new Date().toISOString()
        });
    });
    filesToUpload = [];
    closeModal('uploadModal');
    renderAll();
});

// ── Render All ────────────────────────────────────────────
function renderAll() {
    renderBreadcrumbs();
    renderTree();
    renderGrid();
}

// ── Profile Popup ─────────────────────────────────────────
document.getElementById('profileRow').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profilePopup').classList.toggle('show');
});
document.addEventListener('click', () =>
    document.getElementById('profilePopup').classList.remove('show')
);

// ── Theme ─────────────────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    document.body.classList.toggle('dark', isDark);
    updateThemeUI(isDark);
}
function updateThemeUI(isDark) {
    document.getElementById('themeIcon').className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    document.getElementById('themeText').textContent  = isDark ? 'Mode clair' : 'Mode sombre';
}
document.getElementById('themeToggleBtn').addEventListener('click', e => {
    e.preventDefault();
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
    document.getElementById('profilePopup').classList.remove('show');
});

// ── Init ──────────────────────────────────────────────────
initTheme();
renderAll();
