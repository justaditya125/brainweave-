import User from './User';
import Category from './Category';
import Note from './Note';
import Tag from './Tag';
import NoteTag from './NoteTag';
import NoteVersion from './NoteVersion';
import NoteShare from './NoteShare';
import NoteLink from './NoteLink';
import BoardColumn from './BoardColumn';
import sequelize from '../config/db';

// User Relationships
User.hasMany(Category, { foreignKey: 'userId', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Tag, { foreignKey: 'userId', onDelete: 'CASCADE' });
Tag.belongsTo(User, { foreignKey: 'userId' });

// Category Relationships
Category.hasMany(Note, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Note.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Note <-> Tag Many-to-Many
Note.belongsToMany(Tag, { through: NoteTag, foreignKey: 'noteId', otherKey: 'tagId', as: 'tags' });
Tag.belongsToMany(Note, { through: NoteTag, foreignKey: 'tagId', otherKey: 'noteId', as: 'notes' });

// Note Version Relationships
Note.hasMany(NoteVersion, { foreignKey: 'noteId', onDelete: 'CASCADE' });
NoteVersion.belongsTo(Note, { foreignKey: 'noteId' });

// Note Share Relationships
Note.hasMany(NoteShare, { foreignKey: 'noteId', as: 'shares', onDelete: 'CASCADE' });
NoteShare.belongsTo(Note, { foreignKey: 'noteId' });
NoteShare.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Note Link Relationships
Note.hasMany(NoteLink, { foreignKey: 'sourceNoteId', as: 'outgoingLinks', onDelete: 'CASCADE' });
Note.hasMany(NoteLink, { foreignKey: 'targetNoteId', as: 'incomingLinks', onDelete: 'CASCADE' });
NoteLink.belongsTo(Note, { foreignKey: 'sourceNoteId', as: 'sourceNote' });
NoteLink.belongsTo(Note, { foreignKey: 'targetNoteId', as: 'targetNote' });

// Board Column Relationships
User.hasMany(BoardColumn, { foreignKey: 'userId', onDelete: 'CASCADE' });
BoardColumn.belongsTo(User, { foreignKey: 'userId' });
BoardColumn.hasMany(Note, { foreignKey: 'boardColumnId', as: 'notes', onDelete: 'SET NULL' });
Note.belongsTo(BoardColumn, { foreignKey: 'boardColumnId', as: 'boardColumn' });

export {
  User,
  Category,
  Note,
  Tag,
  NoteTag,
  NoteVersion,
  NoteShare,
  NoteLink,
  BoardColumn,
  sequelize
};
