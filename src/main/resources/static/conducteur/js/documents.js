// Download helper with real filename
function downloadDoc(filename) { triggerDownload(null, filename); }

// Form submission
function submitDoc() {
  const type   = document.getElementById('docType').value;
  const file   = document.getElementById('docFileInput').files[0];
  if (!type)  { showToast('Veuillez sélectionner le type de document','warning'); return; }
  if (!file)  { showToast('Veuillez joindre un fichier','warning'); return; }
  showToast(`Document "${type}" enregistré avec succès!`,'success');
  closeModal('uploadDocModal');
  document.getElementById('docType').value = '';
  document.getElementById('docExpiry').value = '';
  document.getElementById('docNotes').value = '';
}
