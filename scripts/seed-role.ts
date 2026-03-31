import { RoleConfig } from '../src/db/models/role-config.model.js';
import { sequelize } from '../src/db/index.js';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const role = await RoleConfig.create({
      roleName: 'Full Stack Developer',
      keywords: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
      minAtsThreshold: 65,
      isActive: true,
    });

    console.log('Role seeded successfully:', role.toJSON());
  } catch (error) {
    console.error('Error seeding role:', error);
  } finally {
    await sequelize.close();
  }
}

seed();
