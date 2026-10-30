// ── Load admin profile data ──
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/profile/admin');
        if (response.ok) {
            const data = await response.json();

            // Fill form inputs
            document.getElementById('adminNom').value = data.nom || '';
            document.getElementById('adminPrenom').value = data.prenom || '';
            document.getElementById('adminEmail').value = data.email || '';
            document.getElementById('adminTelephone').value = data.telephone || '';

            // Update summary card
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileAvatar = document.getElementById('profileAvatar');

            if (profileName) profileName.textContent = (data.nom || '') + ' ' + (data.prenom || '');
            if (profileEmail) profileEmail.textContent = data.email || '';

            // Update avatar with photo or initials
            if (profileAvatar) {
                if (data.photoProfileUrl) {
                    profileAvatar.textContent = '';
                    profileAvatar.style.backgroundImage = 'url(' + data.photoProfileUrl + ')';
                    profileAvatar.style.backgroundSize = 'cover';
                    profileAvatar.style.backgroundPosition = 'center';
                } else {
                    const initials = ((data.nom || 'A').charAt(0) + (data.prenom || 'D').charAt(0)).toUpperCase();
                    profileAvatar.textContent = initials;
                }
            }
        }
    } catch (err) {
        console.error('Error loading admin profile:', err);
    }
});

// Profile photo upload
document.addEventListener('DOMContentLoaded', () => {
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const response = await fetch('/api/profile/upload-photo', {
                        method: 'POST',
                        body: formData
                    });
                    if (response.ok) {
                        const data = await response.json();
                        profileAvatar.textContent = '';
                        profileAvatar.style.backgroundImage = 'url(' + data.photoUrl + ')';
                        profileAvatar.style.backgroundSize = 'cover';
                        profileAvatar.style.backgroundPosition = 'center';
                        if (window.loadMinimalProfile) window.loadMinimalProfile();
                        if (window.showToast) window.showToast('Photo de profil mise à jour');
                    }
                } catch (err) {
                    console.error('Error uploading photo:', err);
                }
            });
            fileInput.click();
        });
    }
});

// Form submissions
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const data = {
        nom: document.getElementById('adminNom').value,
        prenom: document.getElementById('adminPrenom').value,
        email: document.getElementById('adminEmail').value,
        telephone: document.getElementById('adminTelephone').value
    };
    try {
        const response = await fetch('/api/profile/admin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            btn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Mises à jour enregistrées';
            btn.classList.replace('btn-primary', 'btn-success');
            // Update summary card
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            if (profileName) profileName.textContent = data.nom + ' ' + data.prenom;
            if (profileEmail) profileEmail.textContent = data.email;
            if (window.loadMinimalProfile) window.loadMinimalProfile();
            if (window.showToast) window.showToast('Profil mis à jour avec succès');
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

document.getElementById('securityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const inputs = e.target.querySelectorAll('input');
    const data = {
        newPassword: inputs[0].value,
        confirmPassword: inputs[1].value
    };
    if (data.newPassword !== data.confirmPassword) {
        btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Les mots de passe ne correspondent pas';
        btn.classList.replace('btn-primary', 'btn-danger');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('btn-danger', 'btn-primary');
        }, 3000);
        return;
    }
    try {
        const response = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            btn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Mot de passe mis à jour';
            btn.classList.replace('btn-primary', 'btn-success');
            e.target.reset();
            if (window.showToast) window.showToast('Mot de passe mis à jour');
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
