/**
 * ParcVision — Conducteur Module
 * Shared JS: sidebar, theme, toast, clock, navigation, upload, download
 */

/* ─────────────────────────────────
   TOAST SYSTEM
─────────────────────────────────── */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = {
        success: 'bi-check-circle-fill',
        danger:  'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info:    'bi-info-circle-fill'
    };
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all .3s';
        setTimeout(() => toast.remove(), 320);
    }, 3500);
}

/* ─────────────────────────────────
   CLOCK
─────────────────────────────────── */
function updateClock() {
    document.querySelectorAll('[data-clock]').forEach(el => {
        el.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    });
}

/* ─────────────────────────────────
   THEME
─────────────────────────────────── */
function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle('dark', isDark);
    updateThemeUI(isDark);
}
function updateThemeUI(isDark) {
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
        el.className = `bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`;
    });
    document.querySelectorAll('[data-theme-text]').forEach(el => {
        el.textContent = isDark ? 'Mode clair' : 'Mode sombre';
    });
}
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
    showToast(isDark ? 'Mode sombre activé' : 'Mode clair activé', 'info');
}

/* ─────────────────────────────────
   SIDEBAR
─────────────────────────────────── */
function initSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('overlay');
    const mobBtn   = document.getElementById('mobToggle');
    const mobInner = document.getElementById('mobToggleInner');

    function openSidebar()  { sidebar?.classList.add('open');    if (overlay) overlay.style.display = 'block'; }
    function closeSidebar() { sidebar?.classList.remove('open'); if (overlay) overlay.style.display = 'none';  }

    mobBtn?.addEventListener('click', openSidebar);
    mobInner?.addEventListener('click', openSidebar);
    overlay?.addEventListener('click', closeSidebar);

    // Active link highlight
    const page = location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.nav-link[href]').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === page);
    });
}

/* ─────────────────────────────────
   PROFILE POPUP
─────────────────────────────────── */
function initProfile() {
    const row   = document.getElementById('profileRow');
    const popup = document.getElementById('profilePopup');
    if (!row || !popup) return;

    row.addEventListener('click', e => { e.stopPropagation(); popup.classList.toggle('show'); });
    document.addEventListener('click', () => popup.classList.remove('show'));
    popup.addEventListener('click', e => e.stopPropagation());

    const themeBtn = document.getElementById('themeToggleBtn');
    themeBtn?.addEventListener('click', () => { toggleTheme(); popup.classList.remove('show'); });
}

/* ─────────────────────────────────
   STATUS TOGGLER
─────────────────────────────────── */
const STATUS_CYCLE = [
    { cls: 'status-en-mission', label: 'En mission'   },
    { cls: 'status-disponible', label: 'Disponible'   },
    { cls: 'status-conge',      label: 'En congé'     },
    { cls: 'status-suspendu',   label: 'Suspendu'     },
];

function initStatusToggler() {
    const badge = document.getElementById('statusBadge');
    if (!badge) return;

    const saved = parseInt(localStorage.getItem('conducteur-status') || '0', 10);
    let idx = saved;
    applyStatus(badge, idx);

    badge.addEventListener('click', () => {
        idx = (idx + 1) % STATUS_CYCLE.length;
        localStorage.setItem('conducteur-status', idx);
        applyStatus(badge, idx);
        showToast(`Statut : ${STATUS_CYCLE[idx].label}`, 'info');

        // Fire custom event so dashboard can react (suspension modal, etc.)
        document.dispatchEvent(new CustomEvent('statusChanged', { detail: STATUS_CYCLE[idx].cls }));
    });
}

function applyStatus(badge, idx) {
    STATUS_CYCLE.forEach(s => badge.classList.remove(s.cls));
    badge.classList.add('badge-status', STATUS_CYCLE[idx].cls);
    badge.textContent = STATUS_CYCLE[idx].label;
}

/* ─────────────────────────────────
   TABS
─────────────────────────────────── */
function initTabs() {
    document.querySelectorAll('.tab-bar').forEach(bar => {
        const btns    = bar.querySelectorAll('.tab-btn');
        const panelId = bar.dataset.panels;
        if (!panelId) return;
        const container = document.getElementById(panelId);
        if (!container) return;

        btns.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                container.querySelectorAll('[data-tab-panel]').forEach((panel, j) => {
                    panel.style.display = (j === i) ? '' : 'none';
                });
            });
        });
        // Show first tab
        container.querySelectorAll('[data-tab-panel]').forEach((panel, j) => {
            panel.style.display = j === 0 ? '' : 'none';
        });
    });
}

