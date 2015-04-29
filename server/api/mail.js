var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
 
// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails) 
var auth = {
  auth: {
    api_key: 'key-884aefe0f67dcd473d1b8baf218fd835',
    domain: 'sandbox63b2cc398418486c92907965debf5f90.mailgun.org'
  }
}
 
var nodemailerMailgun = nodemailer.createTransport(mg(auth));

module.exports = nodemailerMailgun;
