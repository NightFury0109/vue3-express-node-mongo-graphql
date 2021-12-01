const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
require('dotenv').config();
const fs = require("fs");
const path = require("path");

// const { EMAIL_HOST, ETHEREAL_USER, ETHEREAL_PASS, EMAIL_SENDER, EMAIL_PORT } = process.env;

const sendMail = async (email, subject, payload) => {
  try {
    const transporter = nodemailer.createTransport({
      // host: EMAIL_HOST,
      // port: EMAIL_PORT,
      service: 'gmail',
      auth: {
        user: 'nightfury0109@gmail.com',
        pass: 'blacktiger0109',
      },
    });

    const source = fs.readFileSync(path.join(__dirname, './template/resetPw.handlebars'), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: 'nightfury0109@gmail.com',
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
        console.log({ er1: error });
        return error;
      } else {
        console.log('Email successfully sent');
        return res.status(200).json({ msg: 'success' });
      }
    });
  } catch (error) {
    console.log({ er2: error });
    return error;
  }
};

module.exports = sendMail;
