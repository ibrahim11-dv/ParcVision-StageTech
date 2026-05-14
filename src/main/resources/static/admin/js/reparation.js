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

// Close modal on overlay click
document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
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
    window.addEventListener('message', function(event) {
        if (event.data === 'theme-dark') {
            document.body.classList.add('dark');
        } else if (event.data === 'theme-light') {
            document.body.classList.remove('dark');
        }
    });
}
//Back-end

    //count :
    // Statistique :
    function fetchStats() {
        fetch("http://localhost:8080/admin/reparation/stats")
            .then(res => res.json())
            .then(data => {
                const elements = document.getElementsByClassName('total_reparation');
                for (let el of elements) {
                    el.textContent = data.total_reparation || 0;
                }
                document.getElementById('EnCours').textContent = data.EnCours || 0;
                document.getElementById('Budget').textContent = data.Budget ? data.Budget.toLocaleString() : 0;
                document.getElementById('urgences').textContent = data.urgences || 0;
            })
            .catch(err => console.error("Erreur stats:", err));
    }

    // Centralized fetch function
    function fetchReparations(page = 0) {
        fetch('http://localhost:8080/admin/reparation?page=' + page)
            .then(res => res.json())
            .then(data => {
                renderTableau(data);
                renderPagination(data);
            });
    }

    // Initial load
    fetchReparations(0);

    //Chercher
    document.getElementById('searchInput').addEventListener('input', function () {
        const query = this.value.trim();
        fetch('http://localhost:8080/admin/reparation/search?immat=' + query + '&page=0')
            .then(res => res.json())
            .then(data => {
                renderTableau(data);
                renderPagination(data);
            });
    });

    //find by statur :
    document.getElementById('statutFilter').addEventListener('change', function () {
        const statut = this.value;
        if (statut === 'all') {
            fetchReparations(0);
        } else {
            fetch('http://localhost:8080/admin/reparation/filterByStatut?statut=' + statut + '&page=0')
                .then(res => res.json())
                .then(data => {
                    renderTableau(data);
                    renderPagination(data);
                });
        }
    });

    //Les buttons !

    //Pour remplir le panier d informations quand on clique sur button eye
    function openViewModal(a) {
        document.getElementById('viewVehicle').textContent = a.vehicule.immatriculation + ' ' + a.vehicule.model;
        document.getElementById('viewDate').textContent = a.dateIntervention;
        document.getElementById('viewGarage').textContent = a.garagePrestataire;
        document.getElementById('viewDescription').textContent = a.descriptionPanne;
        document.getElementById('viewCost').textContent = a.coutTotal + ' DH';
        document.getElementById('viewStatus').textContent = a.statut;

        openModal('viewRepairModal');
    }
    //button de suppression :
    function deleteReparation(id) {
        if (confirm('Voulez-vous vraiment supprimer cette réparation ?')) {
            fetch('http://localhost:8080/admin/reparation/delete/' + id, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Erreur suppression');
                    fetchReparations(0);
                })
                .catch(err => alert('Erreur : ' + err.message));
        }
    }
    //button de modification :
//methode openEditModel et subEditModel !
    function openEditModel(a){
        // Stocker l'id de la réparation
        document.getElementById('editRepairModal').dataset.reparationId = a.id;

        // Pré-remplir les champs avec les valeurs actuelles
        document.getElementById('editDate').value = a.dateIntervention;
        document.getElementById('editGarage').value = a.garagePrestataire;
        document.getElementById('editDescription').value = a.descriptionPanne;
        document.getElementById('editCost').value = a.coutTotal;
        document.getElementById('editStatus').value = a.statut;

        // Ouvrir le modal
        openModal('editRepairModal')
    }
    //quand il clqiue sur mettre a jour il fait l appel a cette methode
    function submitEditModal() {
        const id = document.getElementById('editRepairModal').dataset.reparationId;//recupere l id de la ligne ou il a clique
        //recupere les donnes
        const body = {
            dateIntervention: document.getElementById('editDate').value,
            garagePrestataire: document.getElementById('editGarage').value,
            descriptionPanne: document.getElementById('editDescription').value,
            coutTotal: document.getElementById('editCost').value,
            statut: document.getElementById('editStatus').value
        };

        fetch('http://localhost:8080/admin/reparation/update/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => {
                if (!res.ok) throw new Error('Erreur mise à jour');
                return res.json();
            })
            .then(() => {
                closeModal('editRepairModal');
                fetchReparations(0);
            })
            .catch(err => alert('Erreur : ' + err.message));
    }

