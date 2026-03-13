/**
 * Metadata Extractor
 * Extract video information using yt-dlp
 */

const exec = require("../utils/exec")
const logger = require("../utils/logger")

async function fetchMetadata(url) {

    try {

        const command = `yt-dlp --dump-json --no-playlist "${url}"`

        const output = await exec(command)

        if (!output) {
            throw new Error("Empty metadata response")
        }

        const data = JSON.parse(output)

        return normalize(data)

    } catch (error) {

        logger.error("METADATA_ERROR", error)

        throw error
    }

}

function normalize(data) {

    return {

        id: data.id || null,

        title: data.title || "Unknown Title",

        uploader: data.uploader || data.channel || "Unknown",

        duration: data.duration || 0,

        thumbnail: data.thumbnail || null,

        webpage_url: data.webpage_url || null,

        view_count: data.view_count || 0,

        like_count: data.like_count || 0,

        ext: data.ext || "mp4"

    }

}

module.exports = {
    fetchMetadata
}
