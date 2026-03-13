/**
 * Worker Pool
 * Manages concurrent download workers
 */

const os = require("os")
const logger = require("../utils/logger")
const downloadWorker = require("./downloadWorker")

const MAX_WORKERS = Math.max(2, os.cpus().length)

let activeWorkers = 0
const waitingQueue = []

function runNext() {

    if (waitingQueue.length === 0) return
    if (activeWorkers >= MAX_WORKERS) return

    const job = waitingQueue.shift()

    activeWorkers++

    job()
        .catch(err => {
            logger.error("WORKER_JOB_ERROR", err)
        })
        .finally(() => {

            activeWorkers--

            runNext()

        })
}

function enqueue(job) {

    return new Promise((resolve, reject) => {

        waitingQueue.push(async () => {

            try {

                const result = await job()

                resolve(result)

            } catch (err) {

                reject(err)

            }

        })

        process.nextTick(runNext)

    })
}

async function download(url) {

    return enqueue(async () => {

        logger.info("WORKER_DOWNLOAD_START", url)

        const result = await downloadWorker.downloadVideo(url)

        logger.info("WORKER_DOWNLOAD_FINISH")

        return result

    })
}

async function downloadMP3(url) {

    return enqueue(async () => {

        logger.info("WORKER_MP3_START", url)

        const result = await downloadWorker.downloadMP3(url)

        logger.info("WORKER_MP3_FINISH")

        return result

    })
}

module.exports = {
    download,
    downloadMP3
}
