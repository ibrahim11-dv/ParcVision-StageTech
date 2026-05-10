function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            this.classList.remove('active');
        });
    });

    // Logic for "Irréparable" status budget
    const statutSelect = document.getElementById('statutSelectEdit');
    const budgetInput = document.getElementById('budgetInputEdit');
    
    if(statutSelect && budgetInput) {
        statutSelect.addEventListener('change', function() {
            if (this.value === 'Épave') {
                budgetInput.type = 'text';
                budgetInput.value = 'Pas de budget (Épave)';
                budgetInput.disabled = true;
                // Optional visual cue
                budgetInput.style.backgroundColor = 'var(--gray-100)';
                budgetInput.style.color = 'var(--gray-400)';
                budgetInput.style.fontWeight = '600';
            } else {
                budgetInput.type = 'number';
                budgetInput.disabled = false;
                budgetInput.style.backgroundColor = '';
                budgetInput.style.color = '';
                budgetInput.style.fontWeight = 'normal';
                if(budgetInput.value === 'Pas de budget (Épave)') budgetInput.value = 35000; // Reset to default example
            }
        });
    }

    // Logic for "Très Grave" gravity budget in Add Modal
    const graviteSelectAdd = document.getElementById('graviteSelectAdd');
    const budgetInputAdd = document.getElementById('budgetInputAdd');
    
    if(graviteSelectAdd && budgetInputAdd) {
        graviteSelectAdd.addEventListener('change', function() {
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
                if(budgetInputAdd.value === 'Pas de budget (Épave)') budgetInputAdd.value = ''; 
            }
        });
    }
});

