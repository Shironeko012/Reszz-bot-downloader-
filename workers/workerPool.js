/**
 * Worker Pool
 * Manage concurrent downloader workers
 */

const os = require("os")
const logger = require("../utils/logger")
const downloadWorker = require("./downloadWorker")

/**
 * Limit worker count
 * Prevent overload when CPU count is high
 */

const CPU_COUNT = os.cpus().length
const MAX_WORKERS = Math.min(Math.max(2, CPU_COUNT), 6)

let activeWorkers = 0
const waitingQueue = []

function runNext() {

    if (waitingQueue.length === 0) return
    if (activeWorkers >= MAX_WORKERS) return

    const job = waitingQueue.shift()

    activeWorkers++

    job()
        .catch(err => {

            logger.error("WORKER_JOB_ERROR", {
                error: err.message
            })

        })
        .finally(() => {

            activeWorkers--

            runNext()

        })
}

function enqueue(task) {

    return new Promise((resolve, reject) => {

        waitingQueue.push(async () => {

            try {

                const result = await task()

                resolve(result)

            } catch (error) {

                reject(error)

            }

        })

        process.nextTick(runNext)

    })
}

/**
 * Video downloader
 */

async function download(url) {

    return enqueue(async () => {

        logger.info("WORKER_VIDEO_START", { url })

        const result = await downloadWorker.downloadVideo(url)

        logger.info("WORKER_VIDEO_FINISH", { url })

        return result

    })
}

/**
 * MP3 downloader
 */

async function downloadMP3(url) {

    return enqueue(async () => {

        logger.info("WORKER_MP3_START", { url })

        const result = await downloadWorker.downloadMP3(url)

        logger.info("WORKER_MP3_FINISH", { url })

        return result

    })
}

module.exports = {
    download,
    downloadMP3
}
