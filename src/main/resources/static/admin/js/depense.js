// ── State ──
let depensesData = [];
let currentPage = 0;
let pageSize = 5;

const typePaiementLabels = {
    'CARTE_CREDIT': 'Carte de crédit',
    'ESPECES': 'Espèces',
    'VIREMENT_BANCAIRE': 'Virement bancaire',
    'CHEQUE': 'Chèque',
    'PAYE': 'Payé',
    'EN_ATTENTE': 'En attente'
};

// ── Modal functions ──
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

// ── Toggle custom source field ──
function toggleCustomSource(prefix) {
    const select = document.getElementById(prefix + 'SourceDepense');
    const customGroup = document.getElementById(prefix + 'CustomSourceGroup');
    if (!select || !customGroup) return;
    if (select.value === 'plus') {
        customGroup.style.display = '';
    } else {
        customGroup.style.display = 'none';
        const customInput = document.getElementById(prefix + 'SourceDepenseCustom');
        if (customInput) customInput.value = '';
    }
}

// ── API Calls ──
async function loadDepenses(page = 0) {
    currentPage = page;
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value : '';

    let url = `/api/depenses?page=${page}&size=${pageSize}`;
    if (query) {
        url = `/api/depenses/search?query=${encodeURIComponent(query)}&page=${page}&size=${pageSize}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            depensesData = data.content;
            renderDepensesTable(depensesData);
            renderPagination(data);
            updateKPIs(depensesData);
        }
    } catch (err) {
        console.error('Error loading depenses:', err);
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/depenses/stats');
        if (response.ok) {
            const stats = await response.json();
            const kpiTotal = document.getElementById('kpiTotal');
            const kpiMontant = document.getElementById('kpiMontant');
            const kpiCarte = document.getElementById('kpiCarte');
            const kpiEspeces = document.getElementById('kpiEspeces');
            
            if (kpiTotal) kpiTotal.textContent = stats.total || 0;
            if (kpiMontant) kpiMontant.textContent = formatMontant(stats.totalMontant || 0);
            if (kpiCarte) kpiCarte.textContent = stats.carteCount || 0;
            if (kpiEspeces) kpiEspeces.textContent = stats.especesCount || 0;
        }
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

function renderPagination(data) {
    const container = document.getElementById('paginationContainer');
    const summary = document.getElementById('paginationSummary');
    if (!container || !summary) return;

    container.innerHTML = '';
    const totalPages = data.totalPages;
    const totalElements = data.totalElements;
    const start = data.totalElements === 0 ? 0 : data.number * data.size + 1;
    const end = Math.min(start + data.size - 1, totalElements);

    summary.textContent = totalElements > 0
        ? `Affichage de ${start} à ${end} sur ${totalElements} dépenses`
        : 'Aucune dépense à afficher';

    if (totalPages <= 1) return;

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-icon ${data.first ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => loadDepenses(data.number - 1);
    container.appendChild(prevBtn);

    // Pages
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= data.number - 1 && i <= data.number + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-icon ${i === data.number ? 'active' : ''}`;
            pageBtn.style.width = '32px';
            pageBtn.textContent = i + 1;
            pageBtn.onclick = () => loadDepenses(i);
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
    nextBtn.className = `btn-icon ${data.last ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => loadDepenses(data.number + 1);
    container.appendChild(nextBtn);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMontant(montant) {
    if (!montant && montant !== 0) return '-';
    return Number(montant).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DH';
}

function getSourceDisplay(d) {
    if (d.sourceDepense === 'plus' && d.sourceDepenseCustom) {
        return d.sourceDepenseCustom;
    }
    return d.sourceDepense || '-';
}

function getSourceBadgeClass(source) {
    if (!source) return 'prio-faible';
    if (source.includes('Reparation') || source.includes('Réparation')) return 'prio-haute';
    if (source.includes('Accident')) return 'prio-haute';
    if (source.includes('Infraction')) return 'prio-haute';
    if (source.includes('Assurance')) return 'prio-faible';
    if (source.includes('Dépannage') || source.includes('Depannage')) return 'prio-normale';
    if (source.includes('Vidange')) return 'prio-faible';
    switch (source) {
        case 'Dépannage': return 'prio-normale';
        case 'Vidange': return 'prio-faible';
        case 'Assurance': return 'prio-faible';
        case 'Infraction': return 'prio-haute';
        default: return 'prio-faible';
    }
}

function getPaiementIcon(type) {
    switch (type) {
        case 'CARTE_CREDIT': return 'bi-credit-card';
        case 'ESPECES': return 'bi-cash-coin';
        case 'VIREMENT_BANCAIRE': return 'bi-bank';
        case 'CHEQUE': return 'bi-file-earmark-text';
        case 'PAYE': return 'bi-check-circle-fill text-success';
        case 'EN_ATTENTE': return 'bi-clock-history text-warning';
        default: return 'bi-wallet2';
    }
}

function renderDepensesTable(data) {
    const tbody = document.querySelector('.table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">
            <i class="bi bi-wallet2" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
            Aucune dépense enregistrée
        </td></tr>`;
        return;
    }

    data.forEach(d => {
        const sourceDisplay = getSourceDisplay(d);
        const sourceClass = getSourceBadgeClass(sourceDisplay);
        const paiementIcon = getPaiementIcon(d.typePaiement);
        const paiementLabel = typePaiementLabels[d.typePaiement] || d.typePaiement || '-';
        const statutBadge = d.estPayee 
            ? `<span class="prio-badge prio-faible">Payé</span>`
            : `<span class="prio-badge prio-haute">En attente</span>`;

        const row = document.createElement('tr');
        row.className = 'hist-row';
        row.innerHTML = `
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div class="profile-av bg-light text-primary" style="width: 36px; height: 36px; border-radius: 8px;"><i class="bi bi-person"></i></div>
                    <div>
                        <b class="mission-id" style="color:var(--text-main); display:block; line-height:1.2;">${d.qui || '-'}</b>
                    </div>
                </div>
            </td>
            <td><span class="mission-date">${formatDate(d.dateDepense)}</span></td>
            <td><span class="prio-badge ${sourceClass}">${sourceDisplay}</span></td>
            <td>
                <div style="display:flex;align-items:center;gap:6px">
                    <i class="bi ${paiementIcon}" style="font-size:1rem;"></i>
                    <span style="font-weight:500;">${paiementLabel}</span>
                </div>
            </td>
            <td>${statutBadge}</td>
            <td><b style="color:var(--text-main);">${formatMontant(d.montant)}</b></td>
            <td>
                <div style="display:flex;gap:5px">
                    <button class="btn-icon" title="Voir" onclick="viewDepenseById(${d.id})"><i class="bi bi-eye"></i></button>
                    <button class="btn-icon" title="Modifier" onclick="editDepenseById(${d.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn-icon" title="Supprimer" style="color: #dc3545 !important;" onclick="deleteDepenseById(${d.id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateKPIs(data) {
    let carte = 0, especes = 0;
    data.forEach(d => {
        if (d.typePaiement === 'CARTE_CREDIT') carte++;
        else if (d.typePaiement === 'ESPECES') especes++;
    });
    const kpiCarte = document.getElementById('kpiCarte');
    const kpiEspeces = document.getElementById('kpiEspeces');
    if (kpiCarte) kpiCarte.textContent = carte;
    if (kpiEspeces) kpiEspeces.textContent = especes;
}

// ── View Dépense ──
function viewDepenseById(id) {
    const d = depensesData.find(x => x.id === id);
    if (!d) return;

    document.getElementById('viewQui').textContent = d.qui || '-';
    document.getElementById('viewDate').textContent = formatDate(d.dateDepense);
    document.getElementById('viewTypePaiement').textContent = typePaiementLabels[d.typePaiement] || d.typePaiement || '-';
    
    const viewEstPayee = document.getElementById('viewEstPayee');
    if (viewEstPayee) {
        viewEstPayee.textContent = d.estPayee ? 'Payé' : 'En attente';
        viewEstPayee.style.color = d.estPayee ? '#10b981' : '#ef4444';
        viewEstPayee.style.fontWeight = '600';
    }

    document.getElementById('viewMontant').textContent = formatMontant(d.montant);
    document.getElementById('viewSource').textContent = getSourceDisplay(d);

    const editBtn = document.getElementById('viewEditBtn');
    if (editBtn) {
        editBtn.onclick = () => {
            closeModal('viewDepenseModal');
            openEditModal(d);
        };
    }

    openModal('viewDepenseModal');
}

function editDepenseById(id) {
    const d = depensesData.find(x => x.id === id);
    if (d) openEditModal(d);
}

function openEditModal(d) {
    document.getElementById('editId').value = d.id;
    document.getElementById('editQui').value = d.qui || '';
    document.getElementById('editDate').value = d.dateDepense || '';
    document.getElementById('editTypePaiement').value = d.typePaiement || '';
    document.getElementById('editEstPayee').value = String(d.estPayee);
    document.getElementById('editMontant').value = d.montant || 0;
    
    const select = document.getElementById('editSourceDepense');
    const customInput = document.getElementById('editSourceDepenseCustom');
    const customGroup = document.getElementById('editCustomSourceGroup');
    const helpText = document.getElementById('editSourceHelp');

    // Basic value sync
    select.value = d.sourceDepense || 'plus';
    customInput.value = d.sourceDepenseCustom || '';
    
    // Check if it's an automatic intervention reference
    const isAuto = /^(Reparation|Réparation|Vidange|Assurance|Infraction|Accident|Dépannage|Depannage) #\d+$/.test(customInput.value);

    if (isAuto) {
        // Dropdown shows category, custom field shows fixed reference
        customGroup.style.display = '';
        customInput.readOnly = true;
        customInput.style.backgroundColor = 'var(--bg-light)';
        customInput.style.cursor = 'not-allowed';
        select.disabled = true;
        if (helpText) helpText.style.display = 'block';
    } else {
        // Standard manual entry behavior
        select.disabled = false;
        if (helpText) helpText.style.display = 'none';
        
        if (select.value === 'plus') {
            customGroup.style.display = '';
            customInput.readOnly = false;
            customInput.style.backgroundColor = '';
            customInput.style.cursor = '';
        } else {
            customGroup.style.display = 'none';
            customInput.value = '';
        }
    }

    openModal('editDepenseModal');
}

async function submitEditDepense() {
    const id = document.getElementById('editId').value;
    const qui = document.getElementById('editQui').value;
    const dateInput = document.getElementById('editDate').value;
    const typePaiement = document.getElementById('editTypePaiement').value;
    const estPayee = document.getElementById('editEstPayee').value === 'true';
    const montant = document.getElementById('editMontant').value;
    const select = document.getElementById('editSourceDepense');
    const customInput = document.getElementById('editSourceDepenseCustom');

    if (!qui || !montant) {
        alert('Veuillez remplir les champs obligatoires');
        return;
    }

    const payload = {
        qui: qui,
        dateDepense: dateInput || null,
        typePaiement: typePaiement || null,
        estPayee: estPayee,
        montant: parseFloat(montant),
        sourceDepense: select.value,
        sourceDepenseCustom: (select.value === 'plus' || select.disabled) ? customInput.value : null
    };

    try {
        const response = await fetch(`/api/depenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            closeModal('editDepenseModal');
            await loadDepenses(currentPage);
            await loadStats();
        } else {
            alert('Erreur lors de la modification');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur lors de la modification');
    }
}

// ── Save Dépense ──
async function saveDepense() {
    const qui = document.getElementById('addQui').value;
    const dateInput = document.getElementById('addDate').value;
    const typePaiement = document.getElementById('addTypePaiement').value;
    const estPayee = document.getElementById('addEstPayee').value === 'true';
    const montant = document.getElementById('addMontant').value;
    const sourceDepense = document.getElementById('addSourceDepense').value;
    const sourceDepenseCustom = document.getElementById('addSourceDepenseCustom')?.value || '';

    if (!qui) {
        alert('Veuillez saisir le nom de la personne');
        return;
    }
    if (!montant) {
        alert('Veuillez saisir le montant');
        return;
    }

    const payload = {
        qui: qui,
        dateDepense: dateInput || null,
        typePaiement: typePaiement || null,
        estPayee: estPayee,
        montant: montant ? parseFloat(montant) : 0,
        sourceDepense: sourceDepense || null,
        sourceDepenseCustom: sourceDepense === 'plus' ? sourceDepenseCustom : null
    };

    try {
        const response = await fetch('/api/depenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            closeModal('addDepenseModal');
            document.getElementById('addDepenseForm').reset();
            document.getElementById('addCustomSourceGroup').style.display = 'none';
            await loadDepenses();
            await loadStats();
        } else {
            alert('Erreur lors de l\'enregistrement');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur lors de l\'enregistrement');
    }
}

// ── Delete Dépense ──
let depenseToDelete = null;

function deleteDepenseById(id) {
    depenseToDelete = id;
    openModal('deleteDepenseModal');
}

function submitDeleteDepense() {
    if (!depenseToDelete) return;
    fetch(`/api/depenses/${depenseToDelete}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('Erreur lors de la suppression');
            closeModal('deleteDepenseModal');
            loadDepenses();
            loadStats();
        })
        .catch(err => {
            console.error(err);
            alert('Erreur lors de la suppression');
        });
}

// ── Search ──
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            loadDepenses(0);
        });
    }
}

// Close modal on overlay click
document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
});

// Embedded / iframe mode
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
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
        }
    });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
    await loadDepenses();
    await loadStats();
    setupSearch();

    const urlParams = new URLSearchParams(window.location.search);
    const sourceParam = urlParams.get('source');
    if (!sourceParam) return;

    // Always show the full source param in the search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = sourceParam;
    currentPage = 0;

    // ── Step 1: exact ref search ──
    // Works when depenses are stored with sourceDepenseCustom = "Reparation #5" etc.
    let found = false;
    try {
        const res = await fetch(`/api/depenses/search?query=${encodeURIComponent(sourceParam)}&page=0&size=${pageSize}`);
        if (res.ok) {
            const data = await res.json();
            depensesData = data.content;
            renderDepensesTable(depensesData);
            renderPagination(data);
            if (depensesData.length > 0) {
                viewDepenseById(depensesData[0].id);
                found = true;
            }
        }
    } catch (err) {
        console.error('Error searching by full ref:', err);
    }

    if (found) return;

    // ── Step 2: category fallback ──
    // Works when depenses are stored with sourceDepense = "Vidange" / "Accident" etc.
    // Extract category from "Vidange #3" → "Vidange"
    const catMatch = sourceParam.match(/^([^#]+?)(?:\s*#\d+)?$/);
    const category = catMatch ? catMatch[1].trim() : sourceParam.trim();

    // Only try if there was actually a #id to strip
    if (category === sourceParam) return;

    try {
        const res = await fetch(`/api/depenses/search?query=${encodeURIComponent(category)}&page=0&size=${pageSize}`);
        if (res.ok) {
            const data = await res.json();
            depensesData = data.content;
            renderDepensesTable(depensesData);
            renderPagination(data);
            if (depensesData.length > 0) {
                viewDepenseById(depensesData[0].id);
            }
        }
    } catch (err) {
        console.error('Error searching by category:', err);
    }
});


