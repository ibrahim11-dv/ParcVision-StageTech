// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = 'auto';
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

// ── Theme toggle ──
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

// ── Backend Integration ──

const API_BASE = "http://localhost:8080/admin/depannage-api";

function fetchStats() {
    fetch(`${API_BASE}/stats`)
        .then(res => res.json())
        .then(data => {
            const stats = document.querySelectorAll('.stat-val');
            if (stats.length >= 3) {
                stats[0].textContent = data.total || 0;
                stats[1].textContent = data.enCours || 0;
                stats[2].innerHTML = `${(data.frais || 0).toLocaleString()} <small>DH</small>`;
            }
        })
        .catch(err => console.error("Error fetching stats:", err));
}

fetchStats();

function fetchDepannages(page = 0) {
    const query = document.querySelector('.search-bar input').value.trim();
    const statut = document.querySelector('select.form-select-custom').value;

    let url = `${API_BASE}?page=${page}`;
    if (query) {
        url = `${API_BASE}/search?query=${query}&page=${page}`;
    } else if (statut && statut !== 'all') {
        url = `${API_BASE}/filter?statut=${statut}&page=${page}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderTableau(data);
            renderPagination(data, (p) => fetchDepannages(p));
        })
        .catch(err => console.error("Error fetching depannages:", err));
}

fetchDepannages(0);

// Search and Filter Listeners
document.querySelector('.search-bar input').addEventListener('input', () => fetchDepannages(0));
document.querySelector('select.form-select-custom').addEventListener('change', () => fetchDepannages(0));

function renderTableau(data) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    const content = data.content || [];

    if (content.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px;">Aucun dépannage trouvé</td></tr>`;
        return;
    }

    content.forEach(d => {
        const statutClass = getStatutClass(d.statut);
        
        tbody.innerHTML += `
            <tr class="hist-row">
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="profile-av bg-light text-primary" style="width: 36px; height: 36px; border-radius: 8px;"><i class="bi bi-truck"></i></div>
                        <b class="mission-id" style="color:var(--text-main);">${d.vehicule?.immatriculation || 'N/A'}</b>
                    </div>
                </td>
                <td><span style="font-weight:500;">Conducteur N/A</span></td>
                <td><span class="mission-date">${d.dateIntervention || 'N/A'}</span></td>
                <td><span class="mission-dist">${d.lieuPanne || 'N/A'}</span></td>
                <td><span class="mission-dist">${d.descriptionPanne || 'N/A'}</span></td>
                <td><span class="prio-badge ${statutClass}">${d.statut || 'N/A'}</span></td>
                <td>
                    <div style="display:flex;gap:5px">
                        <button class="btn-icon" title="Voir" onclick="openViewModal(${JSON.stringify(d).replace(/"/g, '&quot;')})"><i class="bi bi-eye"></i></button>
                        <button class="btn-icon" title="Modifier" onclick="openEditModal(${JSON.stringify(d).replace(/"/g, '&quot;')})"><i class="bi bi-pencil-square"></i></button>
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
    const size = data.size || 3;
    const start = currentPage * size + 1;
    const end = Math.min((currentPage + 1) * size, totalElements);

    summary.textContent = `Affichage de ${totalElements === 0 ? 0 : start} à ${end} sur ${totalElements} interventions`;

    const btnPrev = document.createElement('button');
    btnPrev.className = 'btn-ghost';
    btnPrev.style.padding = '6px 12px';
    btnPrev.style.fontSize = '.8rem';
    btnPrev.innerHTML = '<i class="bi bi-chevron-left"></i>';
    btnPrev.disabled = currentPage === 0;
    btnPrev.onclick = () => callback(currentPage - 1);
    container.appendChild(btnPrev);

    for (let i = 0; i < totalPages; i++) {
        const btnPage = document.createElement('button');
        btnPage.className = 'btn-ghost';
        btnPage.style.padding = '6px 14px';
        btnPage.style.fontSize = '.8rem';
        btnPage.textContent = i + 1;
        if (i === currentPage) {
            btnPage.style.background = 'var(--accent)';
            btnPage.style.color = 'white';
            btnPage.style.borderColor = 'var(--accent)';
        }
        btnPage.onclick = () => callback(i);
        container.appendChild(btnPage);
    }

    const btnNext = document.createElement('button');
    btnNext.className = 'btn-ghost';
    btnNext.style.padding = '6px 12px';
    btnNext.style.fontSize = '.8rem';
    btnNext.innerHTML = '<i class="bi bi-chevron-right"></i>';
    btnNext.disabled = currentPage === totalPages - 1 || totalPages === 0;
    btnNext.onclick = () => callback(currentPage + 1);
    container.appendChild(btnNext);
}

function getStatutClass(statut) {
    switch (statut?.toLowerCase()) {
        case 'termine':
        case 'terminé': return 'prio-faible'; // Green in CSS usually
        case 'encours':
        case 'en cours': return 'prio-normale'; // Blue
        case 'attente':
        case 'en attente': return 'prio-moyenne'; // Orange
        default: return 'prio-normale';
    }
}

function openViewModal(d) {
    document.getElementById('v_veh').textContent = d.vehicule?.immatriculation || 'N/A';
    document.getElementById('v_drv').textContent = 'Conducteur N/A';
    document.getElementById('v_date').textContent = d.dateIntervention || 'N/A';
    document.getElementById('v_loc').textContent = d.lieuPanne || 'N/A';
    document.getElementById('v_mot').textContent = d.descriptionPanne || 'N/A';
    document.getElementById('v_sta').innerHTML = `<span class="badge-status">${d.statut || 'N/A'}</span>`;
    openModal('viewDepanageModal');
}

function openEditModal(d) {
    document.getElementById('editDepanageModal').dataset.id = d.id;
    document.getElementById('e_veh').value = d.vehicule?.immatriculation || '';
    document.getElementById('e_date').value = d.dateIntervention || '';
    document.getElementById('e_loc').value = d.lieuPanne || '';
    document.getElementById('e_mot').value = d.descriptionPanne || '';
    document.getElementById('e_sta').value = d.statut || 'encours';
    openModal('editDepanageModal');
}

function updateDepanage() {
    const id = document.getElementById('editDepanageModal').dataset.id;
    const body = {
        statut: document.getElementById('e_sta').value,
        lieuPanne: document.getElementById('e_loc').value,
        descriptionPanne: document.getElementById('e_mot').value,
        // coutTotal could be added if input exists
    };

    fetch(`${API_BASE}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => {
        if (!res.ok) throw new Error("Erreur mise à jour");
        return res.json();
    })
    .then(() => {
        closeModal('editDepanageModal');
        fetchDepannages(0);
        fetchStats();
    })
    .catch(err => alert(err.message));
}

function saveDepanage() {
    // Basic implementation for add
    const body = {
        statut: document.querySelector('#addDepanageModal select').value,
        lieuPanne: document.querySelector('#addDepanageModal input[type="text"]').value,
        descriptionPanne: document.querySelector('#addDepanageModal textarea').value,
        // vehicule needs ID, but HTML select is missing values. 
        // For now, let's assume first vehicle ID 1 if not specified.
        vehicule: { id: 1 } 
    };

    fetch(`${API_BASE}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => {
        if (!res.ok) throw new Error("Erreur ajout");
        return res.json();
    })
    .then(() => {
        closeModal('addDepanageModal');
        fetchDepannages(0);
        fetchStats();
    })
    .catch(err => alert(err.message));
}
