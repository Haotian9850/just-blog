var express = require('express');
var router = express.Router();

//import page model
var Page = require('../models/page');

/*
* GET pages index
 */
router.get('/', function(req, res){
    //get all pages from database
    Page.find({}).sort({sorting: 1}).exec(function(err, pages){     //ascending order
        res.render('admin/pages', {
            pages: pages
        })
    });
})

/*
* GET add page
 */
router.get('/add-page', function(req, res){
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        //print variable in the view
        title: title,
        slug: slug,
        content: content
    });
});

/*
* POST add page
 */
router.post('/add-page', function(req, res){
    //validate title and content
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title; //body parser
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();   //replace all spaces with dash
    if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var content = req.body.content; 
    var errors = req.validationErrors();

    if(errors){
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    }else{
        //make sure slug is unique
        Page.findOne({slug: slug}, function(err, page){
            if(page){
                //we have a problem...
                req.flash('danger', 'Page slug already exists. Choose another.');   //for BS msg styling
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            }else{
                //save page to database
                var page = new Page({
                    //save fields
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function(err){
                    if(err) return console.log(err);
                    req.flash('success', 'Page added!');    //for BS msg styling
                    res.redirect('/admin/pages');
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
router.get('/edit-page/:slug', (req, res) => {
    Page.findOne({slug : req.params.slug}).then((page) => {
      if(!page) { //if page not exist in db
        return res.status(404).send('Page not found');
      }
      res.render('admin/edit_page', { //page  exist
        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id
      });
    }).catch((e) => {//bad request 
      res.status(400).send(e);
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


//exports
module.exports = router;



