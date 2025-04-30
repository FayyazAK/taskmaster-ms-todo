# 📝 TaskMaster Todo Service

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)
![Redis](https://img.shields.io/badge/Redis-6.0+-red.svg)

The TaskMaster Todo Service is a dedicated microservice responsible for managing to-do lists and tasks in the TaskMaster ecosystem.

## ✨ Features

### List Management

- Create and organize multiple lists per user
- Detailed list information with timestamps
- Bulk operations for efficient list management
- List statistics showing total tasks and pending tasks
- Automatic timestamp updates when tasks are modified

### Task Management

- Create, update, and organize tasks within lists
- Multiple priority levels (Low, Medium, High, Urgent)
- Task due dates with status tracking
- Task filtering and search capabilities
- Mark tasks as complete/incomplete
- Task modification with automated list update timestamps
- Due date filtering for overdue and today's tasks

### Performance

- Redis caching layer with intelligent invalidation
- Connection pooling for database optimization
- Efficient SQL queries with proper indexing
- Transaction support for data integrity

## 🛠️ Technical Stack

- **Backend**: Node.js, Express.js 5.x
- **Database**: MySQL 8+
- **Caching**: Redis 6+
- **Logging**: Winston with daily rotation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YourUsername/taskmaster-ms-todo.git
   cd taskmaster-ms-todo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file using `.env-example` as template

4. Start the service:
   ```bash
   # Development mode
   npm start
   ```

## 🌐 API Endpoints

### Lists

- `GET /api/lists` - Get all lists for user (query param: include_tasks)
- `POST /api/lists` - Create a new list
- `GET /api/lists/:list_id` - Get a specific list (query param: include_tasks)
- `PUT /api/lists/:list_id` - Update a list
- `DELETE /api/lists/:list_id` - Delete a list
- `DELETE /api/lists/:list_id/clear` - Remove all tasks from a list
- `DELETE /api/lists` - Delete all lists for user
- `DELETE /api/lists/clear` - Clear all tasks from all lists

### Tasks

- `GET /api/tasks` - Get all tasks for user (query param: completed)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:task_id` - Get a specific task
- `PUT /api/tasks/:task_id` - Update a task
- `DELETE /api/tasks/:task_id` - Delete a task
- `PUT /api/tasks/:task_id/status` - Update task completion status

### Priorities

- `GET /api/priorities` - Get all priority levels
- `GET /api/priorities/id/:priority_id` - Get priority by ID
- `GET /api/priorities/level/:level` - Get priority by level

## 🧠 Caching Strategy

- Cache-Aside Pattern implementation
- Time-Based Expiration with configurable TTL
- Strategic Invalidation on data modification
- Hierarchical Key Structure for efficient invalidation

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

Made with ❤️ by Fayyaz AK
