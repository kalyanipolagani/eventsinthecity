var sess;
var http = require('http'),
  assert = require('assert');

var mongo = require("./mongoConnect");
var mongoURL = "mongodb://ec2-54-183-239-166.us-west-1.compute.amazonaws.com:27017/cmpe295";

var fe = [];
var recommendFun=[];
mongo.connect(mongoURL, function(db) {
  //console.log('Connected to mongo at: ' + mongoURL);

  var coll1 = db.collection('featuredEvents');
  coll1.find().toArray(function(err, result) {
    if (result.length) {
      fe = fe.concat(result[0].featuredEvents);

    } else {
      console.log(err)
    }
  })
  db.close();
});
exports.index = function(req, res) {
  //console.log(JSON.stringify(req.session.email));
  req.session.destroy();
  res.render('index', {
    title: 'Events in the City',
    featured: fe
  });
};

exports.featured = function(req, res) {
  var eventid = req.param("id");
  //console.log("Featured Events Details page!!!!");
  for (var i = 0; i < fe.length; i++) {
    if (fe[i].id == eventid) {

      event = {};

      event.id = eventid;
      event.title = fe[i].title;
      event.time = fe[i].time;
      event.description = fe[i].description;
      event.image = fe[i].image;
      event.location = fe[i].location;
      event.url = fe[i].url;

      res.render('featuredEvents', {
        title: 'Events in the City',
        featuredEvent: event
      });
    };
  }
};

//Render Homepage
exports.homepage = function(req, res) {
  if (req.session.email) {
    res.render('homepage', {
      title: 'Events in the City',
      featured: fe
    });
  } else {
    res.render('signin', {
      title: 'Events in the City'
    });
  }

};
//Login
exports.clickOnLoginButton = function(req, res) {
  res.render('signin', {
    title: 'Events in the City'
  });
};

exports.listFeaturedEventDetails = function(req, res) {
	  var eventid = req.param("id");
	  var eventType = req.param("type");
      var eventCategory = req.param("cat");
	  //console.log("Featured Events Details page!!!!");

	  for(var i = 0; i < 3; i++){
          var randomNumber =  Math.floor(Math.random() * fe.length)
          //console.log("inside recommendations" + randomNumber)
          recommendFun[i]=fe[randomNumber];
      }

	  for (var i = 0; i < fe.length; i++) {
	    if (fe[i].id == eventid) {
	      
		  event={};
          event.userid = req.session.email;
          event.id=eventid;
          event.type=eventType;
          event.category=eventCategory;

          mongo.connect(mongoURL, function(){
              //console.log('Connected to mongo at: ' + mongoURL);
              var coll1 = mongo.collection('userevents');

              coll1.update({
                  id: event.id},
			  	  {$set:{'userid': event.userid, 'type': event.type, 'category': event.category}},
				  {upsert: true}
              );

        /*      coll1.insert(event,(function(err, user){
                  if (!err) {
                      console.log("Details saved successfully  ");
                  } else {
                      console.log("returned false"+err);
                  }
              })); */

          });

	      res.render('featuredEventDetails', {
	        title: 'Events in the City',
	        featuredEvent: fe[i],recommend: recommendFun,
	      });
	    };
	  }
	};

	
exports.savefeaturedDetails = function(req, res){

		var featuredeventid = req.body.eventid;
		var featuredtype = req.body.eventType;


		var feafvrt = {
				userid : req.session.email,
				eventid : req.body.eventid,
				type : req.body.eventType,
				category : "fun",
			};

		mongo.connect(mongoURL, function(){
			//console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('favoriteEvents');

			coll.update({
				eventid: feafvrt.eventid},
			  	  {$set:{'userid': feafvrt.userid, 'type': feafvrt.type, 'category': feafvrt.category}},
				  {upsert: true}
	        );

		});
		res.redirect('/featuredEventDetails?id='+featuredeventid+'&type='+featuredtype+'&cat=fe');
};

	

exports.about = function(req, res) {
  res.render('about');
};

exports.contactUs = function(req, res) {
  res.render('contactUs');
};

exports.savecontactmessage = function(req, res){

	var username = req.body.UserName;
	var useremail = req.body.UserEmail;
	var userphone = req.body.UserPhone;
	var usermessage = req.body.UserMessage;


	var contact = {
			userid : req.session.email,
			username : req.body.UserName,
			useremail : req.body.UserEmail,
			userphone : req.body.UserPhone,
			usermessage : req.body.UserMessage,
		};

	mongo.connect(mongoURL, function(){
		//console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('contactUs');

		coll.insert(contact,(function(err, user){
			if (user) {

				console.log("Details saved successfully  ");

			} else {
				console.log("returned false");
			}
		}));

	});
	res.redirect('contactUs');
};
