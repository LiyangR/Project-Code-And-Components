// import alert from 'alert-node'


const express = require('express')
const app = express()


app.use(express.static('public'));
app.set('view engine', 'ejs');
var pgp = require('pg-promise')();

var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'net_worth_db',
  user: 'postgres',
  password: 'pass'
};

var db = pgp(dbConfig);

var ID = 0;

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory



// Redirection because we're lazy
app.get('/', function(req,res){
  res.redirect('/home');
})


app.get('/share', function (req, res){
  res.render('share',{
  	failed : false
  })
})

app.post('/share', function (req, res){
  console.log(req.body.email);
  console.log(req.body.comment);

  var selector1 = null;
  var selector2 = null;
  var selector3 = null;

  if (req.body.selector1 != undefined)
  {
  	selector1 = req.body.selector1;
  }

  if (req.body.selector2 != undefined)
  {
  	selector2 = req.body.selector2;
  }

  if (req.body.selector3 != undefined)
  {
  	selector3 = req.body.selector3;
  }

//install nodemailer first
//enter: npm install nodemailer  

  	var nodemailer = require('nodemailer'); 

	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
	    user: 'netWorthAppShare@gmail.com', //We need to create a public email address to send the information;
	    pass: '123networth'
	  }
	});

	var targetemail = req.body.email;
	var targetcomment = req.body.comment;

	var user_email = "select email from userInfo where userID = '"+ ID +"';";
	db.query(user_email)
		.then(rows => {
			console.log(rows[0]);
		})
		.catch( err => throw (err))
	var send_text = "";
	var user_name = "select firstName from userInfo where userID = '" + ID + "';" + ' ' + "select lastName from userInfo userID = '" + ID + "';";
	var net_worth = "select netWorth from netWorthInfo where userID = '" + ID + "';";
	console.log(net_worth);
	var total_assets = "select totalAssets from netWorthInfo where userID = '" + ID + "';";
	var total_liabilities = "select totalLiabilities from netWorthInfo where userID = '"+ ID +"';";

	db.task('get-everything', task => {
    return task.batch([
      task.any(user_email),
      task.any(user_name),
      task.any(net_worth),
      task.any(total_assets),
      task.any(total_liabilities)
      ]);
  })
	.then(info => {
    //res.redirect('/create_account');
    console.log(user_email);
    console.log('it worked!!!!!!!!!!!!!!!!');
  })
  .catch(error => {
    //res.redirect('/create_account');
    console.log('there was an error!!!');
  })

	if(selector1 != null)
	{
		send_text = "Your friend " + user_name + "has networth of " + net_worth + 
		", total assets of " + total_assets + ", and total liabilities of " + total_liabilities + ".";
	}
	else if(selector2 != null)
	{
		send_text = "Your friend " + user_name + " has networth of " + net_worth + 
		", total assets of " + total_assets + ".";
	}
	
	else if(selector3 !=null)
	{
		send_text = "Your friend " + user_name + " has networth of " + net_worth +
		".";
	}

	send_text += "\n Comment: " + targetcomment;
		/*var targetemail = req.body
	
		var user_id = "select userID from userInfo where email = targetemail";
	
		var user_name = "select firstName from userInfo where email = targetemail" + ' ' + "select lastName from userInfo where email = targetemail";
	
		var send_text = '';"

	if(document.getElementById("High").checked = true)
	{
		send_text = "Your friend " + user_name + " has networth of " + "select netWorth from netWorthInfo where userID = user_id" + 
		", total assets of " + "select totalAssets from netWorthInfo where userID = user_id" + ", and total liabilities" + 
		"select totalLiabilities from netWorthInfo where userID = user_id";
	}
	else if(document.getElementById("Medium").checked = true)
	{
		send_text = "Your friend " + user_name + " has networth of " + "select netWorth from netWorthInfo where userID = user_id" + 
		", and total assets of " + "select totalAssets from netWorthInfo where userID = user_id" + ".";
	}
	else if(document.getElementById("Low").checked = true)
	{
		send_text = "Your friend " + user_name + " has networth of " + "select netWorth from netWorthInfo where userID = user_id" + 
		".";
	}
	*/

	var mailOptions = {
	  from: 'netWorthAppShare@gmail.com',
	  to: 'liru4968@colorado.edu',
	  subject: 'Your friend '+ 'user_name' + ' share networth with you!',
	  text: send_text
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	  	res.render('share',{
	  		failed: true
	  	})
	  	// 'alert-node'.alert('Email send failed')
	    console.log(error);
	  } else {
	  	res.render('home',
	  	{
	  		share: true
	  	})
	  	//alert('email sent successfully')
	    console.log('Email sent: ' + info.response);
	  }
	}); 
})

