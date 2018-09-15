module.exports = (controller) => {


  controller.hears('welcome_test', 'message_received', (bot, message) => {

    bot.reply(message,'I heard a test')

  })

  controller.hears('typing', 'message_received', (bot, message) => {

    bot.reply(message, {
      text: 'This message used the automatic typing delay',
      typing: true,
    }, () => {

      bot.reply(message,{
        text: 'This message specified a 5000ms typing delay',
        typingDelay: 5000,
      })

    })

  })

}
