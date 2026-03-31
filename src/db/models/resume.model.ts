import { Model, Table, Column, DataType } from 'sequelize-typescript';

export interface ResumeAttributes {
  id: string;
  version: string;
  texContent: string;
  pdfUrl?: string | null;
  isBase: boolean;
}

export type ResumeCreationAttributes = Omit<ResumeAttributes, 'id'> & { id?: string };

@Table({ tableName: 'Resumes', timestamps: true })
export class Resume extends Model<ResumeAttributes, ResumeCreationAttributes> implements ResumeAttributes {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare version: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare texContent: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare pdfUrl: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isBase: boolean;
}