app.get('/login', function (req, res){
  res.render('login');
})

app.get('/create_account', function (req, res){
  res.render('createAccount');

})

app.get('/home', function (req, res) {
  var query = "select * from networthinfo where userid = '" + ID + "';";
  db.any(query)
    .then(function (rows) { 
  console.log(rows)
        res.render('home',{
      my_title: "Home Page",
      data: rows,
      share: false
    })
        })
  .catch(function (err) {
            // display error message in case an error
            req.flash('error', err);
            res.render('home', {
                title: 'Home Page Error',
                data: ''
            })
        })
})


app.get('/add', function (req, res){
  var query = "select * from itemsentered where userid = '1';";
  db.any(query)
    .then(function (rows) { 
  console.log(rows)
        res.render('Calculation',{
      my_title: "Add Page",
      data: rows
    })
  })
})



app.get('/edit', function (req, res){
  var query = "select * from itemsentered where userid = '1';";
  db.any(query)
    .then(function (rows) { 
  console.log(rows)
        res.render('edit',{
      my_title: "edit Page",
      data: rows
    })
  })
})


app.post('/create_account/add_user',function (req, res){

  var usr = req.body.username;
  var pass = req.body.password;
  var email_ = req.body.email;
  console.log(usr);
  console.log(pass);
  console.log(email_);

  //var user_query = 'SELECT * FROM userInfo;';
  var user_query = "SELECT username FROM userInfo WHERE username = '"+ usr + "';";
  var email_query = "SELECT email FROM userInfo where email = '" + email_ +"';";

  db.task('get-everything', task => {
    return task.batch([
      task.any(user_query),
      task.any(email_query)
      ]);
  })
  .then(info => {
    res.redirect('/create_account');
    console.log('it worked!!!!!!!!!!!!!!!!');
  })
  .catch(error => {
    res.redirect('/create_account');
    console.log('there was an error!!!');
  })
})

app.post('/login/verify', function (req, res){
  var username = req.body.username;
  var password = req.body.password;
  var query = "SELECT username, password, userID FROM userInfo WHERE username = '" + username + "' AND password = '" + password + "';";
  db.any(query)
    .then(function (rows) { 
        if(rows.length == 1){
      ID = rows[0].userid;
      res.redirect('/home');
  }
  else{
    res.redirect('/login');
  }
})
})


/*
<<<<<<< HEAD
app.post('/create_account', function (req, res){
  // Retrive information from form
=======

app.post('/create_account', function (req, res){
  // Retrive information from form

>>>>>>> eded17218b385265e7fc7a83a12e4a51f37f5513
  var user = req.body.username;
  var pass = req.body.password;
  var email_ = req.body.email;
  
  // Retrive possible queries
  var user_query = 'SELECT username FROM userInfo WHERE username = user;';
    email_query = 'SELECT email FROM userInfo WHERE email = email_;';
  
  // Compare form info to queries
  // If info does match anything in DB
  // Send an alert and repromt form
  db.task('get-everything', task => {
    return task.batch([
      task.any(user_query),
      task.any(email_query)
      ]);
  })
  .then(function (user, pass, email_) {
    if (user == user_query)
    {
      alert('This username is already taken');
      res.render('create_account');
    } 
    else if(email_ == email_query)
    {
      alert('This email address is already taken');
      res.render('create_account');
    }
    else{
      alert('Account created!');
    }
  })
  .catch(function (err){
    req.flash('Error', err);
    res.redirect('/home');
  });
});
*/


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})