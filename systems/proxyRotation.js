/**
 * Proxy Rotation System
 * Manage proxy pool for downloader requests
 */

const fs = require("fs")
const path = require("path")
const logger = require("../utils/logger")

const PROXY_FILE = path.resolve("./storage/proxy.txt")

let proxies = []
let index = 0

function loadProxies() {

    try {

        if (!fs.existsSync(PROXY_FILE)) {

            logger.warn("PROXY_FILE_NOT_FOUND")

            proxies = []

            return
        }

        const content = fs.readFileSync(PROXY_FILE, "utf8")

        proxies = content
            .split("\n")
            .map(p => p.trim())
            .filter(Boolean)

        logger.info("PROXY_LOADED", {
            count: proxies.length
        })

    } catch (error) {

        logger.error("PROXY_LOAD_ERROR", error)

        proxies = []

    }

}

function getProxy() {

    if (proxies.length === 0) return null

    const proxy = proxies[index]

    index = (index + 1) % proxies.length

    return proxy
}

function getProxyArgs() {

    const proxy = getProxy()

    if (!proxy) return ""

    return `--proxy ${proxy}`
}

loadProxies()

module.exports = {
    getProxy,
    getProxyArgs,
    loadProxies
}
