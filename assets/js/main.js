/*
Theme Name: Balti
Description: Bootstrap Coming Soon Template
Author: Erilisdesign
Theme URI: https://preview.erilisdesign.com/html/balti/
Author URI: https://themeforest.net/user/erilisdesign
Version: 1.0.0
License: https://themeforest.net/licenses/standard
*/

/*------------------------------------------------------
[Table of contents]

1. Loader
2. Website slider
3. Navigation
4. Back to top
5. Layout resize
6. Backgrounds
7. Lightbox
8. Countdown
9. Subscribe Form
10. Contact Form
11. Bootstrap
12. Typed text
13. Slider
14. AOS
------------------------------------------------------*/

(function($){
  "use strict";

  // Vars
  var $html = $('html'),
    $body = $('body'),
    sideAnimaionRun = false,
    $siteMenuToggler = $('.menu-toggler'),
    $siteMenuBody = $('.site-menu-body'),
    $btn_backToTop = $('.btn-back-to-top'),
    $btn_close = $('.btn-close'),
    homeContentID = $('.home-content').attr('id'),
    $sideContent = $('.side-content'),
    $sideContentInner = $('.side-content-inner');

  function getWindowWidth(){
    return Math.max($(window).width(), window.innerWidth);
  }

  function getWindowHeight(){
    return Math.max($(window).height(), window.innerHeight);
  }

  function getDocumentWidth(){
    return Math.max($(document).width(), document.body.clientWidth);
  }

  function setOverflowScroll(){
    var html = document.documentElement;
    var body = document.body;
    var measureDiv = document.createElement('div');
    measureDiv.className = 'body-overflow-measure';
    body.appendChild(measureDiv);
    if ( ( window.getComputedStyle(html).overflowY !== 'visible' && window.getComputedStyle(html).overflowY !== 'hidden' ) && html.scrollHeight > html.clientHeight ){
      html.style.overflowY = 'scroll';
    } else if ( ( window.getComputedStyle(body).overflowY !== 'visible' && window.getComputedStyle(body).overflowY !== 'hidden' ) && body.scrollHeight > body.clientHeight ){
      body.style.overflowY = 'scroll';
    }
    body.removeChild(measureDiv);
  }
  setOverflowScroll();

  // [1. Loader]
  window.addEventListener( 'load', function(){
    document.querySelector('body').classList.add('loaded');
  });

  // [2. Website layout]
  function website_layout(){
    if ( !$sideContent.length > 0 )
      return;

    if ( sideAnimaionRun )
      return;

    if ( getWindowWidth() >= 992 ){
      var height = parseInt( $sideContentInner.innerHeight(), 10 );

      if ( $sideContent.hasClass('show') ){
        $sideContent.css( 'height', height );
      } else {
        $sideContent.css( 'height', getWindowHeight() );
      }

      setTimeout( function(){
        $body.addClass('side-layout');
      }, 20 );
    } else {
      $body.removeClass('side-content-opened side-layout scrolled scrolled-0');
      $btn_close.removeClass('show');
      $sideContent.removeClass('show');
      $sideContent.css( 'height', '' );
      $('.sidenav li a').removeClass('active');
      $('.sidenav a[href="'+homeContentID+'"]').addClass('active');

	  var currentPos = $(window).scrollTop();

      if ( currentPos > 0 ){
        balti_navChangeClasses('resize');
      } else {
        balti_navChangeClasses();
      }
    }
  }

  function website_showTarget(target){
    if ( !$(target).length > 0 )
      return;

    if ( getWindowWidth() >= 992 ){
      if ( sideAnimaionRun )
        return;

      if ( $( target ).hasClass('home-content') ){
        sideAnimaionRun = true;

        $body.removeClass('side-content-opened');
        $btn_close.removeClass('show');
        $btn_backToTop.removeClass('show');
        $sideContent.removeClass('show');
        $('.sidenav li a').removeClass('active');
        $('.sidenav a[href="'+target+'"]').addClass('active');
        balti_navChangeClasses();
        setTimeout(function(){
          $(window).scrollTop(0);
          $sideContent.css( 'height', getWindowHeight() );
          sideAnimaionRun = false;
        }, 820);
      } else if ( $sideContent.hasClass('show') && $( target ).length > 0 && $sideContent.find(target).length > 0 ){
        var targetPosition = parseInt( Math.max( document.querySelector(target).offsetTop, $(target).offset().top ), 10 );

        smoothScroll(targetPosition);
        $(this).blur();
      } else {
        sideAnimaionRun = true;

        var height = parseInt( $sideContentInner.innerHeight(), 10 );

        $(window).scrollTop(0);
        $body.addClass('side-content-opened');
        $btn_close.addClass('show');
        $sideContent.addClass('show');
        $sideContent.css( 'height', height );
        $('.sidenav li a').removeClass('active');
        $('.sidenav a[href="'+target+'"]').addClass('active');
        balti_navChangeClasses('side-content');

        var targetPosition = parseInt( Math.max( document.querySelector(target).offsetTop, $(target).offset().top ), 10 );

        if ( targetPosition === 0 && $(window).scrollTop() === 0 ){
          sideAnimaionRun = false;
        } else {
          setTimeout(function(){
            smoothScroll(targetPosition);
            sideAnimaionRun = false;
          }, 800);
        }
      }
    } else {
      var targetPosition = parseInt( Math.max( document.querySelector(target).offsetTop, $(target).offset().top ), 10 );

      smoothScroll(targetPosition);
      $(this).blur();
    }
  }

  function website_showFirstTarget(){
    if ( !$sideContent.length > 0 )
      return;

    var windowHash = window.location.hash ? window.location.hash : '';

    if ( windowHash !== '#' && windowHash !== '#!' && $(windowHash).length > 0 ){
      website_showTarget(windowHash);
    }
  }

  // [3. Navigation]
  function balti_navigation(){

    // Clickable Links
    $(document).on( 'click', 'a.scrollto, .site-menu a[href^="#"]', function(e){
      var target;

      // Make sure this.hash has a value before overriding default behavior
      if ( this.hash !== '' && this.hash !== '#!' && $( this.hash ).length > 0 ){
        target = this.hash;
      } else {
        return false;
      }

      if ( target !== '' ){
        // Prevent default anchor click behavior
        e.preventDefault();

        if ( $( target ).length > 0 && $sideContent.length > 0 && getWindowWidth() >= 992 ){
          website_showTarget(target);

          $(this).blur();
        } else {
          var targetPosition = parseInt( Math.max( document.querySelector(target).offsetTop, $(target).offset().top ), 10 );

          smoothScroll(targetPosition);
          $(this).blur();
        }
      }

      return false;
    });

    // Back to top
    $(document).on( 'click', '.btn-back-to-top', function(e){
      e.preventDefault();

      smoothScroll(0);

      $(this).blur();
    });

    // Menu toggler
    $(document).on( 'click', '.menu-toggler', function(e){
      e.preventDefault();

      if ( !$siteMenuToggler.hasClass('open') ){
        $siteMenuToggler.addClass('open');
        $siteMenuBody.addClass('show');
      } else {
        $siteMenuToggler.removeClass('open');
        $siteMenuBody.removeClass('show');
      }

      $(this).blur();
    });

    // Close menu on click outside of '.site-menu'
    $(document).on( 'click touchstart', function(e){
      if ( $siteMenuBody.is(e.target) || $(e.target).closest('.site-menu').hasClass('site-menu') || $(e.target).hasClass('menu-toggler') ){
        return;
      }

      if ( $siteMenuToggler.hasClass('open') ){
        $siteMenuToggler.removeClass('open');
        $siteMenuBody.removeClass('show');
      }
    });

  }

  function balti_navOnScroll(){
    var currentPos = $(window).scrollTop();

    if ( currentPos > 0 ){
      if ( $body.hasClass('scrolled') ){
        return;
      }

      $body.addClass('scrolled').removeClass('scrolled-0');
      balti_navChangeClasses('scrolled');
    } else {
      $body.removeClass('scrolled').addClass('scrolled-0');
      if ( $body.hasClass('side-content-opened') ){
        balti_navChangeClasses('side-content');
      } else {
        balti_navChangeClasses();
      }
    }
  }

  var nav_event_old;
  function balti_navChangeClasses(nav_event){
    if ( nav_event_old === nav_event && !( nav_event == '' || nav_event == undefined || nav_event == 'resize' ) )
      return;

    var currentPos = $(window).scrollTop();

    if ( nav_event === 'scrolled' || ( nav_event === 'resize' && currentPos > 0 ) ){
      $('[data-menu-scrolled]').each(function(){
        if( $(this).hasClass('site-logo') && $body.hasClass('side-content-opened') )
          return;

        $(this).removeClass( $(this).attr('data-menu-base'), $(this).attr('data-menu-side-content') );
        $(this).addClass( $(this).attr('data-menu-scrolled') );
	  });
    } else if ( nav_event === 'side-content' ){
      $('[data-menu-side-content]').each(function(){
        $(this).removeClass( $(this).attr('data-menu-base'), $(this).attr('data-menu-scrolled') );
        $(this).addClass( $(this).attr('data-menu-side-content') );
	  });
    } else {
      $('[data-menu-scrolled]').each(function(){
        $(this).removeClass( $(this).attr('data-menu-scrolled') );
	  });
      $('[data-menu-side-content]').each(function(){
        $(this).removeClass( $(this).attr('data-menu-side-content') );
	  });
      $('[data-menu-base]').each(function(){
        $(this).addClass( $(this).attr('data-menu-base') );
	  });
    }

    nav_event_old = nav_event;
  }

  function smoothScroll(targetPosition){
    $(window).scrollTo(targetPosition,800);
  }

  // [4. Back to top]
  function balti_backToTop(){
    if ( $btn_backToTop.length > 0 ){
      var currentPos = $(window).scrollTop();
      if ( $body.hasClass('flyer-animated') ){
        currentPos = $flyerInner.scrollTop();
      }

      if ( currentPos > 400 ){
        $btn_backToTop.addClass('show');
      } else {
        $btn_backToTop.removeClass('show');
      }
    }
  }

  // [6. Backgrounds]
  function balti_backgrounds(){

    // Image
    var $bgImage = $('.bg-image-holder');
    if ($bgImage.length){
      $bgImage.each(function(){
        var $self = $(this);
        var src = $self.children('img').attr('src');

        $self.css('background-image','url('+src+')').children('img').hide();
      });
    }

    // Video Background
    if ( $body.hasClass('mobile') ){
      $('.video-wrapper').css('display','none');
    }

  }

  // [7. Lightbox]
  function balti_lightbox(){
    if (!$().featherlight){
      console.log('Featherlight: featherlight not defined.');
      return true;
    }

    $.extend($.featherlight.defaults, {
      closeIcon: '<i class="fas fa-times"></i>'
    });

    $.extend($.featherlightGallery.defaults, {
      previousIcon: '<i class="fas fa-chevron-left"></i>',
      nextIcon: '<i class="fas fa-chevron-right"></i>'
    });

    $.featherlight.prototype.afterOpen = function(){
      $body.addClass('featherlight-open');
    };

    $.featherlight.prototype.afterContent = function(){
      var title = this.$currentTarget.attr('data-title');
      var text = this.$currentTarget.attr('data-text');

      if ( !title && !text )
        return;

      this.$instance.find('.caption').remove();

      var title = title ? '<h4 class="title-gallery">' + title + '</h4>' : '',
        text = text ? '<p class="text-gallery">' + text + '</p>' : '';

      $('<div class="caption">').html( title + text ).appendTo(this.$instance.find('.featherlight-content'));
    };

    $.featherlight.prototype.afterClose = function(){
      $body.removeClass('featherlight-open');
    };
  }

  // [8. Countdown]
  function balti_countdown(){
    var countdown = $('.countdown[data-countdown]');

    if (countdown.length > 0){
      countdown.each(function(){
        var $countdown = $(this),
          finalDate = $countdown.data('countdown');
        $countdown.countdown(finalDate, function(event){
          $countdown.html(event.strftime(
            '<div class="countdown-container row"> <div class="col-6 col-sm-auto"><div class="countdown-item"><div class="number">%-D</div><span class="title">Day%!d</span></div></div><div class="col-6 col-sm-auto"><div class="countdown-item"><div class="number">%H</div><span class="title">Hours</span></div></div><div class="col-6 col-sm-auto"><div class="countdown-item"><div class="number">%M</div><span class="title">Minutes</span></div></div><div class="col-6 col-sm-auto"><div class="countdown-item"><div class="number">%S</div><span class="title">Seconds</span></div></div></div>'
          ));
        });
      });
    }
  }

  // [9. Subscribe Form]
  function balti_subscribeForm(){
    var $subscribeForm = $('.subscribe-form');

    if ( $subscribeForm.length > 0 ){
      $subscribeForm.each( function(){
        var el = $(this),
          elResult = el.find('.subscribe-form-result');

        el.find('form').validate({
          submitHandler: function(form) {
            elResult.fadeOut( 500 );

            $(form).ajaxSubmit({
              target: elResult,
              dataType: 'json',
              resetForm: true,
              success: function( data ) {
                elResult.html( data.message ).fadeIn( 500 );
                if ( data.alert != 'error' ) {
                  $(form).clearForm();
                  setTimeout(function(){
                    elResult.fadeOut( 500 );
                  }, 5000);
                };
              }
            });
          }
        });

      });
    }
  }

  // [10. Contact Form]
  function balti_contactForm(){
    var $contactForm = $('.contact-form');

    if ( $contactForm.length > 0 ){
      $contactForm.each( function(){
        var el = $(this),
          elResult = el.find('.contact-form-result');

        el.find('form').validate({
          showErrors: function(errorMap, errorList) {
            this.defaultShowErrors();

            website_layout();
          },
          submitHandler: function(form) {
            elResult.fadeOut( 500 );

            $(form).ajaxSubmit({
              target: elResult,
              dataType: 'json',
              success: function( data ) {
                elResult.html( data.message ).fadeIn( 500 );
                website_layout();
                if ( data.alert != 'error' ) {
                  $(form).clearForm();
                  setTimeout(function(){
                    elResult.fadeOut( 500 );
                    website_layout();
                  }, 5000);
                };
              }
            });
          }
        });

      });
    }
  }

  // [11. Bootstrap]
  function balti_bootstrap(){

    // Botostrap Tootltips
    $('[data-toggle="tooltip"]').tooltip();

    // Bootstrap Popovers
    $('[data-toggle="popover"]').popover();

  }

  // [12. Typed text]
  function balti_typedText(){
    var toggle = document.querySelectorAll('[data-toggle="typed"]');

    function init(el) {
      var elementOptions = el.dataset.options;
          elementOptions = elementOptions ? JSON.parse(elementOptions) : {};
      var defaultOptions = {
        typeSpeed: 40,
        backSpeed: 40,
        backDelay: 3000,
        loop: true
      }
      var options = Object.assign(defaultOptions, elementOptions);

      new Typed(el, options);
    }

    if (typeof Typed !== 'undefined' && toggle) {
      [].forEach.call(toggle, function(el) {
        init(el);
      });
    }

  }

  // [13. Slider]
  function balti_slider() {
    var $slider = $('.slider');

    if ($slider.length > 0){

      if ( !$slider.hasClass('slick-initialized') ){
        $slider.slick({
          slidesToShow: 1,
          infinite: true,
          nextArrow: '<button type="button" class="slick-next"><i class="fas fa-angle-right"></i></button>',
          prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-angle-left"></i></button>'
        });
      }

      if ( 1199 >= getWindowWidth() && $slider.hasClass('slick-initialized') && $slider.hasClass('slick-destroy-xl') ){
        $slider.slick('unslick');
      }

      if ( 991 >= getWindowWidth() && $slider.hasClass('slick-initialized') && $slider.hasClass('slick-destroy-lg') ){
        $slider.slick('unslick');
      }

      if ( 767 >= getWindowWidth() && $slider.hasClass('slick-initialized') && $slider.hasClass('slick-destroy-md') ){
        $slider.slick('unslick');
      }

      if ( 575 >= getWindowWidth() && $slider.hasClass('slick-initialized') && $slider.hasClass('slick-destroy-sm') ){
        $slider.slick('unslick');
      }

    }
  }

  // [14. AOS]
  function balti_aos(){
    if( $('[data-aos]').length > 0 ){
      AOS.init();
    }
  }

  $(document).ready(function($){
    $(window).scrollTop(0);
    website_layout();

    balti_navigation();
    balti_navOnScroll();
    balti_backToTop();
    balti_backgrounds();
    balti_lightbox();
    balti_countdown();
    balti_subscribeForm();
    balti_contactForm();
    balti_bootstrap();
    balti_typedText();
    balti_slider();
    balti_aos();
  });

  $(window).on( 'scroll', function(){
    balti_navOnScroll();
    balti_backToTop();
  });

  var clear_website_layout;

  window.addEventListener( 'load', function(){
    website_layout();
    website_showFirstTarget();
  });

  $(window).on('resize', function(){
    balti_navOnScroll();
    balti_backToTop();
    balti_slider();

    clear_website_layout = setTimeout( website_layout(), 20 );
  });

})(jQuery);