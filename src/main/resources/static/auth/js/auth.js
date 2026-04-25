document.addEventListener("DOMContentLoaded", function () {
    
    // --- Password Visibility Toggle ---
    function setupPasswordToggle(toggleBtnId, inputId, iconId) {
        const toggleBtn = document.getElementById(toggleBtnId);
        const passwordInput = document.getElementById(inputId);
        const eyeIcon = document.getElementById(iconId);

        if (toggleBtn && passwordInput && eyeIcon) {
            toggleBtn.addEventListener("click", function () {
                const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                passwordInput.setAttribute("type", type);
                
                if (type === "password") {
                    eyeIcon.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    `;
                } else {
                    eyeIcon.innerHTML = `
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    `;
                }
            });
        }
    }

    // Login page
    setupPasswordToggle("togglePassword", "password", "eyeIcon");
    // Register page
    setupPasswordToggle("toggleRegPassword", "adminPassword", "eyeRegIcon");


    // --- Registration Multi-Step Form ---
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const btnNext = document.getElementById("btnNextTo2");
    const btnBack = document.getElementById("btnBackTo1");
    
    const dot1 = document.getElementById("dot1");
    const line1 = document.getElementById("line1");
    const dot2 = document.getElementById("dot2");

    if (step1 && step2 && btnNext && btnBack) {
        btnNext.addEventListener("click", function () {
            // Optional: validate step 1
            const enterpriseName = document.getElementById("enterpriseName");
            if (enterpriseName && !enterpriseName.value) {
                // simple html5 validation trigger would be better but this works for demo
                enterpriseName.reportValidity();
                return;
            }

            // Transition to next step
            step1.style.display = "none";
            step2.style.display = "block";
            
            // Update indicators
            line1.classList.add("active");
            dot2.classList.add("active");
        });

        btnBack.addEventListener("click", function () {
            step2.style.display = "none";
            step1.style.display = "block";
            
            // Revert indicators
            line1.classList.remove("active");
            dot2.classList.remove("active");
        });
    }
});
