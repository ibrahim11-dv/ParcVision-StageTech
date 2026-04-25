function toggleEditMode() {
    const view = document.getElementById('profileView');
    const edit = document.getElementById('profileEdit');
    const isEditing = edit.style.display !== 'none';
    view.style.display = isEditing ? '' : 'none';
    edit.style.display = isEditing ? 'none' : '';
}
function saveProfile(e) {
    e.preventDefault();
    showToast('Profil mis à jour avec succès!', 'success');
    toggleEditMode();
}
function toggleSwitch(container) {
    const bg    = container.querySelector('div:first-child');
    const knob  = container.querySelector('div:last-child');
    const isOn  = bg.style.background === 'var(--accent)' || bg.style.background.includes('var(--accent)');
    bg.style.background = isOn ? 'var(--gray-300)' : 'var(--accent)';
    knob.style.right = isOn ? 'auto' : '2px';
    knob.style.left  = isOn ? '2px'  : 'auto';
    showToast(isOn ? 'Option désactivée' : 'Option activée', isOn ? 'warning' : 'success');
}
