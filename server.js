// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require('mongoose');
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");
mongoose.Promise = Promise;

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

// -----------------------------------------------------------------------------------------------
request("http://www.latimes.com/", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var result = {};


    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $("a.trb_outfit_relatedListTitle_a").each(function(i, element) {

        result.link = $(element).attr("href");
        result.title = $(element).text();

        var entry = new Article(result);

        // Now, save that entry to the db
        entry.save(function(err, doc) {

            // Log any errors
            if (err) {
                console.log(err);
            }
            // Or log the doc
            else {

                console.log(doc);

            }
        });

    });

});
// ------------------------------------------------------------------------------



app.get("/", function(req, res) {

    Article.find({}, function(error, doc) {
        var hbsObject = {
            data: doc
        };
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.render("index", hbsObject);
        }
    });



});

app.post("/", function(req, res) {

    var data = {};
    data.body = req.body.comment;

    var newComment = new Comment(data);

    // And save the new note the db
    newComment.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            Article.findOneAndUpdate({
                "_id": req.body.pId
            }, {
                $push: {
                    "comment": doc._id
                }
            }, {
                new: true
            }, function(err, newdoc) {
                // Send any errors to the browser
                if (err) {
                    res.send(err);
                }
                // Or send the newdoc to the browser
                else {
                    res.redirect("/");
                }
            })

        }
    });


});

app.post("/comments", function(req, res) {


    Article.find({
            "_id": req.body.tid
        })
        // ..and populate all of the notes associated with it
        .populate("comment")
        // now, execute our query
        .exec(function(error, doc) {
            var hbsObject = {
                data: doc[0]
            };
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                console.log(doc[0].comment)
                res.render("comments", hbsObject);
            }
        });



});




// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});

mongoose.connect("mongodb://heroku_15cwths1:j0305mb0nbelu6cnjer3vrevr2@ds115583.mlab.com:15583/heroku_15cwths1")