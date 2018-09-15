const env = require('node-env-file')
env(__dirname + '/.env')

const Botkit = require('botkit')
const debug = require('debug')('botkit:main')

const bot_options = {
  studio_token: process.env.studio_token,
  studio_command_uri: process.env.studio_command_uri,
  studio_stats_uri: process.env.studio_command_uri,
  replyWithTyping: true,
  debug: true,
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
}

if (process.env.MONGO_URI) {
  const db = require(__dirname + '/components/database.js')({})
  bot_options.storage = db
} else {
  bot_options.json_file_store = __dirname + '/.data/db/'
}

const controller = Botkit.facebookbot(bot_options)

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

const bot = controller.spawn({})
controller.setupWebserver((process.env.port || 4000), (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver, bot, () => {
      console.log('This bot is online!!!');
  })
})

const normalizedPath = require("path").join(__dirname, "skills")
require("fs").readdirSync(normalizedPath).forEach(file => require("./skills/" + file)(controller))

controller.on('message_received', (bot, message) => {
  bot.reply(message, '😝 Não consigo te ajudar com isso')
})

console.log('http://localhost:' + (process.env.PORT || 3000))
