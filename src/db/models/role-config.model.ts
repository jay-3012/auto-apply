import { Model, Table, Column, DataType } from 'sequelize-typescript';

export interface RoleConfigAttributes {
  id: string;
  roleName: string;
  keywords: string[]; // JSON list of keywords for the role
  minAtsThreshold: number;
  isActive: boolean;
}

export type RoleConfigCreationAttributes = Omit<RoleConfigAttributes, 'id'> & { id?: string };

@Table({ tableName: 'RoleConfigs', timestamps: true })
export class RoleConfig extends Model<RoleConfigAttributes, RoleConfigCreationAttributes> implements RoleConfigAttributes {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare roleName: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare keywords: string[];

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 60 })
  declare minAtsThreshold: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
