/**
 * MP3 Downloader Command
 * Command: .mp3 <url>
 * Convert video link to MP3 audio
 */

const validator = require("../utils/validator")
const queue = require("../utils/queue")
const logger = require("../utils/logger")
const rateLimiter = require("../systems/rateLimiter")
const cacheSystem = require("../systems/cacheSystem")
const workerPool = require("../workers/workerPool")
const formatter = require("../lib/formatter")
const selfDestruct = require("../utils/selfDestruct")

module.exports = async function mp3Command(sock, m, args) {

    const chat = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    try {

        /**
         * Validate arguments
         */

        if (!args || !args[0]) {

            await sock.sendMessage(chat, {
                text: "❌ Masukkan link video.\n\nContoh:\n.mp3 https://youtube.com/watch?v=xxxx"
            }, { quoted: m })

            return
        }

        const url = args[0].trim()

        /**
         * Validate URL
         */

        if (!validator.isURL(url)) {

            await sock.sendMessage(chat, {
                text: "❌ Link tidak valid."
            }, { quoted: m })

            return
        }

        /**
         * Rate limit
         */

        const allowed = rateLimiter.check(sender)

        if (!allowed) {

            await sock.sendMessage(chat, {
                text: "⏳ Tunggu beberapa detik sebelum menggunakan command lagi."
            }, { quoted: m })

            return
        }

        /**
         * Check cache
         */

        const cached = await cacheSystem.get(url + "_mp3")

        if (cached) {

            const sent = await sock.sendMessage(chat, {
                audio: { url: cached },
                mimetype: "audio/mpeg",
                fileName: "audio.mp3"
            }, { quoted: m })

            selfDestruct(sock, chat, sent.key)

            return
        }

        /**
         * Inform user
         */

        await sock.sendMessage(chat, {
            text: "🎵 Mengubah video menjadi MP3..."
        }, { quoted: m })

        /**
         * Queue job
         */

        const result = await queue.add(async () => {

            return await workerPool.downloadMP3(url)

        })

        if (!result || !result.file) {

            throw new Error("MP3 conversion failed")

        }

        /**
         * Caption info
         */

        const caption = formatter.audio(result.metadata)

        /**
         * Send audio
         */

        const sent = await sock.sendMessage(chat, {
            audio: { url: result.file },
            mimetype: "audio/mpeg",
            fileName: "audio.mp3",
            ptt: false
        }, { quoted: m })

        /**
         * Save cache
         */

        await cacheSystem.set(url + "_mp3", result.file)

        /**
         * Self destruct
         */

        selfDestruct(sock, chat, sent.key)

    } catch (err) {

        logger.error("MP3_ERROR", err)

        await sock.sendMessage(chat, {
            text: "❌ Terjadi kesalahan saat mengubah ke MP3."
        }, { quoted: m })

    }

}
