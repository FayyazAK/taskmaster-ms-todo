const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Priority = sequelize.define(
    "Priority",
    {
      priorityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "priority_id",
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "priorities",
      timestamps: false,
      indexes: [
        {
          name: "idx_priority_level",
          fields: ["level"],
        },
      ],
    }
  );

  return Priority;
};
