const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const List = sequelize.define(
    "List",
    {
      listId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "list_id",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "lists",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_list_user_id",
          fields: ["user_id"],
        },
        {
          name: "idx_list_created_at",
          fields: ["created_at"],
        },
      ],
    }
  );

  return List;
};
