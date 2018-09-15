const request = require('request')

module.exports = (controller) => {

  const a_vista = (bot, message) => {
    request({
      method: "GET",
      uri: `http://algahack.ngrok.io/api/offers/${message.user}/accept`
    }, (err, res, offerData) => {
      if (err) console.error(err)
      else {

        offerData = JSON.parse(offerData)

        console.log(offerData, offerData)

        request({
          method: "GET",
          uri: offerData.uri.href
        }, (err, res, gifData) => {
          if (err) console.error(err)
          else {

            gifData = JSON.parse(gifData)

            console.log(gifData)

            bot.say({
              text: `😁 Ótimo! Enviei os boletos para o seu email os boletos para pagamento à vista. Você também pode acessar através do link http://bit.ly/a15d`,
              files: [
                  {
                    url: gifData.data.images.original.url,
                    image: true
                  }
              ]
            })

          }
        })




      }
    })
  }

  const nenhuma = (bot, message) => {
    bot.say({
      text: `Como posso ajudar a resolver esse débito? Posso tentar uma outra oferta ou podemos conversar para decidir a melhor data para você.`,
      quick_replies: [
        {
          title: 'Outras ofertas',
          payload: 'Quero outras ofertas'
        },
        {
          title: 'Montar oferta',
          payload: 'Quero escolher data e valor'
        }
      ]
    })
  }

  const welcome = (bot, message) => {

    request({
      method: "GET",
      uri: `http://algahack.ngrok.io/api/users/${message.user}/billings`
    }, (err, res, offerData) => {
      if (err) console.error(err)
      else {

        const total = (offerData.dueAmoutWithInstallment/100)
        const valor_entrada = total*0.05
        let valor_parcela = 0
        let quantidade_parcelas = 36

        for (quantidade_parcelas = 36; valor_parcela <= 20; quantidade_parcelas--) {
          valor_parcela = parseInt(total/quantidade_parcelas)
        }

        offerData = JSON.parse(offerData)

        bot.startConversation(message, (err, convo) => {

          convo.say(`Olá, ${message.user_profile.first_name}! Agradecemos o seu interesse em regulizar os seus débitos com a Algar.`)

          convo.ask({
            text: `Tenho uma ótima oferta para você! Faça o pagamento hoje de R$ ${offerData.dueAmoutWithSight/100} ou pague parcelado R$ ${offerData.dueAmoutWithInstallment/100} (entrada + ${quantidade_parcelas} parcelas). Qual a melhor opção para você?`,
            quick_replies: [
              {
                title: 'À vista',
                payload: 'À vista'
              },
              {
                title: 'Parcelado',
                payload: 'Parcelado'
              },
              {
                title: 'Nenhuma das duas',
                payload: 'Nenhuma'
              }
            ]
          })

        })

      }

    })

  }

  controller.on('hello', welcome)
  controller.on('welcome_back', welcome)

  controller.hears('a_vista', 'message_received', a_vista)
  controller.hears('nenhuma', 'message_received', nenhuma)

  controller.on('reconnect', (bot, message) => {
    // the connection between the client and server experienced a disconnect/reconnect
    bot.reply(message, 'Alguma interferência no subespaço fez com que a nossa conexão fosse interrompida. Mas estou de volta agora 😃')
  })


}
