const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const passHash = require('password-hash');
const cache = require('persistent-cache');
const path = require('path');
const fs = require('fs');
const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');


const users = cache();
const app = express();

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname+'/public/login.html'));
});

app.get('/register', function (req, res) {
	res.sendFile(path.join(__dirname+'/public/register.html'));
});

app.use(express.static(__dirname + '/public'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use(bodyParser.urlencoded({extended: false}));

app.post('/register', function(req, res) {
  console.log('entering register');
  var username = req.body.username;
  var password = passHash.generate(req.body.password);
  var check = passHash.verify(req.body.passwordrepeat, password);

//User Registration
  users.get(username, function(err, user){
	if (!err && !user && check) {
		var profile = {
			'username': username,
			'password': password
		};
		users.put(username, profile, function(err){
			if (err){
				console.log('\n'+err);
				res.send(err);
			} else {
				console.log(`\n Account has been registered as ${username}`);
				console.log('\n'+JSON.stringify(profile));
				console.log('Account has been registered');
				res.sendFile(path.join(__dirname+'/public/login.html'));
			}
		});
		} else if (user) {
			console.log('That account already exists');
			res.send('That account already exists');
			res.sendFile(path.join(__dirname+'/public/login.html'));
		} else if (err) {
			console.log(err)
			res.send(err)
		} else if (!check) {
			console.log('passwords do not match');
			res.send('passwords do not match...');
			res.sendFile(path.join(__dirname+'/public/passnotmatch.html'));
		}
	});
});

//User Login
app.post('/login', function(req, res) {
	console.log('entering login')
	const username = req.body.username;

	users.get(username, function(err, profile) {
		console.log(`${err} ${profile}`);
		if(!err & !profile) {
			console.log('User not registered!');
			res.send('User not registered');
		} else if (profile) {
			if (passHash.verify(req.body.password, profile.password)){
				console.log('You have authenticated!');

				res.sendFile(path.join(__dirname+'/public/homepage.html'));
				// res.sendFile(path.join(__dirname+'/public/css.css'));
			} else {
				console.log('Authentication faliure!');
				res.sendFile(path.join(__dirname+'/public/login.html'));
			}
		} else {
			console.log(err);
		} 
	});	
});

app.post('/homepage', function(req, res) {
	
});

//Homepage -- Sending Emails
app.post('/mail', function(req, res) {
	const Service = req.body.service;
	const email = req.body.email;
	const emailPass = req.body.pass;
	const recipient = req.body.recipient;
	const text = req.body.text;

	var transporter = nodeMailer.createTransport({
  		service: Service,
  		auth: {
   			user: email,
    		pass: emailPass
  		}
	});

	var mailOptions = {
  		from: email,
  		to: recipient,
  		text: text
	};

	transporter.sendMail(mailOptions, function(error, info){
  		if (error) {
    		console.log(error);
  		} else {
    		console.log('Email sent: ' + info.response);
  		}
}); 
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});