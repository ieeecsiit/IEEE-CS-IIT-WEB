import "server-only";

import { fetchCollection, toPhoto, type CmsMedia } from "./cms";
import imageSizes from "./image-sizes.json";
import type { BlogPost, BlogSection, Photo } from "./types";

/** Cache tag on the blog list; `/api/revalidate` clears it when the CMS changes. */
export const BLOGS_TAG = "cms-blogs";

// Subset of the CMS's generated `Blog` type that this site reads.
type CmsBlog = {
  slug: string;
  title: string;
  badge?: string | null;
  excerpt?: string | null;
  author: { name: string; image?: number | CmsMedia | null };
  coverImage: number | CmsMedia;
  cardImage?: number | CmsMedia | null;
  contentHtml: string;
  sections: BlogSection[];
  readMoreUrl?: string | null;
};

function toPost(blog: CmsBlog): BlogPost | undefined {
  const image = toPhoto(blog.coverImage, blog.title);
  if (!image) return undefined;
  return {
    slug: blog.slug,
    title: blog.title,
    badge: blog.badge ?? undefined,
    author: blog.author.name,
    authorImage: toPhoto(blog.author.image, blog.author.name),
    cardImage: toPhoto(blog.cardImage, blog.title) ?? image,
    image,
    summary: blog.excerpt?.trim() || blog.sections[0]?.paragraphs[0],
    body: { type: "html", html: blog.contentHtml },
    readMoreUrl: blog.readMoreUrl ?? undefined,
  };
}

// The posts written before the CMS had a blog. A CMS post with the same slug
// replaces its hand-written one, so these can be moved over one at a time.
type LegacyPost = {
  slug: string;
  title: string;
  badge: string;
  author: string;
  authorImage: string;
  cardImage: string;
  image: string;
  imageAlt: string;
  sections: BlogSection[];
  mediumUrl: string;
};

const sizes: Record<string, number[]> = imageSizes;

function localPhoto(src: string, alt: string): Photo {
  const [width, height] = sizes[src] ?? [];
  if (!width || !height) throw new Error(`Unknown image "${src}". Run \`npm run images\` after adding it.`);
  return { src, width, height, alt };
}

function fromLegacy(post: LegacyPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    badge: post.badge,
    author: post.author,
    authorImage: localPhoto(post.authorImage, post.author),
    cardImage: localPhoto(post.cardImage, ""),
    image: localPhoto(post.image, post.imageAlt),
    summary: post.sections[0]?.paragraphs[0],
    body: { type: "sections", sections: post.sections },
    readMoreUrl: post.mediumUrl,
  };
}

