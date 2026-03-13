/**
 * Exec Utility
 * Safe wrapper for child_process execution
 */

const { exec } = require("child_process")
const logger = require("./logger")

const MAX_BUFFER = 1024 * 1024 * 20 // 20MB buffer

function run(command, options = {}) {

    return new Promise((resolve, reject) => {

        const process = exec(command, {
            maxBuffer: MAX_BUFFER,
            timeout: options.timeout || 0
        }, (error, stdout, stderr) => {

            if (error) {

                logger.error("EXEC_ERROR", {
                    command,
                    error: error.message
                })

                return reject(error)
            }

            if (stderr && stderr.trim() !== "") {

                logger.warn("EXEC_STDERR", {
                    command,
                    stderr
                })

            }

            resolve(stdout)

        })

        process.on("error", err => {

            logger.error("EXEC_PROCESS_ERROR", {
                command,
                error: err.message
            })

            reject(err)

        })

    })

}

module.exports = run
