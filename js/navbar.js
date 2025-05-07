document.addEventListener("DOMContentLoaded", function () {
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            // Insert the navbar into the placeholder
            document.getElementById("navbar-placeholder").innerHTML = data;

            // Now query elements inside the inserted navbar
            const navbar = document.getElementById("navbar-placeholder");

            // Highlight the active link based on the current URL
            const currentPath = window.location.pathname.split("/").pop(); // Get current file name
            const navLinks = navbar.querySelectorAll(".menu-item"); // Select all nav links inside navbar

            navLinks.forEach(link => {
                if (link.getAttribute("href") === currentPath) {
                    link.setAttribute("aria-current", "page");
                    link.classList.add("w--current");
                }
            });

            // Select hamburger button and main menu inside navbar
            const menuButton = navbar.querySelector(".menu-button");
            const mainMenu = navbar.querySelector(".main-menu");

            if (menuButton && mainMenu) {
                menuButton.addEventListener("click", function () {
                    mainMenu.classList.toggle("w--nav-menu-open"); // Toggle menu open class
                    menuButton.classList.toggle("w--open"); // Toggle button open class
                });
            }
        });
});