/** Published CMS posts, newest first, then any hand-written ones they haven't replaced. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const docs = await fetchCollection<CmsBlog>(
    "blogs",
    { sort: "-publishedDate", depth: "1", limit: "100" },
    BLOGS_TAG,
    "blog posts",
  );
  const posts = docs.map(toPost).filter((post): post is BlogPost => !!post);
  const slugs = new Set(posts.map((post) => post.slug));
  return [...posts, ...legacyPosts.filter((post) => !slugs.has(post.slug)).map(fromLegacy)];
}

export async function getBlogPost(slug: string) {
  return (await getBlogPosts()).find((post) => post.slug === slug);
}

const legacyPosts: LegacyPost[] = [
  {
    slug: "multimodal-ai",
    title: "Did You Know? Multimodal AI Is Teaching Machines to See, Hear, and Understand Together",
    badge: "January Winner",
    author: "Lidiya Rajapakse",
    authorImage: "/images/stackmedium/lidiya-lidiya-rajapaksha.webp",
    cardImage: "/images/stackmedium/dec2025blog.webp",
    image: "/images/stackmedium/dec2025blog.webp",
    imageAlt: "Multimodal AI Article Image",
    mediumUrl:
      "https://medium.com/@ieeecomputersocietyiit/did-you-know-multimodal-ai-is-teaching-machines-to-see-hear-and-understand-together-f0dc495ddf8e",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "Did you know that some modern artificial intelligence systems can look at an image, listen to audio, read text, and understand all of them at the same time? This ability comes from Multimodal Artificial Intelligence, an emerging field that is shaping the next wave of intelligent systems.",
          "Unlike traditional AI models that work with a single type of data, multimodal systems combine multiple inputs to make smarter and more human-like decisions. From voice-enabled assistants that understand context to medical systems that analyze scans and reports together, multimodal AI is quietly transforming how machines interact with the world.",
        ],
      },
      {
        heading: "1. What Is Multimodal Artificial Intelligence?",
        paragraphs: [
          "Multimodal Artificial Intelligence refers to AI systems that can process and integrate multiple types of data, such as text, images, audio, video, and sensor data. Instead of treating these inputs separately, multimodal models learn relationships between them. For example, a system can understand an image and the text describing it, or match spoken instructions with visual objects in real time. This approach mirrors how humans perceive the world—we do not rely on just one sense at a time.",
        ],
      },
      {
        heading: "2. How It Works",
        paragraphs: [
          "At a high level, multimodal AI works in three steps: Input Processing, where each data type is processed using specialized models; Feature Alignment, where the system learns how different data types relate to each other; and Unified Decision-Making, where the combined understanding is used to generate predictions or actions.",
        ],
      },
      {
        heading: "3. Real-World Applications",
        paragraphs: [
          "Multimodal AI is already being used in many everyday technologies. Smart Assistants now use both audio and contextual data to respond more accurately. In Healthcare, medical AI systems analyze images, patient history, and notes together to improve diagnosis. Autonomous Vehicles rely on cameras, radar, and maps simultaneously to understand their surroundings safely.",
        ],
      },
    ],
  },
  {
    slug: "home-robot",
    title: "Who Is Driving Your Home Robot?",
    badge: "November Winner",
    author: "Hirushi Jayasekara",
    authorImage: "/images/stackmedium/hirushi-jayasekara-main.webp",
    cardImage: "/images/stackmedium/nov2025blog.webp",
    image: "/images/stackmedium/nov2025blog.webp",
    imageAlt: "Home Robot Article Image",
    mediumUrl: "https://medium.com/@ieeecomputersocietyiit/who-is-driving-your-home-robot-d4f05838bc73",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "NEO’s viral debut raised a core trust question: Are we buying truly autonomous home helpers or a teleoperated service that sends video, audio, and behavior from our private spaces to train future systems? This article compares promises and fine print, explains why friendly design lowers our guard, and lays out guardrails for the future of home robotics.",
        ],
      },
      {
        heading: "1. The Pitch vs. The Product",
        paragraphs: [
          "On paper, the pitch is irresistible. A human-scale helper that tidies, does dishes, waters plants, learns your routines, and quietly recharges when done. The NEO site invites you to schedule chores and “come back to a cleaner home every day.” It also introduces Expert Mode. If NEO does not know a task, you can schedule a 1X Expert to guide it so the robot learns while the job gets done. That is teleoperation by design, not a glitch, and it changes the trust equation inside a private home.",
        ],
      },
      {
        heading: "2. Why Friendly Design Matters",
        paragraphs: [
          "Soft fabrics, earth-tone colors, knit suits, and quiet tendon-driven motion make NEO feel like furniture rather than a machine. That lowers anxiety and friction to adoption, especially for families. Yet, it also lowers our guard about what the robot can see, record, or transmit. Labels such as \"Soft and Safe\" or \"Pinch Proof\" are cues engineered to build comfort. But comfort is great only until it obscures risk.",
        ],
      },
      {
        heading: "3. Governance and Trust",
        paragraphs: [
          "To ensure safety before mass adoption, we need clear guardrails: clear labels for teleoperation versus autonomy, geofenced \"no-view\" zones, on-device processing, and tamper-evident logs. Plain English accountability is essential so that governance arrives before these devices become household staples. We must ensure that friendly design does not mask the reality of surveillance or data collection in our most private spaces.",
        ],
      },
    ],
  },
  {
    slug: "ai-in-2025",
    title: "AI in 2025: Rethinking How We Innovate and Create",
    badge: "October Winner",
    author: "S. H. Biyoni Pietersz",
    authorImage: "/images/stackmedium/biyoni-pietersz-sathruwani-pietersz.webp",
    cardImage: "/images/stackmedium/oct2025blog1.webp",
    image: "/images/stackmedium/oct2025blog.webp",
    imageAlt: "AI in 2025",
    mediumUrl:
      "https://medium.com/@ieeecomputersocietyiit/ai-in-2025-rethinking-how-we-innovate-and-create-18afe935feae",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "Did you know that in 2025, AI systems can sometimes generate entire feature films, complete with original soundtracks and scripts, in less time than it takes to binge-watch a single season of a TV show? This article explores how artificial intelligence is reshaping the fabric of creativity and innovation, shifting from a tool to a collaborative partner.",
        ],
      },
      {
        heading: "1. When AI Becomes a Creative Partner",
        paragraphs: [
          "For decades, innovation was largely a solo or small-team human endeavor. Now, AI technologies are collaborators. In 2025, creativity isn't about human versus machine; it's about human plus machine. Architects sketch concepts while AI instantly generates 3D models with sustainability data baked in. Authors use AI assistants to break writer's block with narrative twists. This real-time collaboration accelerates the exploration of ideas and pushes boundaries.",
        ],
      },
      {
        heading: "2. Innovation Accelerated by AI Technologies",
        paragraphs: [
          "Groundbreaking technologies are rewriting the innovation playbook. Quantum AI combines quantum computing and algorithms to tackle problems in minutes that once took centuries, revolutionizing fields like drug discovery. Edge AI allows devices to make instant, localized decisions without cloud delays. Meanwhile, Multi-modal Generative AI blends text, image, and audio generation, enabling creators to craft multimedia projects from a single prompt.",
        ],
      },
      {
        heading: "3. A Day in the Life with AI",
        paragraphs: [
          "Imagine Maya, a game developer who starts her morning chatting with an AI storytelling assistant for plot ideas and collaborates with an AI artist by noon to create immersive environments. Or Raj, a physician who uses AI diagnostic tools to analyze thousands of medical images in seconds. These scenarios highlight how the partnership between human intuition and AI's computational power is enhancing productivity and saving lives.",
        ],
      },
    ],
  },
  {
    slug: "generative-ai-takeover",
    title: "From Canvas to Code: The Generative AI Takeover",
    badge: "September Winner",
    author: "E.M Achintha Isuranga Ekanayake",
    authorImage: "/images/stackmedium/achintha.webp",
    cardImage: "/images/stackmedium/sep2025blog.webp",
    image: "/images/stackmedium/sep2025blog.webp",
    imageAlt: "Generative AI Article Image",
    mediumUrl:
      "https://medium.com/@ieeecomputersocietyiit/from-canvas-to-code-the-generative-ai-takeover-911bf5be6df1",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "Did you know that the film \"DreadClub: Vampire's Verdict\" won awards despite being almost entirely generated by Artificial Intelligence? This feat was made possible by Generative AI—a branch of technology that doesn't just analyze data but creates new content, from text and music to video and code. This article explores how Generative AI is reshaping industries and challenging our understanding of creativity.",
        ],
      },
      {
        heading: "1. Transforming Creative Industries",
        paragraphs: [
          "Generative AI is transforming creative fields by automating repetitive tasks and unlocking new possibilities. Artists and filmmakers use tools like MidJourney and Adobe Firefly to instantly create unique visuals, while AI accelerates content creation in marketing and education. Beyond the arts, it is redefining healthcare by accelerating drug discovery and creating detailed medical illustrations for training.",
        ],
      },
      {
        heading: "2. Partner or Competitor?",
        paragraphs: [
          "The rise of AI raises a critical question: is it here to replace us or help us? While there are valid concerns regarding copyright, plagiarism, and job displacement—highlighted by controversies over AI copying artistic styles—there is a flip side. AI can serve as a powerful creative partner, handling mundane tasks and freeing humans to focus on high-level decision-making and originality.",
        ],
      },
      {
        heading: "3. The Future: Hybrid Creativity",
        paragraphs: [
          "The future of creativity lies in \"hybrid creativity,\" where human imagination works alongside AI innovation. While we must address the hidden environmental costs of training large models through green computing, the road ahead points to new roles like AI Creative Directors and Ethical AI Managers. The future of art may be powered by AI, but it will always be defined by human imagination.",
        ],
      },
    ],
  },
];
