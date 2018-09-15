module.exports = (controller) => {

  controller.hears('welcome_test', 'message_received', (bot, message) => {

    bot.reply(message,'I heard a test')

  })

  controller.hears('yes', 'message_received', (bot, message) => {

    bot.reply(message, "Sim!!!!")

  })

  controller.hears('typing', 'message_received', (bot, message) => {

    bot.reply(message, {
      text: 'Digitando',
      typing: true,
    }, () => {

      bot.reply(message,{
        text: 'Pronto',
        typingDelay: 5000,
      })

    })

  })



}
