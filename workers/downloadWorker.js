/**
 * Download Worker
 * Executes a single download job
 */

const path = require("path")
const logger = require("../utils/logger")
const downloader = require("../lib/downloader")
const retryEngine = require("../lib/retryEngine")
const fileManager = require("../utils/fileManager")

async function downloadVideo(url) {

    try {

        const result = await retryEngine.execute(async () => {

            return await downloader.downloadVideo(url)

        })

        return result

    } catch (error) {

        logger.error("WORKER_VIDEO_DOWNLOAD_FAILED", error)

        throw error
    }

}

async function downloadMP3(url) {

    try {

        const result = await retryEngine.execute(async () => {

            return await downloader.downloadMP3(url)

        })

        return result

    } catch (error) {

        logger.error("WORKER_MP3_DOWNLOAD_FAILED", error)

        throw error
    }

}

module.exports = {
    downloadVideo,
    downloadMP3
}
