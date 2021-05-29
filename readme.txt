to run the program
npm start or node index.js

to change production mode or production in windows
set NODE_ENV=production&&npm start
ubuntu: NODE_ENV=production npm start

For Starting the API run the command - npm start
Rest_api_with_RabbitMQ is for
	1. Adding new users
	2.Sending newsletters to users using RabbitMQ implementation

	
API's

1.add_user - New users can be added with add_user api.First name, Last name, and Email will be the required parameters. User details were stored into user_list table of  test_api db.
2.csv_uploads - For uploading the csv. After successful uploading a mail(newsletter) will be set to each user as mentioned in the csv.
3.send_mail - With send_mail, we can forcefully run the system to send the mail if needed other than normal.

Postman collection is also used for test purposes and response evaluation.