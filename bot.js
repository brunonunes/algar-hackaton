/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
const env = require('node-env-file')
env(__dirname + '/.env')


const Botkit = require('botkit')
const debug = require('debug')('botkit:main')

const bot_options = {
    studio_token: process.env.studio_token,
    studio_command_uri: process.env.studio_command_uri,
    studio_stats_uri: process.env.studio_command_uri,
    replyWithTyping: true,
}

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
  // create a custom db access method
  var db = require(__dirname + '/components/database.js')({})
  bot_options.storage = db
} else {
    bot_options.json_file_store = __dirname + '/.data/db/' // store user data in a simple JSON format
}

const controller = Botkit.socketbot(bot_options)

const webserver = require(__dirname + '/components/express_webserver.js')(controller)

// ENABLE IBM WATSON ASSISTANT
const watsonMiddleware = require('botkit-middleware-watson')({
  username: process.env.IBM_ASSISTANT_USERNAME,
  password: process.env.IBM_ASSISTANT_PASSWORD,
  url: process.env.IBM_ASSISTANT_URL,
  workspace_id: process.env.IBM_WORKSPACE_ID,
  version: '2018-07-10',
  minimum_confidence: 0.50,
})
controller.middleware.receive.use(watsonMiddleware.receive)
controller.changeEars(watsonMiddleware.hear)

require(__dirname + '/components/plugin_glitch.js')(controller)
require(__dirname + '/components/plugin_identity.js')(controller)

controller.metrics = require('botkit-studio-metrics')(controller)

controller.openSocketServer(controller.httpserver)

controller.startTicking()

const normalizedPath = require("path").join(__dirname, "skills")
require("fs").readdirSync(normalizedPath).forEach(file => require("./skills/" + file)(controller))

console.log('http://localhost:' + (process.env.PORT || 3000))

// This captures and evaluates any message sent to the bot as a DM
// or sent to the bot in the form "@bot message" and passes it to
// Botkit Studio to evaluate for trigger words and patterns.
// If a trigger is matched, the conversation will automatically fire!
// You can tie into the execution of the script using the functions
// controller.studio.before, controller.studio.after and controller.studio.validate
if (process.env.studio_token) {
    controller.on('message_received', (bot, message) => {
        controller.studio.runTrigger(bot, message.text, message.user, message.channel, message).then((convo) => {
            if (!convo) {
              // web bot requires a response of some kind!
              bot.reply(message,'OK')

                // no trigger was matched
                // If you want your bot to respond to every message,
                // define a 'fallback' script in Botkit Studio
                // and uncomment the line below.
                // controller.studio.run(bot, 'fallback', message.user, message.channel, message)
            } else {
                // set variables here that are needed for EVERY script
                // use controller.studio.before('script') to set variables specific to a script
                convo.setVar('current_time', new Date())
                convo.setVar('bot', controller.studio_identity)
            }
        }).catch((err) => {
            bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err)
            debug('Botkit Studio: ', err)
        })
    })
} else {

    console.log('~~~~~~~~~~')
    console.log('NOTE: Botkit Studio functionality has not been enabled')
    console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/')

}
