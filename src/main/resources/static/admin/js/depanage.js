function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function saveDepanage() { alert('Dépannage enregistré !'); closeModal('addDepanageModal'); }

function viewDepanage(veh, drv, date, loc, mot, sta) {
    document.getElementById('v_veh').textContent = veh;
    document.getElementById('v_drv').textContent = drv;
    document.getElementById('v_date').textContent = date;
    document.getElementById('v_loc').textContent = loc;
    document.getElementById('v_mot').textContent = mot;
    
    let statusClass = 'status-encours';
    if(sta === 'Terminé') statusClass = 'status-termine';
    if(sta === 'En attente') statusClass = 'status-attente';
    document.getElementById('v_sta').innerHTML = `<span class="badge-status ${statusClass}">${sta}</span>`;
    
    openModal('viewDepanageModal');
}

function editDepanage(veh, drv, date, loc, mot, sta) {
    document.getElementById('e_veh').value = veh;
    document.getElementById('e_drv').value = drv;
    document.getElementById('e_date').value = date;
    document.getElementById('e_loc').value = loc;
    document.getElementById('e_mot').value = mot;
    document.getElementById('e_sta').value = sta;
    openModal('editDepanageModal');
}

function updateDepanage() {
    alert('Dépannage mis à jour !');
    closeModal('editDepanageModal');
}

// ── Profile popup ──
const profileRow = document.getElementById('profileRow');
const profilePopup = document.getElementById('profilePopup');
if (profileRow) {
    profileRow.addEventListener('click', e => {
        e.stopPropagation();
        if (profilePopup) profilePopup.classList.toggle('show');
    });
}
document.addEventListener('click', () => {
    if (profilePopup) profilePopup.classList.remove('show');
});

// ── Theme & Embedded logic ──
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

function initTheme() {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    document.body.classList.toggle('dark', isDark);
    updateThemeUI(isDark);
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', e => {
        e.preventDefault();
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeUI(isDark);
        if (profilePopup) profilePopup.classList.remove('show');
    });
}

initTheme();

if (window.self !== window.top) {
    document.querySelector('.sidebar').style.display = 'none';
    document.querySelector('.main').style.marginLeft = '0';
    window.addEventListener('message', function(event) {
        if (event.data === 'theme-dark') document.body.classList.add('dark');
        else if (event.data === 'theme-light') document.body.classList.remove('dark');
    });
}
