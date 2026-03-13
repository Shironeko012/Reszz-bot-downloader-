/**
 * Downloader Cluster System
 * Manage multiple downloader nodes and load balancing
 */

const logger = require("../utils/logger")

const nodes = [
    {
        id: "local",
        type: "local",
        healthy: true
    }
]

let currentIndex = 0

function getNextNode() {

    if (nodes.length === 0) return null

    const node = nodes[currentIndex]

    currentIndex = (currentIndex + 1) % nodes.length

    return node
}

function markUnhealthy(nodeId) {

    const node = nodes.find(n => n.id === nodeId)

    if (node) {

        node.healthy = false

        logger.warn("DOWNLOADER_NODE_UNHEALTHY", {
            node: nodeId
        })
    }

}

function markHealthy(nodeId) {

    const node = nodes.find(n => n.id === nodeId)

    if (node) {

        node.healthy = true

        logger.info("DOWNLOADER_NODE_RECOVERED", {
            node: nodeId
        })
    }

}

function registerNode(node) {

    nodes.push({
        id: node.id,
        type: node.type || "remote",
        healthy: true,
        endpoint: node.endpoint || null
    })

    logger.info("DOWNLOADER_NODE_REGISTERED", {
        node: node.id
    })

}

function getHealthyNode() {

    const healthyNodes = nodes.filter(n => n.healthy)

    if (healthyNodes.length === 0) {

        logger.error("NO_HEALTHY_DOWNLOADER_NODE")

        return null
    }

    const node = healthyNodes[currentIndex % healthyNodes.length]

    currentIndex++

    return node
}

module.exports = {
    getNextNode,
    getHealthyNode,
    registerNode,
    markUnhealthy,
    markHealthy
}
