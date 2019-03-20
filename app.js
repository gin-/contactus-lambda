const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const SES = new AWS.SES({
    region: 'us-east-1'
});

// declare a new express app
const app = express();
app.use(bodyParser.json());

// Enable CORS for all methods
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
});


AWS.config.update({region: process.env.REGION});

app.post('/blackbird-home/contacts', function (req, res) {
    console.log(req.body);
    const params = req.body;
    if (!params.email) {
        console.log("Empty email. EMAIL WON'T BE SENT");
        res.status(400).send("Empty email!");
        return;
    }

    const bbEmail = 'info@blackbird-lab.com';

    const eParams = {
        Destination: {
            ToAddresses: [bbEmail]
        },
        Message: {
            Body: {
                Html: {
                    Data: `<h3>New message from Contact Us on blackbird-lab.com:</h3></br></hr></br>
                            <p><b>From:</b> ${params.firstName} ${params.lastName}</p>
                            <p><b>Email:</b> ${params.email}</p>
                            <p><b>Country:</b> ${params.country}</p>
                            <p><b>Message:</b></p>
                            <p>${params.message}</p>`,
                    Charset: "UTF8"
                },
                Text: {
                    Data: `New message from Contact Us on blackbird-lab.com:\nFrom ${params.firstName} ${params.lastName}\n${params.message}\nPlease reply to email: ${params.email}`,
                    Charset: "UTF8"
                }
            },
            Subject: {
                Data: `Contact us message from ${params.firstName} ${params.lastName}`,
                Charset: "UTF8"
            }
        },
        ReplyToAddresses: [
            params.email
        ],
        Source: bbEmail
    };

    console.log('===SENDING CONTACT US EMAIL===');
    const email = SES.sendEmail(eParams, function (err, data) {
        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else {
            console.log("===EMAIL SENT===");
            console.log(data);


            console.log("EMAIL CODE END");
            console.log('EMAIL: ', email);
            res.json({
                isBase64Encoded: false,
                statusCode: 200,
                headers: {},
                body: {message: "Email has been sent."}
            });
        }
    });
});

/*TODO: implement*/
app.post('/blackbird/vac_apply', function (req, res) {
    console.log(req.body);
    res.status(400).send("Not implemented yet");
    const params = req.body;
    if (!params.email) {
        console.log("Empty email. EMAIL WON'T BE SENT");
        return;
    }

    const bbEmail = 'info@blackbird-lab.com';

    const eParams = {
        Destination: {
            ToAddresses: [bbEmail]
        },
        Message: {
            Body: {
                Html: {
                    Data: `<h3>New subscription from on blackbird-lab.com:</h3></br></hr></br>
                            <p><b>Email:</b> ${params.email}</p>`,
                    Charset: "UTF8"
                },
                Text: {
                    Data: `New subscription on blackbird-lab.com:\nEmail: ${params.email}`,
                    Charset: "UTF8"
                }
            },
            Subject: {
                Data: `Subscription message from ${params.email}`,
                Charset: "UTF8"
            }
        },
        ReplyToAddresses: [
            params.email
        ],
        Source: bbEmail
    };

    console.log('===SENDING SUBSCRIPTION EMAIL===');
    const email = SES.sendEmail(eParams, function (err, data) {
        if (err) {
            console.log(err);
            res.json(err);
        } else {
            console.log("===EMAIL SENT===");
            console.log(data);


            console.log("EMAIL CODE END");
            console.log('EMAIL: ', email);
            res.json({
                isBase64Encoded: false,
                statusCode: 200,
                headers: {},
                body: {message: "Email has been sent."}
            });
        }
    });
});

app.listen(3000, function () {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
