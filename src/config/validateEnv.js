// config/validateEnv.js
const Joi = require("joi");
const logger = require('../utils/logger');

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),

  // SERVER
  PORT: Joi.number().port().default(4002),

  // GATEWAY
  API_GATEWAY_SIGNATURE: Joi.string().default("taskmaster@gateway"),
  SYSTEM_TOKEN: Joi.string().default("taskmaster@system"),
  GATEWAY_URL: Joi.string().uri().default("https://localhost:4000"),

  // MYSQL DATABASE CONNECTION
  DB_HOST: Joi.string().default("localhost"),
  DB_USER: Joi.string().default("root"),
  DB_PASSWORD: Joi.string().default("1234"),
  AUTH_DB_NAME: Joi.string().default("taskmaster-todo-db"),
  DB_PORT: Joi.number().port().default(3306),

  // BACKUP
  BACKUP_DIR: Joi.string().default("./db_backups"),
  BACKUP_RETENTION_DAYS: Joi.number().default(7),

  // JWT CONFIG
  JWT_SECRET: Joi.string().required(),

  // SSL CONFIG
  SSL_ENABLED: Joi.boolean().truthy("true").falsy("false").default(false),
  SSL_KEY_PATH: Joi.string().default("ssl/key.pem"),
  SSL_CERT_PATH: Joi.string().default("ssl/cert.pem"),
  SSL_PORT: Joi.number().port().default(4002),

  // CORS CONFIG
  CORS_ALLOWED_ORIGINS: Joi.string().default("https://127.0.0.1"),
  CORS_ALLOWED_METHODS: Joi.string().default("GET,POST,PUT,DELETE,OPTIONS"),
  CORS_ALLOWED_HEADERS: Joi.string().default("Content-Type,Authorization"),

  // REDIS CONFIGURATION
  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow("").default(""),
  REDIS_DB: Joi.number().default(0),
  REDIS_TTL: Joi.number().default(3600),
  CLEAR_CACHE_ON_START: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(true),

  // LOGGING
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .default("info"),
  LOG_DIR: Joi.string().default("../logs"),
  LOG_DATE_PATTERN: Joi.string().default("YYYY-MM-DD"),
  LOG_MAX_SIZE: Joi.string().default("20m"),
  LOG_MAX_FILES: Joi.string().default("14d"),
  LOG_SERVICE_NAME: Joi.string().default("taskmaster-ms-todo"),

  // TASK
  TASK_TITLE_MAX_LENGTH: Joi.number().default(100),
  TASK_DESCRIPTION_MAX_LENGTH: Joi.number().default(255),

  // RABBITMQ
  RABBITMQ_URL: Joi.string().uri().default("amqp://localhost:5672"),

})
  .unknown() // allow other vars
  .required();

function validateEnv(env = process.env) {
  const { error, value: validated } = envSchema.validate(env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    logger.error(
      "\n❌ Environment validation error(s):\n" +
      error.details.map((d) => ` • ${d.message}`).join("\n") +
      "\n"
    );
    process.exit(1);
  }
  
  return validated;
}

module.exports = validateEnv;
