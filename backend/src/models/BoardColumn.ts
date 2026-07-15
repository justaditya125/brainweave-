import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class BoardColumn extends Model {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare position: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

BoardColumn.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'board_columns',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'name'],
      },
    ],
  }
);

export default BoardColumn;
