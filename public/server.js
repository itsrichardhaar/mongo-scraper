var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");


var db = require("./models");

var PORT = 3000;
var app = express();


app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


mongoose.connect('mongodb://localhost/mongoosescraper');
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('Mongoose Error: ', err);
});
db.once('open', function () {
    console.log('Mongoose connection successful.');
});

// Routes


app.get("/scrape", function(req, res) {
	request("https://www.nytimes.com/section/world", function(error, response, html) {
		var $ = cheerio.load(html);
		var result = {};
		$("div.story-body").each(function(i, element) {
			var link = $(element).find("a").attr("href");
			var title = $(element).find("h2.headline").text().trim();
			var summary = $(element).find("p.summary").text().trim();
			var img = $(element).parent().find("figure.media").find("img").attr("src");
			result.link = link;
			result.title = title;
			if (summary) {
				result.summary = summary;
			};
			if (img) {
				result.img = img;
			}
			else {
				result.img = $(element).find(".wide-thumb").find("img").attr("src");
			};
			var entry = new Article(result);
			Article.find({title: result.title}, function(err, data) {
				if (data.length === 0) {
					entry.save(function(err, data) {
						if (err) throw err;
					});
				}
			});
		});
		console.log("Scrape finished.");
		res.redirect("/");
	});
});

app.get("/articles", function (req, res) {

    db.Article.find({})
        .then(function (dbArticle) {

            res.json(dbArticle);
        })
        .catch(function (err) {

            res.json(err);
        });
});


app.get("/articles/:id", function (req, res) {

    db.Article.findOne({ _id: req.params.id })

        .populate("note")
        .then(function (dbArticle) {

            res.json(dbArticle);
        })
        .catch(function (err) {

            res.json(err);
        });
});


app.post("/articles/:id", function (req, res) {

    db.Note.create(req.body)
        .then(function (dbNote) {

            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {

            res.json(dbArticle);
        })
        .catch(function (err) {

            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});