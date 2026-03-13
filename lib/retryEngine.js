/**
 * Retry Engine
 * Handle automatic retries for unstable operations
 */

const logger = require("../utils/logger")

const DEFAULT_RETRIES = 3
const DEFAULT_DELAY = 1500

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function retry(task, options = {}) {

    const retries = options.retries || DEFAULT_RETRIES
    const delay = options.delay || DEFAULT_DELAY

    let lastError

    for (let attempt = 1; attempt <= retries; attempt++) {

        try {

            const result = await task()

            return result

        } catch (error) {

            lastError = error

            logger.error("RETRY_ATTEMPT_FAILED", {
                attempt,
                retries,
                error: error.message
            })

            if (attempt < retries) {

                const wait = delay * attempt

                await sleep(wait)

            }

        }

    }

    throw lastError
}

module.exports = {
    retry
}
