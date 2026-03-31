import { Sequelize } from 'sequelize-typescript';
import { env } from '#config/env.js';

import { Resume } from './models/resume.model.js';
import { JobListing } from './models/job-listing.model.js';
import { Application } from './models/application.model.js';
import { CompanyInfo } from './models/company-info.model.js';
import { RoleConfig } from './models/role-config.model.js';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: env.DATABASE_URL.includes('localhost')
    ? {}
    : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
  logging: env.NODE_ENV === 'development' ? console.log : false,
  models: [Resume, JobListing, Application, CompanyInfo, RoleConfig],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
