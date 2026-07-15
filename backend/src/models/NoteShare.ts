import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class NoteShare extends Model {
  declare id: number;
  declare noteId: number;
  declare ownerId: number;
  declare userId: number;
  declare permission: 'view' | 'edit';
  declare readonly createdAt: Date;
}

NoteShare.init(
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
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission: {
      type: DataTypes.ENUM('view', 'edit'),
      allowNull: false,
      defaultValue: 'view',
    },
  },
  {
    sequelize,
    tableName: 'note_shares',
    indexes: [
      {
        unique: true,
        fields: ['noteId', 'userId'],
      },
    ],
  }
);

export default NoteShare;
