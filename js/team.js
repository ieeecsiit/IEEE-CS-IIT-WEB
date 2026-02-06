document.addEventListener("DOMContentLoaded", function () {
    const execCommittee = [
        {
            name: "Kithsara Medawewa",
            job: "Chairperson",
            image: "images/team/kithsara.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/kithsara-medawewa-b1b7a932a/" },
                { icon: "images/email.png", link: "mailto:kithsara.20240505@iit.ac.lk" }
            ]
        },
        {
            name: "Vinuka Jayavihan",
            job: "Vice - Chairperson",
            image: "images/team/vinuka.demo.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/vinuka-jayavihan/" },
                { icon: "images/email.png", link: "mailto:vinuka.20240732@iit.ac.lk" }
            ]
        },
        {
            name: "Saumya Liyanage",
            job: "Secretary",
            image: "images/team/saumya1jpeg.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/saumya-liyanage/" },
                { icon: "images/email.png", link: "mailto:saumya.20230094@iit.ac.lk" }
            ]
        },
        {
            name: "Maleesha Bandaranayake",
            job: "Treasurer",
            image: "images/team/maleesha.demo.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/maleesha-bandaranayake/" },
                { icon: "images/email.png", link: "mailto:maleesha.20241596@iit.ac.lk" }
            ]
        },
        {
            name: "Adrian Vethanayagam",
            job: "Webmaster",
            image: "images/team/adrian1.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/joshua-adrian-/" },
                { icon: "images/email.png", link: "mailto:joshua.20240846@iit.ac.lk" }
            ]
        }
    ];

    const standingCommittee = [
        {
            name: "Dulina Samarathunga",
            job: "Program & Logistics Coordinator",
            image: "images/team/dulina1.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/dulina-samarathunga-006735358/" },
                { icon: "images/email.png", link: "mailto:dulina.20231407@iit.ac.lk" }
            ]
        },
        {
            name: "Dulansa Manamperi",
            job: "Volunteer Management Coordinator",
            image: "images/team/dulansa.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/dulansa-manamperi-425876371/" },
                { icon: "images/email.png", link: "mailto:dulansa.20240564@iit.ac.lk" }
            ]
        },
        {
            name: "Janindu Wijesooriya",
            job: "Public Visibility Coordinator",
            image: "images/team/janindu.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/janindu-wijesooriya-bb459a1b0/" },
                { icon: "images/email.png", link: "mailto:janidu.20233130@iit.ac.lk" }
            ]
        },
        {
            name: "Nikini Madugoda",
            job: "Industry Outreach Coordinator",
            image: "images/team/nikini.jpg",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/nikini-madugoda/" },
                { icon: "images/email.png", link: "mailto:milsha.20232393@iit.ac.lk" }
            ]
        },
        {
            name: "Umesha Liyanage",
            job: "Membership Development Coordinator",
            image: "images/team/umesha.png",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/umesha-liyanage/" },
                { icon: "images/email.png", link: "mailto:samindi.20240265@iit.ac.lk" }
            ]
        },
        {
            name: "Teneesha Alwis",
            job: "Secretarial Coordinator",
            image: "images/team/teneesha.png",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/teneesha-alwis/" },
                { icon: "images/email.png", link: "mailto:teneesha.20231326@iit.ac.lk" }
            ]
        },
        {
            name: "Yasindu Janapriya",
            job: "Design Coordinator",
            image: "images/team/yasindu.png",
            socials: [
                { icon: "images/LinkedIn.png", link: "https://www.linkedin.com/in/yasindujanapriya/" },
                { icon: "images/email.png", link: "mailto:yasindu.20231866@iit.ac.lk" }
            ]
        }
    ];

    const teamGrid = document.getElementById("team-grid");

function renderMembers(members) {
    return members.map(member => {
        const socialLinks = member.socials
            .map(social => `
                <a href="${social.link}" target="_blank" class="social-link-2">
                    <img src="${social.icon}" class="social-image" loading="lazy" alt="icon">
                </a>
            `).join("");

        return `
            <div class="team-item">
                <div class="team-image-wrapp">
                    <img alt="${member.name}" src="${member.image}" class="team-img" loading="lazy">
                    <div class="team-scials">${socialLinks}</div>
                </div>
                <div class="team-details">
                    <h4 class="team-heading">${member.name}</h4>
                    <div class="team-job">${member.job}</div>
                </div>
            </div>
        `;
    }).join("");
}

if (teamGrid) {
    teamGrid.innerHTML = `
        <div class="team-section">
            <h2 class="team-section-heading">Executive Committee</h2>
            <div class="team-grid exec-grid">
                ${renderMembers(execCommittee)}
            </div>

            <h2 class="team-section-heading">Standing Committee Leads</h2>
            <div class="team-grid standing-grid">
                ${renderMembers(standingCommittee)}
            </div>
        </div>
    `;
}
});