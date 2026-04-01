import { Model, Table, Column, DataType, HasOne } from 'sequelize-typescript';
import { JobStatus, Platform } from '#types/db.types.js';
import { Application } from './application.model.js';
import type { Application as IApplication } from './application.model.js';

export interface JobListingAttributes {
  id: string;
  title: string;
  company: string;
  platform: Platform;
  url: string;
  jdText: string;
  salary: string | null;
  location: string | null;
  externalId: string;
  status: JobStatus;
}

export type JobListingCreationAttributes = Omit<JobListingAttributes, 'id'> & { id?: string };

@Table({ tableName: 'JobListings', timestamps: true })
export class JobListing extends Model<JobListingAttributes, JobListingCreationAttributes> implements JobListingAttributes {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare company: string;

  @Column({ type: DataType.ENUM(...Object.values(Platform)), allowNull: false })
  declare platform: Platform;

  @Column({ type: DataType.STRING, allowNull: false })
  declare url: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare jdText: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare salary: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare location: string | null;

  @Column({ type: DataType.STRING, allowNull: false })
  declare externalId: string;

  @Column({ type: DataType.ENUM(...Object.values(JobStatus)), allowNull: false, defaultValue: JobStatus.PENDING })
  declare status: JobStatus;

  @HasOne(() => Application, 'jobId')
  declare application: IApplication | null;
}
