/**
 * Link Converter
 * Normalize URLs before sending to yt-dlp
 */

function normalize(url) {

    if (!url) return null

    let clean = url.trim()

    /**
     * Remove tracking params
     */

    if (clean.includes("?")) {
        clean = clean.split("?")[0]
    }

    /**
     * Convert youtu.be → youtube watch
     */

    if (clean.includes("youtu.be")) {

        const id = clean.split("/").pop()

        return `https://www.youtube.com/watch?v=${id}`

    }

    /**
     * Instagram share → reel
     */

    if (clean.includes("/share/")) {
        clean = clean.replace("/share/", "/reel/")
    }

    return clean
}

module.exports = {
    normalize
}
