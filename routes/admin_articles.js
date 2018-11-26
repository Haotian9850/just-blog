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
 * GET edit article
 */
router.get('/edit-product/:id', function(req, res){

    var errors; //errors array

    if(req.session.errors){
        errors = req.session.errors;
    }
    req.session.errors = null;  //default, if no error
    
    Category.find(function(err, categories){

        //find a particular article
        Article.find(req.params.id, function(err, a){
            if(err){
                console.log(err);
                res.redirect('/admin/articles');
            }else{
                //get gallery
                var glalleryDir = 'public/article_images/' + a._id + '/gallery';
                var galleryImages = null;
                
                fs.readdir(galleryDir, function(err, files){
                    if(err){
                        console.log(err);
                    }else{
                        galleryImages = files;
                        //render the view
                        res.render('admin/edit_product', {
                            title: a.title,
                            errors: errors,
                            summary: a.summary,
                            categories: categories,
                            category: a.category.replace(/\s+/g, '-').toLowerCase(),  //replace all spaces with -
                            image: a.image,
                            galleryImages: galleryImages,
                            id: a._id
                        });
                    }
                });
            } 
        });
    });

});

/*
* POST edit article
 */
router.post('/edit-product/:id', function(req, res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('summary', 'Summary must have a value.').notEmpty();
    req.checkBody('image', 'You must upload at least one image to continue').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var summary = req.body.summary;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errrors = req.validationErrors();

    if(errors){
        req.session.errors = errors;
        res.redirect('/admin/articles/edit-article' + id);
    }else{
        Article.findOne({slug: slug, _id:{'$ne': id}}, function(err, a){
            if(err){
                console.log(err);
            }
            if(a){
                req.flash('danger', 'Article title already exists. Please choose another');
                res.redirect('/admin/products/edit-product/' + id);
            }else{
                Article.findById(id, function(Err, a){
                    if(err){
                        console.log(err);
                    }

                    a.title = title;
                    a.slug = slug;
                    a.summary = summary;
                    a.category = category;
                    if(imageFile != ""){
                        //update
                        a.image = imageFile;
                    }
                    a.save(function(err){
                        if(err){
                            console.log(err);
                        }
                        if(imageFile != ""){
                            if(aimage != ""){
                                fs.remove('public/article_images/' + id + '/' + aimage, function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                });
                            }

                            var articleImage = req.files.image;
                            var path = 'public/article_images/' + article._id + '/' + imageFile;

                            articleImage.mv(path, function(err){
                                return console.log(err);
                            });
                        }

                        //success!
                        req.flash('success', 'New article added!');
                        res.redirect('/admin/articles');
                    });
                });
            }
        });
    }
});

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



