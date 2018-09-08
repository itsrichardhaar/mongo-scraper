var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    // `title` is required and of type String
    title: {
      type: String,
      required: true
    },
    // `link` is required and of type String
    link: {
      type: String,
      required: true
    },
    // `note` is an object that stores a Note id
    // The ref property links the ObjectId to the Note model
    // This allows us to populate the Article with an associated Note
    note: {
      type: Schema.Types.ObjectId,
      ref: "Note"
    }
  });

  var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;