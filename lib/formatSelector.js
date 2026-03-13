/**
 * Format Selector
 * Determine best download format for video/audio
 */

const MAX_VIDEO_HEIGHT = 720

function selectVideoFormat() {

    /**
     * Prefer mp4 video up to 720p
     * Fallback to best available
     */

    return `bestvideo[height<=${MAX_VIDEO_HEIGHT}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${MAX_VIDEO_HEIGHT}]`
}

function selectAudioFormat() {

    /**
     * Extract best audio
     */

    return `bestaudio[ext=m4a]/bestaudio`
}

function selectPlaylistFormat() {

    /**
     * Safer format for playlist downloads
     */

    return `bestvideo[height<=${MAX_VIDEO_HEIGHT}]+bestaudio/best`
}

module.exports = {
    selectVideoFormat,
    selectAudioFormat,
    selectPlaylistFormat
}
