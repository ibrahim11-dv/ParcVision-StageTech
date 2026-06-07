// Modal functions
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

// ── INITIALISATION ──
document.addEventListener("DOMContentLoaded", () => {
    // Close modal on overlay click
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    fetchStats();
    loadSuppliers();

    // Add Form Submit
    const addForm = document.getElementById("addSupplierForm");
    if (addForm) {
        addForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                typeFournisseur: document.getElementById("typeFournisseur").value,
                nomFournisseur: document.getElementById("nomFournisseur").value,
                ville: document.getElementById("ville").value,
                adresse: document.getElementById("adresse").value,
                telephone: document.getElementById("telephone").value
            };

            try {
                const res = await fetch("/admin/fournisseur/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    closeModal("addSupplierModal");
                    addForm.reset();
                    fetchStats();
                    loadSuppliers();
                } else {
                    alert("Erreur lors de la création du fournisseur.");
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Edit Form Submit
    const editForm = document.getElementById("editSupplierForm");
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("editId").value;
            const payload = {
                typeFournisseur: document.getElementById("editTypeFournisseur").value,
                nomFournisseur: document.getElementById("editNomFournisseur").value,
                ville: document.getElementById("editVille").value,
                adresse: document.getElementById("editAdresse").value,
                telephone: document.getElementById("editTelephone").value
            };

            try {
                const res = await fetch(`/admin/fournisseur/update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    closeModal("editSupplierModal");
                    fetchStats();
                    loadSuppliers();
                } else {
                    alert("Erreur lors de la modification.");
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Search Input keyup with simple debounce
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("keyup", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = e.target.value.trim();
                currentPage = 0;
                loadSuppliers();
            }, 300);
        });
    }
});

// ── CRUD Logic ──
let currentPage = 0;
const pageSize = 5;
let totalPages = 0;
let currentSearch = "";
let allSuppliers = [];

// Load stats
async function fetchStats() {
    try {
        const res = await fetch("/admin/fournisseur/stats");
        if (res.ok) {
            const data = await res.json();
            const statTotal = document.getElementById("statTotal");
            const statFournisseurs = document.getElementById("statFournisseurs");
            const statGarages = document.getElementById("statGarages");
            const statStations = document.getElementById("statStations");
            
            if (statTotal) statTotal.textContent = data.total_fournisseurs || 0;
            if (statFournisseurs) statFournisseurs.textContent = data.fournisseur_count || 0;
            if (statGarages) statGarages.textContent = data.garage_count || 0;
            if (statStations) statStations.textContent = data.station_count || 0;
        }
    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

// Load list
async function loadSuppliers() {
    const url = currentSearch
        ? `/admin/fournisseur/search?query=${encodeURIComponent(currentSearch)}&page=${currentPage}&size=${pageSize}`
        : `/admin/fournisseur?page=${currentPage}&size=${pageSize}`;

    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            allSuppliers = data.content || [];
            totalPages = data.totalPages || 0;
            renderTable(allSuppliers, data.totalElements, data.number, data.size);
        }
    } catch (err) {
        console.error("Error loading suppliers:", err);
    }
}

// Render Table
function renderTable(suppliers, totalElements, page, size) {
    const tbody = document.getElementById("suppliersTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (suppliers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Aucun fournisseur trouvé.</td></tr>`;
        updatePaginationUI(0, 0, 0);
        return;
    }

    suppliers.forEach(s => {
        const tr = document.createElement("tr");

        let badgeClass = "fournisseur";
        if (s.typeFournisseur === "Garage") badgeClass = "garage";
        else if (s.typeFournisseur === "Station de Gazoil") badgeClass = "station";

        tr.innerHTML = `
            <td><strong>${escapeHtml(s.nomFournisseur)}</strong></td>
            <td><span class="badge-type ${badgeClass}">${escapeHtml(s.typeFournisseur)}</span></td>
            <td>${escapeHtml(s.ville || "-")}</td>
            <td>${escapeHtml(s.adresse || "-")}</td>
            <td>${escapeHtml(s.telephone || "-")}</td>
            <td>
                <div style="display:flex; gap:8px">
                    <button class="btn-action" onclick="openViewModal(${s.idFournisseur})" title="Voir">
                        <i class="bi bi-eye text-primary"></i>
                    </button>
                    <button class="btn-action" onclick="openEditModal(${s.idFournisseur})" title="Modifier">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteSupplier(${s.idFournisseur})" title="Supprimer">
                        <i class="bi bi-trash" style="color:#ef4444"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const start = page * size + 1;
    const end = Math.min(start + suppliers.length - 1, totalElements);
    updatePaginationUI(start, end, totalElements);
}

// Pagination Controls
function updatePaginationUI(start, end, total) {
    const summary = document.getElementById("paginationSummary");
    if (summary) summary.textContent = total > 0 ? `Affichage ${start}-${end} sur ${total}` : "Aucun fournisseur à afficher";

    const container = document.getElementById("paginationContainer");
    if (!container) return;
    container.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = `btn-action ${currentPage === 0 ? 'disabled' : ''}`;
    prevBtn.innerHTML = `<i class="bi bi-chevron-left"></i>`;
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            loadSuppliers();
        }
    };
    container.appendChild(prevBtn);

    // Page Numbers
    for (let i = 0; i < totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `btn-action ${currentPage === i ? 'active' : ''}`;
        pageBtn.style.width = '32px';
        pageBtn.textContent = i + 1;
        pageBtn.onclick = () => {
            currentPage = i;
            loadSuppliers();
        };
        container.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = `btn-action ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextBtn.innerHTML = `<i class="bi bi-chevron-right"></i>`;
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.onclick = () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            loadSuppliers();
        }
    };
    container.appendChild(nextBtn);
}

// Open View Modal
function openViewModal(id) {
    const s = allSuppliers.find(x => x.idFournisseur === id);
    if (!s) return;

    document.getElementById("viewNomFournisseur").textContent = s.nomFournisseur;
    document.getElementById("viewTypeFournisseur").textContent = s.typeFournisseur;
    document.getElementById("viewVille").textContent = s.ville || "-";
    document.getElementById("viewAdresse").textContent = s.adresse || "-";
    document.getElementById("viewTelephone").textContent = s.telephone || "-";

    openModal("viewSupplierModal");
}

// Open Edit Modal
function openEditModal(id) {
    const s = allSuppliers.find(x => x.idFournisseur === id);
    if (!s) return;

    document.getElementById("editId").value = s.idFournisseur;
    document.getElementById("editTypeFournisseur").value = s.typeFournisseur;
    document.getElementById("editNomFournisseur").value = s.nomFournisseur;
    document.getElementById("editVille").value = s.ville || "";
    document.getElementById("editAdresse").value = s.adresse || "";
    document.getElementById("editTelephone").value = s.telephone || "";

    openModal("editSupplierModal");
}

// Delete Supplier
async function deleteSupplier(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) return;

    try {
        const res = await fetch(`/admin/fournisseur/delete/${id}`, {
            method: "DELETE"
        });
        if (res.ok) {
            fetchStats();
            loadSuppliers();
        } else {
            alert("Erreur lors de la suppression.");
        }
    } catch (err) {
        console.error(err);
    }
}

// HTML Escaper helper
function escapeHtml(str) {
    if (!str) return "";
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ── Embedded / iframe mode ──
if (window.self !== window.top || new URLSearchParams(window.location.search).get('embedded') === 'true') {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'none';

    const mobToggle = document.querySelector('.mob-toggle');
    if (mobToggle) mobToggle.style.display = 'none';

    const mainEl = document.querySelector('.main');
    if (mainEl) {
        mainEl.style.marginLeft = '0';
        mainEl.style.padding = '30px';
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
