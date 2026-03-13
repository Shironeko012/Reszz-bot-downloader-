/**
 * WhatsApp Downloader Bot
 * Main Entry
 */

// FIX crypto for Baileys
const crypto = require("crypto")
if (!global.crypto) global.crypto = crypto.webcrypto

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")

/*
SYSTEM IMPORT
*/

const messageHandler = require("./handlers/messageHandler")
const antiCrash = require("./systems/antiCrash")
const redisCache = require("./systems/redisCache")

const logger = require("./utils/logger")
const errorHandler = require("./utils/errorHandler")

/*
=========================
BOOT SYSTEM
=========================
*/

async function startBot(){

try{

    logger.info("BOT_STARTING")

    /*
    REGISTER SYSTEMS
    */

    errorHandler.register()
    antiCrash.register()

    await redisCache.connect()

    /*
    AUTH STATE
    */

    const { state, saveCreds } =
    await useMultiFileAuthState("./session")

    const { version } =
    await fetchLatestBaileysVersion()

    /*
    CREATE SOCKET
    */

    const sock = makeWASocket({

        version,

        auth: state,

        logger: pino({ level: "silent" }),

        browser: ["DownloaderBot","Node","WA"]

    })

    /*
    SAVE SESSION
    */

    sock.ev.on("creds.update", saveCreds)

    /*
    CONNECTION UPDATE
    */

    sock.ev.on("connection.update", (update)=>{

        const { connection, lastDisconnect } = update

        if(connection === "connecting"){

            logger.info("CONNECTING_WHATSAPP")

        }

        if(connection === "open"){

            logger.info("BOT_CONNECTED")

        }

        if(connection === "close"){

            const reason = lastDisconnect?.error?.output?.statusCode

            logger.warn("CONNECTION_CLOSED", reason)

            if(reason !== DisconnectReason.loggedOut){

                logger.info("RECONNECTING")

                setTimeout(startBot,5000)

            }

        }

    })

    /*
    MESSAGE ROUTER
    */

    sock.ev.on("messages.upsert", async ({ messages }) => {

        try{

            const m = messages?.[0]

            if(!m) return
            if(!m.message) return

            // ignore status broadcast
            if(m.key?.remoteJid === "status@broadcast") return

            await messageHandler.handle(sock, m)

        }catch(err){

            logger.error("MESSAGE_HANDLER_ERROR", err)

        }

    })

}catch(err){

    logger.error("BOT_START_ERROR", err)

    setTimeout(startBot,5000)

}

}

/*
=========================
START BOT
=========================
*/

startBot()
