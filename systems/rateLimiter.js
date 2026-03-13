/**
 * Rate Limiter System
 * Prevent command spam from users
 */

const logger = require("../utils/logger")

const LIMIT_WINDOW = 5000 // 5 seconds
const userMap = new Map()

function check(userId) {

    if (!userId) return false

    const now = Date.now()

    if (!userMap.has(userId)) {

        userMap.set(userId, now)

        return true
    }

    const last = userMap.get(userId)

    if (now - last < LIMIT_WINDOW) {

        logger.warn("RATE_LIMIT_TRIGGERED", {
            user: userId
        })

        return false
    }

    userMap.set(userId, now)

    return true
}

function reset(userId) {

    if (userMap.has(userId)) {
        userMap.delete(userId)
    }

}

function cleanup() {

    const now = Date.now()

    for (const [user, time] of userMap.entries()) {

        if (now - time > LIMIT_WINDOW * 10) {
            userMap.delete(user)
        }

    }

}

setInterval(cleanup, 60000)

module.exports = {
    check,
    reset
}
