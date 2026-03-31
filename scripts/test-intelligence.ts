import { JobListing } from '../src/db/models/job-listing.model.js';
import { Resume } from '../src/db/models/resume.model.js';
import { sequelize } from '../src/db/index.js';
import { calculateFitScore } from '../src/intelligence/prompts/fit-score.js';
import { calculateAtsScore } from '../src/intelligence/prompts/ats-score.js';
import { searchCompany } from '../src/intelligence/research/searxng-client.js';
import { summarizeResearch } from '../src/intelligence/prompts/company-research.js';

async function testIntelligence() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const job = await JobListing.findOne();
    if (!job) {
      console.error('No jobs found in the database. Run the scraper first.');
      return;
    }

    const resume = await Resume.findOne({ where: { isBase: true } });
    if (!resume) {
      console.error('No base resume found. Run seed-resume script first.');
      return;
    }

    console.log(`[test-intelligence] Evaluating job: ${job.title} at ${job.company}`);

    const res = await calculateFitScore(job.jdText, resume.texContent);
    console.log('[test-intelligence] Fit Score:', res);

    const ats = await calculateAtsScore(job.jdText, resume.texContent);
    console.log('[test-intelligence] ATS Score:', ats);

    const raw = await searchCompany(job.company);
    const research = await summarizeResearch(job.company, raw);
    console.log('[test-intelligence] Company Research:', research);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testIntelligence();
