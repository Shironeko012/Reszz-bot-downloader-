/**
 * CDN Uploader
 * Upload large files and generate public links
 */

const fs = require("fs")
const path = require("path")
const logger = require("../utils/logger")

const MAX_WHATSAPP_SIZE = 50 * 1024 * 1024 // 50MB

function getFileSize(filePath) {

    try {

        const stat = fs.statSync(filePath)

        return stat.size

    } catch (error) {

        logger.error("FILE_SIZE_ERROR", error)

        return 0
    }

}

function needsUpload(filePath) {

    const size = getFileSize(filePath)

    return size > MAX_WHATSAPP_SIZE
}

/**
 * Placeholder uploader
 * Replace with real CDN integration
 */

async function upload(filePath) {

    try {

        if (!fs.existsSync(filePath)) {

            throw new Error("File not found")

        }

        /**
         * Example placeholder
         * In production you can integrate:
         * Cloudflare R2
         * Backblaze
         * BunnyCDN
         */

        const fileName = path.basename(filePath)

        const publicUrl = `https://cdn.example.com/${fileName}`

        logger.info("FILE_UPLOADED_TO_CDN", {
            file: fileName
        })

        return {
            url: publicUrl,
            file: filePath
        }

    } catch (error) {

        logger.error("CDN_UPLOAD_FAILED", error)

        throw error
    }

}

module.exports = {
    upload,
    needsUpload,
    getFileSize
}
