document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;

    let errorBanner = document.getElementById('loginErrorBanner');
    if (errorBanner) errorBanner.style.display = 'none';

    if (!email || !password) {
        showLoginError("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
        return;
    }

    try {
        const response = await fetch("/api/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
                rememberMe: rememberMe
            })
        });
        if (response.ok) {
            window.location.href = "/admin/dashboard";
        } else {
            showLoginError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.");
        }
    } catch (err) {
        showLoginError("Erreur de connexion au serveur. Veuillez réessayer.");
    }
});

function showLoginError(msg) {
    let errorBanner = document.getElementById('loginErrorBanner');
    if (!errorBanner) {
        errorBanner = document.createElement('div');
        errorBanner.id = 'loginErrorBanner';
        errorBanner.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#dc2626;padding:12px 16px;border-radius:10px;font-size:0.86rem;font-weight:500;margin-bottom:16px;';
        const form = document.getElementById('loginForm');
        form.insertBefore(errorBanner, form.firstChild);
    }
    errorBanner.textContent = msg;
    errorBanner.style.display = 'block';
}
