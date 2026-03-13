/**
 * Formatter Utility
 * Format metadata for bot messages
 */

function formatDuration(seconds) {

    if (!seconds || isNaN(seconds)) return "0:00"

    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function video(metadata = {}) {

    const title = metadata.title || "Unknown Title"
    const uploader = metadata.uploader || "Unknown"
    const duration = formatDuration(metadata.duration)

    return `🎬 *${title}*

👤 Uploader : ${uploader}
⏱ Duration : ${duration}

Powered by Downloader Bot`
}

function audio(metadata = {}) {

    const title = metadata.title || "Unknown Title"
    const uploader = metadata.uploader || "Unknown"
    const duration = formatDuration(metadata.duration)

    return `🎵 *${title}*

👤 Artist : ${uploader}
⏱ Duration : ${duration}

Converted to MP3`
}

module.exports = {
    video,
    audio,
    formatDuration
}
