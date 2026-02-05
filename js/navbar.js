document.addEventListener("DOMContentLoaded", function () {
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById("navbar-placeholder");
            placeholder.innerHTML = data;

            // 1. Highlight active link
            const currentPath = window.location.pathname.split("/").pop();
            const navLinks = placeholder.querySelectorAll(".menu-item");

            navLinks.forEach(link => {
                if (link.getAttribute("href") === currentPath) {
                    link.setAttribute("aria-current", "page");
                    link.classList.add("w--current");
                }
            });

            // 2. Mobile Menu Toggle
            const menuButton = placeholder.querySelector(".menu-button");
            const mainMenu = placeholder.querySelector(".main-menu");

            if (menuButton && mainMenu) {
                menuButton.addEventListener("click", function () {
                    mainMenu.classList.toggle("w--nav-menu-open");
                    menuButton.classList.toggle("w--open");
                });
            }

            // 3. SMART SCROLL LOGIC
            let lastScrollY = window.scrollY;

            window.addEventListener("scroll", function () {
                const currentScrollY = window.scrollY;

                // A. Handle General Scrolled Look (Blur/Shadow/Smallness)
                if (currentScrollY > 50) {
                    placeholder.classList.add("navbar-scrolled");
                } else {
                    placeholder.classList.remove("navbar-scrolled");
                }

                // B. Handle Directional Hide/Show
                if (currentScrollY > lastScrollY && currentScrollY > 150) {
                    // Scrolling DOWN and passed 150px - Hide it
                    placeholder.classList.add("nav-hidden");
                } else {
                    // Scrolling UP or at the very top - Show it
                    placeholder.classList.remove("nav-hidden");
                }

                lastScrollY = currentScrollY;
            });
        })
        .catch(err => console.error("Error loading navbar:", err));
});