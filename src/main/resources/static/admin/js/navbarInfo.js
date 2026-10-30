document.addEventListener("DOMContentLoaded", async () => {
    initCommonUI();
    loadMinimalProfile();
    loadSidebarStats();
});

/**
 * Standardize UI logic for Sidebar, Profile Popup, and Dark Mode
 */
function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function initCommonUI() {
    if (window.__pvCommonUIInitialized) return;
    window.__pvCommonUIInitialized = true;

    // 1. Profile Popup Logic
    const profileRow = document.getElementById('profileRow');
    const profilePopup = document.getElementById('profilePopup');

    if (profileRow && profilePopup) {
        profileRow.addEventListener('click', e => {
            e.stopPropagation();
            profilePopup.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            profilePopup.classList.remove('show');
        });
        profilePopup.addEventListener('click', e => {
            e.stopPropagation();
        });
    }

    // 2. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', e => {
            e.preventDefault();
            toggleTheme();
            if (profilePopup) profilePopup.classList.remove('show');
        });
    }

    // 3. Sidebar Collapse Logic
    const collapseBtn = document.getElementById('collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const main = document.getElementById('main');
            if (sidebar && main) {
                sidebar.classList.toggle('mini');
                main.classList.toggle('mini');
                const isMini = sidebar.classList.contains('mini');
                localStorage.setItem('sidebar-mini', isMini);
            }
        });
    }

    // Initial sidebar state
    if (localStorage.getItem('sidebar-mini') === 'true') {
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('main');
        if (sidebar && main) {
            sidebar.classList.add('mini');
            main.classList.add('mini');
        }
    }

    // Mobile Navigation Logic (Global)
    window.openMobile = () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.style.display = 'block';
    };
    window.closeMobile = () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.style.display = 'none';
    };
    window.openMob = window.openMobile;
    window.closeMob = window.closeMobile;

    // 4. Logout Logic
    const logoutLinks = document.querySelectorAll('.pp-logout');
    logoutLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch("/api/auth/logout", {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" }
                });
                // Clear any local storage auth data
                localStorage.removeItem('token');
                window.location.href = '/login';
            } catch (err) {
                console.error("Logout error:", err);
                // Fallback redirect
                window.location.href = '/login';
            }
        });
    });

    initTheme();
}

/**
 * Initialize theme from localStorage
 */
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    
    setTheme(isDark);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const isDark = !document.body.classList.contains('dark');
    setTheme(isDark);
    // Notify charts if they exist
    window.dispatchEvent(new Event('themeChanged'));
}

/**
 * Apply theme to the document
 */
function setTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

/**
 * Update Icon and Text for Theme Toggle
 */
function updateThemeUI(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (!themeIcon || !themeText) return;
    if (isDark) {
        themeIcon.className = 'bi bi-sun';
        themeText.textContent = 'Mode clair';
    } else {
        themeIcon.className = 'bi bi-moon-stars';
        themeText.textContent = 'Mode sombre';
    }
}

/**
 * Load minimal profile info (Header/Sidebar)
 */
async function loadMinimalProfile() {
    const nameEls = document.querySelectorAll("#user-name, #pp-user-name");
    const emailEls = document.querySelectorAll("#user-email, #pp-user-email");
    const avatarEls = document.querySelectorAll(".profile-row .profile-av, .pp-av");

    try {
        const profileRes = await fetch("/api/profile/info-minimal", {
            method: 'POST',
            headers: { "Content-Type": "application/json" }
        });
        if (profileRes.ok) {
            const data = await profileRes.json();
            const fullName = data.nom + " " + data.prenom;
            
            nameEls.forEach(el => el.textContent = fullName);
            emailEls.forEach(el => el.textContent = data.email);

            avatarEls.forEach(el => {
                if (data.photoProfileUrl) {
                    el.innerHTML = "";
                    el.style.backgroundImage = "url('" + data.photoProfileUrl + "')";
                    el.style.backgroundSize = "cover";
                    el.style.backgroundPosition = "center";
                } else {
                    const initials = ((data.nom || 'A').charAt(0) + (data.prenom || 'D').charAt(0)).toUpperCase();
                    el.textContent = initials;
                    el.style.backgroundImage = "none";
                }
            });
        }
    } catch (err) {
        console.error("Error loading profile info:", err);
    }
}

/**
 * Load stats for the sidebar badges
 */
