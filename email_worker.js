// const queue = 'email-task';
const nodemailer = require('nodemailer');

const open = require('amqplib').connect('amqps://fscjghwa:RY3XzdJSfmaG-R2CMt2astCYesFjJrOy@puffin.rmq2.cloudamqp.com/fscjghwa');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});
// Publisher
const publishMessage = (payload,queue) => open.then(connection => connection.createChannel())
  .then(channel => channel.assertQueue(queue)
    .then(() => channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)))))
  .catch(error => console.warn(error));

// Consumer
const consumeMessage = () => {
  const queue = 'email-task';
  open.then(connection => connection.createChannel()).then(channel => channel.assertQueue(queue).then(() => {
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
    return channel.consume(queue, (msg) => {
      if (msg !== null) {
        const { mail, subject, template } = JSON.parse(msg.content.toString());
        console.log(' [x] Received %s', mail);
            //node mailer
            const mailOptions = {
                from: '',
                to: mail,
                subject: 'Email sent using RabbitMQ',
                text: template
              };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
                const emailOptions = {
                  mail: [mail],
                  subject: 'Error while adding message to queue'
                  }
                publishMessage(emailOptions,'parking-lot');
              } else {
                console.log('Email sent: ' + info.response);
                channel.ack(msg);
              }
            });
      }
    });
  })).catch(error => console.warn(error));
};

const sendMail = (mailBody) =>{
          var mailOptions = {
            from: '',
            to: mailBody.to,
            subject: 'Email sent using RabbitMQ',
            text: mailBody.text
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              return false;
            } else {
              console.log('Email sent: ' + info.response);
              return false;
            }
          });
}

module.exports = {
  publishMessage,
  consumeMessage,
  sendMail
}
require('make-runnable');