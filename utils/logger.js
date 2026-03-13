/**
 * Logger Utility
 * Handle application logging
 */

const fs = require("fs")
const path = require("path")

const LOG_DIR = path.resolve("./storage/logs")
const LOG_FILE = path.join(LOG_DIR, "bot.log")

/**
 * Ensure log directory exists
 */

function ensureLogDir() {

    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true })
    }

}

ensureLogDir()

function write(level, message, data = null) {

    try {

        const timestamp = new Date().toISOString()

        const logEntry = {
            time: timestamp,
            level,
            message,
            data
        }

        const line = JSON.stringify(logEntry) + "\n"

        fs.appendFileSync(LOG_FILE, line)

    } catch (error) {

        console.error("LOGGER_WRITE_FAILED", error)

    }

}

function info(message, data = null) {

    write("INFO", message, data)

}

function warn(message, data = null) {

    write("WARN", message, data)

}

function error(message, data = null) {

    write("ERROR", message, data)

}

module.exports = {
    info,
    warn,
    error
}
