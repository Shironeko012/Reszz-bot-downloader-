/**
 * Message Handler
 * Process incoming messages and route actions
 */

const commandHandler = require("./commandHandler")
const autoDetect = require("../commands/autoDetect")
const logger = require("../utils/logger")

async function handle(sock, m) {

    try {

        const message = m.message

        if (!message) return

        const text =
            message.conversation ||
            message.extendedTextMessage?.text ||
            ""

        if (!text) return

        /**
         * Try command first
         */

        const isCommand = await commandHandler.handle(sock, m, text)

        if (isCommand) return

        /**
         * If not command → run auto detect
         */

        await autoDetect(sock, m, text)

    } catch (error) {

        logger.error("MESSAGE_HANDLER_ERROR", {
            error: error.message
        })

    }

}

module.exports = {
    handle
}
