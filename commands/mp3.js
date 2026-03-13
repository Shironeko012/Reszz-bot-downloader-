/**
 * MP3 Downloader Command
 * Command: .mp3 <url>
 */

const validator = require("../utils/validator")
const queue = require("../utils/queue")
const logger = require("../utils/logger")
const rateLimiter = require("../systems/rateLimiter")
const cacheSystem = require("../systems/cacheSystem")
const workerPool = require("../workers/workerPool")
const formatter = require("../lib/formatter")
const selfDestruct = require("../utils/selfDestruct")
const linkConverter = require("../lib/linkConverter")

module.exports = async function mp3Command(sock, m, args) {

    const chat = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    try {

        if (!args || !args[0]) {

            await sock.sendMessage(chat, {
                text: "❌ Masukkan link video.\n\nContoh:\n.mp3 https://youtube.com/watch?v=xxxx"
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
                text: "⏳ Tunggu beberapa detik sebelum menggunakan command lagi."
            }, { quoted: m })

            return
        }

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

        await sock.sendMessage(chat, {
            text: "🎵 Mengubah video menjadi MP3..."
        }, { quoted: m })

        const result = await queue.add(async () => {

            return await workerPool.downloadMP3(url)

        })

        const sent = await sock.sendMessage(chat, {
            audio: { url: result.file },
            mimetype: "audio/mpeg",
            fileName: "audio.mp3"
        }, { quoted: m })

        await cacheSystem.set(url + "_mp3", result.file)

        selfDestruct(sock, chat, sent.key)

    } catch (err) {

        logger.error("MP3_ERROR", err)

        await sock.sendMessage(chat, {
            text: "❌ Gagal convert ke MP3."
        }, { quoted: m })

    }

}
