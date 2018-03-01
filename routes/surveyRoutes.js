const mongoose = require('mongoose')

const requireLogin = require('../middlewares/requireLogin')
const requireCredits = require('../middlewares/requireCredits')
const Mailer = require('../services/Mailer')
const surveyTemplate = require('../services/emailTemplates/surveyTemplate')

const Survey = mongoose.model('surveys')

module.exports = app => {
  app.get('/api/surveys/thanks', (req, res) => {
    res.send('Thank you for your feedback!')
  })

  app.post('/api/surveys/webhooks', (req, res) => {
    console.log(req.body)
    res.send({})
  })

  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body

    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now()
    })

    try {
      // Send email
      const mailer = new Mailer(survey, surveyTemplate(survey))
      await mailer.send()

      // Save survey
      await survey.save()

      // Withdraw credit
      req.user.credits -= 1
      const user = await req.user.save()

      res.send(user)
    } catch (error) {
      res.status(422).send(error)
    }
  })
}
