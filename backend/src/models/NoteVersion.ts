import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class NoteVersion extends Model {
  declare id: number;
  declare noteId: number;
  declare userId: number;
  declare title: string;
  declare content: string;
  declare version: number;
  declare readonly createdAt: Date;
}

NoteVersion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'note_versions',
    indexes: [
      {
        fields: ['noteId', 'version'],
      },
    ],
  }
);

export default NoteVersion;
