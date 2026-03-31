import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApplicationDecision, ApplicationResult } from '#types/db.types.js';
import { JobListing } from './job-listing.model.js';
import { Resume } from './resume.model.js';

export interface ApplicationAttributes {
  id: string;
  jobId: string;
  resumeId?: string | null;
  atsScore?: number | null;
  fitScore?: number | null;
  aiReasoning?: string | null;
  gapAnalysis?: any | null; // JSON
  decision: ApplicationDecision;
  result?: ApplicationResult | null;
  appliedAt?: Date | null;
  screenshotUrl?: string | null;
}

export type ApplicationCreationAttributes = Omit<ApplicationAttributes, 'id'> & { id?: string };

@Table({ tableName: 'Applications', timestamps: true })
export class Application extends Model<ApplicationAttributes, ApplicationCreationAttributes> implements ApplicationAttributes {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => JobListing)
  @Column({ type: DataType.UUID, allowNull: false })
  declare jobId: string;

  @ForeignKey(() => Resume)
  @Column({ type: DataType.UUID, allowNull: true })
  declare resumeId: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare atsScore: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare fitScore: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare aiReasoning: string | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare gapAnalysis: any | null;

  @Column({ type: DataType.ENUM(...Object.values(ApplicationDecision)), allowNull: false, defaultValue: ApplicationDecision.PENDING })
  declare decision: ApplicationDecision;

  @Column({ type: DataType.ENUM(...Object.values(ApplicationResult)), allowNull: true })
  declare result: ApplicationResult | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare appliedAt: Date | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare screenshotUrl: string | null;

  @BelongsTo(() => JobListing)
  declare jobListing: JobListing;

  @BelongsTo(() => Resume)
  declare resume: Resume | null;
}
