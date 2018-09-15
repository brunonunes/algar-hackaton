module.exports = (controller) => {

  if (process.env.studio_token) {
    controller.on('hello', (bot, message) => {
      // a new session with an unknown user has begun
      // controller.studio.run(bot, 'welcome_user', message.user, message.channel, message)

      bot.reply(message, {
        text: 'Hello, brow!',
        quick_replies: [
          {
            title: 'Hello',
            payload: 'hello'
          },
          {
            title: 'Test',
            payload: 'test'
          },
        ]
      },function() {})



    })

    controller.on('welcome_back', function(bot, message) {
      // a known user has started a new, fresh session
      // controller.studio.run(bot, 'welcome_user', message.user, message.channel, message).then(function(convo) {
      //     convo.gotoThread('welcome_back')
      // })

      bot.reply(message, {
        text: `Olá, ${message.user_profile.first_name}!`,
        quick_replies: [
          {
            title: 'Oi',
            payload: 'hello'
          },
          {
            title: 'Ei',
            payload: 'test'
          },
        ]
      },function() {})


    })

    controller.studio.before('welcome_user', function(convo, next) {
      convo.setVar('bot', controller.studio_identity)
      next()
    })

    controller.on('reconnect', function(bot, message) {
      // the connection between the client and server experienced a disconnect/reconnect
      // bot.reply(message, 'Some sub-space interference just caused our connection to be interrupted. But I am back now.')
    })
  }

}
