const sequelize = require("../config/database");
const Task = require("./Task")(sequelize);
const List = require("./List")(sequelize);
const Priority = require("./Priority")(sequelize);

// Define model relationships
const defineRelationships = () => {
  // List - Task relationship
  List.hasMany(Task, {
    foreignKey: "listId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Task.belongsTo(List, {
    foreignKey: "listId",
  });

  // Task - Priority relationship
  Task.belongsTo(Priority, {
    foreignKey: "priorityId",
  });
  Priority.hasMany(Task, {
    foreignKey: "priorityId",
  });
};

// Initialize relationships
defineRelationships();

module.exports = {
  sequelize,
  Task,
  List,
  Priority,
};