// ── Profile popup ──
const profileRow = document.getElementById('profileRow');
const profilePopup = document.getElementById('profilePopup');
if (profileRow) {
    profileRow.addEventListener('click', e => {
        e.stopPropagation();
        profilePopup.classList.toggle('show');
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
    // Total Accidents
    fetch('http://localhost:8080/admin/count')
        .then(res => res.json())
        .then(data => {
            document.getElementById('totalAccidents').textContent = data;
        });

    // En Réparation
    fetch('http://localhost:8080/admin/countByEtat')
        .then(res => res.json())
        .then(data => {
            document.getElementById('enReparation').textContent = data;
        });

    // Budget Total
    fetch('http://localhost:8080/admin/SumBudget')
        .then(res => res.json())
        .then(data => {
            document.getElementById('budgetTotal').textContent = data + ' DH';
        });

    //Search
    document.getElementById('searchInput').addEventListener('input', function () {
        const query = this.value.trim();

        fetch('http://localhost:8080/admin/search?query=' + query)
            .then(res => res.json())
            .then(data => {
                renderTableau(data);
            });
    });

    //afficher le sous forme tableau(render tab)
    function renderTableau(data) {
        const id_tab = document.getElementById('conductors');
        id_tab.innerHTML = '';

        if (data.length === 0) {
            id_tab.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; font-size:18px;">
                    Aucun accident trouvé
                </td>
            </tr>
        `;
            return;
        }

        data.forEach(a => {
            // Initiales du conducteur
            const nom = a.conducteur.utilisateur.nom || '';
            const prenom = a.conducteur.utilisateur.prenom || '';
            const initiales = (nom.charAt(0) + prenom.charAt(0)).toUpperCase();

            // Badge gravité
            const graviteClass = getGraviteClass(a.gravite);

            // Badge statut
            const statutStyle = getStatutStyle(a.etat);

            // Budget
            const budget = a.budgetEstime ? a.budgetEstime.toLocaleString() + ' DH' : '-';

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
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="profile-av" 
                             style="width:30px;height:30px;border-radius:50%;font-size:0.7rem;">
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
                    </div>
                </td>
            </tr>
        `;
        });
    }

// Couleur selon gravité
    function getGraviteClass(gravite) {
        switch (gravite?.toUpperCase()) {
            case 'TRÈS GRAVE': return 'prio-haute';
            case 'MAJEUR':     return 'prio-haute';
            case 'MOYENNE':    return 'prio-normale';
            case 'LÉGÈRE':     return 'prio-basse';
            default:           return 'prio-normale';
        }
    }

// Style inline selon statut
    function getStatutStyle(etat) {
        switch (etat) {
            case 'Épave':
                return 'background:rgba(31,41,55,0.1); color:#1f2937;';
            case 'En expertise':
                return 'background:rgba(245,158,11,0.1); color:#f59e0b;';
            case 'En réparation':
            case 'Réparation':
                return 'background:rgba(59,130,246,0.1); color:#3b82f6;';
            case 'Réparé':
                return 'background:rgba(16,185,129,0.1); color:#10b981;';
            default:
                return 'background:rgba(107,114,128,0.1); color:#6b7280;';
        }
    }

    //Pour find by etat :
    document.getElementById('etat').addEventListener('change', function () {
        const etat = document.getElementById('etat').value;
        if (etat === 'all') {
            fetch('http://localhost:8080/admin')
                .then(res => res.json())
                .then(data => renderTableau(data));
        } else {
            fetch('http://localhost:8080/admin/findByEtat?etat=' + etat)
                .then(res => res.json())
                .then(data => renderTableau(data));
        }
    });

    //afficher tout les accidents
    fetch('http://localhost:8080/admin')
        .then(res => res.json())
        .then(data => renderTableau(data));

    //afficher les informations d une accident(clique sur l icone)
    function openViewModal(a) {
        const values = document.querySelectorAll('#viewModal .view-detail-value');
        values[0].textContent = a.vehicule.immatriculation + ' ' + a.vehicule.model;
        values[1].textContent = a.conducteur.utilisateur.nom + ' ' + a.conducteur.utilisateur.prenom;
        values[2].textContent = a.dateIntervention + ' - ' + a.lieu;
        values[3].textContent = a.contexte;
        values[4].textContent = a.gravite;
        values[5].textContent = a.budgetEstime + ' DH';
        values[6].textContent = a.descriptionPanne;

        openModal('viewModal');
    }

    function openEditModal(a) {
        // Stocker l'id de l'accident en cours
        document.getElementById('editModal').dataset.accidentId = a.id;

        // Pré-remplir les champs avec les valeurs actuelles
        document.getElementById('statutSelectEdit').value = a.etat || '';
        document.getElementById('budgetInputEdit').value = a.budgetEstime || '';
        document.getElementById('notesTextarea').value = a.notes || '';

        openModal('editModal');
    }

    function submitEditModal() {
        const id = document.getElementById('editModal').dataset.accidentId;

        const body = {
            etat: document.getElementById('statutSelectEdit').value,
            budgetEstime: document.getElementById('budgetInputEdit').value,
            notes: document.getElementById('notesTextarea').value
        };

        fetch('http://localhost:8080/admin/update/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => {
                if (!res.ok) throw new Error('Erreur mise à jour');
                return res.json();
            })
            .then(() => {
                closeModal('editModal');
                // Recharger le tableau
                fetch('http://localhost:8080/admin')
                    .then(res => res.json())
                    .then(data => renderTableau(data));
            })
            .catch(err => alert('Erreur : ' + err.message));
    }

    function submitAddModal() {
        // Récupérer les valeurs des champs
        const vehiculeId = document.getElementById("vehicule").value;
        const conducteurId = document.getElementById("conducteur").value;
        const time = document.getElementById("time").value;
        const lieu = document.getElementById("lieu").value;
        const contexte = document.getElementById("contexte").value;
        const gravite = document.getElementById("graviteSelectAdd").value;
        const statut = document.getElementById("statutSelectAdd").value;
        const budget = document.getElementById("budgetInputAdd").value;
        const description = document.getElementById("description").value;

        // VALIDATIONS
        if (!vehiculeId || vehiculeId === "Sélectionnez un véhicule" || vehiculeId === "") {
            alert("Veuillez sélectionner un véhicule valide");
            return;
        }

        if (!conducteurId || conducteurId === "Sélectionnez un conducteur" || conducteurId === "") {
            alert("Veuillez sélectionner un conducteur valide");
            return;
        }

        if (!time) {
            alert("Veuillez saisir la date et l'heure de l'accident");
            return;
        }

        if (!lieu || lieu.trim() === "") {
            alert("Veuillez saisir le lieu de l'accident");
            return;
        }

        if (budget && budget < 0) {
            alert("Le budget estimé ne peut pas être négatif");
            return;
        }

        // Construction du body OPTIMISÉ
        const body = {
            // Champs hérités de Intervention (obligatoires)
            vehicule: {
                id: parseInt(vehiculeId)
            },
            dateIntervention: time,
            descriptionPanne: description,     // ← Un seul champ pour la description
            actionsMenees: "",                 // À remplir si besoin plus tard
            coutTotal: 0,                      // ← À 0 pour l'instant (sera mis à jour après réparation)
            kilometrageAuMoment: null,         // À récupérer du véhicule si besoin

            // Champs spécifiques à Accident
            lieu: lieu,
            contexte: contexte,
            gravite: gravite,
            budgetEstime: parseFloat(budget) || 0,  // ← Budget estimé pour l'accident
            etat: statut,
            conducteur: {
                id: parseInt(conducteurId)
            }
            // notes: description  ← SUPPRIMÉ (utilise descriptionPanne à la place)
        };

        // Envoi de la requête
        fetch('http://localhost:8080/admin/Add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(`Erreur ${res.status}: ${text}`);
                    });
                }
                return res.json();
            })
            .then(() => {
                closeModal('addModal');

                // Réinitialiser le formulaire (bonne pratique)
                document.getElementById("vehicule").value = "";
                document.getElementById("conducteur").value = "";
                document.getElementById("time").value = "";
                document.getElementById("lieu").value = "";
                document.getElementById("contexte").value = "en-mission";
                document.getElementById("graviteSelectAdd").value = "mineur";
                document.getElementById("statutSelectAdd").value = "En expertise";
                document.getElementById("budgetInputAdd").value = "";
                document.getElementById("description").value = "";

                // Recharger le tableau
                return fetch('http://localhost:8080/admin');
            })
            .then(res => res.json())
            .then(data => {
                renderTableau(data);

                // Recharger les KPIs
                return Promise.all([
                    fetch('http://localhost:8080/admin/count'),
                    fetch('http://localhost:8080/admin/countByEtat'),
                    fetch('http://localhost:8080/admin/SumBudget')
                ]);
            })
            .then(([countRes, repairRes, budgetRes]) => {
                return Promise.all([countRes.json(), repairRes.json(), budgetRes.json()]);
            })
            .then(([total, enReparation, budgetTotal]) => {
                document.getElementById('totalAccidents').textContent = total;
                document.getElementById('enReparation').textContent = enReparation;
                document.getElementById('budgetTotal').textContent = budgetTotal + ' DH';
            })
            .catch(err => {
                console.error('Erreur détaillée:', err);
                alert('Erreur lors de l\'ajout: ' + err.message);
            });
    }



