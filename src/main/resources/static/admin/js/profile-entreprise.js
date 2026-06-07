// ── Load entreprise profile data ──
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/profile/entreprise');
        if (response.ok) {
            const data = await response.json();

            // Fill form inputs by id
            document.getElementById('entNom').value = data.nom || '';
            document.getElementById('entSecteur').value = data.secteurActivite || '';
            document.getElementById('entAdresse').value = data.adresse || '';
            document.getElementById('entEmail').value = data.email || '';
            document.getElementById('entTelephone').value = data.telephone || '';
            document.getElementById('entDateCreation').value = data.dateCreation || '';

            // Update summary card
            const entName = document.getElementById('entName');
            const entEmail = document.getElementById('entEmail');
            const entAvatar = document.getElementById('entAvatar');

            if (entName) entName.textContent = data.nom || 'Entreprise';
            if (entEmail) entEmail.textContent = data.email || '';

            // Update avatar with logo or initials
            if (entAvatar) {
                if (data.logoUrl) {
                    entAvatar.textContent = '';
                    entAvatar.style.backgroundImage = "url('" + data.logoUrl + "')";
                    entAvatar.style.backgroundSize = 'cover';
                    entAvatar.style.backgroundPosition = 'center';
                } else if (data.nom) {
                    const words = data.nom.split(' ');
                    const initials = words.map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
                    entAvatar.textContent = initials;
                }
            }
        }
    } catch (err) {
        console.error('Error loading entreprise profile:', err);
    }
});

// Logo upload logic
document.addEventListener('DOMContentLoaded', () => {
    const entAvatar = document.getElementById('entAvatar');
    if (entAvatar) {
        entAvatar.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const response = await fetch('/api/profile/upload-entreprise-logo', {
                        method: 'POST',
                        body: formData
                    });
                    if (response.ok) {
                        const data = await response.json();
                        entAvatar.textContent = '';
                        entAvatar.style.backgroundImage = "url('" + data.photoUrl + "')";
                        entAvatar.style.backgroundSize = 'cover';
                        entAvatar.style.backgroundPosition = 'center';
                    }
                } catch (err) {
                    console.error('Error uploading logo:', err);
                }
            });
            fileInput.click();
        });
    }
});

// Form submissions
document.getElementById('entrepriseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const data = {
        nom: document.getElementById('entNom').value,
        secteurActivite: document.getElementById('entSecteur').value,
        adresse: document.getElementById('entAdresse').value,
        email: document.getElementById('entEmail').value,
        telephone: document.getElementById('entTelephone').value,
        dateCreation: document.getElementById('entDateCreation').value
    };
    try {
        const response = await fetch('/api/profile/entreprise', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            btn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Enregistré avec succès';
            btn.classList.replace('btn-primary', 'btn-success');
            // Update summary card
            const entName = document.getElementById('entName');
            const entEmailEl = document.getElementById('entEmail');
            if (entName) entName.textContent = data.nom;
            if (entEmailEl) entEmailEl.textContent = data.email;
        } else {
            btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Erreur';
            btn.classList.replace('btn-primary', 'btn-danger');
        }
    } catch (err) {
        console.error(err);
        btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Erreur';
        btn.classList.replace('btn-primary', 'btn-danger');
    }
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.className = btn.className.replace('btn-success', 'btn-primary').replace('btn-danger', 'btn-primary');
    }, 3000);
});
