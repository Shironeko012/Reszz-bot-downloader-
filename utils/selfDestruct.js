/**
 * Self Destruct Utility
 * Automatically delete bot messages after a delay
 */

const logger = require("./logger")

const DEFAULT_DELAY = 24 * 60 * 60 * 1000 // 24 hours

function schedule(sock, chatId, messageKey, delay = DEFAULT_DELAY) {

    if (!sock || !chatId || !messageKey) return

    setTimeout(async () => {

        try {

            await sock.sendMessage(chatId, {
                delete: messageKey
            })

        } catch (error) {

            logger.warn("SELF_DESTRUCT_FAILED", {
                chatId,
                error: error.message
            })

        }

    }, delay)

}

module.exports = {
    schedule
}
