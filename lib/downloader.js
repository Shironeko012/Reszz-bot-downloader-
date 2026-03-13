/**
 * Downloader Engine
 * Handle video and audio download using yt-dlp
 */

const path = require("path")
const exec = require("../utils/exec")
const logger = require("../utils/logger")
const retryEngine = require("./retryEngine")
const formatSelector = require("./formatSelector")
const metadata = require("./metadata")

const TEMP_DIR = path.resolve("./storage/temp")

/**
 * Build output file path
 */

function buildOutputTemplate() {

    return `${TEMP_DIR}/%(id)s.%(ext)s`

}

/**
 * Download video (mp4)
 */

async function downloadVideo(url) {

    try {

        const info = await metadata.fetchMetadata(url)

        const format = formatSelector.selectVideoFormat()

        const output = buildOutputTemplate()

        const command = `
            yt-dlp
            -f "${format}"
            -o "${output}"
            --no-playlist
            --merge-output-format mp4
            "${url}"
        `.replace(/\s+/g, " ").trim()

        await retryEngine.retry(async () => {

            await exec(command)

        })

        const file = path.join(TEMP_DIR, `${info.id}.mp4`)

        return {
            file,
            metadata: info
        }

    } catch (error) {

        logger.error("VIDEO_DOWNLOAD_ERROR", error)

        throw error
    }

}

/**
 * Download audio (mp3)
 */

async function downloadAudio(url) {

    try {

        const info = await metadata.fetchMetadata(url)

        const format = formatSelector.selectAudioFormat()

        const output = buildOutputTemplate()

        const command = `
            yt-dlp
            -f "${format}"
            -x
            --audio-format mp3
            -o "${output}"
            --no-playlist
            "${url}"
        `.replace(/\s+/g, " ").trim()

        await retryEngine.retry(async () => {

            await exec(command)

        })

        const file = path.join(TEMP_DIR, `${info.id}.mp3`)

        return {
            file,
            metadata: info
        }

    } catch (error) {

        logger.error("AUDIO_DOWNLOAD_ERROR", error)

        throw error
    }

}

module.exports = {
    downloadVideo,
    downloadAudio
}
