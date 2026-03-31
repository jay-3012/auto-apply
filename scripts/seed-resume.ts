import { Resume } from '../src/db/models/resume.model.js';
import { sequelize } from '../src/db/index.js';

const BASE_LATEX = `
\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{casual}
\\moderncvcolor{blue}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.75]{geometry}

\\name{John}{Doe}
\\title{Full Stack Developer}
\\phone[mobile]{+91~9999999999}
\\email{john.doe@example.com}

\\begin{document}
\\makecvtitle

\\section{Summary}
Experienced Full Stack Developer with 4 years of expertise in React, Node.js, and Cloud Infrastructure.

\\section{Experience}
\\cventry{2020--Present}{Senior Developer}{Tech Solutions}{Bangalore}{}{
\\begin{itemize}
  \\item Built scalable microservices using Node.js and PostgreSQL.
  \\item Developed responsive frontends with React and Tailwind CSS.
  \\item Improved CI/CD pipelines increasing deployment frequency by 40\\%.
\\end{itemize}}

\\section{Skills}
\\cvitem{Languages}{TypeScript, JavaScript, Python, SQL}
\\cvitem{Frameworks}{React, Next.js, Express, NestJS}
\\cvitem{Tools}{Docker, AWS, Git, Redis}

\\end{document}
`;

async function seedResume() {
  try {
    await sequelize.authenticate();
    const resume = await Resume.create({
      version: 'v1.0.0',
      texContent: BASE_LATEX,
      pdfUrl: 'https://example.com/base-resume.pdf',
      isBase: true,
    });
    console.log('Base resume seeded successfully:', resume.id);
  } catch (error) {
    console.error('Error seeding resume:', error);
  } finally {
    await sequelize.close();
  }
}

seedResume();
