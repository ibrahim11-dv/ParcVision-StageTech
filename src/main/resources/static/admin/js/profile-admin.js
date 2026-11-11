// ── Load admin profile data ──
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/profile/admin');
        if (response.ok) {
            const data = await response.json();

            // Fill form inputs
            if (document.getElementById('adminNom')) document.getElementById('adminNom').value = data.nom || '';
            if (document.getElementById('adminPrenom')) document.getElementById('adminPrenom').value = data.prenom || '';
            if (document.getElementById('adminEmail')) document.getElementById('adminEmail').value = data.email || '';
            if (document.getElementById('adminTelephone')) document.getElementById('adminTelephone').value = data.telephone || '';
            if (document.getElementById('adminCin')) document.getElementById('adminCin').value = data.cin || '';
            if (document.getElementById('adminDateNaissance')) document.getElementById('adminDateNaissance').value = data.dateNaissance || '';

            // Update summary banner
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileCin = document.getElementById('profileCin');
            const profilePhone = document.getElementById('profilePhone');
            const profileEntreprise = document.getElementById('profileEntreprise');
            const profileAvatar = document.getElementById('profileAvatar');
            const kpiVehicules = document.getElementById('kpiProfileVehicules');
            const kpiConducteurs = document.getElementById('kpiProfileConducteurs');
            const adminEntrepriseDisplay = document.getElementById('adminEntrepriseDisplay');

            if (profileName) profileName.textContent = ((data.nom || '') + ' ' + (data.prenom || '')).trim() || 'Administrateur';
            if (profileEmail) profileEmail.textContent = data.email || '';
            if (profileCin) profileCin.textContent = data.cin || 'BK123456';
            if (profilePhone) profilePhone.textContent = data.telephone || '0669462131';
            if (profileEntreprise) profileEntreprise.textContent = data.entrepriseNom || 'Parc Vision Sarl';
            if (adminEntrepriseDisplay) adminEntrepriseDisplay.value = data.entrepriseNom || 'Parc Vision Sarl';

            if (kpiVehicules) kpiVehicules.textContent = data.vehiculesCount !== undefined ? data.vehiculesCount : '10';
            if (kpiConducteurs) kpiConducteurs.textContent = data.conducteursCount !== undefined ? data.conducteursCount : '8';

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
                    profileAvatar.style.backgroundImage = 'none';
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
                        if (window.showToast) window.showToast('Photo de profil mise à jour avec succès');
                    }
                } catch (err) {
                    console.error('Error uploading photo:', err);
                }
            });
            fileInput.click();
        });
    }
});

// Form submission for personal info
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const data = {
        nom: document.getElementById('adminNom').value,
        prenom: document.getElementById('adminPrenom').value,
        email: document.getElementById('adminEmail').value,
        telephone: document.getElementById('adminTelephone').value,
        cin: document.getElementById('adminCin').value,
        dateNaissance: document.getElementById('adminDateNaissance').value
    };
    try {
        const response = await fetch('/api/profile/admin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            btn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Modifications enregistrées !';
            btn.classList.replace('btn-primary', 'btn-success');
            
            // Update summary card
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileCin = document.getElementById('profileCin');
            const profilePhone = document.getElementById('profilePhone');
            if (profileName) profileName.textContent = data.nom + ' ' + data.prenom;
            if (profileEmail) profileEmail.textContent = data.email;
            if (profileCin) profileCin.textContent = data.cin || '--';
            if (profilePhone) profilePhone.textContent = data.telephone || '--';

            if (window.loadMinimalProfile) window.loadMinimalProfile();
            if (window.showToast) window.showToast('Profil mis à jour avec succès');
        } else {
            btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Erreur d\'enregistrement';
            btn.classList.replace('btn-primary', 'btn-danger');
        }
    } catch (err) {
        console.error(err);
        btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Erreur serveur';
        btn.classList.replace('btn-primary', 'btn-danger');
    }
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.className = btn.className.replace('btn-success', 'btn-primary').replace('btn-danger', 'btn-primary');
    }, 3000);
});

// Password form submission
document.getElementById('securityForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword.length < 6) {
        btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Minimum 6 caractères requis';
        btn.classList.replace('btn-primary', 'btn-danger');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('btn-danger', 'btn-primary');
        }, 3000);
        return;
    }

    if (newPassword !== confirmPassword) {
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
            body: JSON.stringify({ newPassword, confirmPassword })
        });
        if (response.ok) {
            btn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Mot de passe mis à jour !';
            btn.classList.replace('btn-primary', 'btn-success');
            e.target.reset();
            if (window.showToast) window.showToast('Mot de passe mis à jour avec succès');
        } else {
            btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Erreur lors de la mise à jour';
            btn.classList.replace('btn-primary', 'btn-danger');
        }
    } catch (err) {
        console.error(err);
        btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Erreur serveur';
        btn.classList.replace('btn-primary', 'btn-danger');
    }
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.className = btn.className.replace('btn-success', 'btn-primary').replace('btn-danger', 'btn-primary');
    }, 3000);
});
