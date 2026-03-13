/**
 * File Manager Utility
 * Handle storage paths, temp files, and cleanup
 */

const fs = require("fs")
const path = require("path")
const logger = require("./logger")

const TEMP_DIR = path.resolve("./storage/temp")
const CACHE_DIR = path.resolve("./storage/cache")

function ensureDir(dir) {

    try {

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

    } catch (error) {

        logger.error("FILE_MANAGER_DIR_ERROR", {
            dir,
            error: error.message
        })

    }

}

ensureDir(TEMP_DIR)
ensureDir(CACHE_DIR)

function getTempPath(filename) {

    return path.join(TEMP_DIR, filename)

}

function getCachePath(filename) {

    return path.join(CACHE_DIR, filename)

}

function fileExists(filePath) {

    try {

        return fs.existsSync(filePath)

    } catch {

        return false

    }

}

function deleteFile(filePath) {

    try {

        if (fs.existsSync(filePath)) {

            fs.unlinkSync(filePath)

        }

    } catch (error) {

        logger.warn("FILE_DELETE_FAILED", {
            file: filePath,
            error: error.message
        })

    }

}

function cleanupTemp(maxAgeMs = 3600000) {

    try {

        const files = fs.readdirSync(TEMP_DIR)

        const now = Date.now()

        for (const file of files) {

            const filePath = path.join(TEMP_DIR, file)

            const stats = fs.statSync(filePath)

            if (now - stats.mtimeMs > maxAgeMs) {

                deleteFile(filePath)

            }

        }

    } catch (error) {

        logger.warn("TEMP_CLEANUP_FAILED", error)

    }

}

module.exports = {
    getTempPath,
    getCachePath,
    fileExists,
    deleteFile,
    cleanupTemp
}
