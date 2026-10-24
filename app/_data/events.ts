import type { Event } from "./types";

const range = (dir: string, prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/${dir}/${prefix}${i + 1}.webp`);

export const events: Event[] = [
  {
    slug: "stackmedium",
    title: "StackMedium",
    category: "Article Writing",
    year: "2026",
    aboutHeading: "About StackMedium",
    coverImage: "/images/stackmedium/stackmedium-1.webp",
    website: "https://medium.com/@ieeecomputersocietyiit",
    content: [
      {
        type: "paragraph",
        text: "StackMedium is a year-long monthly blog initiative aimed at helping undergraduates sharpen their technical writing skills while sharing their knowledge with a wider audience. Each month, participants can submit articles on a range of tech-related topics, which will be published on the official Medium platform. To encourage quality and creativity, one standout article is selected monthly based on set criteria and recognized as the winner. This creates a collaborative space for students to grow as writers, gain exposure, and actively contribute to the tech community.",
      },
      { type: "heading", text: "StackMedium has honoured these inspiring writers so far as the monthly winners:" },
      {
        type: "list",
        items: [
          "January 2026 Winner: Lidiya Rajapakse for his insightful article “Did You Know? Multimodal AI Is Teaching Machines to See, Hear, and Understand Together,” which explores how multimodal AI enables machines to process and understand multiple forms of data simultaneously.",
          "November 2025 Winner: Hirushi Jayasekara for her article “Who Is Driving Your Home Robot,” which offers a sharp, forward-looking perspective on how friendly home robots quietly reshape trust and privacy, and why clear governance is essential.",
          "October 2025 Winner: Biyoni Pietersz for her article “AI in 2025: Rethinking How We Innovate and Create,” which presents a sharp, forward-looking view on how artificial intelligence is transforming creativity and innovation.",
        ],
      },
    ],
    gallery: [
      "/images/stackmedium/stackmedium-6.webp",
      "/images/stackmedium/stackmedium-3.webp",
      "/images/stackmedium/stackmedium-4.webp",
      "/images/stackmedium/stackmedium-5.webp",
      "/images/stackmedium/stackmedium-1.webp",
      "/images/stackmedium/stackmedum-2.webp",
    ],
  },
  {
    slug: "commitdev",
    title: "commit.dev",
    category: "Community Meetups",
    year: "2025",
    aboutHeading: "About commit.dev",
    coverImage: "/images/commit-dev/commitdev-2.webp",
    content: [
      {
        type: "paragraph",
        text: "Commit.dev is an upcoming year-long initiative tailored exclusively for IEEE Computer Society global members at IIT, focused on driving engagement with our members. Set to launch soon, the program will feature bi-monthly meetups, each comprising two technical sessions, one networking session, exciting swag giveaways, and a variety of engaging activities. Designed to foster continuous learning, professional development, and community-building, Commit.dev aims to create a vibrant space where members can collaborate, exchange knowledge, and expand their network.",
      },
    ],
    gallery: range("commit-dev", "commitdev-", 6),
  },
  {
    slug: "coderally6-0",
    title: "CodeRally 6.0",
    category: "Coding & Hackathon",
    year: "2025",
    aboutHeading: "About CodeRally 6.0",
    coverImage: "/images/coderally6-0/coderally6-0-2.webp",
    website: "https://www.coderally.lk/",
    content: [
      { type: "heading", text: "Competitive Programming Workshop" },
      {
        type: "paragraph",
        text: "An introductory workshop designed to introduce participants to the fundamentals of competitive programming, effective problem-solving approaches, and commonly used contest structures.",
      },
      { type: "heading", text: "Algorithm Fundamentals Workshop" },
      {
        type: "paragraph",
        text: "This session focused on essential algorithmic topics such as sorting techniques, searching methods, and recursion, helping participants build a strong conceptual base.",
      },
      { type: "heading", text: "Advanced Algorithm Techniques Workshop" },
      {
        type: "paragraph",
        text: "Participants explored advanced problem-solving approaches including dynamic programming and greedy algorithms, enabling them to handle more challenging computational problems.",
      },
      { type: "heading", text: "Advanced Programming Workshop" },
      {
        type: "paragraph",
        text: "A deep dive into advanced coding practices, performance optimization, and language-specific strategies aimed at improving efficiency in competitive programming scenarios.",
      },
      { type: "heading", text: "Competitive Programming Guide Workshop" },
      {
        type: "paragraph",
        text: "This workshop offered hands-on guidance and contest-oriented strategies such as effective time management, debugging techniques, and analyzing edge cases.",
      },
      { type: "heading", text: "24-hour Hackathon Awareness Session" },
      {
        type: "paragraph",
        text: "An orientation session that prepared participants for the hackathon by covering rules, expectations, team coordination, and effective project planning methods.",
      },
      { type: "heading", text: "24-hour Hackathon" },
      {
        type: "paragraph",
        text: "The flagship event of CodeRally 6.0, this 24-hour hackathon pushed participants to transform ideas into innovative technical solutions within a limited timeframe. The event emphasized collaboration, creativity, and problem-solving under pressure, giving teams a platform to showcase both technical skills and teamwork.",
      },
    ],
    gallery: range("coderally6-0", "coderally6-0-", 12),
  },
  {
    slug: "campus-to-ceo",
    title: "Campus to CEO",
    category: "Career Guidance",
    year: "2025",
    aboutHeading: "About Campus To CEO",
    coverImage: "/images/campustoceo/campustoceo-1.webp",
    content: [
      {
        type: "paragraph",
        text: "Kithsiri Gunasekara, Director of VSIS, delivered the Campus to CEO session organized by the IEEE Computer Society Student Branch Chapter of IIT. The event provided a valuable opportunity for students from IIT as well as participants from several other universities. Through initiatives such as this, VSIS and the broader group remain committed to knowledge sharing and empowering the next generation to contribute to a brighter future for the nation.",
      },
    ],
    gallery: [1, 2, 7, 4, 5, 6].map((n) => `/images/campustoceo/campustoceo-${n}.webp`),
  },
  {
    slug: "industpro4-0",
    title: "IndustPro 4.0",
    category: "Career Guidance",
    year: "2025",
    aboutHeading: "About IndustPro",
    coverImage: "/images/industpro4-0/industpro4-home.webp",
    content: [
      {
        type: "paragraph",
        text: "IndustPro 4.0 was a comprehensive five-part workshop series tailored to elevate students’ professional readiness, entrepreneurial mindset, and career-building strategies. With over 650 cumulative participants, the program brought together leading industry experts, startup founders, and talent acquisition professionals to deliver insights on modern recruitment expectations, personal branding, internship success, and startup innovation.",
      },
      { type: "heading", text: "Workshop 01: Blueprints for Tomorrow" },
      {
        type: "paragraph",
        text: "A dynamic panel discussion featuring six top professionals from fields such as Software Engineering, DevOps, Program Management, ML Engineering, UI/UX, and Business Analysis. Moderated by Ms. Sekar Anoja from ECONSULATE, the session offered students practical career guidance, skill trends, and a post-panel networking opportunity for one-on-one industry interaction.",
      },
      { type: "heading", text: "Workshop 02: Unveiling the Journey" },
      {
        type: "paragraph",
        text: "Led by Mr. Navinda Dissanayake (Senior Software Engineer at TWC Innovation), this session focused on portfolio development, crafting standout CVs, and LinkedIn optimization for internship success. Delivered virtually, it equipped participants with the tools to align their personal profiles with market expectations.",
      },
      { type: "heading", text: "Workshop 03: Branding for Impact" },
      {
        type: "paragraph",
        text: "Conducted by Ms. Chanukah Gunawardena from IFS, this session explored the art of personal branding. Students learned how to refine their online presence, effectively network on LinkedIn, and present themselves confidently at career fairs.",
      },
      { type: "heading", text: "Workshop 04: Art of a Business Pitch Canvas" },
      {
        type: "paragraph",
        text: "Entrepreneurship took the spotlight in this session led by Ms. Nadia De Mel, Founder of SynergX & NINA. Participants were introduced to the essentials of creating compelling pitch decks, mastering storytelling, and understanding the investor mindset through real-world case studies and live feedback.",
      },
      { type: "heading", text: "Workshop 05: Venture Into Startups" },
      {
        type: "paragraph",
        text: "This inspiring session by Mr. Sharanyan Sharma (Founder, Prime One Global & Altitude1) explored the Sri Lankan startup ecosystem. Attendees learned about startup lifecycle stages, reasons behind failures, and strategies for pitching and scaling. A live pitching activity helped students gain hands-on experience and receive expert feedback.",
      },
      {
        type: "paragraph",
        text: "IndustPro 4.0 successfully bridged the gap between academia and industry by empowering students with essential career tools, entrepreneurial insights, and industry exposure.",
      },
    ],
    gallery: range("industpro4-0", "industpro4-", 16),
  },
  {
    slug: "webspire2-0",
    title: "WebSpire 2.0",
    category: "Web Development",
    year: "2025",
    aboutHeading: "About WebSpire",
    coverImage: "/images/webspire2-0/webspire2-home.webp",
    website: "https://www.webspire2-0.site/",
    content: [
      {
        type: "paragraph",
        text: "Webspire is a dynamic web development workshop series designed to equip students with essential front-end skills. The program featured three hands-on workshops, covering HTML, CSS, and JavaScript, along with key design principles and modern frameworks. It all wrapped up with an exciting industry visit, giving participants a real-world glimpse into professional web development environments.",
      },
      { type: "heading", text: "Workshop 1: Building Blocks of the Web" },
      {
        type: "paragraph",
        text: "This workshop introduced the essentials of front-end development, covering HTML structure, CSS styling, Flexbox layouts, and responsive design principles, equipping students with the core skills to build modern web interfaces.",
      },
      { type: "heading", text: "Workshop 2: Designing for Humans" },
      {
        type: "paragraph",
        text: "This session introduced students to core UI/UX principles, visual design basics, user flows, and prototyping. It bridged the gap between intuitive design thinking and development-ready outputs, empowering attendees to craft human-centered digital experiences.",
      },
      { type: "heading", text: "Workshop 3: The Art of JavaScript & Frameworks" },
      {
        type: "paragraph",
        text: "This workshop focused on JavaScript essentials, covering functions, DOM manipulation, and event handling. Through hands-on activities, students built dynamic components and gained foundational skills to create interactive, responsive web applications.",
      },
      { type: "heading", text: "Exclusive Industry Visit" },
      {
        type: "paragraph",
        text: "As the final chapter of the Webspire series, the industry visit to Cambio Software gave participants a valuable behind-the-scenes look at a real-world tech environment. Students had the opportunity to interact with professionals, explore how web technologies are applied in practice, and gain insights into industry workflows, tools, and career paths.",
      },
    ],
    gallery: ["/images/webspire2-0/webspire2-home.webp", ...range("webspire2-0", "webspire2-", 11)],
  },
  {
    slug: "coderally5-0",
    title: "CodeRally 5.0",
    category: "Coding & Hackathon",
    year: "2024",
    aboutHeading: "About CodeRally",
    coverImage: "/images/coderally5-0/coderally5-home.webp",
    content: [
      {
        type: "paragraph",
        text: "CodeRally 5.0 brought together more than 500 coding enthusiasts for a competitive programming experience divided into two phases. The journey began with an intensive workshop series that guided participants through foundational programming concepts, key algorithms, strategic approaches for competitions, and advanced problem-solving methods, culminating in expert advice on excelling in coding contests. This was followed by a 24-hour hackathon, challenging participants to craft innovative tech solutions under limited time constraints collaboratively. The event fostered a dynamic environment for skill-building, teamwork, and demonstrating technical prowess.",
      },
      { type: "heading", text: "Competitive Programming Workshop" },
      {
        type: "paragraph",
        text: "This is an introductory session that aims to familiarize participants with the basics of competitive programming, problem-solving strategies, and standard contest formats.",
      },
      { type: "heading", text: "Algorithm Fundamentals Workshop" },
      {
        type: "paragraph",
        text: "Focused on core algorithmic concepts such as sorting, searching, and recursion—laying a solid foundation for deeper technical understanding.",
      },
      { type: "heading", text: "Advanced Algorithm Techniques Workshop" },
      {
        type: "paragraph",
        text: "Covered complex algorithms like dynamic programming and greedy methods, helping participants tackle high-difficulty problems.",
      },
      { type: "heading", text: "Advanced Programming Workshop" },
      {
        type: "paragraph",
        text: "Took a deeper dive into coding practices, optimization, and language-specific tricks essential for performance in competitive environments.",
      },
      { type: "heading", text: "Competitive Programming Guide Workshop" },
      {
        type: "paragraph",
        text: "Provided practical tips and contest-specific advice, including time management, debugging, and test case analysis.",
      },
      { type: "heading", text: "24-hour Hackathon Awareness Session" },
      {
        type: "paragraph",
        text: "Prepared participants for the upcoming hackathon by explaining rules, expectations, team collaboration tips, and project planning techniques.",
      },
      { type: "heading", text: "24-hour Hackathon" },
      {
        type: "paragraph",
        text: "The highlight of CodeRally 5.0, this intense 24-hour hackathon, challenged participants to apply their skills by building innovative tech solutions under pressure. It fostered teamwork, creativity, and problem-solving in a fast-paced environment, allowing teams to demonstrate both technical prowess and collaboration.",
      },
    ],
    gallery: [
      "/images/coderally5-0/coderally5-home.webp",
      ...[1, 3, 10, 4, 5, 6, 7, 8, 9, 11, 2].map((n) => `/images/coderally5-0/coderally5-${n}.webp`),
    ],
  },
  {
    slug: "industpro3-0",
    title: "IndustPro 3.0",
    category: "Career Guidance",
    year: "2024",
    aboutHeading: "About IndustPro",
    coverImage: "/images/industpro3-0/industpro-4.webp",
    content: [
      {
        type: "paragraph",
        text: "IndustPro 3.0 was designed to boost professional development and industry readiness, especially targeting students preparing for their placement year. The program featured four workshops, including CV building, LinkedIn profile optimization, effective career fair preparation, open-source contributions, and securing summer internships. Enriched by tech talks from six seasoned industry professionals, each session drew over 300 participants. IndustPro 3.0 offered a valuable platform for students to gain practical knowledge, strengthen their professional profiles, and confidently navigate the path toward successful careers and internships.",
      },
      { type: "heading", text: "CV Optimization Workshop" },
      {
        type: "paragraph",
        text: "Aimed at helping students craft impactful and professional CVs tailored to industry expectations. This session focused on improving content structure, keyword usage, and formatting to boost internship and job application success.",
      },
      { type: "heading", text: "Career Navigator Workshop" },
      {
        type: "paragraph",
        text: "Designed to guide students through the process of planning and navigating their career paths. The session covered career fair strategies, building a personal brand, and using LinkedIn effectively to network and explore opportunities.",
      },
      { type: "heading", text: "Summer Internships Awareness Session" },
      {
        type: "paragraph",
        text: "Focused on preparing students for securing meaningful summer internships. This session highlighted application strategies, timelines, and key skills recruiters look for in internship candidates.",
      },
      { type: "heading", text: "Leveraging Open Source Contributions for Career Success" },
      {
        type: "paragraph",
        text: "Introduced students to the power of contributing to open-source projects. The workshop demonstrated how real-world coding experience and community involvement can enhance employability and technical credibility.",
      },
      { type: "heading", text: "Tech Talk" },
      {
        type: "paragraph",
        text: "A session led by industry professionals sharing insights into current tech trends, career advice, and real-world experiences. This served as a motivational and informative conclusion to the series, inspiring students to stay ahead in the evolving tech landscape.",
      },
    ],
    gallery: range("industpro3-0", "industpro-", 12),
  },
  {
    slug: "webspire1-0",
    title: "WebSpire",
    category: "Web Development",
    year: "2023/2024",
    aboutHeading: "About WebSpire",
    coverImage: "/images/webspire1-0/webspire-7.webp",
    content: [
      {
        type: "paragraph",
        text: "Webspire is an event aimed at empowering undergraduates by connecting them with experienced professionals in the field of web development. The program unfolds in two stages: the first lays a strong foundation in web design and development principles, while the second delivers an immersive, full-day hands-on workshop focused on front-end development with React. In its second stage, WebSpire drew over 250 enthusiastic participants, equipping them with essential skills and practical experience to thrive both academically and in the tech industry.",
      },
      { type: "heading", text: "Awareness session: Introduction to front-end web development" },
      {
        type: "paragraph",
        text: "An introductory session aimed at familiarizing participants with the fundamentals of front-end web development. It laid the groundwork for the upcoming workshops by highlighting essential concepts, tools, and technologies used in modern web development.",
      },
      { type: "heading", text: "Online workshop: To enhance your HTML/CSS and JavaScript knowledge." },
      {
        type: "paragraph",
        text: "A technical session designed to strengthen participants' HTML, CSS, and JavaScript skills. Delivered virtually, it allowed students to dive deeper into coding practices and enhance their understanding of core front-end building blocks.",
      },
      { type: "heading", text: "Physical workshop: Dive deep into advanced JavaScript (ES6) and React." },
      {
        type: "paragraph",
        text: "An in-depth, hands-on workshop that focused on advanced JavaScript (ES6) and React. Conducted in person, this session provided a practical learning experience, helping attendees build dynamic web applications and apply their skills in real-world scenarios.",
      },
    ],
    gallery: range("webspire1-0", "webspire-", 8),
  },
  {
    slug: "imagine-cup",
    title: "Microsoft Imagine Cup Awareness Session",
    category: "Tech",
    year: "2024",
    aboutHeading: "About the event",
    coverImage: "/images/imagine-cup/imagine-cup-3.webp",
    content: [
      {
        type: "paragraph",
        text: "We hosted a highly engaging Microsoft Imagine Cup Awareness session that attracted over 300 enthusiastic attendees. The session featured an insightful keynote by Mr. Prabhath Mannapperuma, who provided an in-depth overview of the Imagine Cup competition, its global significance, and how students can leverage it to showcase their innovative ideas on an international stage.",
      },
      {
        type: "paragraph",
        text: "Team Nana Shilpa took the stage to share their championship-winning strategies and experiences offering attendees firsthand insights into building impactful tech solutions.",
      },
      {
        type: "paragraph",
        text: "In addition, Mr. Nandun Diaz introduced the audience to the Microsoft Learn platform, outlining how students can access structured learning paths, certifications, and resources to upskill and stay industry-ready continuously.",
      },
      {
        type: "paragraph",
        text: "This session not only raised awareness about one of the world's most prestigious student tech competitions but also empowered participants with practical knowledge and tools to pursue innovation and personal growth within the tech industry.",
      },
    ],
    gallery: [3, 8, 2, 5, 1, 7, 6, 4].map((n) => `/images/imagine-cup/imagine-cup-${n}.webp`),
  },
  {
    slug: "after-party",
    title: "Microsoft Build After Party",
    category: "Tech",
    year: "2024",
    aboutHeading: "About the event",
    coverImage: "/images/after-party/after-party-2.webp",
    content: [
      {
        type: "paragraph",
        text: "Microsoft Build After Party: Season of AI at IIT Sri Lanka brought together tech enthusiasts and industry professionals for an inspiring afternoon of innovation and learning. Organized by the Microsoft Student Ambassadors in collaboration with the IEEE Computer Society Student Branch Chapter of IIT, the event featured three insightful sessions centered around cloud computing, AI development, and modern deployment practices.",
      },
      { type: "heading", text: "Mr. Sahan Dissanayaka" },
      {
        type: "paragraph",
        text: "shared his expertise on Machine Learning Workflow Design with Cloud, offering a deep dive into scalable ML pipelines and cloud integration.",
      },
      { type: "heading", text: "Mr. Indrajith Ekanayake" },
      {
        type: "paragraph",
        text: "a Microsoft MVP and Cloud Native expert, demonstrated how to Deploy Containerized Applications using Azure Kubernetes Service, emphasizing efficiency and flexibility in modern app deployment.",
      },
      { type: "heading", text: "Mr. Nandun Diaz" },
      {
        type: "paragraph",
        text: "a Gold Microsoft Learn Student Ambassador, showcased how AI Development Can Be Streamlined with Azure AI Studio, highlighting tools that simplify and accelerate the AI development lifecycle.",
      },
    ],
    gallery: [2, 1, 3, 6, 5, 4, 7, 8].map((n) => `/images/after-party/after-party-${n}.webp`),
  },
  {
    slug: "postman",
    title: "Postman API Workshops",
    category: "Web Development",
    year: "2024",
    aboutHeading: "About the event",
    coverImage: "/images/postman/postman-1.webp",
    content: [
      {
        type: "paragraph",
        text: "Led by certified Postman Student Experts, these workshops organized by our chapter, offered a clear and practical introduction to Postman and API development. Centered around API development, these sessions offered hands-on, practical experience that helped participants understand how to build and test APIs effectively. With over 300 students taking part, the workshops served as a valuable stepping stone for students looking to strengthen their technical toolkit and advance in both academic projects and future tech careers.",
      },
      { type: "heading", text: "Introduction to APIs using Postman" },
      {
        type: "paragraph",
        text: "Led by Postman Student Expert Hasala Abhilasha, this virtual session introduced students to the fundamentals of API development and testing using Postman. With no prior experience required, attendees gained hands-on exposure to API requests, responses, and workflows, laying the groundwork for modern software integration skills.",
      },
      { type: "heading", text: "API 101 Using Postman" },
      {
        type: "paragraph",
        text: "Facilitated by Postman Student Expert Geesad Bandara, this beginner-friendly session guided students through the basics of APIs using Postman. Participants explored how to send requests, interpret responses, and build a strong foundation in API testing, with no prior experience required.",
      },
    ],
    gallery: [1, 6, 3, 4, 5, 2].map((n) => `/images/postman/postman-${n}.webp`),
  },
];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}
