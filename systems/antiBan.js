/**
 * Anti Ban System
 * Protect bot from WhatsApp spam detection
 */

const logger = require("../utils/logger")

const MIN_DELAY = 800
const MAX_DELAY = 2500

function randomDelay() {

    return Math.floor(
        Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY
    )

}

async function typing(sock, chatId) {

    try {

        await sock.sendPresenceUpdate("composing", chatId)

    } catch (error) {

        logger.warn("TYPING_INDICATOR_FAILED", error.message)

    }

}

async function delay() {

    const ms = randomDelay()

    return new Promise(resolve => setTimeout(resolve, ms))

}

async function safeSend(sock, chatId, message, options = {}) {

    try {

        await typing(sock, chatId)

        await delay()

        return await sock.sendMessage(chatId, message, options)

    } catch (error) {

        logger.error("SAFE_SEND_FAILED", error)

        throw error

    }

}

module.exports = {
    delay,
    typing,
    safeSend
}
