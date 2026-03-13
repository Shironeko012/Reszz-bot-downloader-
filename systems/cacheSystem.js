/**
 * Cache System
 * Store downloaded files to prevent duplicate downloads
 */

const path = require("path")
const fs = require("fs")
const logger = require("../utils/logger")
const fileManager = require("../utils/fileManager")

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const cacheMap = new Map()

function get(url) {

    const item = cacheMap.get(url)

    if (!item) return null

    const now = Date.now()

    if (now - item.time > CACHE_TTL) {

        cacheMap.delete(url)

        return null
    }

    if (!fileManager.fileExists(item.file)) {

        cacheMap.delete(url)

        return null
    }

    return item.file
}

function set(url, filePath) {

    try {

        cacheMap.set(url, {
            file: filePath,
            time: Date.now()
        })

    } catch (error) {

        logger.error("CACHE_SET_ERROR", {
            url,
            error: error.message
        })

    }

}

function remove(url) {

    if (cacheMap.has(url)) {

        cacheMap.delete(url)

    }

}

function cleanup() {

    const now = Date.now()

    for (const [url, item] of cacheMap.entries()) {

        if (now - item.time > CACHE_TTL) {

            cacheMap.delete(url)

        }

    }

}

setInterval(cleanup, 600000)

module.exports = {
    get,
    set,
    remove
}