/* ─────────────────────────────────
   MODALS
─────────────────────────────────── */
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('show');
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('show');
}
function initModals() {
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
    });
    document.querySelectorAll('.modal-overlay').forEach(ov => {
        ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('show'); });
    });
}

/* ─────────────────────────────────
   FILE UPLOAD ZONES
─────────────────────────────────── */
function initUploadZones() {
    document.querySelectorAll('[data-upload-zone]').forEach(zone => {
        const fileInput  = zone.querySelector('input[type=file]');
        const nameDisplay = zone.parentElement?.querySelector('.upload-file-name');

        if (!fileInput) return;

        // Click to open file picker
        zone.addEventListener('click', e => {
            if (e.target !== fileInput) fileInput.click();
        });

        // Drag & drop styles
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--accent)'; zone.style.background = 'var(--accent-soft)'; });
        zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; zone.style.background = ''; });
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.style.borderColor = '';
            zone.style.background = '';
            const files = e.dataTransfer?.files;
            if (files?.length) handleFileSelected(files[0], fileInput, nameDisplay, zone);
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files?.length) handleFileSelected(fileInput.files[0], fileInput, nameDisplay, zone);
        });
    });
}

function handleFileSelected(file, input, nameDisplay, zone) {
    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) { showToast(`Fichier trop lourd (max ${maxMB}MB)`, 'danger'); return; }

    if (nameDisplay) {
        nameDisplay.style.display = '';
        nameDisplay.innerHTML = `<i class="bi bi-check-circle-fill me-1" style="color:var(--success)"></i>${file.name} (${(file.size/1024).toFixed(0)} KB)`;
    }
    // Update zone appearance
    zone.style.borderColor = 'var(--success)';
    zone.querySelector('i')?.setAttribute('class', 'bi bi-check-circle-fill fs-3 d-block mb-1');
    zone.querySelector('i')?.style && (zone.querySelector('i').style.color = 'var(--success)');
    const label = zone.querySelector('span');
    if (label) label.textContent = 'Fichier sélectionné';

    showToast(`Fichier prêt: ${file.name}`, 'success');
}

/* ─────────────────────────────────
   DOWNLOAD (Real download trigger)
─────────────────────────────────── */
function initDownloadButtons() {
    document.querySelectorAll('[data-download]').forEach(btn => {
        btn.addEventListener('click', () => triggerDownload(btn.dataset.download, btn.dataset.filename || 'document.pdf'));
    });

    // Generic download for bio btn-icon with download icon inside
    document.querySelectorAll('button.btn-icon').forEach(btn => {
        const icon = btn.querySelector('.bi-download');
        if (!icon) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card    = btn.closest('.doc-card, tr');
            const docName = card?.querySelector('h6, b')?.textContent?.trim() || 'document';
            triggerDownload(null, docName.replace(/[^a-z0-9]/gi, '_') + '.pdf');
        });
    });
}

function triggerDownload(url, filename) {
    showToast(`Téléchargement: ${filename}...`, 'info');
    if (url) {
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); return;
    }
    // Generate a minimal PDF-like blob so it's a real download
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /MediaBox [0 0 595 842] >>\nendobj\nxref\n0 4\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setTimeout(() => showToast(`${filename} téléchargé avec succès!`, 'success'), 800);
}

/* ─────────────────────────────────
   MISSION ACTIONS
─────────────────────────────────── */
function initMissionActions() {
    // Accept
    document.querySelectorAll('[data-accept-mission]').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.mission-row');
            if (!row) return;
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Acceptation...';
            showToast('Mission acceptée! Elle est maintenant active.', 'success');
            setTimeout(() => { row.style.transition = 'opacity .4s'; row.style.opacity = '0'; setTimeout(() => row.remove(), 420); }, 900);
        });
    });

    // Refuse
    document.querySelectorAll('[data-refuse-mission]').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.mission-row');
            if (!row) return;
            showToast('Mission refusée', 'warning');
            row.style.transition = 'opacity .4s'; row.style.opacity = '0';
            setTimeout(() => row.remove(), 420);
        });
    });

    // End mission
    const endBtn = document.getElementById('btnEndMission');
    endBtn?.addEventListener('click', () => {
        endBtn.disabled = true;
        endBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Finalisation...';
        showToast('Mission terminée avec succès!', 'success');
        setTimeout(() => { window.location.href = 'historique.html'; }, 1800);
    });

    // Live timer
    const timerEl = document.getElementById('missionTimer');
    if (timerEl) {
        let start = parseInt(localStorage.getItem('missionStartTime') || '0');
        if (!start) { start = Date.now() - 6322000; localStorage.setItem('missionStartTime', start); }
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
            const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
            const s = (elapsed % 60).toString().padStart(2, '0');
            timerEl.textContent = `${h}:${m}:${s}`;
        }, 1000);
    }
}

