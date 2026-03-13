/**
 * Downloader Command
 * Command: .dl <url>
 * Download video mp4 from supported platforms
 */

const validator = require("../utils/validator")
const queue = require("../utils/queue")
const logger = require("../utils/logger")
const rateLimiter = require("../systems/rateLimiter")
const cacheSystem = require("../systems/cacheSystem")
const workerPool = require("../workers/workerPool")
const formatter = require("../lib/formatter")
const selfDestruct = require("../utils/selfDestruct")

module.exports = async function downloadCommand(sock, m, args) {

    const chat = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    try {

        /**
         * Validate argument
         */

        if (!args || !args[0]) {

            await sock.sendMessage(chat, {
                text: "❌ Masukkan link video.\n\nContoh:\n.dl https://tiktok.com/xxxxx"
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
         * Rate limiter
         */

        const allowed = rateLimiter.check(sender)

        if (!allowed) {

            await sock.sendMessage(chat, {
                text: "⏳ Tunggu beberapa detik sebelum download lagi."
            }, { quoted: m })

            return
        }

        /**
         * Check cache
         */

        const cached = await cacheSystem.get(url)

        if (cached) {

            const sent = await sock.sendMessage(chat, {
                video: { url: cached },
                caption: "⚡ Video diambil dari cache"
            }, { quoted: m })

            selfDestruct(sock, chat, sent.key)

            return
        }

        /**
         * Inform user download started
         */

        await sock.sendMessage(chat, {
            text: "📥 Mengunduh video..."
        }, { quoted: m })

        /**
         * Queue download job
         */

        const result = await queue.add(async () => {

            return await workerPool.download(url)

        })

        if (!result || !result.file) {

            throw new Error("Download gagal")
        }

        /**
         * Format caption
         */

        const caption = formatter.video(result.metadata)

        /**
         * Send video
         */

        const sent = await sock.sendMessage(chat, {
            video: { url: result.file },
            caption: caption
        }, { quoted: m })

        /**
         * Save cache
         */

        await cacheSystem.set(url, result.file)

        /**
         * Self destruct message
         */

        selfDestruct(sock, chat, sent.key)

    } catch (err) {

        logger.error("DOWNLOAD_ERROR", err)

        await sock.sendMessage(chat, {
            text: "❌ Terjadi kesalahan saat mengunduh video."
        }, { quoted: m })

    }

}
