// backup-db.js
const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config/env");
const util = require("util");
const logger = require('../utils/logger');

const execPromise = util.promisify(exec);
const { uri, name } = config.db;
const { dir, retentionDays } = config.backup;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function backupDatabase() {
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const backupDir = path.join(dir, `${name}-${timestamp}`);
    const archivePath = `${backupDir}.tar.gz`;

    const cmd = `mongodump --uri="${uri}" --db="${name}" --out="${backupDir}" && tar -czf "${archivePath}" -C "${dir}" "${path.basename(backupDir)}" && rm -rf "${backupDir}"`;

    logger.info(`[Backup] Starting MongoDB dump at ${new Date().toISOString()}`);

    await execPromise(cmd);
    logger.info(`[Backup] Completed: ${path.basename(archivePath)}`);

    // Verify the file was created
    if (!fs.existsSync(archivePath)) {
      throw new Error("Backup file was not created");
    }

    // rotate old files
    await rotateBackups();

    return archivePath;
  } catch (error) {
    logger.error("[Backup] ERROR:", error.message);
    throw error;
  }
}

async function rotateBackups() {
  try {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = await fs.promises.stat(fullPath);

      if (stats.mtimeMs < cutoff) {
        await fs.promises.unlink(fullPath);
        logger.info(`[Rotate] Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    logger.error("[Rotate] ERROR:", error);
    throw error;
  }
}

// Runs every day at 02:30 AM Asia/Karachi time
cron.schedule(
  "30 2 * * *",
  async () => {
    try {
      await backupDatabase();
    } catch (error) {
      logger.error("[Cron Backup] Failed:", error);
    }
  },
  {
    timezone: "Asia/Karachi",
    scheduled: true,
  }
);

// Optionally export for manual triggering/tests
module.exports = { backupDatabase };
