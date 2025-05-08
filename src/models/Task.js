const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Task = sequelize.define(
    "Task",
    {
      taskId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "task_id",
      },
      listId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "list_id",
        references: {
          model: "lists",
          key: "list_id",
        },
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      priorityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "priority_id",
        references: {
          model: "priorities",
          key: "priority_id",
        },
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "due_date",
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_completed",
      },
    },
    {
      tableName: "tasks",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_task_list_id",
          fields: ["list_id"],
        },
        {
          name: "idx_task_priority_id",
          fields: ["priority_id"],
        },
        {
          name: "idx_task_created_at",
          fields: ["created_at"],
        },
      ],
    }
  );

  return Task;
};
