document.addEventListener("DOMContentLoaded", function () {
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            // Insert the navbar into the placeholder
            document.getElementById("navbar-placeholder").innerHTML = data;

            // Highlight the active link based on the current URL
            const currentPath = window.location.pathname.split("/").pop(); // Get the current file name
            const navLinks = document.querySelectorAll(".menu-item"); // Select all nav links

            navLinks.forEach(link => {
                if (link.getAttribute("href") === currentPath) {
                    link.setAttribute("aria-current", "page"); // Set aria-current for the active link
                    link.classList.add("w--current"); // Add the active class
                }
            });

            // Add functionality for the hamburger menu toggle
            const menuButton = document.querySelector(".menu-button"); // Select the hamburger button
            const mainMenu = document.querySelector(".main-menu"); // Select the navigation menu

            if (menuButton && mainMenu) {
                menuButton.addEventListener("click", function () {
                    mainMenu.classList.toggle("menu-open"); // Toggle the menu visibility
                });
            }
        });
});