//Ajouter une reparation ,methode submitAddModal()

    function saveRepair(){
        const body = {
            vehicule: {id: parseInt(document.getElementById('vehicule').value)},
            dateIntervention:document.getElementById('date').value,
            garagePrestataire:document.getElementById('garage').value,
            descriptionPanne:document.getElementById('description').value,
            coutTotal:document.getElementById('cout').value,
            statut:document.getElementById('statut').value
        }
        fetch('http://localhost:8080/admin/reparation/add',{
            method : 'POST',
            headers :  { 'Content-Type' : 'application/json' },
            body : JSON.stringify(body)
        })
            .then(res => {
                if (!res.ok) throw new Error('Erreur');
                return res.json();
            })
            .then(() => {
                closeModal('addRepairModal');
                fetchReparations(0);
            })
            .catch(err => alert('Erreur : ' + err.message));
    }

    function renderPagination(data) {
        const container = document.getElementById('paginationContainer');
        const summary = document.getElementById('paginationSummary');
        if (!container || !summary) return;

        container.innerHTML = '';
        const totalPages = data.totalPages;
        const currentPage = data.number; // 0-indexed
        const totalElements = data.totalElements;
        const size = data.size;
        const start = currentPage * size + 1;
        const end = Math.min((currentPage + 1) * size, totalElements);

        summary.textContent = `Affichage de ${totalElements === 0 ? 0 : start} à ${end} sur ${totalElements} réparations`;

        // Button Previous
        const btnPrev = document.createElement('button');
        btnPrev.className = 'btn-ghost';
        btnPrev.style.padding = '6px 12px';
        btnPrev.style.fontSize = '.8rem';
        btnPrev.innerHTML = '<i class="bi bi-chevron-left"></i>';
        btnPrev.disabled = currentPage === 0;
        btnPrev.onclick = () => fetchReparations(currentPage - 1);
        container.appendChild(btnPrev);

        // Page Numbers
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

            btnPage.onclick = () => fetchReparations(i);
            container.appendChild(btnPage);
        }

        // Button Next
        const btnNext = document.createElement('button');
        btnNext.className = 'btn-ghost';
        btnNext.style.padding = '6px 12px';
        btnNext.style.fontSize = '.8rem';
        btnNext.innerHTML = '<i class="bi bi-chevron-right"></i>';
        btnNext.disabled = currentPage === totalPages - 1 || totalPages === 0;
        btnNext.onclick = () => fetchReparations(currentPage + 1);
        container.appendChild(btnNext);
    }

    //affichage du liste des reparations
    function renderTableau(data) {
        const id_tab = document.getElementById('reparationsTableBody');
        id_tab.innerHTML = '';

        if (!data.content || data.content.length === 0) {
            id_tab.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; font-size:18px;">
                    Aucune réparation trouvée
                </td>
            </tr>
            `;
            return;
        }

        data.content.forEach(a => {
            const cout = a.coutTotal ? a.coutTotal.toLocaleString() + ' DH' : '-';
            const statutStyle = getStatutStyle(a.statut);

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
                               ${a.vehicule.immatriculation}
                            </b>
                            <span class="mission-dist" style="font-size:0.75rem;">
                                ${a.vehicule.model}
                            </span>
                        </div>
                    </div>
                </td>
                <td>${a.dateIntervention}</td>
                <td>${a.garagePrestataire}</td>
                <td>${a.descriptionPanne}</td>
                <td>${cout}</td>
                <td><span class="prio-badge" style="${statutStyle}">${a.statut}</span></td>
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
                        <button class="btn-icon" title="Supprimer" style="color:red"
                            onclick="deleteReparation(${a.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        });
    }

    function getStatutStyle(statut) {
        switch (statut) {
            case 'termine':
            case 'Terminé':
                return 'background:rgba(16,185,129,0.1); color:#10b981;';
            case 'encours':
            case 'En cours':
                return 'background:rgba(59,130,246,0.1); color:#3b82f6;';
            case 'attente':
            case 'En attente':
                return 'background:rgba(245,158,11,0.1); color:#f59e0b;';
            default:
                return 'background:rgba(107,114,128,0.1); color:#6b7280;';
        }
    }

    async function loadVehicles() {
        try {
            const res = await fetch('http://localhost:8080/api/vehicules');
            if (!res.ok) throw new Error('Erreur chargement véhicules');
            const vehicules = await res.json();
            
            const selects = ['vehicule', 'editVehicle'];
            selects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Sélectionner un véhicule</option>';
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

    // Initialisation
    loadVehicles();
    fetchReparations(0);
    fetchStats();




