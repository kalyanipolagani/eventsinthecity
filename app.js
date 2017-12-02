var express = require('express')
  , routes = require('./routes/index')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
var session = require('express-session');

var MongoStore = require('connect-mongo')(session);

var events=require('./routes/events');
var login = require('./routes/login');
var profile = require('./routes/profile');
var profileHistory = require('./routes/profileHistory');
var scrape = require('./routes/scrape');

var app = express();

app.use(session({
	  secret: 'my_secret',
	  resave: false,
	  saveUninitialized: false,
	  cookie: { maxAge: 30*60000 },
	  //duration: 30 * 60 * 1000,
	  //activeDuration: 5 * 60 * 1000,
	  store: new MongoStore({ url: 'mongodb://ec2-54-183-239-166.us-west-1.compute.amazonaws.com:27017/cmpe295' })
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/login', routes.clickOnLoginButton);
app.get('/homepage',routes.homepage);
app.get('/featuredEvents',routes.featured);
app.get('/users', user.list);
app.get('/profile',profile.getProfileInfo);
app.get('/profileHistory',profileHistory.getProfileHistInfo);
app.post('/loginRequest', login.loginRequest);
app.post('/register',login.register);
//app.get('/logout',login.logout);
app.get('/about',routes.about);
app.get('/contactUs', routes.contactUs);
app.get('/techEvents',events.listTechEvents);
app.get('/funEvents',events.listFunEvents);

app.get('/techEventDetails',events.listTechEventDetails)
app.get('/funEventDetails',events.listFunEventDetails)
app.get('/featuredEventDetails',routes.listFeaturedEventDetails)

app.post('/savetechDetails',events.savetechDetails);
app.post('/savefunDetails',events.savefunDetails);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
