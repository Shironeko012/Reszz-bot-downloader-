/**
 * Download Worker
 * Execute download tasks using downloader engine
 */

const logger = require("../utils/logger")
const downloader = require("../lib/downloader")
const retryEngine = require("../lib/retryEngine")

async function downloadVideo(url) {

    try {

        const result = await retryEngine.retry(async () => {

            return await downloader.downloadVideo(url)

        })

        return result

    } catch (error) {

        logger.error("WORKER_VIDEO_DOWNLOAD_FAILED", {
            url,
            error: error.message
        })

        throw error
    }

}

async function downloadMP3(url) {

    try {

        const result = await retryEngine.retry(async () => {

            return await downloader.downloadAudio(url)

        })

        return result

    } catch (error) {

        logger.error("WORKER_MP3_DOWNLOAD_FAILED", {
            url,
            error: error.message
        })

        throw error
    }

}

module.exports = {
    downloadVideo,
    downloadMP3
}