/* ─────────────────────────────────
   HISTORIQUE: SEARCH + FILTER
─────────────────────────────────── */
function initHistorique() {
    const searchInput = document.getElementById('histSearch');
    const filterSel   = document.getElementById('histFilter');
    const rows        = document.querySelectorAll('.hist-row');
    if (!rows.length) return;

    function applyFilter() {
        const q = searchInput?.value.toLowerCase() || '';
        const f = filterSel?.value || 'all';
        rows.forEach(row => {
            const txt    = row.textContent.toLowerCase();
            const status = row.dataset.status || '';
            const month  = row.dataset.month  || '';
            const matchQ = !q || txt.includes(q);
            const matchF = f === 'all' || status === f || month === f;
            row.style.display = (matchQ && matchF) ? '' : 'none';
        });
    }

    searchInput?.addEventListener('input', applyFilter);
    filterSel?.addEventListener('change', applyFilter);

    // View detail modal
    document.querySelectorAll('[data-view-mission]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const row    = btn.closest('.hist-row');
            const id     = row?.querySelector('.mission-id')?.textContent    || '—';
            const trajet = row?.querySelector('.mission-trajet')?.textContent || '—';
            const dist   = row?.querySelector('.mission-dist')?.textContent   || '—';
            const date   = row?.querySelector('.mission-date')?.textContent   || '—';

            const info = document.getElementById('missionDetailInfo');
            if (info) info.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                  <div><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">Mission</div><div style="font-weight:700">${id}</div></div>
                  <div><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">Date</div><div style="font-weight:700">${date}</div></div>
                  <div><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">Trajet</div><div style="font-weight:700">${trajet}</div></div>
                  <div><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">Distance</div><div style="font-weight:700">${dist}</div></div>
                </div>
            `;
            openModal('missionDetailModal');
        });
    });

    // Export
    document.getElementById('exportBtn')?.addEventListener('click', () => {
        showToast('Génération du rapport PDF...', 'info');
        setTimeout(() => triggerDownload(null, 'historique_missions.pdf'), 1200);
    });
}

/* ─────────────────────────────────
   DOCUMENTS
─────────────────────────────────── */
function initDocuments() {
    const uploadBtn = document.getElementById('uploadDocBtn');
    uploadBtn?.addEventListener('click', () => openModal('uploadDocModal'));
}

/* ─────────────────────────────────
   INCIDENT FORM
─────────────────────────────────── */
function initIncident() {
    const form = document.getElementById('incidentForm');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Envoi en cours...';
        setTimeout(() => {
            showToast('Incident signalé! L\'équipe a été notifiée.', 'success');
            form.reset();
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-send-fill"></i> Envoyer le signalement';
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);
        }, 1500);
    });
}

/* ─────────────────────────────────
   QUICK ACTION BUTTONS
─────────────────────────────────── */
function initActionButtons() {
    document.getElementById('actionScanner')?.addEventListener('click', () => {
        showToast('Scanner QR / Code-barres activé', 'info');
    });
    document.getElementById('actionGPS')?.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => showToast(`Position partagée: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`, 'success'),
                ()  => showToast('GPS: position simulée partagée avec le dispatcher', 'success')
            );
        } else {
            showToast('Position simulée partagée avec le dispatcher', 'success');
        }
    });
    document.getElementById('actionPlein')?.addEventListener('click', () => openModal('pleinModal'));
    document.getElementById('actionSOS')?.addEventListener('click',   () => {
        showToast('🚨 ALERTE URGENCE envoyée! Secours notifiés.', 'danger');
    });
    document.getElementById('actionReport')?.addEventListener('click', () => {
        window.location.href = 'incident.html';
    });
}

/* ─────────────────────────────────
   NOTIFICATIONS
─────────────────────────────────── */
function initNotifications() {
    document.querySelectorAll('.notif-item.unread').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.remove('unread');
            const dot = item.querySelector('.notif-dot');
            if (dot) dot.style.background = 'transparent';
        });
    });
    document.getElementById('markAllRead')?.addEventListener('click', () => {
        document.querySelectorAll('.notif-item.unread').forEach(i => {
            i.classList.remove('unread');
            const dot = i.querySelector('.notif-dot');
            if (dot) dot.style.background = 'transparent';
        });
        showToast('Toutes les notifications lues', 'success');
    });
}

/* ─────────────────────────────────
   UPLOAD ZONE CSS INJECTION
─────────────────────────────────── */
function injectUploadZoneStyles() {
    if (document.getElementById('upload-zone-styles')) return;
    const style = document.createElement('style');
    style.id = 'upload-zone-styles';
    style.textContent = `
        .upload-zone {
            border: 2px dashed var(--border-color);
            border-radius: var(--radius-sm);
            padding: 22px 16px;
            text-align: center;
            cursor: pointer;
            transition: var(--transition);
            position: relative;
        }
        .upload-zone:hover {
            border-color: var(--accent);
            background: var(--accent-soft);
        }
        .upload-zone .file-input-hidden {
            position: absolute; inset: 0;
            opacity: 0; cursor: pointer; width: 100%; height: 100%;
        }
    `;
    document.head.appendChild(style);
}

/* ─────────────────────────────────
   INIT ALL
─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    injectUploadZoneStyles();
    initTheme();
    initSidebar();
    initProfile();
    initStatusToggler();
    initTabs();
    initModals();
    initUploadZones();
    initDownloadButtons();
    initMissionActions();
    initHistorique();
    initDocuments();
    initIncident();
    initActionButtons();
    initNotifications();

    updateClock();
    setInterval(updateClock, 30000);
});

/* ─────────────────────────────────
   SUSPENSION MODAL LOGIC (Global)
─────────────────────────────────── */
function cancelSuspension() {
    const badge = document.getElementById('statusBadge');
    if (badge) {
        ['status-suspendu','status-en-mission','status-conge','status-disponible'].forEach(c => badge.classList.remove(c));
        badge.classList.add('badge-status','status-disponible');
        badge.textContent = 'Disponible';
        localStorage.setItem('conducteur-status','1');
    }
    closeModal('suspensionModal');
    showToast('Statut changé: Disponible','info');
}

function submitSuspension() {
    const motif = document.getElementById('suspensionMotif')?.value;
    const desc  = document.getElementById('suspensionDesc')?.value;
    const file  = document.getElementById('suspensionFile')?.files;

    if (!motif || !desc) {
        showToast('Veuillez remplir tous les champs obligatoires','warning');
        return;
    }
    if (motif === 'maladie' && (!file || file.length === 0)) {
        showToast('Un certificat médical est obligatoire pour un arrêt maladie','danger');
        return;
    }

    // Hide form, show pending
    const formView = document.getElementById('suspensionFormView');
    const pendingView = document.getElementById('suspensionPendingView');
    const timeStamp = document.getElementById('pendingTimestamp');

    if (formView) formView.style.display = 'none';
    if (pendingView) pendingView.style.display = 'block';
    
    // Set exact time
    if (timeStamp) {
        const now = new Date();
        const t = now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
        timeStamp.textContent = `Aujourd'hui à ${t}`;
    }

    showToast("Demande soumise avec succès", 'success');
}

