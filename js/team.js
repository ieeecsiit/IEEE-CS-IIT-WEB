document.addEventListener("DOMContentLoaded", function () {
    // Array of team members
    const teamMembers = [
        {
            name: "Geesad Bandara",
            job: "Chairperson",
            image: "images/team/Geesad.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://linkedin.com/in/Geesad-Bandara" },
                { icon: "images/email.png", link: "mailto:chamithu.20230782@iit.ac.lk" }
            ]
        },
        {
            name: "Yuthmi Bangamu Arachchi",
            job: "Secretary",
            image: "images/team/Yuthmi.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:yuthmi.20231072@iit.ac.lk" }
            ]
        },
        {
            name: "Mayuran Thanushan",
            job: "Vice - Chairperson",
            image: "images/team/Thanushan.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://linkedin.com/in/Mayuran-Thanushan"},
                { icon: "images/email.png", link: "mailto:mayuran.20231047@iit.ac.lk" }
            ]
        },
        {
            name: "Rajeevan Ramakumar",
            job: "Treasurer",
            image: "images/team/Rajeevan.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://linkedin.com/in/Rajeevan-Ramakumar"},
                { icon: "images/email.png", link: "mailto:rajeeva.20230018@iit.ac.lk" }
            ]
        },
        {
            name: "Sasindu Janapriya",
            job: "Webmaster",
            image: "images/team/Sasindu.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://linkedin.com/in/Sasindu-Janapriya" },
                { icon: "images/email.png", link: "mailto:sasindu.20230130@iit.ac.lk" }
            ]
        },
        {
            name: "Pujana Rathnayake",
            job: "Program & Logistics Coordinator",
            image: "images/team/Pujana.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:pujana.20222362@iit.ac.lk" }
            ]
        },

        {
            name: "Dinaya Yuhansi",
            job: "Volunteer Management Coordinator",
            image: "images/team/Dinaya.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:dinaya.20231211@iit.ac.lk" }
            ]
        },

        {
            name: "Krisha Ravichandran",
            job: "Public Visibility Coordinator",
            image: "images/team/Krisha.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:krisha.20220849@iit.ac.lk" }
            ]
        },

        {
            name: "Pushpavie Krishnathasan",
            job: "Industry Outreach Coordinator",
            image: "images/team/Pushpavie.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:pushpavie.20230745@iit.ac.lk" }
            ]
        },

        {
            name: "Lakith Garusingharachchi",
            job: "Membership Development Coordinator",
            image: "images/team/Lakith.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:lakith.20231573@iit.ac.lk" }
            ]
        },

        {
            name: "Arani Weerathunga",
            job: "Secretarial Coordinator",
            image: "images/team/Arani.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:arani.20231178@iit.ac.lk" }
            ]
        },

        {
            name: "Wooshan Gamage",
            job: "Finance Coordinator",
            image: "images/team/Wooshan.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.themeforest.com" },
                { icon: "images/email.png", link: "mailto:wooshan.20231374@iit.ac.lk" }
            ]
        },
    ];

    // Get the team grid container
    const teamGrid = document.getElementById("team-grid");

    // Generate HTML for each team member
    teamMembers.forEach(member => {
        // Create the social links HTML
        const socialLinks = member.socials
            .map(
                social =>
                    `<a href="${social.link}" target="_blank" class="social-link-2 w-inline-block">
                        <img src="${social.icon}" alt="" class="social-image" />
                    </a>`
            )
            .join("");

        // Create the team member card HTML
        const memberCard = `
            <div class="team-item">
                <div class="team-image-wrapp">
                    <img alt="${member.name}" src="${member.image}" class="team-img" />
                    <div class="team-scials">
                        ${socialLinks}
                    </div>
                </div>
                <div class="team-details">
                    <h4 class="team-heading">${member.name}</h4>
                    <div class="team-job">${member.job}</div>
                </div>
            </div>
        `;

        // Append the card to the team grid
        teamGrid.innerHTML += memberCard;
    });
});