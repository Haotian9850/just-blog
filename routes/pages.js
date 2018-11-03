var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    res.render('index',{
        title: 'Home'
    });   //render diles in /_layouts
})

//exports
module.exports = router;



