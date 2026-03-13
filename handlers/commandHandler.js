/**
 * Command Handler
 * Route commands to corresponding modules
 */

const logger = require("../utils/logger")

const commands = {
    dl: require("../commands/download"),
    mp3: require("../commands/mp3")
}

const PREFIX = "."

async function handle(sock, m, text) {

    try {

        if (!text.startsWith(PREFIX)) return false

        const args = text.slice(PREFIX.length).trim().split(/\s+/)
        const command = args.shift().toLowerCase()

        const handler = commands[command]

        if (!handler) return false

        logger.info("COMMAND_EXECUTE", {
            command,
            user: m.key.participant || m.key.remoteJid
        })

        await handler(sock, m, args)

        return true

    } catch (error) {

        logger.error("COMMAND_HANDLER_ERROR", {
            error: error.message
        })

        return false
    }

}

module.exports = {
    handle
}
