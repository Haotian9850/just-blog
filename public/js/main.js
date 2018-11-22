//use jQuery
$(function(){
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');         //init CKEDITOR
    }

    $('a.confirmDeletion').on('click', function(e){
        if(!confirm('Do you really want to delete this page?')){
            return false;   //if no confirmation for deletion, a page will not be deleted eventually
        }
    });
});