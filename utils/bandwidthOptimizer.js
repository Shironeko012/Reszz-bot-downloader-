/**
 * Bandwidth Optimizer
 * Generate downloader arguments for yt-dlp to improve speed
 */

const os = require("os")

const CPU_COUNT = os.cpus().length

/**
 * Determine connection count
 */

function getConnections() {

    if (CPU_COUNT <= 2) return 4
    if (CPU_COUNT <= 4) return 8
    if (CPU_COUNT <= 8) return 16

    return 24
}

/**
 * Build aria2 downloader arguments
 */

function getAria2Args() {

    const connections = getConnections()

    return [
        "--external-downloader", "aria2c",
        "--external-downloader-args",
        `-x ${connections} -k 1M -s ${connections}`
    ]

}

/**
 * Limit download rate if needed
 */

function limitRate(rate = null) {

    if (!rate) return []

    return [
        "--limit-rate",
        rate
    ]

}

module.exports = {
    getAria2Args,
    limitRate
}
