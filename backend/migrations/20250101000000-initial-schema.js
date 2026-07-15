'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      avatar: { type: Sequelize.STRING, allowNull: true },
      twoFactorSecret: { type: Sequelize.STRING, allowNull: true },
      twoFactorEnabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Categories
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Tags
    await queryInterface.createTable('tags', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Notes
    await queryInterface.createTable('notes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: true },
      categoryId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      boardColumnId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'board_columns', key: 'id' }, onDelete: 'SET NULL' },
      pinned: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      starred: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      archived: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
      isPublic: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      shareToken: { type: Sequelize.STRING, allowNull: true, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('notes', ['userId']);
    await queryInterface.addIndex('notes', ['deletedAt']);
    await queryInterface.addIndex('notes', ['archived']);
    await queryInterface.addIndex('notes', ['userId', 'deletedAt', 'archived'], { name: 'notes_user_deleted_archived' });
    await queryInterface.addIndex('notes', ['title', 'content'], { type: 'FULLTEXT', name: 'notes_title_content_fulltext' });

    // Note Tags (junction)
    await queryInterface.createTable('note_tags', {
      noteId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'notes', key: 'id' }, onDelete: 'CASCADE', primaryKey: true },
      tagId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tags', key: 'id' }, onDelete: 'CASCADE', primaryKey: true },
    });

    // Note Versions
    await queryInterface.createTable('note_versions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      noteId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'notes', key: 'id' }, onDelete: 'CASCADE' },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: true },
      version: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Note Shares
    await queryInterface.createTable('note_shares', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      noteId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'notes', key: 'id' }, onDelete: 'CASCADE' },
      ownerId: { type: Sequelize.INTEGER, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      permission: { type: Sequelize.STRING, allowNull: false, defaultValue: 'view' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Note Links
    await queryInterface.createTable('note_links', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      sourceNoteId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'notes', key: 'id' }, onDelete: 'CASCADE' },
      targetNoteId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'notes', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Board Columns
    await queryInterface.createTable('board_columns', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('board_columns');
    await queryInterface.dropTable('note_links');
    await queryInterface.dropTable('note_shares');
    await queryInterface.dropTable('note_versions');
    await queryInterface.dropTable('note_tags');
    await queryInterface.dropTable('notes');
    await queryInterface.dropTable('tags');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  }
};
