module.exports = (controller) => {

  const makeOffer = (bot, message) => {

    bot.reply(message, "Ok! Vou tentar montar uma nova oferta para você")

    controller.storage.users.get(message.user, (err, userData) => {

      bot.startConversation(message, (err, convo) => {

        convo.addQuestion({
          text: `Ok! Vou `,
          quick_replies: [
            {
              title: 'Sim',
              payload: 'Sim',
            },
            {
              title: 'Não',
              payload: 'Não',
            }
          ]
        },[
          {
            pattern: 'Sim',
            callback: (res, convo) => {
              convo.gotoThread('docs')
              convo.next()
            }
          },
          {
            pattern: 'Não',
            callback: (res, convo) => {
              convo.gotoThread('community')
              convo.next()
            }
          },
          {
            default: true,
            callback: (response, convo) => {
              convo.say("Essa não é uma das opções de resposta 😕")
            }
          }
        ])

      })


    })

  }

  controller.hears('another_offer', 'message_received', makeOffer)

}
