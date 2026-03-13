/**
 * Auto Link Detection
 * Detect media links and suggest available commands
 */

const validator = require("../utils/validator")
const logger = require("../utils/logger")

/**
 * Supported platforms
 */

const supportedPlatforms = [
    "tiktok.com",
    "vt.tiktok.com",
    "instagram.com",
    "facebook.com",
    "fb.watch",
    "youtube.com",
    "youtu.be",
    "twitter.com",
    "x.com",
    "reddit.com"
]

/**
 * Detect if URL belongs to supported platform
 */

function detectPlatform(url) {

    return supportedPlatforms.find(domain => url.includes(domain))

}

module.exports = async function autoDetect(sock, m, text) {

    try {

        const chat = m.key.remoteJid

        if (!text) return

        /**
         * Validate URL
         */

        if (!validator.isURL(text)) return

        /**
         * Check supported platform
         */

        const platform = detectPlatform(text)

        if (!platform) return

        /**
         * Send suggestion message
         */

        const message = `🔗 *Link terdeteksi*

Platform: ${platform}

Pilih tindakan:

📥 Download video
.dl ${text}

🎵 Convert ke MP3
.mp3 ${text}`

        await sock.sendMessage(chat, {
            text: message
        }, { quoted: m })

    } catch (err) {

        logger.error("AUTO_DETECT_ERROR", err)

    }

}
