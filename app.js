const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");
const SES = new AWS.SES({
  region: 'us-east-1'
});

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(upload.single('attachment'));

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
});

AWS.config.update({region: process.env.REGION});

app.post('/blackbird-home/contacts', function (req, res) {
  console.log(req.file);
  const params = req.body;
  if (!params.email) {
    console.log("Empty email. EMAIL WON'T BE SENT");
    res.status(400).send("Empty email!");
    return;
  }

  const bbEmail = 'info@blackbird-lab.com';

  const mailOptions = {
    from: bbEmail,
    replyTo: params.email,
    to: bbEmail,
    subject: `Contact us message from ${params.firstName} ${params.lastName}`,
    html: `<h3>New message from Contact Us on blackbird-lab.com:</h3></br></hr></br>
                            <p><b>From:</b> ${params.firstName} ${params.lastName}</p>
                            <p><b>Email:</b> ${params.email}</p>
                            <p><b>Country:</b> ${params.country}</p>
                            <p><b>Message:</b></p>
                            <p>${params.message}</p>`,
    text: `New message from Contact Us on blackbird-lab.com:\\nFrom ${params.firstName} ${params.lastName}\\n${params.message}\\nPlease reply to email: ${params.email}`,
    attachments: [
      {
        filename: req.file.originalname,
        content: req.file.buffer
      }
    ]
  };

  const transporter = nodemailer.createTransport({
    SES: SES
  });

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log("Error sending email: ", err);
      res.status(500).send('Internal Error: The message is not accepted.');
    } else {
      console.log("Email sent successfully");
      res.sendStatus(200);
    }
  });
});

app.post('/blackbird-home/vac_apply', function (req, res) {
  if (!req.file) {
    console.log("Empty attachment. EMAIL WON'T BE SENT");
    res.status(400).send("Empty attachment!");
    return;
  }

  const bbEmail = 'hr@blackbird-lab.com';

  const mailOptions = {
    from: bbEmail,
    to: bbEmail,
    subject: `New vacation application on Blackbird Home`,
    html: `<h3>New vacation application on Blackbird Home (see attachment)</h3>`,
    text: `New vacation application on Blackbird Home (see attachment)`,
    attachments: [
      {
        filename: req.file.originalname,
        content: req.file.buffer
      }
    ]
  };

  const transporter = nodemailer.createTransport({
    SES: SES
  });

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log("Error sending email: ", err);
      res.status(500).send('Internal Error: The message is not accepted.');
    } else {
      console.log("Email sent successfully");
      res.sendStatus(200);
    }
  });
});

app.listen(3000, function () {
  console.log("App started")
});

module.exports = app;
