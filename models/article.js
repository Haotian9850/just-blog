var mongoose = require('mongoose');

//article schema
var ArticleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    },
    summary: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    sorting: {
        type: Number,
    },
    image: {
        type: String,   //image url
    }
});

//prepare model for routes
var Article = module.exports = mongoose.model('Article', ArticleSchema);
