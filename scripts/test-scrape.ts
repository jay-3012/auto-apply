import { runAllScrapers } from '../src/services/scraper.service.js';
import { sequelize } from '../src/db/index.js';
import { redisClient } from '../src/utils/redis-client.js';

async function testScrapers() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const result = await runAllScrapers();
    console.log('Scrape run completed:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error running scrapers:', error);
  } finally {
    await sequelize.close();
    await redisClient.quit();
  }
}

testScrapers();