async function loadSidebarStats() {
    try {
        const statsRes = await fetch("/api/dashboard/stats");
        if (statsRes.ok) {
            const stats = await statsRes.json();
            updateSidebarUI(stats);
        }
    } catch (err) {
        console.error("Error loading sidebar stats:", err);
    }
}

function updateSidebarUI(stats) {
    const navLinks = document.querySelectorAll('.nav-link[data-tip]');
    navLinks.forEach(link => {
        const tip = link.getAttribute('data-tip');
        const subEl = link.querySelector('.nt-sub');
        const totalEl = link.querySelector('.nb');

        switch (tip) {
            case 'Conducteurs':
                if (subEl) subEl.textContent = (stats.conducteursDisponibles + stats.conducteursEnMission) + " actifs";
                if (totalEl) totalEl.textContent = stats.totalConducteurs;
                break;
            case 'Véhicules':
                if (subEl) subEl.textContent = (stats.vehiculesDisponibles + stats.vehiculesEnMission) + " en flotte";
                if (totalEl) totalEl.textContent = stats.totalVehicules;
                break;
            case 'Assurances':
                if (subEl && stats.totalAssurances !== undefined) subEl.textContent = stats.totalAssurances + " contrats";
                if (totalEl && stats.totalAssurances !== undefined) totalEl.textContent = stats.totalAssurances;
                break;
            case 'Infractions':
                if (subEl && stats.totalInfractions !== undefined) subEl.textContent = stats.totalInfractions + " enregistrées";
                if (totalEl && stats.totalInfractions !== undefined) totalEl.textContent = stats.totalInfractions;
                break;
            case 'Suivi GPS':
                if (subEl) subEl.textContent = stats.missionsEnCours + " en déplacement";
                break;
            case 'Réparation':
                if (subEl) subEl.textContent = stats.nbReparations + " interventions";
                if (totalEl) totalEl.textContent = stats.nbReparations;
                break;
            case 'Accident':
                if (subEl) subEl.textContent = stats.nbAccidents + " ce mois";
                if (totalEl) totalEl.textContent = stats.nbAccidents;
                break;
            case 'Dépannage':
                if (subEl) subEl.textContent = stats.nbDepannages + " interventions";
                if (totalEl) totalEl.textContent = stats.nbDepannages;
                break;
            case 'Vidange':
                if (subEl) subEl.textContent = stats.nbVidanges + " planifiées";
                if (totalEl) totalEl.textContent = stats.nbVidanges;
                break;
            case 'Dépenses':
            case 'Depenses':
                if (subEl) subEl.textContent = "Suivi financier";
                if (totalEl && stats.totalDepenses !== undefined) totalEl.textContent = stats.totalDepenses;
                break;
            case 'Fournisseurs':
                if (subEl) subEl.textContent = stats.nbFournisseurs + " prestataires";
                if (totalEl) totalEl.textContent = stats.nbFournisseurs;
                break;
        }
    });
}

window.loadMinimalProfile = loadMinimalProfile;
window.loadSidebarStats = loadSidebarStats;

/**
 * Global sleek Toast Notification helper
 */
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('pv-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'pv-toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#10b981', icon: 'bi-check-circle-fill' },
        error:   { bg: '#ef4444', icon: 'bi-exclamation-octagon-fill' },
        warning: { bg: '#f59e0b', icon: 'bi-exclamation-triangle-fill' },
        info:    { bg: '#3b82f6', icon: 'bi-info-circle-fill' }
    };
    const cfg = colors[type] || colors.success;
    const isDark = document.body.classList.contains('dark');

    const toast = document.createElement('div');
    toast.style.cssText = `
        display:flex;align-items:center;gap:12px;
        background:${isDark ? '#1a1d24' : '#ffffff'};
        color:${isDark ? '#f3f4f6' : '#1f2937'};
        border:1px solid ${isDark ? '#2a2e38' : '#e5e7eb'};
        border-left:4px solid ${cfg.bg};
        border-radius:12px;padding:12px 18px;
        box-shadow:0 10px 25px -5px rgba(0,0,0,0.18);
        font-family:'Inter',sans-serif;font-size:0.86rem;font-weight:500;
        pointer-events:auto;min-width:260px;max-width:380px;
        transform:translateX(120%);transition:transform 0.28s cubic-bezier(.34,1.56,.64,1),opacity 0.25s ease;
    `;
    toast.innerHTML = `
        <i class="bi ${cfg.icon}" style="color:${cfg.bg};font-size:1.15rem;flex-shrink:0;"></i>
        <span style="flex:1;line-height:1.35;">${message}</span>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 280);
    }, 3500);
};
