const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { publishMessage, consumeMessage } = require('./email_worker.js')


module.exports = router;

var upload = multer({ dest: 'uploads/',fileFilter:function(req,file,cb){
        console.log('file is',file)
        cb(null,true);
    }
});

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'softinc',
  database : 'test_api'
});
 
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  // console.log('connected as id ' + connection.threadId);
});

router.post('/csv_uploads', upload.single('file_name'), function(req, res, next) {
    console.log(req.file);
    let response = [];
    fs.createReadStream('newletter.csv')
    .pipe(csv())
    .on('data', (row) => {        
        console.log(row);
        let final_text = `Newsletter Name: ${row.newsletter_name}\n Newsletter Content: ${row.newsletter_content} `;
        const toAddress = row.email;
        console.log("toAddress",toAddress);
        const select_user = `select concat_ws(' ',firstname,lastname) as userName from user_list where email = ?;`;
        connection.query(select_user, toAddress, (err, userInfo) => {
            if(err) 
                response.push(`Error occured ${err}`);
               else if(userInfo.length === 0){
                console.log("No valid user");
                response.push(`No valid user`);
               }else {
                console.log('Found user user info ', userInfo);
                final_text += userInfo[0].userName;
                console.log("final_text===>",final_text);
                const emailOptions = {
                mail: [toAddress],
                subject: 'Email confirmed',
                template: final_text
                }
                // call rabbitmq service to append mail to queue
                publishMessage(emailOptions,'email-task');
                response.push(`Email queued`);
              }
        });

    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        res.send(response)
  });
});

router.post('/send_mail', (req, res) => {
    consumeMessage()
    return res.status(202).send({
        message: 'Listening to message queue now'
      });
});

router.post('/add_user',function(req,res){
    let user_details = req.query;
    connection.query('INSERT INTO user_list SET ?', user_details, (err, result) => {
    if(err) 
        res.send(`Error occured ${err}`);
    else res.send(`User Added`);
    });
});