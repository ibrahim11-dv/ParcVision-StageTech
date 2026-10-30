document.addEventListener("DOMContentLoaded", () => {
    if (window.__pvCommonUIInitialized) return;
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/auth/logout", {
                method: 'POST',
                credentials: 'same-origin'
            });
            localStorage.removeItem('token');
            if (response.ok) {
                window.location.href = '/login';
            } else {
                window.location.href = '/login';
            }
        } catch (err) {
            console.error(err);
            window.location.href = '/login';
        }
    });
});
