/**
 * Queue Utility
 * Simple async task queue with concurrency control
 */

const logger = require("./logger")

class Queue {

    constructor(concurrency = 2) {

        this.concurrency = concurrency
        this.running = 0
        this.tasks = []

    }

    push(task) {

        return new Promise((resolve, reject) => {

            this.tasks.push({
                task,
                resolve,
                reject
            })

            process.nextTick(() => this.next())

        })

    }

    next() {

        if (this.running >= this.concurrency) return

        if (this.tasks.length === 0) return

        const item = this.tasks.shift()

        this.running++

        Promise.resolve(item.task())
            .then(result => {

                item.resolve(result)

            })
            .catch(err => {

                logger.error("QUEUE_TASK_ERROR", err)

                item.reject(err)

            })
            .finally(() => {

                this.running--

                this.next()

            })

    }

}

const defaultQueue = new Queue(3)

module.exports = defaultQueue
