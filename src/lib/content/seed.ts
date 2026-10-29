import type { Content } from "./schema";

// Starting content, shown until the first save in /admin. After that the saved
// copy in DATA_DIR wins and this file is no longer read.
export const seedContent: Content = {
  profile: {
    name: "Taha Gökalp Alkoç",
    headline: "Founder of Operon · High-school student in Turkey",
    location: "Turkey",
    photo: "",
    intro: [
      "I build the things I wish had existed when I needed them.",
      "While preparing for AP Biology, I was also doing a laboratory internship. I wanted to understand what I saw there properly: not only well enough to answer an exam question, but well enough to explain why each step was done and what would happen if it changed. The free material I found was scattered, and private lessons were out of reach. So I started building the resource myself, and it became Operon.",
      "That has become the way I work. I find a problem I have run into myself, learn whatever it takes to solve it, and make the result available to the people who come after me. Along the way I have learned to take a project from the first sketch to the server it runs on.",
      "I believe that how well someone understands the world should not depend on where they live or what their family can afford. Everything on this page is a small step toward that.",
    ].join("\n\n"),
    email: "",
  },
  links: [
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/tahagokalpalkoc/" },
    { id: "github", label: "GitHub", url: "https://github.com/gokalpalkoc-lang" },
  ],
  projects: [
    {
      id: "operon",
      visible: true,
      name: "Operon Biology",
      tagline: "A free, interactive study site for AP Biology and Biology Olympiad students.",
      description:
        "Pathway models you can change and trace, a curriculum map of 38 topics with a fact-checked lesson for each, diagnostic drills built on real experiments, AP-style practice tests with a timed mock exam, and a moderated board where students ask and answer questions.",
      url: "https://operon.devtga.com",
      status: "live",
      tags: ["Next.js", "TypeScript", "PostgreSQL"],
      image: "",
    },
    {
      id: "scout",
      visible: true,
      name: "Scout",
      tagline: "A mobile AI assistant that watches websites and keeps you ahead of dates and deadlines.",
      description:
        "Give Scout a page that lists things, such as a venue's programme, a university's seminars or a conference's call for papers, and it reads that page on a schedule. New events land in your agenda, registration cutoffs become reminders, and meaningful changes become notifications.",
      url: "",
      status: "in-development",
      tags: ["React Native", "Expo", "AI"],
      image: "",
    },
  ],
  sections: [
    {
      id: "experience",
      visible: true,
      title: "Experience",
      items: [
        {
          id: "operon-founder",
          visible: true,
          title: "Founder & developer",
          org: "Operon Biology",
          date: "2026 – present",
          description:
            "Designed, wrote and deployed a free study platform for AP Biology and Biology Olympiad students, from the curriculum and lessons to the server it runs on.",
          url: "https://operon.devtga.com",
        },
        {
          id: "lab-internship",
          visible: false,
          title: "Laboratory internship",
          org: "",
          date: "",
          description: "",
          url: "",
        },
      ],
    },
    {
      id: "education",
      visible: true,
      title: "Education",
      items: [
        {
          id: "high-school",
          visible: false,
          title: "High school",
          org: "",
          date: "",
          description: "",
          url: "",
        },
      ],
    },
    {
      id: "honors",
      visible: true,
      title: "Honors & awards",
      items: [],
    },
  ],
  skills: ["TypeScript", "React", "Next.js", "React Native", "Node.js", "PostgreSQL", "Python", "Docker", "Linux servers"],
};
