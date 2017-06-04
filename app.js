const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const passHash = require('password-hash');
const cache = require('persistent-cache');
const path = require('path');
const fs = require('fs');

const users = cache();
const app = express();

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname+'/public/login.html'));
});

app.use(express.static('/public'));
app.use(bodyParser.urlencoded({extended: false}));

app.post('/register', function(req, res) {
  console.log('entering register');
  var username = req.body.username;
  var password = passHash.generate(req.body.password);

  users.get(username, function(err, user){
	if (!err && !user) {
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
			}
		});
			console.log('\n'+JSON.stringify(profile));
			res.send('Account has been registered');
		} else if (user) {
			console.log('That account already exists');
			res.send('That account already exists');
		} else if (err) {
			console.log(err)
			res.send(err)
		}
	});
});

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
				res.sendFile(path.join(__dirname+'/public/homepage`.html'));
			} else {
				console.log('Authentication faliure!');
				res.send({ redirect: '/login'});
			}
		} else {
			console.log(err);
		} 
	});	
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});