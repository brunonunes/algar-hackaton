const request = require('request')

module.exports = (controller) => {

  const parcelar = (bot, message) => {

    request({
      method: "GET",
      uri: `http://algahack.ngrok.io/api/offers/${message.user}/installment`
    }, (err, res, offerData) => {
      if (err) console.error(err)
      else {

        offerData = JSON.parse(offerData)

        const total = (offerData.dueAmoutWithInstallment/100)
        const valor_entrada = (offerData.minEntry/100)
        const quantidade_parcelas = offerData.maxInstallment
        const valor_parcela = (total/quantidade_parcelas).toFixed(2)

        console.log("offerData", offerData)

        bot.startConversation(message, (err, convo) => {

          convo.ask({
            text: `Ok. O valor da entrada é R$ ${valor_entrada}, você pode parcelar em até ${quantidade_parcelas} vezes de R$ ${valor_parcela}. Em quantas parcelas você prefere?`
          }, [
            {
              default: true,
              callback: (response, convo) => {
                try {
                  num_parcelas = parseInt(response.text)
                  convo.setVar('num_parcelas', num_parcelas)
                  convo.gotoThread('num_parcelas')
                  convo.next()
                } catch (err) {
                  if (parseInt(response.text) > quantidade_parcelas) {
                    convo.addMessage(`O número máximo de parcelas é ${quantidade_parcelas}. Me diga o número de parcelas que você quer`)
                  } else {
                    convo.addMessage('Isso não é um número 😕 Me diga o número de parcelas que você quer')
                  }
                }

              }
            }
          ])

          convo.addMessage({
            text: `😁 Ótimo! Enviei os boletos para o seu email os boletos para pagamento da entrada de R$ ${valor_entrada} e das {{vars.num_parcelas}} parcelas de R$ ${valor_parcela}. Você também pode acessar através do link http://bit.ly/a15d`
          }, 'num_parcelas')

        })

      }

    })

  }

  controller.hears('parcelar', 'message_received', parcelar)

}
