// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require('mongoose');
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");

// Initialize Express
var app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: false
}));



// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "mongodb://heroku_15cwths1:j0305mb0nbelu6cnjer3vrevr2@ds115583.mlab.com:15583/heroku_15cwths1";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});



app.get("/all", function(req, res) {
    db.news.find({}, function(err, data) {
    // Log any errors if the server encounters one
                var hbsObject = {
                data: data
            };
    if (err) {
      console.log(err);
    }
    // Otherwise, send the result of this query to the browser
    else {
    	
      res.render("index", hbsObject);
    }
  });
  
});

app.post("/all", function(req, res) {
	console.log(req);
    var data = [];
    data.push({

      titleId:req.body.pId,
      comment:req.body.comment

    });
    db.comments.insert(data);
    res.end();

  
});
// "_id": mongojs.ObjectId(req.params.id)
app.post("/comments", function(req, res) {
	
  db.comments.find({"titleId":req.body.tid}, function(err, data) {
   
    var hbsObject = {
      data: data
    };
    
    if (err) {
      console.log(err);
    }
    // Otherwise, send the result of this query to the browser
    else {
    	
      res.render("comments", hbsObject);
    }
  });


});



 request("http://www.latimes.com/", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var results = [];

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works
  $("a.trb_outfit_relatedListTitle_a").each(function(i, element) {

    var link = $(element).attr("href");
    var title = $(element).text();

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      link: "http://www.latimes.com"+link
    });
    db.news.insert(results)
  });


});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});



mongoose.connect("mongodb://heroku_15cwths1:j0305mb0nbelu6cnjer3vrevr2@ds115583.mlab.com:15583/heroku_15cwths1")