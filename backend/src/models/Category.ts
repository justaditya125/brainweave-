import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Category extends Model {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Category.init(
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
  },
  {
    sequelize,
    tableName: 'categories',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'name'],
      },
    ],
  }
);

export default Category;
