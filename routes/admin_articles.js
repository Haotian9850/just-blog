var express = require('express');
var router = express.Router();
var mkddirp = require('mkdirp');
var fs = require('fs-extrea');
var resizeImg = require('resize-img');


//import article model
var Article = require('../models/article');
//import category model
var Category = require('../models/category');


/*
* GET article index
 */
router.get('/', function(req, res){
    var count;
    Article.count(function(err, c){
        count = c;
    });

    //find all
    Article.find(function(err, article){
        res.render('admin/articles', {
            aticles: articles,
            count: count
        });
    });
})

/*
* GET add article
 */
router.get('/add-article', function(req, res){
    var title = "";
    var summary = "";
    var content = "";

    Category.find(function(err, categories){
        res.render('admin/add_article', {
            //print variable in the view
            title: title,
            summary = summary,
            category = categories,
            content: content
        });
    });
});

/*
* POST add article
 */
router.post('/add-article', function(req, res){

    var imageFile = typeof req.files.image !== "undefined" ? imageFile = req.files.image.name : "";


    //validate title and content
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('summary', 'Summary must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title; //body parser
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();   //replace all spaces with dash
    if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var summary = req.body.summary;
    var category = req.body.category;


    var content = req.body.content; 
    var errors = req.validationErrors();

        if(errors){
            Category.find(function(err, categories){
                res.render('admin/add_article', {
                    //print variable in the view
                    title: title,
                    summary: summary,
                    category: categories,
                    content: content
            });
        });
    }else{
        //make sure slug is unique
        Article.findOne({slug: slug}, function(err, article){
            if(article){
                //we have a problem...
                req.flash('danger', 'Article title already exists. Choose another.');   //for BS msg styling
                Category.find(function(err, categories){
                    res.render('admin/add_article', {
                        //print variable in the view
                        title: title,
                        summary: summary,
                        category: categories,
                        content: content
                    });
                });
            }else{
                //all good. save article to database
                var article = new Article({
                    //save fields
                    title: title,
                    slug: slug,
                    content: content,
                    summary: summary,
                    image: imageFile
                });
                article.save(function(err){
                    if(err) return console.log(err);

                    //create image folder
                    mkdirp('public/product_images/' + product._id, function(err){
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function(err){
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id, + '/gallery/thumbs', function(err){
                        return console.log(err);
                    });

                    //check imageFile
                    if(imageFile != ""){
                        var articleImage = req.files.image;
                        var path = 'public/product_image/' + product._id + '/' + imageFile;

                        productImage.mv(path, function(err){
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'New article added!');    //for BS msg styling
                    res.redirect('/admin/articles');
                });
            }
        });

    }

    res.render('admin/add_page', {
        //print variable in the view
        title: title,
        slug: slug,
        content: content
    })
})

/*
* POST reorder pages
 */
router.post('/reorder-pages', function(req, res){
    var ids = req.body['id[]'];
    var count = 0;
    for(var i = 0; i < ids.length; ++ i){
        var id = ids[i];
        ++ count;
        
        (function(count){
            Page.findById(id, function(err, page){
                page.sorting = count;
                page.save(function(err){
                    return console.log(err);
                });
            });
        })(count);
    }
});


/*
 * GET edit page
 */
router.get('/edit-page/:id', function(req, res) {
    Page.findById(req.params.id, function(err, page){
        if(err){
            return console.log(err);
        }
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,    //will not be necessary...
            content: page.content,
            id: page._id
        });
    });
});

/*
* POST edit page
 */
router.post('/edit-page/:id', function(req, res){
    //validate title and content
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title; //body parser
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();   //replace all spaces with dash
    if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var content = req.body.content; 
    var errors = req.validationErrors();
    var id = req.params.id;
    if(errors){
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    }else{
        //make sure slug is unique
        Page.findOne({slug: slug, _id: {'$ne':id}}, function(err, page){
            if(page){
                //we have a problem...
                req.flash('danger', 'Page slug already exists. Choose another.');   //for BS msg styling
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            }else{
                Page.findById(id, function(err, page){
                    if(err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    //update page and save it to database
                    page.save(function(err){
                        if(err) return console.log(err);
                        req.flash('success', 'Page added!');    //for BS msg styling
                        res.redirect('/admin/edit-page/' + id);
                    });
                });

            }
        });

    }

    res.render('admin/add_page', {
        //print variable in the view
        title: title,
        slug: slug,
        content: content
    })
})

/*
* GET delete page
 */
router.get('/delete/page/:id', function(req, res){
    //get all pages from database
    Page.findByIdAndRemove(req.params.id, function(err){
        if(err) return console.log(err);
        req.flash('success', 'Page deleted!');    //for BS msg styling
        res.redirect('/admin/pages/');
    });
})

//exports
module.exports = router;



