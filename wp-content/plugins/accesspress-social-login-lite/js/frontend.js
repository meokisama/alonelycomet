jQuery(document).ready( function($){
	"use strict";
	$('.show-apsl-container').on('click', function(e){
        e.preventDefault();
        $('.apsl-container').slideToggle();
    });
});