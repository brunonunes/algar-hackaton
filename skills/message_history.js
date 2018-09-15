module.exports = (controller) => {

  if (controller.storage && controller.storage.history) {

    // expose history as an endpoint
    controller.webserver.post('/botkit/history', (req, res) => {
      if (req.body.user) {
        controller.storage.history.getHistoryForUser(req.body.user, 10).then((history) => {
          res.json({success: true, history: history.map((h) => { return h.message })})
        }).catch((err) => {
          res.json({success: false, history: [], error: err})
        })
      } else {
        res.json({success: false, history: [], error: 'no user specified'})
      }
    })

    const logMessage = (message, user) => {

        if (message.type == 'message' || message.type == 'message_received') {
          controller.storage.history.addToHistory(message, message.user).catch((err) => {
            console.error('Error storing history: ',err)
          })
        }
    }

    // log incoming messages to the user history
    controller.middleware.receive.use((bot, message, next) => {
        controller.storage.users.get(message.user, (err, user) => {
            logMessage(message,user)
        })
        next()
    })


    controller.middleware.format.use((bot, message, platform_message, next) => {
        controller.storage.users.get(message.to, (err, user) => {
            logMessage(platform_message,user)
        })
        next()
    })

  } else {
    console.log("Configure a MONGO_URI to enable message history")
    controller.webserver.post('/botkit/history', (req, res) => {
      res.json({success:true, history: []})
    })
  }

}