function closeSuspensionPending() {
    closeModal('suspensionModal');
    // Reset view for next time
    setTimeout(() => {
        const formView = document.getElementById('suspensionFormView');
        const pendingView = document.getElementById('suspensionPendingView');
        if (formView) formView.style.display = 'block';
        if (pendingView) pendingView.style.display = 'none';
        
        // Reset form
        const motif = document.getElementById('suspensionMotif');
        if (motif) {
            motif.value = '';
            onMotifChange('');
        }
        const desc = document.getElementById('suspensionDesc');
        if (desc) desc.value = '';
    }, 400);
}

function onMotifChange(val) {
    const note = document.getElementById('maladieNote');
    if (note) {
        if (val === 'maladie') {
            note.style.display = 'block';
            note.style.animation = 'toast-in 0.3s ease';
        } else {
            note.style.display = 'none';
        }
    }
}

document.addEventListener('statusChanged', e => {
    if(e.detail === 'status-suspendu') {
        // Ensure form view is visible initially
        const formView = document.getElementById('suspensionFormView');
        const pendingView = document.getElementById('suspensionPendingView');
        if (formView) formView.style.display = 'block';
        if (pendingView) pendingView.style.display = 'none';
        setTimeout(() => openModal('suspensionModal'), 400);
    }
});
