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
        if (profilePopup) profilePopup.classList.toggle('active');
    });
}
document.addEventListener('click', () => {
    if (profilePopup) profilePopup.classList.remove('active');
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
        if (profilePopup) profilePopup.classList.remove('active');
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

// ── CRUD Logic ──
let currentPage = 0;
const pageSize = 5;
let totalPages = 0;
let currentSearch = "";
let allSuppliers = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchStats();
    loadSuppliers();

    // Add Form Submit
    document.getElementById("addSupplierForm").addEventListener("submit", async (e) => {
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
                document.getElementById("addSupplierForm").reset();
                fetchStats();
                loadSuppliers();
            } else {
                alert("Erreur lors de la création du fournisseur.");
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Edit Form Submit
    document.getElementById("editSupplierForm").addEventListener("submit", async (e) => {
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

    // Search Input keyup with simple debounce
    let searchTimeout;
    document.getElementById("searchInput").addEventListener("keyup", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value.trim();
            currentPage = 0;
            loadSuppliers();
        }, 300);
    });
});

// Load stats
async function fetchStats() {
    try {
        const res = await fetch("/admin/fournisseur/stats");
        if (res.ok) {
            const data = await res.json();
            document.getElementById("statTotal").textContent = data.total_fournisseurs || 0;
            document.getElementById("statFournisseurs").textContent = data.fournisseur_count || 0;
            document.getElementById("statGarages").textContent = data.garage_count || 0;
            document.getElementById("statStations").textContent = data.station_count || 0;
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
                <div class="d-flex gap-2">
                    <button class="btn-action" onclick="openViewModal(${s.idFournisseur})" title="Voir">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-action" onclick="openEditModal(${s.idFournisseur})" title="Modifier">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteSupplier(${s.idFournisseur})" title="Supprimer">
                        <i class="bi bi-trash"></i>
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
    summary.textContent = `Affichage ${start}-${end} sur ${total}`;

    const container = document.getElementById("paginationContainer");
    container.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = `btn btn-secondary py-1 px-2 ${currentPage === 0 ? 'disabled' : ''}`;
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
        pageBtn.className = `btn ${currentPage === i ? 'btn-primary' : 'btn-secondary'} py-1 px-3`;
        pageBtn.textContent = i + 1;
        pageBtn.onclick = () => {
            currentPage = i;
            loadSuppliers();
        };
        container.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = `btn btn-secondary py-1 px-2 ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
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
