import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class NoteTag extends Model {
  public noteId!: number;
  public tagId!: number;
}

NoteTag.init(
  {
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'note_tags',
    timestamps: false,
  }
);

export default NoteTag;
