var express = require('express');
var router = express.Router();

//import Category model
var Category = require('../models/category');

/*
* GET category index
 */
router.get('/', function(req, res){
    Category.find(function(err, categories){
        if(err) return console.log(err);
        res.render('admin/categories', {
            categories : categories
        });
    });
});

/*
* GET add category
 */
router.get('/add-page', function(req, res){
    var title = "";

    res.render('admin/add_category', {
        title: title
    });
});

/*
* POST add category
 */
router.post('/add-category', function(req, res){
    //validate title and content
    req.checkBody('title', 'Title must have a value').notEmpty();

    var title = req.body.title; //body parser
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var errors = req.validationErrors();

    if(errors){
        res.render('admin/add_category', {
            errors: errors,
            title: title,
        });
    }else{
        //make sure slug is unique
        Page.findOne({slug: slug}, function(err, page){
            if(category){
                req.flash('danger', 'Category title exists, please choose another!');
                res.render('admin/add_category', {
                    title: title
                });
            }else{
                var category = new Category({
                    title: title,
                    slug: slug
                });

                //save new category
                category.save(function(err){
                    if(err){
                        return console.log(err);
                    }
                    res.flash('success', 'New Category added!');
                    res.redirect('/admin/categories');
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
 * GET edit category
 */
router.get('/edit-category/:id', function(req, res){
    Category.findById(req.params.id, function(err, category){
        if(err){
            return console.log(err);
        }
        res.render('admin/edit_category', {
            title: category.title,
            id: category_id
        });
    });
});

/*
* POST edit page
 */
router.post('/edit-page/:slug', function(req, res){
    //validate title and content
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title; //body parser
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();   //replace all spaces with dash
    if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var content = req.body.content; 
    var errors = req.validationErrors();
    var id = req.body.id;

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
                        res.redirect('/admin/edit-page/' + page.slug);
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



