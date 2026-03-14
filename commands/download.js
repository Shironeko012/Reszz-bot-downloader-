/**
 * Video Downloader Command
 * Command: .dl <url>
 */

const validator = require("../utils/validator")
const queue = require("../utils/queue")
const logger = require("../utils/logger")
const rateLimiter = require("../systems/rateLimiter")
const cacheSystem = require("../systems/cacheSystem")
const workerPool = require("../workers/workerPool.js")
const formatter = require("../lib/formatter")
const selfDestruct = require("../utils/selfDestruct")
const linkConverter = require("../lib/linkConverter")

module.exports = async function downloadCommand(sock, m, args) {

    const chat = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    try {

        if (!args || !args[0]) {

            await sock.sendMessage(chat, {
                text: "❌ Masukkan link video.\n\nContoh:\n.dl https://tiktok.com/xxxxx"
            }, { quoted: m })

            return
        }

        const rawUrl = args[0]
        const url = linkConverter.normalize(rawUrl)

        if (!validator.isURL(url)) {

            await sock.sendMessage(chat, {
                text: "❌ Link tidak valid."
            }, { quoted: m })

            return
        }

        const allowed = rateLimiter.check(sender)

        if (!allowed) {

            await sock.sendMessage(chat, {
                text: "⏳ Tunggu beberapa detik sebelum download lagi."
            }, { quoted: m })

            return
        }

        const cached = await cacheSystem.get(url)

        if (cached) {

            const sent = await sock.sendMessage(chat, {
                video: { url: cached },
                caption: "⚡ Video diambil dari cache"
            }, { quoted: m })

            selfDestruct(sock, chat, sent.key)

            return
        }

        await sock.sendMessage(chat, {
            text: "📥 Mengunduh video..."
        }, { quoted: m })

        const result = await queue.add(async () => {

            return await workerPool.download(url)

        })

        const caption = formatter.video(result.metadata)

        const sent = await sock.sendMessage(chat, {
            video: { url: result.file },
            caption
        }, { quoted: m })

        await cacheSystem.set(url, result.file)

        selfDestruct(sock, chat, sent.key)

    } catch (err) {

        logger.error("DOWNLOAD_ERROR", err)

        await sock.sendMessage(chat, {
            text: "❌ Terjadi kesalahan saat download."
        }, { quoted: m })

    }

}
