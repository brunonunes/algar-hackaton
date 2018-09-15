module.exports = (controller) => {

  controller.middleware.receive.use((bot, message, next) => {

    if (message.text && message.text.match(bot.utterances.quit)) {
      bot.findConversation(message, (convo) => {
        if (convo) {
          convo.stop('quit')
          bot.reply(message, 'Saindo 🙃')
        } else {
          next()
        }
      })
    } else {
      next()
    }

  })

}
