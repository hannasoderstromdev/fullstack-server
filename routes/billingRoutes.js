const keys = require('../config/keys')
const stripe = require('stripe')(keys.stripeSecretKey)

module.exports = app => {
  app.get('/api/billing', (req, res) => {
    
  })
}