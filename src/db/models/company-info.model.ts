import { Model, Table, Column, DataType } from 'sequelize-typescript';

export interface CompanyInfoAttributes {
  id: string;
  companyName: string;
  researchSummary?: string | null;
  glassdoorRating?: number | null;
  redFlags?: any | null; // JSON array of strings
}

export type CompanyInfoCreationAttributes = Omit<CompanyInfoAttributes, 'id'> & { id?: string };

@Table({ tableName: 'CompanyInfos', timestamps: true })
export class CompanyInfo extends Model<CompanyInfoAttributes, CompanyInfoCreationAttributes> implements CompanyInfoAttributes {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare companyName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare researchSummary: string | null;

  @Column({ type: DataType.FLOAT, allowNull: true })
  declare glassdoorRating: number | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare redFlags: any | null;
}
