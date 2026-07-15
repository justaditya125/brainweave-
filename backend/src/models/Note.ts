import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Note extends Model {
  declare id: number;
  declare userId: number;
  declare title: string;
  declare content: string;
  declare categoryId: number | null;
  declare boardColumnId: number | null;
  declare pinned: boolean;
  declare starred: boolean;
  declare archived: boolean;
  declare sortOrder: number;
  declare deletedAt: Date | null;
  declare isPublic: boolean;
  declare shareToken: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Note.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    boardColumnId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    starred: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    shareToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'notes',
    indexes: [
      {
        name: 'notes_title_content_fulltext',
        type: 'FULLTEXT',
        fields: ['title', 'content'],
      },
    ],
  }
);

export default Note;
