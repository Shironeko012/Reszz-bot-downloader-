/**
 * Anti Crash System
 * Prevent fatal runtime errors from killing the bot
 */

const logger = require("../utils/logger")

let crashCount = 0
const MAX_CRASH = 10

function register() {

    process.on("uncaughtException", (error) => {

        crashCount++

        logger.error("ANTI_CRASH_UNCAUGHT_EXCEPTION", {
            error: error.message,
            stack: error.stack,
            crashCount
        })

        if (crashCount > MAX_CRASH) {

            logger.error("ANTI_CRASH_LIMIT_REACHED")

            process.exit(1)

        }

    })

    process.on("unhandledRejection", (reason) => {

        crashCount++

        logger.error("ANTI_CRASH_UNHANDLED_REJECTION", {
            reason,
            crashCount
        })

    })

    process.on("SIGINT", () => {

        logger.info("PROCESS_SIGINT_RECEIVED")

        process.exit(0)

    })

    process.on("SIGTERM", () => {

        logger.info("PROCESS_SIGTERM_RECEIVED")

        process.exit(0)

    })

}

module.exports = {
    register
}
