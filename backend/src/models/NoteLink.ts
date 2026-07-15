import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class NoteLink extends Model {
  declare id: number;
  declare sourceNoteId: number;
  declare targetNoteId: number;
  declare readonly createdAt: Date;
}

NoteLink.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sourceNoteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    targetNoteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'note_links',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['sourceNoteId', 'targetNoteId'],
      },
    ],
  }
);

export default NoteLink;
