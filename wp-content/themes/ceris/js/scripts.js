var ATBS = ATBS || {};

(function($){

    // USE STRICT
    "use strict";

    var $window = $(window);
    var $document = $(document);
    var $goToTopEl = $('.js-go-top-el');
    var $overlayBg = $('.js-overlay-bg');
    $(".single-body").fitVids();
    
    ATBS.header = {

        init: function(){
            ATBS.header.pageBlockHeadingInit();
            ATBS.header.pagiButton();
            ATBS.header.ajaxSearch();
            ATBS.header.ajaxMegamenu();
            ATBS.header.loginForm();
            ATBS.header.offCanvasMenu();
            ATBS.header.priorityNavInit();
            ATBS.header.searchToggle();
            ATBS.header.smartAffix.init({
                fixedHeader: '.js-sticky-header',
                headerPlaceHolder: '.js-sticky-header-holder',
            });
            ATBS.header.smartFooterInfo.init({
                fixedFooter: '.js-sticky-article-info',
            });
        },
        
        pageBlockHeadingInit: function(){
            if($('.site-wrapper').hasClass('ceris-block-heading-loading')) {
                $('.site-wrapper').removeClass('ceris-block-heading-loading');
            }
        },
        /* ============================================================================
         * Fix sticky navbar padding when open modal
         * ==========================================================================*/
        stickyNavbarPadding: function() {
            var oldSSB = $.fn.modal.Constructor.prototype.setScrollbar;
            var $stickyHeader = $('.sticky-header .navigation-bar');

            $.fn.modal.Constructor.prototype.setScrollbar = function () 
            {
                oldSSB.apply(this);
                if(this.bodyIsOverflowing && this.scrollbarWidth) 
                {
                    $stickyHeader.css('padding-right', this.scrollbarWidth);
                }       
            }

            var oldRSB = $.fn.modal.Constructor.prototype.resetScrollbar;
            $.fn.modal.Constructor.prototype.resetScrollbar = function () 
            {
                oldRSB.apply(this);
                $stickyHeader.css('padding-right', '');
            }
        },

        /* ============================================================================
         * Header dropdown search
         * ==========================================================================*/
        searchToggle: function() {
            var $headerSearchDropdown = $('#header-search-dropdown');
            var $searchDropdownToggle = $('.js-search-dropdown-toggle');
            var $mobileHeader = $('#atbs-ceris-mobile-header');
            var $stickyHeaderNav = $('#atbs-ceris-sticky-header').find('.navigation-bar__inner');
            var $staticHeaderNav = $('.site-header').find('.navigation-bar__inner');
            var $headerSearchDropdownInput = $headerSearchDropdown.find('.search-form__input');

            $headerSearchDropdown.on('click', function(e) {
                e.stopPropagation();
            });

            $searchDropdownToggle.on('click', function(e) {
                e.stopPropagation();
                var $toggleBtn = $(this);
                var position = '';
                

                if ($toggleBtn.hasClass('mobile-header-btn')) {
                    position = 'mobile';
                } else if ($toggleBtn.parents('.sticky-header').length) {
                    position = 'sticky';
                } else {
                    position = 'navbar';
                }

                if ($headerSearchDropdown.hasClass('is-in-' + position) || !$headerSearchDropdown.hasClass('is-active')) {
                    $headerSearchDropdown.toggleClass('is-active');
                }

                switch(position) {
                    case 'mobile':
                        if (!$headerSearchDropdown.hasClass('is-in-mobile')) {
                            $headerSearchDropdown.addClass('is-in-mobile');
                            $headerSearchDropdown.removeClass('is-in-sticky');
                            $headerSearchDropdown.removeClass('is-in-navbar');
                            $headerSearchDropdown.appendTo($mobileHeader);
                        }
                        break;

                    case 'sticky':
                        if (!$headerSearchDropdown.hasClass('is-in-sticky')) {
                            $headerSearchDropdown.addClass('is-in-sticky');
                            $headerSearchDropdown.removeClass('is-in-mobile');
                            $headerSearchDropdown.removeClass('is-in-navbar');
                            $headerSearchDropdown.insertAfter($stickyHeaderNav);
                        }
                        break;

                    default:
                        if (!$headerSearchDropdown.hasClass('is-in-navbar')) {
                            $headerSearchDropdown.addClass('is-in-navbar');
                            $headerSearchDropdown.removeClass('is-in-sticky');
                            $headerSearchDropdown.removeClass('is-in-mobile');
                            $headerSearchDropdown.insertAfter($staticHeaderNav);
                        }
                }
                
                if ($headerSearchDropdown.hasClass('is-active')) {
                    setTimeout(function () {
                        $headerSearchDropdownInput.focus();
                    }, 200);
                }
            });

            $document.on('click', function(event) {
                switch (event.which) {
                    case 1:
                        $headerSearchDropdown.removeClass('is-active');
                        break;
                    default:
                        break;
                }
            });

            $window.on('stickyHeaderHidden', function(){
                if ($headerSearchDropdown.hasClass('is-in-sticky')) {
                    $headerSearchDropdown.removeClass('is-active');
                }
            });
        },
        /* ============================================================================
         * AJAX search
         * ==========================================================================*/
        ajaxSearch: function() {
            var $results = '';
            var $ajaxSearch = $('.js-ajax-search');
            var ajaxStatus = '';
            var noResultText = '<span class="noresult-text">There is no result.</span>';
            var errorText = '<span class="error-text">There was some error.</span>';

            $ajaxSearch.each(function() {
                var $this = $(this);
                var $searchForm = $this.find('.search-form__input');
                var $resultsContainer = $this.find('.search-results');
                var $resultsInner = $this.find('.search-results__inner');
                var searchTerm = '';
                var lastSearchTerm = '';

                $searchForm.on('input', $.debounce(800, function() {
                    searchTerm = $searchForm.val();

                    if (searchTerm.length > 0) {
                        $resultsContainer.addClass('is-active');
                        $('.atbs-ceris-search-full').addClass("active");

                        if ((searchTerm != lastSearchTerm) || (ajaxStatus === 'failed' )) {
                            $resultsContainer.removeClass('is-error').addClass('is-loading');
                            lastSearchTerm = searchTerm;
                            ajaxLoad(searchTerm, $resultsContainer, $resultsInner);
                        }
                    } else {
                        $resultsContainer.removeClass('is-active');
                    }
                }));
            });

            function ajaxLoad(searchTerm, $resultsContainer, $resultsInner) {
                var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];   
                var ajaxCall = $.ajax({
                        url: ajaxurl,
                        type: 'post',
                        dataType: 'html',
                        data: {
                            action: 'ceris_ajax_search',
                            searchTerm: searchTerm,
                            securityCheck: cerisAjaxSecurity,
                        },
                    });

                ajaxCall.done(function(respond) {
                    $results = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if (!$results.length) {
                        $results = noResultText;
                    }
                    $resultsInner.html($results).css('opacity', 0).animate({opacity: 1}, 500);  
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                    $resultsContainer.addClass('is-error');
                    $results = errorText;
                    $resultsInner.html($results).css('opacity', 0).animate({opacity: 1}, 500);  
                });

                ajaxCall.always(function() {
                    $resultsContainer.removeClass('is-loading');
                });
            }
        },

        /* ============================================================================
         * Megamenu Ajax
         * ==========================================================================*/
        ajaxMegamenu: function() {
            var $results = '';
            var $subCatItem = $('.atbs-ceris-mega-menu ul.sub-categories > li');
            $subCatItem.on('click',function(e) {
              e.preventDefault();
                var $this = $(this);
                if($(this).hasClass('active')) {
                    return;
                }
                
                $(this).parents('.sub-categories').find('li').removeClass('active');
                
                var $container = $this.parents('.atbs-ceris-mega-menu__inner').find('.posts-list');
                var $thisCatSplit = $this.attr('class').split('-');
                var thisCatID = $thisCatSplit[$thisCatSplit.length - 1];
                var megaMenuStyle = 0;
                
                $container.append('<div class="bk-preload-wrapper"></div>');
                $container.find('article').addClass('bk-preload-blur');
            
                if($container.hasClass('megamenu-1st-large')) {
                    megaMenuStyle = 2;
                }else if($container.hasClass('megamenu-style-3')) {
                    megaMenuStyle = 3;
                }else {
                    megaMenuStyle = 1;
                }
                
                $this.addClass('active');
                
                var $htmlRestore = ajax_buff['megamenu'][thisCatID]['html'];
                
                //console.log($htmlRestore);
                if($htmlRestore == '') {
                    ajaxLoad(thisCatID, megaMenuStyle, $container);
                }else {
                    ajaxRestore($container, thisCatID, $htmlRestore);
                }
            });
            function ajaxLoad(thisCatID, megaMenuStyle, $container) {
                var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];   
                var ajaxCall = {
                    action: 'ceris_ajax_megamenu',
                    thisCatID: thisCatID,
                    megaMenuStyle : megaMenuStyle,
                    securityCheck: cerisAjaxSecurity
                };
                
                $.post(ajaxurl, ajaxCall, function (response) {
                    $results = $.parseJSON(response);
                    //Save HTML
                    ajax_buff['megamenu'][thisCatID]['html'] = $results;
                    // Append Result
                    $container.html($results).css('opacity', 0).animate({opacity: 1}, 500); 
                    $container.find('.bk-preload-wrapper').remove();
                    $container.find('article').removeClass('bk-preload-blur');
                });    
            }
            function ajaxRestore($container, thisCatID, $htmlRestore) {
                // Append Result
                $container.html($htmlRestore).css('opacity', 0).animate({opacity: 1}, 500); 
                $container.find('.bk-preload-wrapper').remove();
                $container.find('article').removeClass('bk-preload-blur'); 
            }
        },
        
        /* ============================================================================
         * Ajax Button
         * ==========================================================================*/
        pagiButton: function() {
            var $dotNextTemplate = '<span class="atbs-ceris-pagination__item atbs-ceris-pagination__dots atbs-ceris-pagination__dots-next">&hellip;</span>';
            var $dotPrevTemplate = '<span class="atbs-ceris-pagination__item atbs-ceris-pagination__dots atbs-ceris-pagination__dots-prev">&hellip;</span>';
            var $buttonTemplate = '<a class="atbs-ceris-pagination__item" href="#">##PAGENUMBER##</a>';
            var $dotIndex_next;
            var $dotIndex_prev;
            var $pagiAction;
            var $results = '';
            
            $('body').on('click', '.atbs-ceris-module-pagination .atbs-ceris-pagination__links > a', function(e) {
                e.preventDefault();
                var $this = $(this);
                if(($this.hasClass('disable-click')) || $this.hasClass('atbs-ceris-pagination__item-current')) 
                    return;
                
                var $pagiChildren = $this.parent().children();
                var $totalPageVal = parseInt($($pagiChildren[$pagiChildren.length - 2]).text());
                var $lastIndex = $this.parent().find('.atbs-ceris-pagination__item-current').index();
                var $lastPageVal = parseInt($($pagiChildren[$lastIndex]).text());
                
                var $nextButton = $this.parent().find('.atbs-ceris-pagination__item-next');
                var $prevButton = $this.parent().find('.atbs-ceris-pagination__item-prev');
                
                // Save the last active button 
                var $lastActiveButton = $this.parent().find('.atbs-ceris-pagination__item-current');
                // Save the last page
                var $lastActivePage = $this.parent().find('.atbs-ceris-pagination__item-current');
                
                // Add/Remove current class
                $this.siblings().removeClass('atbs-ceris-pagination__item-current');
                if($this.hasClass('atbs-ceris-pagination__item-prev')) {
                    $lastActivePage.prev().addClass('atbs-ceris-pagination__item-current');
                }else if($this.hasClass('atbs-ceris-pagination__item-next')) {
                    $lastActivePage.next().addClass('atbs-ceris-pagination__item-current');
                }else {
                    $this.addClass('atbs-ceris-pagination__item-current');
                }
                
                var $currentActiveButton = $this.parent().find('.atbs-ceris-pagination__item-current');
                var $currentIndex = $this.parent().find('.atbs-ceris-pagination__item-current').index();
                var $currentPageVal = parseInt($($pagiChildren[$currentIndex]).text());

                if($currentPageVal == 1) {
                    $($prevButton).addClass('disable-click');
                    $($nextButton).removeClass('disable-click');
                }else if($currentPageVal == $totalPageVal) {
                    $($prevButton).removeClass('disable-click');
                    $($nextButton).addClass('disable-click');
                }else {
                    $($prevButton).removeClass('disable-click');
                    $($nextButton).removeClass('disable-click');
                }
                
                if($totalPageVal > 5) {
                    
                    if($this.parent().find('.atbs-ceris-pagination__dots').hasClass('atbs-ceris-pagination__dots-next')) {
                        $dotIndex_next = $this.parent().find('.atbs-ceris-pagination__dots-next').index();
                    }else {
                        $dotIndex_next = -1;
                    }
                    if($this.parent().find('.atbs-ceris-pagination__dots').hasClass('atbs-ceris-pagination__dots-prev')) {
                        $dotIndex_prev = $this.parent().find('.atbs-ceris-pagination__dots-prev').index();
                    }else {
                        $dotIndex_prev = -1;
                    }
                    
                    if(isNaN($currentPageVal)) {
                        if($this.hasClass('atbs-ceris-pagination__item-prev')) {
                            $currentPageVal = parseInt($($pagiChildren[$currentIndex + 1]).text()) - 1;
                        }else if($this.hasClass('atbs-ceris-pagination__item-next')) {
                            $currentPageVal = parseInt($($pagiChildren[$currentIndex - 1]).text()) + 1;
                        }else {
                            return;
                        }
                        
                    }
                    
                    if($currentPageVal > $lastPageVal) {
                        $pagiAction = 'up';
                    }else {
                        $pagiAction = 'down';
                    }
                    
                    if(($pagiAction == 'up')) {
                        if(($currentIndex == ($dotIndex_next - 1)) || ($currentIndex == $dotIndex_next) || ($currentPageVal == $totalPageVal)) {
                            
                            $this.parent().find('.atbs-ceris-pagination__dots').remove();                 //Remove ALL Dot Signal
                            
                            if($currentIndex == $dotIndex_next) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal))).insertAfter($lastActiveButton);
                                $lastActiveButton.next().addClass('atbs-ceris-pagination__item-current');
                                $currentActiveButton = $this.parent().find('.atbs-ceris-pagination__item-current');
                            }
                            
                            while(parseInt(($this.parent().find('a:nth-child(3)')).text()) != $currentPageVal) {
                                $this.parent().find('a:nth-child(3)').remove();       //Remove 1 button before
                            }
                            
                            $($dotPrevTemplate).insertBefore($currentActiveButton);                 //Insert Dot Next             
                            
                            if(($currentPageVal < ($totalPageVal - 3))) {
                                $($dotNextTemplate).insertAfter($currentActiveButton);              //Insert Dot Prev
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 2))).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            }else if(($currentPageVal < ($totalPageVal - 2))) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 2))).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            }
                            else if(($currentPageVal < ($totalPageVal - 1))) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            }
                            if($currentPageVal == $totalPageVal) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 3))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }else if($currentPageVal == ($totalPageVal - 1)) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }else if($currentPageVal == ($totalPageVal - 2 )) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                        }
                    }else if($pagiAction == 'down') {
                        if(($currentIndex == ($dotIndex_prev + 1)) || ($currentIndex == $dotIndex_prev) || (($currentPageVal == 1) && ($currentIndex < $dotIndex_prev))) {
                            
                            $this.parent().find('.atbs-ceris-pagination__dots').remove();                 //Remove ALL Dot Signal
    
                            if($currentIndex == $dotIndex_prev) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal))).insertBefore($lastActiveButton);
                                $lastActiveButton.prev().addClass('atbs-ceris-pagination__item-current');
                                $currentActiveButton = $this.parent().find('.atbs-ceris-pagination__item-current');
                                while(parseInt($this.parent().find('a:nth-child('+($currentIndex + 2)+')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child('+($currentIndex + 2)+')').remove();       //Remove 1 button before
                                }
                            }else if(($currentPageVal == 1) && ($currentIndex < $dotIndex_prev)) {
                                while(parseInt($this.parent().find('a:nth-child('+($currentIndex + 2)+')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child('+($currentIndex + 2)+')').remove();       //Remove 1 button before
                                }
                            }else {
                                while(parseInt($this.parent().find('a:nth-child('+($currentIndex + 1)+')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child('+($currentIndex + 1)+')').remove();       //Remove 1 button before
                                }
                            }
                            $($dotNextTemplate).insertAfter($currentActiveButton);                  //Insert Dot After
        
                            if($currentPageVal > 4) {                                               // <- 1 ... 5 6 7 ... 10 -> 
                                $($dotPrevTemplate).insertBefore($currentActiveButton);              //Insert Dot Prev
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }else if($currentPageVal > 3) {                                         // <- 1 ... 4 5 6 ... 10 -> 
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                            else if($currentPageVal > 2) {                                          // <- 1 ... 3 4 5 ... 10 -> 
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                            if($currentPageVal == 1) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 3)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 2)).insertAfter($currentActiveButton);
                            }else if($currentPageVal == 2) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 3)).insertAfter($currentActiveButton);
                            }else if($currentPageVal == 3) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                            }
                        }
                    }
                }
                if($currentPageVal != 1) {
                    $this.siblings('.atbs-ceris-pagination__item-prev').css('display', 'inline-block');
                }else {
                    if($this.hasClass('atbs-ceris-pagination__item-prev')) {
                        $this.css('display', 'none');
                    }else {
                        $this.siblings('.atbs-ceris-pagination__item-prev').css('display', 'none');
                    }
                }
                if($currentPageVal == $totalPageVal) {
                    if($this.hasClass('atbs-ceris-pagination__item-next')) {
                        $this.css('display', 'none');
                    }else {
                        $this.siblings('.atbs-ceris-pagination__item-next').css('display', 'none');
                    }
                }else {
                    $this.siblings('.atbs-ceris-pagination__item-next').css('display', 'inline-block');
                }
                if($this.closest('.atbs-ceris-module-pagination').hasClass('ceris-user-review-pagination')) {
                    ATBS.ATBS_CustomerReview.reviewPagination($this, $currentPageVal);
                }else {
                    ajaxListing($this, $currentPageVal);   
                }
            });
            function ajaxListing($this, $currentPageVal) {
                var $moduleID = $this.closest('.atbs-ceris-block').attr('id');
                var moduleName = $moduleID.split("-")[0];
                var args = ajax_buff['query'][$moduleID]['args'];
                
                if(moduleName == 'ceris_author_results') {
                    var postOffset = ($currentPageVal-1)*args['number'] + parseInt(args['offset']);
                    var $container = $this.closest('.atbs-ceris-block').find('.authors-list');
                    var moduleInfo = '';
                }else {
                    var postOffset = ($currentPageVal-1)*args['posts_per_page'] + parseInt(args['offset']);
                    var $container = $this.closest('.atbs-ceris-block').find('.posts-list');
                    var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];    
                }
                
                var parameters = {
                        moduleName: moduleName,
                        args: args,
                        moduleInfo: moduleInfo,
                        postOffset: postOffset,
                    };
                //console.log(parameters);
                $container.css('height', $container.height()+'px');
                $container.append('<div class="bk-preload-wrapper"></div>');
                $container.find('article').addClass('bk-preload-blur');
                
                loadAjax(parameters, $container);
                
                var $mainCol = $this.parents('.atbs-ceris-main-col');
                if($mainCol.length > 0) {
                    var $subCol = $mainCol.siblings('.atbs-ceris-sub-col');
                    $subCol.css('min-height', '1px');
                }                
                
                var $scrollTarget = $this.parents('.atbs-ceris-block');
                $('body,html').animate({
                    scrollTop: $scrollTarget.offset().top,
                }, 1100);
                
                setTimeout(function(){ $container.css('height', 'auto'); }, 1100);
                
            }
            function loadAjax(parameters, $container){
                //console.log(parameters.moduleName);
                var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
                
                var ajaxCall = {
                    action: parameters.moduleName,
                    args: parameters.args,
                    moduleInfo: parameters.moduleInfo,
                    postOffset: parameters.postOffset,
                    securityCheck: cerisAjaxSecurity
                };
                
                //console.log(ajaxCall);
                $.post(ajaxurl, ajaxCall, function (response) {
                    $results = $.parseJSON(response);
                    //Save HTML
                    // Append Result
                    $container.html($results).css('opacity', 0).animate({opacity: 1}, 500); 
                    $container.find('.bk-preload-wrapper').remove();
                    $container.find('article').removeClass('bk-preload-blur');
                    ATBS.ATBS_Bookmark.reAddBookmark($container);
                });   
            }
            function checkStickySidebar($this){
                var $subCol = $this.parents('.atbs-ceris-main-col').siblings('.atbs-ceris-sub-col');
                if($subCol.hasClass('js-sticky-sidebar')) {
                    return $subCol;
                }else {
                    return 0;
                }
            }
        },
        
        /* ============================================================================
         * Login Form tabs
         * ==========================================================================*/
        loginForm: function() {
            var $loginFormTabsLinks = $('.js-login-form-tabs').find('a');

            $loginFormTabsLinks.on('click', function (e) {
                e.preventDefault()
                $(this).tab('show');
            });
        },

        
        /* ============================================================================
         * Offcanvas Menu
         * ==========================================================================*/
        offCanvasMenu: function() {
            var $backdrop = $('<div class="atbs-ceris-offcanvas-backdrop"></div>');
            var $offCanvas = $('.js-atbs-ceris-offcanvas');
            var $offCanvasToggle = $('.js-atbs-ceris-offcanvas-toggle');
            var $offCanvasClose = $('.js-atbs-ceris-offcanvas-close');
            var $offCanvasMenuHasChildren = $('.navigation--offcanvas').find('li.menu-item-has-children > a');
            var menuExpander = ('<div class="submenu-toggle"><i class="mdicon mdicon-expand_more"></i></div>');
            var check_show_more = false;

            $backdrop.on('click', function(){
                var button_hide =  $offCanvas.find('.btn-nav-show_full i');
                $(this).fadeOut(0, function(){
                    $(this).detach();
                });
                var check_show_full = $offCanvas;
                if($(check_show_full).hasClass('show-full')){
                    $(check_show_full).removeClass('animation');
                    setTimeout(function () {
                        $(check_show_full).removeClass('show-full');
                        $(check_show_full).removeClass('is-active');
                    },400);
                }
                else{
                    $(check_show_full).removeClass('show-full');
                    $(check_show_full).removeClass('is-active');
                }
                setTimeout(function () {
                    $(check_show_full).removeClass('animation');
                    $(check_show_full).removeClass('show-full');
                    $(check_show_full).removeClass('is-active');
                },400);
                check_show_more = false;
                button_hide.attr('class','mdicon mdicon-chevron-thin-right');
            });
            $offCanvasToggle.on('click', function(e){
                var check_show_full = $offCanvas;
                e.preventDefault();
                var targetID = $(this).attr('href');
                var $target = $(targetID);
                $target.toggleClass('is-active');
                $backdrop.hide().appendTo(document.body).fadeIn(200);
            });
            $offCanvasClose.on('click', function(e){
                e.preventDefault();
                // var targetID = $(this).attr('href');
                // var $target = $(targetID);
                // $target.removeClass('is-active');
                var button_hide =  $offCanvas.find('.btn-nav-show_full i');
                $backdrop.fadeOut(200, function(){
                    $(this).detach();
                });
                check_show_more = false;
                var check_show_full = $offCanvas;
                if($(check_show_full).hasClass('show-full')){
                    $(check_show_full).removeClass('animation');
                    setTimeout(function () {
                        $(check_show_full).removeClass('show-full');
                        $(check_show_full).removeClass('is-active');
                    },400);
                }
                else{
                    $(check_show_full).removeClass('show-full');
                    $(check_show_full).removeClass('is-active');
                }
                button_hide.attr('class','mdicon mdicon-chevron-thin-right');
            });
            $offCanvasMenuHasChildren.append(function() {
                return $(menuExpander).on('click', function(e){
                    e.preventDefault();
                    var $subMenu = $(this).parent().siblings('.sub-menu');
                    $subMenu.slideToggle(200);
                });
            });
            $(window).on('resize',function (e) {
                var checkExist = setInterval(function() {
                    var elementPC = $('#atbs-ceris-offcanvas-primary');
                    var elementMB = $('#atbs-ceris-offcanvas-mobile');
                    if(elementPC.hasClass('is-active') ){
                        var checkDisplay = elementPC.css('display');
                        if(checkDisplay == 'none' ){
                            $backdrop.css('display','none');
                            clearInterval(checkExist);
                        }
                    }
                    if(elementMB.hasClass('is-active')) {
                        var checkDisplay = elementMB.css('display');
                        if( checkDisplay == 'none'){
                            $backdrop.css('display','none');
                            clearInterval(checkExist);
                        }
                    }
                    if(elementPC.hasClass('is-active')  && elementPC.css('display') != 'none' || elementMB.hasClass('is-active')  && elementMB.css('display') != 'none'){
                        $backdrop.css('display','block');
                        clearInterval(checkExist);
                    }
                    clearInterval(checkExist);
                }, 100); // check every 100ms
            });
            var btn_show_more = $('.btn-nav-show_full');
            $(btn_show_more).click(function () {
                var $this = $(this).parents('.atbs-ceris-offcanvas');
                var button_hide =  $(this).find('i');
                $(this).fadeOut(500);
                if( check_show_more == false){
                    // $($this).animate({'width':'1420px'},500);
                    $($this).addClass('animation');
                    setTimeout(function () {
                        $($this).addClass("show-full");
                        button_hide.attr('class','mdicon mdicon-chevron-thin-left');
                        $(btn_show_more).fadeIn(50);
                    },600);
                    check_show_more = true;
                }
                else {
                    $($this).removeClass("show-full");
                    $(this).fadeOut(1000);
                    setTimeout(function () {
                        // $($this).animate({'width':'530px'},500);
                        $($this).removeClass('animation');
                        $(btn_show_more).fadeIn(50);
                         button_hide.attr('class','mdicon mdicon-chevron-thin-right');
                    },200);
                    check_show_more = false;
                   
                }
            });
        },
        /* ============================================================================
         * Prority+ menu init
         * ==========================================================================*/
        priorityNavInit: function() {
            var $menus = $('.js-priority-nav');
            $menus.each(function() {
                ATBS.priorityNav($(this));
            })
        },

        /* ============================================================================
         * Smart sticky header
         * ==========================================================================*/
        smartAffix: {
            //settings
            $headerPlaceHolder: '', //the affix menu (this element will get the mdAffixed)
            $fixedHeader: '', //the menu wrapper / placeholder
            isDestroyed: false,
            isDisabled: false,
            isFixed: false, //the current state of the menu, true if the menu is affix
            isShown: false,
            windowScrollTop: 0, 
            lastWindowScrollTop: 0, //last scrollTop position, used to calculate the scroll direction
            offCheckpoint: 0, // distance from top where fixed header will be hidden
            onCheckpoint: 0, // distance from top where fixed header can show up
            breakpoint: 992, // media breakpoint in px that it will be disabled

            init : function init (options) {

                //read the settings
                this.$fixedHeader = $(options.fixedHeader);
                this.$headerPlaceHolder = $(options.headerPlaceHolder);

                // Check if selectors exist.
                if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length ) {
                    this.isDestroyed = true;
                } else if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length || ( ATBS.documentOnResize.windowWidth <= ATBS.header.smartAffix.breakpoint ) ) { // Check if device width is smaller than breakpoint.
                    this.isDisabled = true;
                }

            },// end init

            compute: function compute(){
                if (ATBS.header.smartAffix.isDestroyed || ATBS.header.smartAffix.isDisabled) {
                    return;
                }

                // Set where from top fixed header starts showing up
                if( !this.$headerPlaceHolder.length ) {
                    this.offCheckpoint = 400;
                } else {
                    this.offCheckpoint = $(this.$headerPlaceHolder).offset().top + 400;
                }
                
                this.onCheckpoint = this.offCheckpoint + 500;

                // Set menu top offset
                this.windowScrollTop = ATBS.documentOnScroll.windowScrollTop;
                if (this.offCheckpoint < this.windowScrollTop) {
                    this.isFixed = true;
                }
            },
            
            updateState: function updateState() {
                //update affixed state
                if (this.isFixed) {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.addClass('is-fixed');
                    }
                } else {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.removeClass('is-fixed');
                    }
                    $window.trigger('stickyHeaderHidden');
                }

                if (this.isShown) {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.addClass('is-shown');
                    }
                } else {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.removeClass('is-shown');
                    }
                }
            },

            /**
             * called by events on scroll
             */
            eventScroll: function eventScroll(scrollTop) {

                var scrollDirection = '';
                var scrollDelta = 0;

                // check the direction
                if (scrollTop != this.lastWindowScrollTop) { //compute direction only if we have different last scroll top

                    // compute the direction of the scroll
                    if (scrollTop > this.lastWindowScrollTop) {
                        scrollDirection = 'down';
                    } else {
                        scrollDirection = 'up';
                    }

                    //calculate the scroll delta
                    scrollDelta = Math.abs(scrollTop - this.lastWindowScrollTop);
                    this.lastWindowScrollTop = scrollTop;

                    // update affix state
                    if (this.offCheckpoint < scrollTop) {
                        this.isFixed = true;
                    } else {
                        this.isFixed = false;
                    }
                    
                    // check affix state
                    if (this.isFixed) {
                        // We're in affixed state, let's do some check
                        if ((scrollDirection === 'down') && (scrollDelta > 14)) {
                            if (this.isShown) {
                                this.isShown = false; // hide menu
                            }
                        } else {
                            if ((!this.isShown) && (scrollDelta > 14) && (this.onCheckpoint < scrollTop)) {
                                this.isShown = true; // show menu
                            }
                        }
                    } else {
                        this.isShown = false;
                    }

                    this.updateState(); // update state
                }
            }, // end eventScroll function

            /**
            * called by events on resize
            */
            eventResize: function eventResize(windowWidth) {
                // Check if device width is smaller than breakpoint.
                if ( ATBS.documentOnResize.windowWidth < ATBS.header.smartAffix.breakpoint ) {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                    ATBS.header.smartAffix.compute();
                }
            }
        },
        
        smartFooterInfo: {
            //settings
            $fixedFooter: '', //the menu wrapper / placeholder
            isDestroyed: false,
            isDisabled: false,
            isFixed: false, //the current state of the menu, true if the menu is affix
            isShown: false,
            windowScrollTop: 0, 
            lastWindowScrollTop: 0, //last scrollTop position, used to calculate the scroll direction
            offCheckpoint: 0, // distance from top where fixed header will be hidden
            onCheckpoint: 0, // distance from top where fixed header can show up
            breakpoint: 992, // media breakpoint in px that it will be disabled

            init : function init (options) {
                //read the settings
                this.$fixedFooter = $(options.fixedFooter);
            },// end init

            compute: function compute(){
                if (ATBS.header.smartFooterInfo.isDestroyed || ATBS.header.smartFooterInfo.isDisabled) {
                    return;
                }

                this.offCheckpoint = 400;
                
                this.onCheckpoint = this.offCheckpoint + 500;

                // Set menu top offset
                this.windowScrollTop = ATBS.documentOnScroll.windowScrollTop;
                if (this.offCheckpoint < this.windowScrollTop) {
                    this.isFixed = true;
                }
            },

            updateState: function updateState(){
                //update affixed state
                if (this.isFixed) {
                    this.$fixedFooter.addClass('is-fixed');
                } else {
                    this.$fixedFooter.removeClass('is-fixed');
                    //$window.trigger('stickyHeaderHidden');
                }
                //var reading_indicator =  $('.scroll-count-percent');
                //var siteHeaderOffsetTop = $('.site-header').first().offset().top;
                if (this.isShown) {
                    this.$fixedFooter.addClass('is-shown');
                    /*reading_indicator.each( function() {
                        $(this).css({'top': $('.sticky-header').height() + (siteHeaderOffsetTop + 60)+ 'px' });
                    });*/
                } else {
                    this.$fixedFooter.removeClass('is-shown');
                    /*reading_indicator.each( function() {
                        $(this).css({'top': $('.sticky-header').height() + (siteHeaderOffsetTop) + 'px' });
                    });*/
                }
            },

            /**
             * called by events on scroll
             */
            eventScroll: function eventScroll(scrollTop) {

                var scrollDirection = '';
                var scrollDelta = 0;

                // check the direction
                if (scrollTop != this.lastWindowScrollTop) { //compute direction only if we have different last scroll top

                    // compute the direction of the scroll
                    if (scrollTop > this.lastWindowScrollTop) {
                        scrollDirection = 'down';
                    } else {
                        scrollDirection = 'up';
                    }

                    //calculate the scroll delta
                    scrollDelta = Math.abs(scrollTop - this.lastWindowScrollTop);
                    this.lastWindowScrollTop = scrollTop;

                    // update affix state
                    if (this.offCheckpoint < scrollTop) {
                        this.isFixed = true;
                    } else {
                        this.isFixed = false;
                    }
                    //console.log(this);
                    // check affix state
                    if (this.isFixed) {
                        // We're in affixed state, let's do some check
                        if ((scrollDirection === 'down') && (scrollDelta > 14)) {
                            if (!this.isShown) {
                                this.isShown = true; // hide menu
                            }
                        } else {
                            if ((this.isShown) && (scrollDelta > 14) && (this.onCheckpoint < scrollTop)) {
                                this.isShown = false; // show menu
                            }
                        }
                    } else {
                        this.isShown = false;
                    }

                    this.updateState(); // update state
                }
            }, // end eventScroll function

            /**
            * called by events on resize
            */
            eventResize: function eventResize(windowWidth) {
                ATBS.header.smartFooterInfo.compute();
            }
        },
    };

    ATBS.documentOnScroll = {
        ticking: false,
        windowScrollTop: 0, //used to store the scrollTop

        init: function() {
            window.addEventListener('scroll', function(e) {
                if (!ATBS.documentOnScroll.ticking) {
                    window.requestAnimationFrame(function() {
                        ATBS.documentOnScroll.windowScrollTop = $window.scrollTop();

                        // Functions to call here
                        if (!ATBS.header.smartAffix.isDisabled && !ATBS.header.smartAffix.isDestroyed) {
                            ATBS.header.smartAffix.eventScroll(ATBS.documentOnScroll.windowScrollTop);
                        }
                        
                        ATBS.header.smartFooterInfo.eventScroll(ATBS.documentOnScroll.windowScrollTop);

                        ATBS.documentOnScroll.goToTopScroll(ATBS.documentOnScroll.windowScrollTop);

                        ATBS.documentOnScroll.ticking = false;
                    });
                }
                ATBS.documentOnScroll.ticking = true;
            });
        },

        /* ============================================================================
         * Go to top scroll event
         * ==========================================================================*/
        goToTopScroll: function(windowScrollTop){
            if ($goToTopEl.length) {
                if(windowScrollTop > 800) {
                    if (!$goToTopEl.hasClass('is-active')) $goToTopEl.addClass('is-active');
                } else {
                    $goToTopEl.removeClass('is-active');
                }
            }
        },
        /* ============================================================================
         * INFINITY AJAX load more posts
         * ==========================================================================*/
        infinityAjaxLoadPost: function() {
            var loadedPosts = '';
            var $ajaxLoadPost = $('.infinity-ajax-load-post');
            var $this;
    
            function ajaxLoad(parameters, postContainer) {
                var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
                var ajaxStatus = '',
                    ajaxCall = $.ajax({
                        url: ajaxurl,
                        type: 'post',
                        dataType: 'html',
                        data: {
                            action: parameters.action,
                            args: parameters.args,
                            postOffset: parameters.postOffset,
                            type: parameters.type,
                            moduleInfo: parameters.moduleInfo,
                            securityCheck: cerisAjaxSecurity
                            // other parameters
                        },
                    });
                ajaxCall.done(function(respond) {
                    loadedPosts = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if(loadedPosts == 'no-result') {
                        postContainer.closest('.infinity-ajax-load-post').addClass('disable-infinity-load');
                        postContainer.closest('.infinity-ajax-load-post').find('.js-ajax-load-post-trigger').addClass('hidden');
                        postContainer.closest('.infinity-ajax-load-post').find('.ceris-no-more-button').removeClass('hidden');
                        return;
                    }
                    if (loadedPosts) {
                        var elToLoad = $(loadedPosts).css('opacity',0).animate({'opacity': 1}, 400);
                        postContainer.append(elToLoad);
                        ATBS.ATBS_Bookmark.reAddBookmark(postContainer);                                                
                    }
                    $('html, body').animate({ scrollTop: $window.scrollTop() + 1 }, 0).animate({ scrollTop: $window.scrollTop() - 1 }, 0); // for recalculating of sticky sidebar
                    // do stuff like changing parameters
                });
    
                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                });
    
                ajaxCall.always(function() {
                    postContainer.closest('.infinity-ajax-load-post').removeClass('ceris_loading');
                    postContainer.closest('.infinity-ajax-load-post').removeClass('infinity-disable');
                });
            }
            function ajaxLoadInfinitiveScroll(){
                $ajaxLoadPost.each(function(index) {
                    $this = $(this);
               
                    var triggerElement = $this.find('.js-ajax-load-post-trigger');
                    
                    var top_of_element = triggerElement.offset().top;
                    var bottom_of_element = triggerElement.offset().top + triggerElement.outerHeight();
                    var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
                    var top_of_screen = $(window).scrollTop();
                    
                    
                    if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
                        if($this.hasClass('infinity-disable') || $this.hasClass('disable-infinity-load'))
                            return;
                                
                        $this.addClass('infinity-disable');
                        
                        var $moduleID = $this.closest('.atbs-ceris-block').attr('id');
                        var moduleName = $moduleID.split("-")[0];
                        var args = ajax_buff['query'][$moduleID]['args'];
    
                        var postContainer = $this.find('.posts-list');
                        var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];
    
                        $this.addClass('ceris_loading');
    
                        var postOffset      = parseInt(args['offset']) + $this.find('article').length;
         
                        if($this.closest('.atbs-ceris-block').hasClass('ceris_latest_blog_posts')) {
                            var stickPostLength = args['post__not_in'].length;
                            postOffset = postOffset - stickPostLength;
                        }
                        var parameters = {
                            action: moduleName,
                            args: args,
                            postOffset: postOffset,
                            type: 'loadmore',
                            moduleInfo: moduleInfo,
                        };
                        ajaxLoad(parameters, postContainer);
                        
                    }
                });
            }
            
            $(window).on('scroll', $.debounce(250, ajaxLoadInfinitiveScroll));
        },
        
        //single Scrolling 
        /* ============================================================================
         * Single INFINITY AJAX Load Posts
         * ==========================================================================*/
        infinityAjaxLoadSinglePost: function() {
            var ajaxLoadPost = $('.single-infinity-scroll');
            var nextArticlePopup = $('.single-next-article-info-popup');
            var currentArticleInfo = $('.header-current-reading-article');
            var $this;
            function ajaxLoad(parameters, postContainer) {
                var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
                var ajaxStatus = '',
                    ajaxCall = $.ajax({
                        url: parameters.postURLtoLoad,
                        type: "GET",
                        dataType: "html"
                    });
                ajaxCall.done(function(respond) {
                    if (respond) {
                        var elToLoad = $($(respond).find('.single-infinity-container').html()).css('opacity',0).animate({'opacity': 1}, 400);
                        var adsRandomCode = $(respond).find('.single-infinity-container').parents('.ceris-dedicated-single-header').data('infinity-ads');
                        postContainer.append(adsRandomCode);
                        postContainer.append(elToLoad);
                        
                        setTimeout(function() {
                            var $stickySidebar = $(postContainer).children().last().find('.js-sticky-sidebar');
                            var $stickyHeader = $('.js-sticky-header');
            
                            var marginTop = ($stickyHeader.length) ? ($stickyHeader.outerHeight() + 20) : 0; // check if there's sticky header
            
                            if ( $( document.body ).hasClass( 'admin-bar' ) ) // check if admin bar is shown.
                                marginTop += 32;
            
                            if ( $.isFunction($.fn.theiaStickySidebar) ) {
                                $stickySidebar.theiaStickySidebar({
                                    additionalMarginTop: marginTop,
                                    additionalMarginBottom: 20,
                                });
                            }
                            
                            //React
                            
                            var reactions = $(postContainer).children().last().find('.js-atbs-reaction');
                            ATBS.ATBS_reaction.atbs_reaction(reactions);
                            
                            // Remove Ajax Load
                            var postURLnextLoad = postContainer.find('.single-infinity-inner').last().data('url-to-load');
                            if((typeof postURLnextLoad == 'undefined') || (postURLnextLoad == '')) {
                                $('.infinity-single-trigger').remove();
                            }
                            
                        }, 250); // wait a bit for precise height;   
                        // Run Photorama
                        setTimeout(function() {
                            var galleryPhotorama = $(postContainer).children().last().find('.fotorama');
                            if(galleryPhotorama.length > 0) {
                              $(galleryPhotorama).fotorama();
                            }
                            
                        }, 250); // wait a bit for precise height;   
                          
                        // js blur single
                        var overlayBackgroundSingle = $(postContainer).children().find('.js-overlay-bg');
                        
                        if (overlayBackgroundSingle.length) {
                            overlayBackgroundSingle.each(function() {
                                
                                var $mainArea = $(this).find('.js-overlay-bg-main-area');
                                if (!$mainArea.length) {
                                    $mainArea = $(this);
                                }
                
                                var $subArea = $(this).find('.js-overlay-bg-sub-area');
                                var $subBg = $(this).find('.js-overlay-bg-sub');
                
                                var leftOffset = $mainArea.offset().left - $subArea.offset().left;
                                var topOffset = $mainArea.offset().top - $subArea.offset().top;
                
                                $subBg.css('display', 'block');
                                $subBg.css('position', 'absolute');
                                $subBg.css('width', $mainArea.outerWidth() + 'px');
                                $subBg.css('height', $mainArea.outerHeight() + 'px');
                                $subBg.css('left', leftOffset + 'px');
                                $subBg.css('top', topOffset + 'px');
                            });
                        };
                          
                        // do stuff like changing parameters
                        var $postSliderSidebar = $(postContainer).children().last().find('.js-atbs-ceris-carousel-1i-loopdot');
    
                        $postSliderSidebar.each( function() {
                            $(this).owlCarousel({
                                items: 1,
                                margin: 0,
                                loop: true,
                                nav: true,
                                dots: true,
                                autoHeight: true,
                                navText: ['<i class="mdicon mdicon-chevron-thin-left"></i>', '<i class="mdicon mdicon-chevron-thin-right"></i>'],
                                smartSpeed: 500,
                                responsive: {
                                    0 : {
                                        items: 1,
                                    },
            
                                },
                            });
                        });    
                    
                        // Review
                        var reviews_rating_score = $(postContainer).children().last().find('.reviews-score-list');
                        ATBS.ATBS_CustomerReview.reviewScoreList(reviews_rating_score); 
                        
                        var reviews_rating_star = $(postContainer).children().last().find('.reviews-rating');
                        ATBS.ATBS_CustomerReview.reviewRatingStarIcon(reviews_rating_star);     
                        
                        var userReviewContents = $(postContainer).children().last().find('.ceris-user-review-content');
                        ATBS.ATBS_CustomerReview.reviewReadmoreInit(userReviewContents);
                        
                        var reader_review_form = $(postContainer).children().last().find('.rating-form');
                        ATBS.ATBS_CustomerReview.userReviewFormSubmit(reader_review_form);
                        
                        var closeReviewPopup_1 = $(postContainer).children().last().find('.btn-close-review-popup');
                        var closeReviewPopup_2 = $(postContainer).children().last().find('.btn-close-review-normal');                        
                        ATBS.ATBS_CustomerReview.popupThankyouPanel(closeReviewPopup_1, closeReviewPopup_2);

                        currentArticleInfoUpdate();
                        nextArticlePopupInfo();                                                
                    }
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                });
                ajaxCall.always(function() {
                    $this.removeClass('infinity-disable');      
                    var triggerElement = $this.find('.infinity-single-trigger');
                    if(!triggerElement.length) {
                        return
                    }
                    //ATBS.ajaxLazyload.lazyload_start();
                });
            }
            function nextArticlePopupInfo(){                
                var elemnt_scroll  = $('.element-scroll-percent');
                elemnt_scroll.each( function() {
                    var thisELScroll = $(this);
                    var theJourney = $(window).scrollTop() - thisELScroll.offset().top;
                    if((theJourney > 0) && (theJourney <= thisELScroll.height())) {
                        var nextPostTitletoLoad = thisELScroll.data('post-title-to-load');
                        if(theJourney > (thisELScroll.height() - $(window).height())) {
                            nextArticlePopup.addClass('atbs-force-hidden');
                        }else {
                            if((nextArticlePopup.hasClass('atbs-force-hidden')) && (nextPostTitletoLoad != '')) {
                                nextArticlePopup.removeClass('atbs-force-hidden');
                            }
                        }
                        if(nextPostTitletoLoad != '') {
                            var currentPostTitleText = $.trim(nextArticlePopup.find('.post__title').html());
                            if((nextPostTitletoLoad !== currentPostTitleText) || (currentPostTitleText == '')) {
                                var wcntPerMin;
                                if(typeof ceris_wcount !== 'undefined'){
                                    wcntPerMin = ceris_wcount[0];                                    
                                }else {
                                    wcntPerMin = 130;
                                }
                                var postWPM = parseInt(thisELScroll.data('next-wcount')/wcntPerMin) + 1;
                                nextArticlePopup.find('.post__title').text(nextPostTitletoLoad); 
                                nextArticlePopup.find('span.ceris-article-wpm').text(postWPM);
                                nextArticlePopup.find('.post__title').unbind();
                                nextArticlePopup.find('.post__title').on('click',function(e) {
                                    e.preventDefault();
                                    $('body,html').animate({
                                        scrollTop: thisELScroll.offset().top + thisELScroll.height(),
                                    }, 800);
                                });   
                                nextArticlePopup.removeClass('atbs-force-hidden');
                            }
                        }else {
                            nextArticlePopup.addClass('atbs-force-hidden');
                        }
                    }
                });
            }
            function currentArticleInfoUpdate() {
                var elemnt_scroll  = $('.element-scroll-percent');
                elemnt_scroll.each( function() {
                    var thisELScroll = $(this);
                    var theJourney = $(window).scrollTop() - thisELScroll.offset().top;
                    if((theJourney > 0) && (theJourney <= thisELScroll.height())) {
                        
                        var currentReadingPostTitle = $.trim($(currentArticleInfo.find('h5')).html());
                        var currentPostTitleText = $.trim(thisELScroll.find('header.single-header').find('h1.post__title').html());
                        currentArticleInfo.find('h5').unbind();
                        currentArticleInfo.find('h5').on('click',function(e) {
                            e.preventDefault();
                            $('body,html').animate({
                                scrollTop: thisELScroll.offset().top - 70,
                            }, 800);
                        });   
                        if((currentReadingPostTitle !== currentPostTitleText) || (currentReadingPostTitle == '')) {
                            var wcntPerMin;
                            if(typeof ceris_wcount !== 'undefined'){
                                wcntPerMin = ceris_wcount[0];                                    
                            }else {
                                wcntPerMin = 130;
                            }
                            var postWPM = parseInt(thisELScroll.data('wcount')/wcntPerMin) + 1;
                            currentArticleInfo.find('h5').text(currentPostTitleText); 
                            currentArticleInfo.find('span.ceris-article-wpm').text(postWPM);
                            currentArticleInfo.find('h5').unbind();
                            currentArticleInfo.find('h5').on('click',function(e) {
                                e.preventDefault();
                                $('body,html').animate({
                                    scrollTop: thisELScroll.offset().top - 70,
                                }, 800);
                            });   
                        }
                    }
                });
            }
            function ajaxLoadInfinitiveScroll(){
                
                $this = ajaxLoadPost;
                
                nextArticlePopupInfo();
                
                currentArticleInfoUpdate();
                                                
                var triggerElement = $this.find('.infinity-single-trigger');
                
                if(!triggerElement.length) {
                    return;
                }
                
                var top_of_element = triggerElement.offset().top;
                var bottom_of_element = triggerElement.offset().top + triggerElement.outerHeight();
                var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
                var top_of_screen = $(window).scrollTop();
                
                if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
                    if($this.hasClass('infinity-disable'))
                        return;
                            
                    $this.addClass('infinity-disable');
                    var postURLtoLoad = $this.find('.single-infinity-inner').last().data('url-to-load');
                    var postContainer = $this.find('.single-infinity-container');

                    var parameters = {
                        postURLtoLoad: postURLtoLoad,
                    };
                    ajaxLoad(parameters, postContainer);
                }
            }
            
            $(window).on('scroll', $.debounce(250, ajaxLoadInfinitiveScroll));
        },
    };

    ATBS.documentOnResize = {
        ticking: false,
        windowWidth: $window.width(),

        init: function() {
            window.addEventListener('resize', function(e) {
                if (!ATBS.documentOnResize.ticking) {
                    window.requestAnimationFrame(function() {
                        ATBS.documentOnResize.windowWidth = $window.width();

                        // Functions to call here
                        if (!ATBS.header.smartAffix.isDestroyed) {
                            ATBS.header.smartAffix.eventResize(ATBS.documentOnResize.windowWidth);
                        }

                        ATBS.clippedBackground();

                        ATBS.documentOnResize.ticking = false;
                    });
                }
                ATBS.documentOnResize.ticking = true;
            });
        },
    };
    ATBS.ATBS_Bookmark = {
        init: function() {
            var buttonRemoveBookmark = $('.bookmark-for-user .post__button-remove-bookmark');
            var buttonBookMarkUser = $('.bookmark-for-user .post__button-bookmark');
            var buttonDismissBookmark = $('.ceris-dismiss-item');
            var buttonBookMarkShowOption = $('.bookmark-for-guest .button-bookmark-option');
            var buttonPercentWBookmark = $('.scroll-count-percent-with-bookmark');
            
            if(buttonBookMarkUser.length) {
                ATBS.ATBS_Bookmark.bookmarkUser(buttonBookMarkUser);
            }
            
            if(buttonRemoveBookmark.length) {
                ATBS.ATBS_Bookmark.removebookmarkUser(buttonRemoveBookmark);
            }
            if(buttonDismissBookmark.length) {
                ATBS.ATBS_Bookmark.dismissArticle(buttonDismissBookmark);
            }
            if(buttonBookMarkShowOption.length) {
                ATBS.ATBS_Bookmark.bookmarkforGuest(buttonBookMarkShowOption);
            }
            if(buttonPercentWBookmark.length) {
                ATBS.ATBS_Bookmark.bookmarkSingleScrolling(buttonPercentWBookmark);
            }
            $(document).on('click',function(event){
                if (!$(event.target).closest(".button-bookmark-option, .button-bookmark-option-content").length) {
                    $(".show-bookmark-option-content").toggleClass('show-bookmark-option-content');
                }
            });
        },
        /* ============================================================================
        * Bookmark
        * ==========================================================================*/
        bookmarkUser: function(buttonBookMarkUser){
            buttonBookMarkUser.each(function () {
                $(this).off('click');
                $(this).on('click',function(){
                    $(this).closest('.bookmark__buttons-wrap').find('.post__button-bookmark-option').removeClass('show-bookmark-option-content');
                    var bookmarkItem = $(this).parents('.post-has-bookmark');
                    $(bookmarkItem).toggleClass('active-status-bookmark');
                    
                    $(this).toggleClass('show-bookmark-option-content');
                    
                    var userID = $(this).closest('.bookmark-for-user').data('userid');
                    var postID = $(this).closest('.bookmark-for-user').data('postid');
                    if($(bookmarkItem).hasClass('active-status-bookmark')) {
                        var parameters = {
                            action: 'ceris_add_bookmark',
                            userID: userID,
                            postID: postID
                        };
                        ATBS.ATBS_Bookmark.ajaxLoad(parameters);
                    }else {
                        var parameters = {
                            action: 'ceris_remove_bookmark',
                            userID: userID,
                            postID: postID
                        };
                        ATBS.ATBS_Bookmark.ajaxLoad(parameters);
                    }
                });
            });
        },
        bookmarkSingleScrolling: function(buttonPercentWBookmark){
            buttonPercentWBookmark.each(function () {
                $(this).off('click');
                $(this).on('click',function(){              
                    var bookmarkIcon = $(this).find('.btn-bookmark-icon');
                    
                    var userID = $(this).closest('.atbs-scroll-single-percent-wrap').data('userid');
                    var postID = $(this).closest('.atbs-scroll-single-percent-wrap').data('postid');
                    
                    $(bookmarkIcon).toggleClass('is-saved');
                    if(bookmarkIcon.hasClass('is-saved')) {
                        $('.atbs-ceris-block-'+postID).addClass('ceris-already-bookmarked');
                    }else {
                        $('.atbs-ceris-block-'+postID).removeClass('ceris-already-bookmarked');
                    }
                    
                    $(this).toggleClass('show-bookmark-option-content');
                    
                    if($(bookmarkIcon).hasClass('is-saved')) {
                        var parameters = {
                            action: 'ceris_add_bookmark',
                            userID: userID,
                            postID: postID
                        };
                        ATBS.ATBS_Bookmark.ajaxLoad(parameters);
                    }else {
                        var parameters = {
                            action: 'ceris_remove_bookmark',
                            userID: userID,
                            postID: postID
                        };
                        ATBS.ATBS_Bookmark.ajaxLoad(parameters);
                    }
                });
            });
        },
        dismissArticle: function(buttonDismissBookmark) {
            buttonDismissBookmark.each(function () {
                $(this).off('click');
                $(this).on('click',function(){
                    var thisobj = $(this);
                    if($(this).parents('.site-content').hasClass('bookmark-without-dismiss')) {
                        return;
                    }
                    
                    var userID = $(this).closest('.bookmark-for-user').data('userid');
                    var postID = $(this).closest('.bookmark-for-user').data('postid');
                        
                    if($(this).hasClass('ceris-remove-dismiss')) {
                        var parameters = {
                            action: 'ceris_remove_dismiss_article',
                            userID: userID,
                            postID: postID
                        };
                        ATBS.ATBS_Bookmark.ajaxLoad(parameters);
                    }else {
                        var moduleID = $(this).closest('.atbs-ceris-block').attr('id');
                        var args = ajax_buff['query'][moduleID]['moduleInfo']['bookmarkTmp'];
                        args.push(postID);
                        ajax_buff['query'][moduleID]['moduleInfo']['bookmarkTmp'] = args;
                        
                        var parameters = {
                            action: 'ceris_dismiss_article',
                            userID: userID,
                            postID: postID
                        };
                        ATBS.ATBS_Bookmark.ajaxLoad(parameters);
                    }                  
                    $(this).closest('.list-item').addClass('ceris-scale-to-zero');
                    var waitingCount = 3;
                    var checkItemClassthenRemove = setInterval(function() {
                        if(waitingCount == 0) {
                            clearInterval(checkItemClassthenRemove);
                        }
                        if(thisobj.closest('.list-item').hasClass('ceris-scale-to-zero')) {
                            thisobj.closest('.list-item').remove();
                            clearInterval(checkItemClassthenRemove);
                        }
                        waitingCount --;
                    }, 350); // check every 100ms
                });
            });
        },
        removebookmarkUser: function(buttonRemoveBookmark) {
            $('.post-has-bookmark').hover(function(){
              }, function(){
              $(this).find('.post__button-bookmark-option').removeClass('show-bookmark-option-content')
            });
            buttonRemoveBookmark.each(function () {
                $(this).off('click');
                $(this).on('click',function(){
                    //$(this).closest('.bookmark__buttons-wrap').find('.post__button-bookmark-option').removeClass('show-bookmark-option-content');
                    $(this).toggleClass('show-bookmark-option-content');
                });
            });
        },        
        bookmarkforGuest: function(buttonBookMarkShowOption) {
            $('.post-has-bookmark').hover(function(){
              }, function(){
              $(this).find('.post__button-bookmark-option').removeClass('show-bookmark-option-content')
            });
            buttonBookMarkShowOption.each(function () {
                $(this).off('click');
                $(this).on('click',function(){
                    //$(this).closest('.bookmark__buttons-wrap').find('.post__button-bookmark-option').removeClass('show-bookmark-option-content');
                    $(this).closest('.post__button-bookmark-option').siblings().removeClass('show-bookmark-option-content');
                    $(this).closest('.post__button-bookmark-option').toggleClass('show-bookmark-option-content');
                });
            });
        },
        reAddBookmark: function(container){
            var buttonBookMarkUser = $(container).find('.bookmark-for-user .post__button-bookmark');
            var buttonRemoveBookmark = $(container).find('.bookmark-for-user .post__button-remove-bookmark');
            var buttonDismissBookmark = $(container).find('.ceris-dismiss-item');
            var buttonBookMarkShowOption = $('.bookmark-for-guest .button-bookmark-option');
            
            if(buttonBookMarkUser.length) {
                ATBS.ATBS_Bookmark.bookmarkUser(buttonBookMarkUser);
            }
            
            if(buttonRemoveBookmark.length) {
                ATBS.ATBS_Bookmark.removebookmarkUser(buttonRemoveBookmark);
            }
            if(buttonDismissBookmark.length) {
                ATBS.ATBS_Bookmark.dismissArticle(buttonDismissBookmark);
            }
            if(buttonBookMarkShowOption.length) {
                ATBS.ATBS_Bookmark.bookmarkforGuest(buttonBookMarkShowOption);
            }

            container.find('.ceris-scale-to-zero').remove();
       
        },
        ajaxLoad: function(parameters) {
            var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
           // console.log(parameters);
            var ajaxStatus = '',
                ajaxCall = $.ajax({
                    url: ajaxurl,
                    type: 'post',
                    dataType: 'html',
                    data: {
                        action: parameters.action,
                        userID: parameters.userID,
                        postID: parameters.postID,
                        securityCheck: cerisAjaxSecurity
                        // other parameters
                    },
                });
            ajaxCall.done(function(respond) {
                //console.log(respond);
            });

            ajaxCall.fail(function() {
            });

            ajaxCall.always(function() {
            });
        },
    }
    ATBS.ATBS_CustomerReview = {
        init: function() {
            var reviews_rating_score = $('.reviews-score-list');
            var reviews_rating_star = $('.reviews-rating');
            var userReviewContents = $('.ceris-user-review-content');
            var reader_review_form = $('.rating-form');
            var closeReviewPopup_1 = $('.btn-close-review-popup');
            var closeReviewPopup_2 = $('.btn-close-review-normal');
            
            ATBS.ATBS_CustomerReview.reviewRatingStarIcon(reviews_rating_star);
            ATBS.ATBS_CustomerReview.reviewScoreList(reviews_rating_score);
            ATBS.ATBS_CustomerReview.reviewReadmoreInit(userReviewContents);
            ATBS.ATBS_CustomerReview.userReviewFormSubmit(reader_review_form);
            ATBS.ATBS_CustomerReview.popupThankyouPanel(closeReviewPopup_1, closeReviewPopup_2);
            ATBS.ATBS_CustomerReview.reviewAdminDelete();
        },
        reviewReadmoreInit: function(userReviewContents) {
            ATBS.ATBS_CustomerReview.reviewReadmoreCal(userReviewContents);
        },
        reviewReadmoreCal: function(userReviewContents){
            $(userReviewContents).each(function(index, userReviewContent) {
                ATBS.ATBS_CustomerReview.reviewReadmoreAction(userReviewContent);
            });
        },
        reviewReadmoreAction: function(userReviewContent) {
            var reviewContentHeight = $(userReviewContent).find('.user__description-excerpt').height();
            var ceris_html = document.getElementsByTagName('html')[0];
            var ceris_rem = parseInt(window.getComputedStyle(ceris_html)['fontSize']);

            var checkExist = setInterval(function() {
                if(reviewContentHeight > 0) {
                    if(reviewContentHeight > (6.8*ceris_rem)) {
                        $(userReviewContent).addClass('has-more-active');
                    }
                    $(userReviewContent).find('.review-readmore').on('click', function(e) {
                        $(this).siblings('.user__description-excerpt').css({
                          // Set height to prevent instant jumpdown when max height is removed
                          "height": $(userReviewContent).find('.user__description-excerpt').height(),
                          "max-height": 9999
                        }).animate({
                          "height": reviewContentHeight
                        });
                        $(userReviewContent).removeClass('has-more-active');
                    });
                    $(userReviewContent).removeClass(('review-content-loading'));
                    clearInterval(checkExist);
                }
            }, 50); // check every 100ms
        },
        popupThankyouPanel: function(closeReviewPopup_1, closeReviewPopup_2){
            closeReviewPopup_1.on('click', function(){
                $(this).closest('.ceris-user-review-popup-notification ').removeClass('enable-review-popup');
            });
            closeReviewPopup_2.on('click', function(){
                $(this).closest('.ceris-user-review-popup-notification ').removeClass('enable-review-popup');
            });
        },
        userReviewFormSubmit: function(reader_review_form) {
            reader_review_form.each(function () {
                $(this).submit(function(e){
                    e.preventDefault();
                    var thisFormSubmitButton;
                    thisFormSubmitButton = $(this);
                    thisFormSubmitButton.find('.rating-submit').addClass('ceris_loading');
                    var formData = $(this).serializeArray();
                    var userID = $(this).closest('.reviews-rating').data('userid');
                    var postID = $(this).closest('.reviews-rating').data('postid');
                    var reviewTime = new Date(); 
                    var reviewTimeStr = ATBS.ATBS_CustomerReview.reviewMonthName() + ' ' + reviewTime.getDate() + ', ' + reviewTime.getFullYear();
                    var formVal = {userID:userID, postID:postID, reviewTime:reviewTimeStr};
      
                    $(formData).each(function(index, field){
                        switch(field.name) {
                            case 'user-star-rating':
                                formVal.user_star_rating = field.value;
                                break;
                            case 'user-review-title':
                                formVal.user_review_title = field.value;
                                break;
                            case 'user-review-content':
                                formVal.user_review_content = field.value;
                                break;
                        }
                    });
                    var parameters = {
                        action: 'ceris_user_review',
                        formVal: formVal,
                    };
                    
                    ATBS.ATBS_CustomerReview.ajaxLoad(parameters, thisFormSubmitButton);
                });
            });
        },
        reviewMonthName: function(){
            var month = new Array();
            month[0] = "Jan";
            month[1] = "Feb";
            month[2] = "Mar";
            month[3] = "Apr";
            month[4] = "May";
            month[5] = "Jun";
            month[6] = "Jul";
            month[7] = "Aug";
            month[8] = "Sep";
            month[9] = "Oct";
            month[10] = "Nov";
            month[11] = "Dec";
            
            var d = new Date();
            return month[d.getMonth()];
        },
        reviewRatingStarIcon: function(reviews_rating_star){
            reviews_rating_star.each(function () {
                var theCurrentReviewForm = $(this);
                var rating_reviews_list = $(this).find('.rating-form');
                $(rating_reviews_list).each(function () {
                    var star_score_icon = $(this).find('.star-item');
                    star_score_icon.on('click',function () {                        
                        $(star_score_icon).removeClass("active");
                        var star_score_value = $(this).index();
                        $(this).parents('.rating-star').siblings('.user-star-rating').attr('value', 5 - star_score_value);
                        star_score_icon.each(function () {
                            if ($(this).index() >= star_score_value){
                                //console.log($(this).index());
                                $(this).addClass("active");
                            }
                        })
                    });
                });
            });
        },
        reviewScoreList: function(reviews_rating_score){
            reviews_rating_score.each(function () {
                var score_list_item = $(this).find(".score-item");
                $(score_list_item).each(function () {
                    var percent = parseFloat( $(this).data('total') );
                    var percent_default = 0;
                    var score_item = setInterval(frame, 0  );
                    var $this = $(this);
                    function frame() {
                        if (percent_default >= percent) {
                            clearInterval(score_item);
                        } else {
                            percent_default++;
                            $this.find(".score-percent").css({"width": percent_default +'%'});
                            $this.find(".score-number").text(percent_default / 10);
                            // console.log(percent_default);
                        }
                    }
                });
            });
        },
        ajaxLoad: function(parameters, thisFormSubmitButton) {
            var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
            var ajaxStatus = '',
                ajaxCall = $.ajax({
                    url: ajaxurl,
                    type: 'post',
                    dataType: 'html',
                    data: {
                        action: parameters.action,
                        formVal: parameters.formVal,
                        securityCheck: cerisAjaxSecurity
                        // other parameters
                    },
                });
            ajaxCall.done(function(respond) {
                var theReview = $.parseJSON(respond);
                
                var container = $(thisFormSubmitButton).closest('.reviews-rating').siblings('.ceris-user-reviews').find('.user-reviews-list');
                container.prepend(theReview);
                
                var userReviewContents = container.find('.list-item:first-child').find('.ceris-user-review-content');
                ATBS.ATBS_CustomerReview.reviewReadmoreCal(userReviewContents);
                
                var ReviewPerPage = $(thisFormSubmitButton).closest('.reviews-rating').siblings('.ceris-user-reviews').data('user-review-count');
                if($(thisFormSubmitButton).closest('.reviews-rating').siblings('.ceris-user-reviews').find('.list-item').length > ReviewPerPage) {
                    $(thisFormSubmitButton).closest('.reviews-rating').siblings('.ceris-user-reviews').find('.list-item:last-child').remove();
                }
                $(thisFormSubmitButton).closest('.reviews-rating').addClass('hidden-form');
                $(thisFormSubmitButton).closest('.reviews-content').siblings('.ceris-user-review-popup-notification').addClass('enable-review-popup');
                var popuploadcomplete = setInterval(function() {
                    $(thisFormSubmitButton).closest('.ceris-reviews-section').find('.circle-loader').addClass('load-complete');       
                    $(thisFormSubmitButton).closest('.ceris-reviews-section').find('.checkmark').toggle();
                    clearInterval(popuploadcomplete);
                },800);
            });

            ajaxCall.fail(function() {
            });

            ajaxCall.always(function() {
                thisFormSubmitButton.find('.rating-submit').removeClass('ceris_loading');
            });
        },
        reviewPagination: function($this, currentPageVal){
            var postID = $this.closest('.ceris-user-reviews').siblings('.reviews-rating').data('postid');
            var reviewPerPage = $this.closest('.ceris-user-reviews').data('user-review-count');
            var parameters = {
                action: 'ceris_user_review_pagination',
                currentPageVal : currentPageVal,
                postID: postID,
                reviewPerPage: reviewPerPage,
            };
            var container = $this.closest('.ceris-user-review-pagination').siblings('.user-reviews-list');
            container.css('height', container.height()+'px');
            container.append('<div class="bk-preload-wrapper"></div>');
            container.find('.list-item').addClass('bk-preload-blur');
            
            ATBS.ATBS_CustomerReview.paginationAjaxLoad(parameters, $this);
        },
        paginationAjaxLoad: function(parameters, $this) {
            var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
            var ajaxStatus = '',
                ajaxCall = $.ajax({
                    url: ajaxurl,
                    type: 'post',
                    dataType: 'html',
                    data: {
                        action: parameters.action,
                        currentPageVal: parameters.currentPageVal,
                        postID: parameters.postID,
                        reviewPerPage: parameters.reviewPerPage,
                        securityCheck: cerisAjaxSecurity
                        // other parameters
                    },
                });
            ajaxCall.done(function(respond) {
                var theReviews = $.parseJSON(respond);
                var elToLoad = $(theReviews).css('opacity',0).animate({'opacity': 1}, 400);
                
                var container = $this.closest('.ceris-user-review-pagination').siblings('.user-reviews-list');
                container.html(elToLoad); 
                
                var userReviewContents = $(container).find('.ceris-user-review-content');
                ATBS.ATBS_CustomerReview.reviewReadmoreCal(userReviewContents);
                          
                container.find('.bk-preload-wrapper').remove();
                container.find('.list-item').removeClass('bk-preload-blur');
                                
                setTimeout(function(){ container.css('height', 'auto'); }, 200);
                
                ATBS.ATBS_CustomerReview.reviewAdminDelete();
            });

            ajaxCall.fail(function() {
            });

            ajaxCall.always(function() {
            });
        },
        reviewAdminDelete: function() {
            var reviewDelButtons = $('.ceris-admin-delete-review');
            $(reviewDelButtons).each(function () {
                if(!$(this).hasClass('deleteBtnActive')) {
                    $(this).on('click', function() {
                        var userID = $(this).data('userid');
                        var postID = $(this).data('postid');
                        var formVal = {userID:userID, postID:postID};
                        var parameters = {
                            action: 'ceris_user_delete_review',
                            postID: postID,
                            formVal: formVal
                        };
                        ATBS.ATBS_CustomerReview.reviewAdminDeleteAjax(parameters, $(this));
                    });
                    $(this).addClass('deleteBtnActive');
                }
            });
        },
        reviewAdminDeleteAjax: function(parameters, $this) {
            var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
            var ajaxStatus = '',
            ajaxCall = $.ajax({
                url: ajaxurl,
                type: 'post',
                dataType: 'html',
                data: {
                    action: parameters.action,
                    formVal: parameters.formVal,
                    securityCheck: cerisAjaxSecurity
                    // other parameters
                },
            });
            ajaxCall.done(function(respond) {
                $this.closest('.list-item').slideUp("normal", function() { $(this).remove(); } );
            });

            ajaxCall.fail(function() {
            });

            ajaxCall.always(function() {
            });
        },
    }
    /* ============================================================================
     * Reaction
     * ==========================================================================*/    
    ATBS.ATBS_reaction = {
        init: function() {
            var reactions = $('.js-atbs-reaction');
            ATBS.ATBS_reaction.atbs_reaction(reactions);
        },
        /**/
        atbs_reaction: function(reactions){
            reactions.each( function() {
                var reaction_col = $(this).find('.atbs-reactions-col');
                reaction_col.on('click', function(){
                    var reactionType = $(this).data('reaction-type');
                    var reaction_content = $(this).find('.atbs-reactions-content');
                    var reactionStatus = '';
                    if($(this).find('.atbs-reactions-image').hasClass("active")){
                        reactionStatus = 'active';
                    }else{
                        reactionStatus = 'non-active';
                    }
                    if($(this).find('.atbs-reactions-image').hasClass("active")){
                        $(this).find('.atbs-reactions-image').removeClass("active");
                        $(this).find('.atbs-reactions-image').removeClass("scale-icon");
                        
                    }else{
                        $(this).find('.atbs-reactions-image').addClass("active");
                        $(this).find('.atbs-reactions-image').addClass("scale-icon"); 
                    } 
                    if(reaction_content.hasClass("active")){
                        reaction_content.removeClass("active");
                        reaction_content.removeClass("scale-count");
                    }else{
                        reaction_content.addClass("active");
                        reaction_content.addClass("scale-count");
                    }
                    ATBS.ATBS_reaction.ajaxLoad($(this), reactionType, reactionStatus);
                });
            });
        },    
        ajaxLoad: function(reaction, reactionType, reactionStatus) {
            var $this = reaction;
            var reaction_content = $this.find('.atbs-reactions-content');
            var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];   
            var postID = reaction.closest('.js-atbs-reaction').data('article-id');
            var ajaxCall = $.ajax({
                    url: ajaxurl,
                    type: 'post',
                    dataType: 'html',
                    data: {
                        action: 'ceris_ajax_reaction',
                        postID: postID,
                        reactionType: reactionType,
                        reactionStatus: reactionStatus,
                        securityCheck: cerisAjaxSecurity,
                    },
                });
            ajaxCall.done(function(respond) {
                var results = $.parseJSON(respond);
                $this.find('.atbs-reaction-count').html(results);
            });
            ajaxCall.fail(function() {
                //console.log('failed');
            });
            ajaxCall.always(function() {
                 if($this.find('.atbs-reactions-image').hasClass("active")){
                    $this.find('.atbs-reactions-image').removeClass("scale-icon");
                 }
                if(reaction_content.hasClass("active")){
                    reaction_content.removeClass("scale-count");
                }
            });
        },
    }    
    ATBS.ATBS_carousel = {
        init: function() {
            var CarouselOptions;
            var CarouselCarouselOptionsDefault = {
        		items: 5,
        	};
            $.fn.ATBS_Carousel = function(CarouselOptions){
                if(typeof CarouselOptions === 'object' && CarouselOptions) {
                    console.log(Object.keys(CarouselOptions).length);
                    var thisCarouselOptions = $.extend({}, CarouselCarouselOptionsDefault, CarouselOptions);
                    if(thisCarouselOptions.items == 1) {
                        $(this).wrapInner('<div class="atbs-carousel"></div>');
                        var theCarousel = $(this).children();
                        $(this).find('.list-item:first-child').addClass('carousel-item-active');
                        theCarousel.css('height', $(this).find('.atbs-carousel').height()+'px');
                        $(this).append(ATBS.ATBS_carousel.carousel_nav(thisCarouselOptions.navText));
                        $(this.find('.atbs-next')).on('click', function(){
                            var currentItem = theCarousel.find('.carousel-item-active');
                            if(!$(currentItem).is(':last-child')) {
                                var nextItem = theCarousel.find('.carousel-item-active').next();
                            }else {
                                var nextItem = theCarousel.children().first();
                            }
                            currentItem.removeClass('carousel-item-active');
                            nextItem.addClass('carousel-item-active');
                            theCarousel.animate({height:nextItem.height()},300);;
                        });
                        $(this.find('.atbs-prev')).on('click', function(){
                            var currentItem = theCarousel.find('.carousel-item-active');
                            if(!$(currentItem).is(':first-child')) {
                                var nextItem = theCarousel.find('.carousel-item-active').prev();
                            }else {
                                var nextItem = theCarousel.children().last();
                            }
                            currentItem.removeClass('carousel-item-active');
                            nextItem.addClass('carousel-item-active');
                            $(this).closest('.atbs-nav').siblings('.atbs-carousel').animate({height:nextItem.height()},300);
                            console.log('eventaaaaaaa');
                        });
                                          
                        var startX = 0;
                        var startY = 0;
                        var endX = 0;
                        var endY = 0;      
                        
                        $(theCarousel).on('dragstart', function(e) {   
                            startX = e.pageX;
                            startY = e.pageY;       
                        });
                                                
                        $(theCarousel).on('dragend', function(e) { 
                            e.preventDefault();  
                            endX = e.pageX;
                            endY = e.pageY;   
                            if(endX < startX){
                                console.log('left');
                            }else {
                                console.log('right');
                            }
                        });
                        /*                                                
                        var startX = 0;
                        var startY = 0;
                        var endX = 0;
                        var endY = 0;
                        
                        var thisAlert = function() {
                          alert("Link Clicked");
                        };
                        
                        $(theCarousel).on('mousedown', function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();                            
                            startX = e.pageX;
                            startY = e.pageY;
                            return false;                                                        
                          ;  console.log('aaaaaa');                            
                        };
                        $(theCarousel).closest('.site-content').on('mouseup', function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();                            
                        $(theCarousenmouseup=function(event){
                            endX = e.pageX;
                            console.log('aaaaaaaaaaa');                            console.log('bbbbbbbbbb');                            
                            
                            // Swipe Up 
                            ifconsole.logrtY - endY > 
                              
                            return false;                              event.preventDefault();
                         )   }
                                                                          
                        } ;
                        };     */
                    }
                }
            };
        },
        carousel_nav: function($navArray) {
            return '<div class="atbs-nav"><div class="atbs-prev">'+$navArray[0]+'</div><div class="atbs-next">'+$navArray[1]+'</div></div>';
        },
        carousel_1i: function() {
            var carousels = $('.js-atbs-ceris-carousel');
            carousels.each( function() {
                $(this).ATBS_Carousel({
                    items: 1,
                    margin: 3,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-chevron-thin-left"></i>', '<i class="mdicon mdicon-chevron-thin-right"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                        },
                    },
                });
            });
        },    
    }      
    ATBS.documentOnReady = {

        init: function(){
            ATBS.header.init();
            ATBS.header.smartAffix.compute();
            ATBS.header.smartFooterInfo.compute();
            ATBS.documentOnScroll.init();
            ATBS.documentOnReady.ajaxLoadPost();
            ATBS.documentOnScroll.infinityAjaxLoadPost();
            ATBS.documentOnScroll.infinityAjaxLoadSinglePost();
            ATBS.documentOnReady.scrollSingleCountPercent();
            ATBS.documentOnReady.carousel_1i();
            ATBS.documentOnReady.carousel_1i30m_thumb_round();
            ATBS.documentOnReady.carousel_only_1i_loopdot();
            ATBS.documentOnReady.carousel_1i_loopdot();
            ATBS.documentOnReady.carousel_1i_get_background();
            ATBS.documentOnReady.carousel_1i_fade_dot_number_effect();
            ATBS.documentOnReady.carousel_1i_not_nav();
            ATBS.documentOnReady.carousel_1i_not_nav_2();
            ATBS.documentOnReady.carousel_1i_dot_number_effect();
            ATBS.documentOnReady.carousel_1i_dot_number_get_background();
            ATBS.documentOnReady.carousel_1i_dot_number_get_background_style_2();
            ATBS.documentOnReady.carousel_1i30m_effect();
            ATBS.documentOnReady.carousel_1i30m();
            ATBS.documentOnReady.carousel_2i0m_number_effect();
            ATBS.documentOnReady.carousel_2i30m_number_effect();
            ATBS.documentOnReady.carousel_2i50m_number_effect();
            ATBS.documentOnReady.carousel_2i0m();
            ATBS.documentOnReady.carousel_2i4m();
            ATBS.documentOnReady.carousel_2i30m5();
            ATBS.documentOnReady.carousel_2i30m();
            ATBS.documentOnReady.carousel_2i10m();
            ATBS.documentOnReady.carousel_2i20m();
            ATBS.documentOnReady.carousel_3i30m5();
            ATBS.documentOnReady.carousel_3i30m5_update();
            ATBS.documentOnReady.carousel_4i30m5_update();
            ATBS.documentOnReady.carousel_3i4m();
            ATBS.documentOnReady.carousel_3i30m();
            ATBS.documentOnReady.carousel_3i4m_small();
            ATBS.documentOnReady.carousel_3i20m();
            ATBS.documentOnReady.carousel_headingAside_3i();
            ATBS.documentOnReady.carousel_4i();
            ATBS.documentOnReady.carousel_4i4m();
            ATBS.documentOnReady.carousel_4i0m();
            ATBS.documentOnReady.carousel_4i20m();
            ATBS.documentOnReady.carousel_4i30m();
            ATBS.documentOnReady.carousel_5i0m();
            ATBS.documentOnReady.carousel_overlap();
            ATBS.documentOnReady.customCarouselNav();
            ATBS.documentOnReady.countdown();
            ATBS.documentOnReady.goToTop();
            ATBS.documentOnReady.newsTicker();
            ATBS.documentOnReady.lightBox();
            ATBS.documentOnReady.perfectScrollbarInit();
            ATBS.documentOnReady.tooltipInit();
            ATBS.documentOnReady.ceris_search_button();
            ATBS.documentOnReady.carousel_1i_dot_number();
            ATBS.ATBS_Bookmark.init();
            ATBS.ATBS_CustomerReview.init();
            ATBS.ATBS_reaction.init();
            ATBS.ATBS_carousel.init();
            ATBS.ATBS_carousel.carousel_1i();
            ATBS.documentOnReady.the_close_buttons();
            ATBS.documentOnReady.ATBS_Article_Header_Nav_Switch();
            ATBS.documentOnReady.ATBSNavDetectEdgeBrowser();
            ATBS.documentOnReady.atbs_theme_switch();
        },

        /* ============================================================================
        * Dark Mode & Light Mode   js
        * ==========================================================================*/
        atbs_theme_switch: function () {
            const siteWrapper          = $('.site-wrapper');
            const darModeOptionEnabled = siteWrapper.hasClass('atbs-enable-dark-mode-option');
            if ( !darModeOptionEnabled ) {
                return;
            }
            const theme_switch         = $('.atbs-theme-switch');
            const ceris_logo_switch   = $('.atbs-ceris-logo');
            function getCookie(cookieName) {
                var name = cookieName + '=';
                var decodedCookie = decodeURIComponent(document.cookie);
                var cookies = decodedCookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i];
                    while (cookie.charAt(0) == ' ') {
                        cookie = cookie.substring(1);
                    }
                    if (cookie.indexOf(name) == 0) {
                        return cookie.substring(name.length, cookie.length);
                    }
                }
                return '';
            }
            function setCookie(cookieName, cookieValue, expireDays) {
                var date = new Date();
                date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
                var expires = 'expires=' + date.toGMTString();
                document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
            }
            function toggleDarkMode(status) {
                if (status == 'on') {
                    $(theme_switch).addClass('active');
                    $(ceris_logo_switch).addClass('logo-dark-mode-active');
                    siteWrapper.addClass('ceris-dark-mode');
                    setCookie(ATBS_DARKMODE_COOKIE_NAME[0], 1, 30); // Save data
                } else {
                    $(theme_switch).removeClass('active');
                    $(ceris_logo_switch).removeClass('logo-dark-mode-active');
                    siteWrapper.removeClass('ceris-dark-mode');
                    setCookie(ATBS_DARKMODE_COOKIE_NAME[0], 0, 30); // Save data
                }
            }
            function updateDarkMode() {
                var darkMode = getCookie(ATBS_DARKMODE_COOKIE_NAME[0]);
                if (darkMode == 1) {
                    toggleDarkMode('off');
                } else {
                    toggleDarkMode('on');
                }
            }
            function initDarkMode() {
                var darkMode        = getCookie(ATBS_DARKMODE_COOKIE_NAME[0]);
                var defaultDarkMode = siteWrapper.hasClass('ceris-dark-mode-default');
                // Turn on Dark Mode default if is set in Theme Option
                if (darkMode == '') {
                    if ( defaultDarkMode ) {
                        toggleDarkMode('on');
                    }
                }
            }
            theme_switch.each(function() {
                $(this).on('click', updateDarkMode);
            });
            initDarkMode(); // init
        },

        ATBS_Article_Header_Nav_Switch:function() {
            var headerNavSW = $('.header-article-nav-icon');
            headerNavSW.on('click', function(e){
                e.preventDefault();
                $(this).closest('.sticky-header').toggleClass('article-header-nav-hide');
                if($(this).closest('.sticky-header').hasClass('article-header-nav-hide')) {
                    $(this).closest('.sticky-header').find('.navigation-wrapper').fadeOut(300);
                    $(this).closest('.sticky-header').find('.header-current-reading-article').fadeIn(3000);
                }else {
                    $(this).closest('.sticky-header').find('.navigation-wrapper').fadeIn(3000);
                    $(this).closest('.sticky-header').find('.header-current-reading-article').fadeOut(300);
                }
            });
        },
        ATBSNavDetectEdgeBrowser: function(){
            $("#main-menu li").on('mouseenter mouseleave', function (e) {
                if ($('ul', this).length) {
                    var elm = $('ul:first', this);
                    var off = elm.offset();
                    var l = off.left;
                    var w = elm.width();
                    var docW = $(".site-wrapper").width();
                    var isEntirelyVisible = (l + w <= docW);

                    if (!isEntirelyVisible) {
                        $(this).addClass('atbs-submenu-to-left');
                    } else {
                        //$(this).removeClass('atbs-submenu-to-left');
                    }

                    if(l<0) {
                        $(this).addClass('atbs-submenu-to-right');
                    } else {
                        //$(this).removeClass('atbs-submenu-to-right');
                    }
                }
            });
        },
        the_close_buttons: function(){
            $('body').imagesLoaded( function() {
                //Cookie bar
                var CookieCloseButton = $('#cn-close-notice');
                $('#cookie-notice').show();
                CookieCloseButton.on('click', function(e){
                   e.preventDefault();
                   $(this).closest('#cookie-notice').remove();
                });
                
                //Currently Reading Article Panel
                var nextArticlePopupCloseButton = $('.single-next-article-info-popup--close');
                nextArticlePopupCloseButton.on('click', function(e){
                   e.preventDefault();
                   $(this).closest('.single-next-article-info-popup').addClass('atbs-force-hidden-forever');
                });
            });
        },
        /* ============================================================================
        * Single scroll percent
        * ==========================================================================*/
        scrollSingleCountPercent: function(){
            var lastWindowScrollTop = 0;
            var scrollDirection = '';
            var elemnt_scroll = $('.element-scroll-percent');
            if(elemnt_scroll.length > 0){
                var ofsetTop_element_scroll;
                var ofsetBottom_element_scroll;
                var progressValue = $('.progress__value');
                var progressValueMobile = $('.scroll-count-percent-mobile .percent-number');
                var percentNumberText = $('.percent-number').find('.percent-number-text');
                var RADIUS = 54;
                var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
                var docHeight = 0;
                $(progressValue).css({'stroke-dasharray' : CIRCUMFERENCE });
                var reading_indicator =  $('.scroll-count-percent');
                var dataPostID;
                progress(0);
                $(percentNumberText).html(0);
                $(progressValueMobile).css({'width':'0px'});
                $(window).scroll(function(e){
                    if($(window).scrollTop() > lastWindowScrollTop) {
                        scrollDirection = 'down';
                    }else {
                        scrollDirection = 'up';
                    }
                    elemnt_scroll  = $('.element-scroll-percent');
                    
                    if(elemnt_scroll.hasClass('post-content-100-percent')) {
                        var theContentPercent = elemnt_scroll.find('.single-content__wrap');
                        theContentPercent.each( function() {
                            var theJourney = $(window).scrollTop() - $(this).offset().top;
                            if((theJourney > 0) && (theJourney <= $(this).height())) {
                                ofsetTop_element_scroll = $(this).offset().top;
                                ofsetBottom_element_scroll = ofsetTop_element_scroll + $(this).height();
                                docHeight = $(this).height();
                                dataPostID = $(this).closest('.single-infinity-inner').data('postid');
                                
                                $('.atbs-scroll-single-percent-wrap').data('postid', dataPostID);
                                if($(this).closest('.single-infinity-inner').hasClass('ceris-already-bookmarked')) {
                                    $('.scroll-count-percent-with-bookmark').find('.btn-bookmark-icon').addClass('is-saved');
                                }else {
                                    $('.scroll-count-percent-with-bookmark').find('.btn-bookmark-icon').removeClass('is-saved');
                                }
                            }
                        });
                    }else {
                        elemnt_scroll.each( function() {
                            var theJourney = $(window).scrollTop() - $(this).offset().top;
                            if((theJourney > 0) && (theJourney <= $(this).height())) {
                                ofsetTop_element_scroll = $(this).offset().top;
                                ofsetBottom_element_scroll = ofsetTop_element_scroll + $(this).height();
                                docHeight = $(this).height();
                                dataPostID = $(this).closest('.single-infinity-inner').data('postid');
                                
                                $('.atbs-scroll-single-percent-wrap').data('postid', dataPostID);
                                if($(this).closest('.single-infinity-inner').hasClass('ceris-already-bookmarked')) {
                                    $('.scroll-count-percent-with-bookmark').find('.btn-bookmark-icon').addClass('is-saved');
                                }else {
                                    $('.scroll-count-percent-with-bookmark').find('.btn-bookmark-icon').removeClass('is-saved');
                                }
                            }
                        });
                    }
                    
                    if(docHeight == 0) {
                        return false;
                    }
                    
                    if (($(window).scrollTop() >= ofsetTop_element_scroll) ){
                        $('.scroll-count-percent').addClass('active');
                    }
                    else{
                        $('.scroll-count-percent').removeClass('active');
                    }
                    var windowScrollTop = $(window).scrollTop();
                    var scrollPercent = (windowScrollTop - ofsetTop_element_scroll) / (docHeight);
                    var scrollPercentRounded = Math.round(scrollPercent*100);
                    if(scrollPercentRounded <= 0){
                        scrollPercentRounded = 0;
                    }else if(scrollPercentRounded >= 100) {
                        scrollPercentRounded = 100;
                        $('.scroll-count-percent').removeClass('active');
                    }
                    
                    progress(scrollPercentRounded);
                    $(percentNumberText).html(scrollPercentRounded);
                    $(progressValueMobile).css({'width': scrollPercentRounded + '%'});
                    lastWindowScrollTop = $(window).scrollTop();
                });
                $(window).resize(function () {
                    elemnt_scroll  = $('.element-scroll-percent');
                    if(elemnt_scroll.hasClass('post-content-100-percent')) {
                        var theContentPercent = elemnt_scroll.find('.single-context');
                        theContentPercent.each( function() {
                            var theJourney = $(window).scrollTop() - $(this).offset().top;
                            if((theJourney > 0) && (theJourney <= $(this).height())) {
                                ofsetTop_element_scroll = $(this).offset().top;
                                ofsetBottom_element_scroll = ofsetTop_element_scroll + $(this).height();
                                docHeight = $(this).height();
                                return false;
                            }
                        });
                    }else {
                        elemnt_scroll.each( function() {
                            var theJourney = $(window).scrollTop() - $(this).offset().top;
                            if((theJourney > 0) && (theJourney <= $(this).height())) {
                                ofsetTop_element_scroll = $(this).offset().top;
                                ofsetBottom_element_scroll = ofsetTop_element_scroll + $(this).height();
                                docHeight = $(this).height();
                                return false;
                            }
                        });

                    }
                    
                    var windowScrollTop = $(window).scrollTop();
                    var winHeight = $(window).height();
                    var scrollPercent = (windowScrollTop - ofsetTop_element_scroll) / (docHeight);
                    var scrollPercentRounded = Math.round(scrollPercent*100);
                    
                    if(scrollPercentRounded <= 0){
                        scrollPercentRounded = 0;
                    }else if(scrollPercentRounded > 100) {
                        scrollPercentRounded = 100;
                        $('.scroll-count-percent').removeClass('active');
                    }
                    progress(scrollPercentRounded);
                    $(percentNumberText).html(scrollPercentRounded);
                    $(progressValueMobile).css({'width': scrollPercentRounded + '%'});
                });
            }
            function progress(value) {
                var progress = value / 100;
                var dashoffset = CIRCUMFERENCE * (1 - progress);
                $(progressValue).css({'stroke-dashoffset': dashoffset });
            }
        },
        /* ============================================================================
         * ceris Search Button
         * ==========================================================================*/
        ceris_search_button: function() {
            
                $('.js-search-popup').on('click',function(){
                    $('.atbs-ceris-search-full').toggleClass('On');
                }); 
                $('#atbs-ceris-search-remove').on('click',function(){
                    $('.atbs-ceris-search-full').removeClass('On');
                    $('.atbs-ceris-search-full').removeClass("active");
                    $('.search-form__input').val('');
                });
                if( $(window).resize() || $(window).load() ){
                    $(window).height();
                    var input_search_frame = $('.atbs-ceris-search-full--form form').height() + parseInt($('.atbs-ceris-search-full--form form').css('margin-bottom'));
                    var max_height_search = $(window).height() - parseInt($('.atbs-ceris-search-full').css('padding-bottom')) - parseInt($('.atbs-ceris-search-full').css('padding-top')) - input_search_frame;
            
                    $('.result-default').css('max-height', max_height_search );
                    $('.atbs-ceris-search-full--result').css('max-height', max_height_search +  input_search_frame );
                }
        
        },
        /* ============================================================================
         * AJAX load more posts
         * ==========================================================================*/
        ajaxLoadPost: function() {
            var loadedPosts = '';
            var $ajaxLoadPost = $('.js-ajax-load-post');
            var $this;

            function ajaxLoad(parameters, $postContainer) {
                var cerisAjaxSecurity = ajax_buff['ceris_security']['ceris_security_code']['content'];
                console.log(cerisAjaxSecurity);
                var ajaxStatus = '',
                    ajaxCall = $.ajax({
                        url: ajaxurl,
                        type: 'post',
                        dataType: 'html',
                        data: {
                            action: parameters.action,
                            args: parameters.args,
                            postOffset: parameters.postOffset,
                            type: parameters.type,
                            moduleInfo: parameters.moduleInfo,
                            securityCheck: cerisAjaxSecurity                            
                            // other parameters
                        },
                    });
                //console.log(parameters.action);
                ajaxCall.done(function(respond) {
                    loadedPosts = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if(loadedPosts == 'no-result') {
                        $postContainer.closest('.js-ajax-load-post').addClass('disable-click');
                        $postContainer.closest('.js-ajax-load-post').find('.js-ajax-load-post-trigger').addClass('hidden');
                        $postContainer.closest('.js-ajax-load-post').find('.ceris-no-more-button').removeClass('hidden');
                        return;
                    }
                    if (loadedPosts) {
                        var elToLoad = $(loadedPosts).css('opacity',0).animate({'opacity': 1}, 400);
                        $postContainer.append(elToLoad);
                        ATBS.ATBS_Bookmark.reAddBookmark($postContainer);                        
                    }
                    $('html, body').animate({ scrollTop: $window.scrollTop() + 1 }, 0).animate({ scrollTop: $window.scrollTop() - 1 }, 0); // for recalculating of sticky sidebar
                    // do stuff like changing parameters
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                });

                ajaxCall.always(function() {
                    $postContainer.closest('.js-ajax-load-post').removeClass('ceris_loading');
                    $postContainer.closest('.js-ajax-load-post').removeClass('disable-click');
                });
            }

            $ajaxLoadPost.each(function() {
                $this = $(this);
                var $moduleID = $this.closest('.atbs-ceris-block').attr('id');
                var moduleName = $moduleID.split("-")[0];
                var $triggerBtn = $this.find('.js-ajax-load-post-trigger');
                var args = ajax_buff['query'][$moduleID]['args'];
                
                var $postContainer = $this.find('.posts-list');
                var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];
                                                
                $triggerBtn.on('click', function() {
                    
                    $this = $(this).closest('.js-ajax-load-post');
 
                    if(($this.hasClass('disable-click')) || $this.hasClass('infinity-ajax-load-post')) 
                        return;
                    
                    $this.addClass('disable-click');
                    
                    $this.addClass('ceris_loading');
                    
                    var postOffset  = parseInt(args['offset']) + $this.find('article').length;    
                    
                    if($this.closest('.atbs-ceris-block').hasClass('ceris_latest_blog_posts')) {
                        var stickPostLength = args['post__not_in'].length;
                        postOffset = postOffset - stickPostLength;
                    }

                    var parameters = {
                        action: moduleName,
                        args: args,
                        postOffset: postOffset,
                        type: 'loadmore',
                        moduleInfo: moduleInfo,
                    };
                    ajaxLoad(parameters, $postContainer);
                });
            });
        },
        
        carousel_1i_fade_dot_number_effect: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i-fade-dot-number-effect');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    // autoHeight: true,
                    smartSpeed: 450,
                    animateIn: 'fadeIn',
                    // animateOut: 'fadeOut',
                    onInitialized  : owl_onInitialized,
                    onTranslate : owl_onInitialized,
                    navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17" fill="#fff" viewBox="0 0 32 17"><path id="slider-prev" data-name="Slider Prev" class="slider_arrow_path" d="M8.158,0.007L8.835,0.685,1.5,8.019H32V8.979H1.5l7.338,7.334-0.677.679L0,8.839V8.16Z"></path></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17"  fill="#fff" viewBox="0 0 32 17"><path id="slider-next" data-name="Slider Next" class="slider_arrow_path" d="M23.842,0.007l-0.677.678L30.5,8.019H0V8.979H30.5l-7.338,7.334,0.677,0.679L32,8.839V8.16Z"></path></svg>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 30,
                        },

                        768 : {
                            items: 1,
                        },
                    },
                });
                $(this).on('translate.owl.carousel', function(event) {
                    var element   = event.target;
                    var thebackgroundIMG = '';
                    var currentImgSrcData = '';
                    
                    var checkActiveItemLoaded = setInterval(function() {
                        if(!$(element).find('.owl-item.active').hasClass('owl-item-active-loaded')) {
                            $(element).find('.owl-item').removeClass('owl-item-active-loaded');
                            $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                            thebackgroundIMG = $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img');
                            currentImgSrcData = $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src');
                            thebackgroundIMG.each(function () {
                                if($(this).hasClass('active')) {
                                    $(this).removeClass('active');
                                }else {
                                    $(this).removeAttr('src').attr('src', currentImgSrcData);
                                    $(this).addClass('active');
                                }
                            });
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                            clearInterval(checkActiveItemLoaded);
                        }
                                                
                    }, 10); // check every 10ms
                });
                function owl_onInitialized(event) {
                    var element         = event.target;
                    var itemCount       = event.item.count;
                    var itenIndex       = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;
    
                    var theCloned       = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }
    
                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
                    //console.log($(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(this).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                     
                    $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                };
            });
        },

        carousel_1i30m_thumb_round: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i30m-thumb-round');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 1,
                    loop: true,
                    animateOut: 'fadeOut',
                    margin: 30,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 300,
                });
            })
        },

        /* ============================================================================
         * Carousel funtions
         * ==========================================================================*/
         carousel_1i30m_effect: function() {
            var $carousels = $('.js-carousel-1i30m-effect');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {   
                        567 : {
                            margin: 0,
                        },
                    },
                });
            })
        },
        carousel_1i_dot_number: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i-dot-number');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    autoHeight: true,
                    onInitialized  : counter,
                    onTranslated : counter,
                    navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17" fill="#fff" viewBox="0 0 32 17"><path id="slider-prev" data-name="Slider Prev" class="slider_arrow_path" d="M8.158,0.007L8.835,0.685,1.5,8.019H32V8.979H1.5l7.338,7.334-0.677.679L0,8.839V8.16Z"></path></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17"  fill="#fff" viewBox="0 0 32 17"><path id="slider-next" data-name="Slider Next" class="slider_arrow_path" d="M23.842,0.007l-0.677.678L30.5,8.019H0V8.979H30.5l-7.338,7.334,0.677,0.679L32,8.839V8.16Z"></path></svg>'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 1,
                        },
                    },
                });
            })
            function counter(event) {
                var element         = event.target;
                var itemCount       = event.item.count;
                var itenIndex       = event.item.index;
                var owlstageChildrens = $(element).find('.owl-stage').children().length;

                var theCloned       = owlstageChildrens - itemCount;
                var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                if(itenIndex < parseInt(theCloned / 2)) {
                    currentIndex = owlstageChildrens - theCloned;
                }else if(currentIndex > itemCount) {
                    currentIndex = currentIndex - itemCount;
                }

                $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
            }
        },
        
        carousel_1i_loopdot: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i-loopdot');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        576 : {
                            items: 2,
                            margin: 30,
                        },

                        992 : {
                            items: 1,
                        },
                    },
                });
            })
        },
        carousel_1i_dot_number_get_background: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i-dot-number-get-background');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    autoHeight: true,
                    smartSpeed:450,
                    //animateOut: 'fadeOut',
                    onInitialized  : owl_onInitialized,
                    onTranslate : counter,
                    navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17" fill="#fff" viewBox="0 0 32 17"><path id="slider-prev" data-name="Slider Prev" class="slider_arrow_path" d="M8.158,0.007L8.835,0.685,1.5,8.019H32V8.979H1.5l7.338,7.334-0.677.679L0,8.839V8.16Z"></path></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17"  fill="#fff" viewBox="0 0 32 17"><path id="slider-next" data-name="Slider Next" class="slider_arrow_path" d="M23.842,0.007l-0.677.678L30.5,8.019H0V8.979H30.5l-7.338,7.334,0.677,0.679L32,8.839V8.16Z"></path></svg>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 30,
                        },

                        768 : {
                            items: 1,
                        },
                    },
                });
                $(this).on('translate.owl.carousel', function(event) {
                    var element   = event.target;
                    var thebackgroundIMG = '';
                    var currentImgSrcData = '';
                    
                    var checkActiveItemLoaded = setInterval(function() {
                        if(!$(element).find('.owl-item.active').hasClass('owl-item-active-loaded')) {
                            $(element).find('.owl-item').removeClass('owl-item-active-loaded');
                            $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                            thebackgroundIMG = $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img');
                            currentImgSrcData = $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src');
                            thebackgroundIMG.each(function () {
                                if($(this).hasClass('active')) {
                                    $(this).removeClass('active');
                                }else {
                                    $(this).removeAttr('src').attr('src', currentImgSrcData);
                                    $(this).addClass('active');
                                }
                            });
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                            clearInterval(checkActiveItemLoaded);
                        }
                                                
                    }, 10); // check every 10ms
                });
                function owl_onInitialized(event) {
                    var element         = event.target;
                    var itemCount       = event.item.count;
                    var itenIndex       = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;
    
                    var theCloned       = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }
    
                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
                    
                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(this).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                     
                    $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                };
                function counter(event) {
                    var element         = event.target;
                    var itemCount       = event.item.count;
                    var itenIndex       = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;
    
                    var theCloned       = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }
    
                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
                }
            });
        },

        carousel_1i_dot_number_get_background_style_2: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i-dot-number-get-background-style-2');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    autoHeight: true,
                    smartSpeed:450,
                    //animateOut: 'fadeOut',
                    onInitialized  : owl_onInitialized,
                    onTranslate : counter,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 30,
                        },

                        768 : {
                            items: 1,
                        },
                    },
                });
                $(this).on('translate.owl.carousel', function(event) {
                    var element   = event.target;
                    var thebackgroundIMG = '';
                    var currentImgSrcData = '';

                    var checkActiveItemLoaded = setInterval(function() {
                        if(!$(element).find('.owl-item.active').hasClass('owl-item-active-loaded')) {
                            $(element).find('.owl-item').removeClass('owl-item-active-loaded');
                            $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                            thebackgroundIMG = $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img');
                            currentImgSrcData = $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src');
                            thebackgroundIMG.each(function () {
                                if($(this).hasClass('active')) {
                                    $(this).removeClass('active');
                                }else {
                                    $(this).removeAttr('src').attr('src', currentImgSrcData);
                                    $(this).addClass('active');
                                }
                            });
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                            clearInterval(checkActiveItemLoaded);
                        }

                    }, 10); // check every 10ms
                });
                function owl_onInitialized(event) {
                    var element         = event.target;
                    var itemCount       = event.item.count;
                    var itenIndex       = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;

                    var theCloned       = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }

                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);

                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(this).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));

                    $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                };
                function counter(event) {
                    var element         = event.target;
                    var itemCount       = event.item.count;
                    var itenIndex       = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;

                    var theCloned       = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }

                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
                }
            });
        },
        
        carousel_1i_dot_number_effect: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i-dot-number-effect');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    autoHeight: true,
                    smartSpeed:450,
                    //animateOut: 'fadeOut',
                    onInitialized  : owl_onInitialized,
                    onTranslate : owl_onInitialized,
                    navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17" fill="#fff" viewBox="0 0 32 17"><path id="slider-prev" data-name="Slider Prev" class="slider_arrow_path" d="M8.158,0.007L8.835,0.685,1.5,8.019H32V8.979H1.5l7.338,7.334-0.677.679L0,8.839V8.16Z"></path></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17"  fill="#fff" viewBox="0 0 32 17"><path id="slider-next" data-name="Slider Next" class="slider_arrow_path" d="M23.842,0.007l-0.677.678L30.5,8.019H0V8.979H30.5l-7.338,7.334,0.677,0.679L32,8.839V8.16Z"></path></svg>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 30,
                        },

                        768 : {
                            items: 1,
                        },
                    },
                });
                $(this).on('translate.owl.carousel', function(event) {
                    var element   = event.target;
                    var thebackgroundIMG = '';
                    var currentImgSrcData = '';
                    
                    var checkActiveItemLoaded = setInterval(function() {
                        if(!$(element).find('.owl-item.active').hasClass('owl-item-active-loaded')) {
                            $(element).find('.owl-item').removeClass('owl-item-active-loaded');
                            $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                            thebackgroundIMG = $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img');
                            currentImgSrcData = $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src');
                            thebackgroundIMG.each(function () {
                                if($(this).hasClass('active')) {
                                    $(this).removeClass('active');
                                }else {
                                    $(this).removeAttr('src').attr('src', currentImgSrcData);
                                    $(this).addClass('active');
                                }
                            });
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                            $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                            clearInterval(checkActiveItemLoaded);
                        }
                                                
                    }, 10); // check every 10ms
                });
                function owl_onInitialized(event) {
                    var element         = event.target;
                    var itemCount       = event.item.count;
                    var itenIndex       = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;
    
                    var theCloned       = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }
    
                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
                    //console.log($(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                    $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(this).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                     
                    $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                };
            });
        },
        carousel_2i0m_number_effect: function() {
            var $carousels = $('.js-carousel-2i0m-number-effect');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 2,
                    margin: 0,
                    nav: true,
                    dots: true,
                    loop: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 700,
                    onInitialized  : counter,
                    onTranslate : counter,
                    onTranslated: showAnimation,
                    onDrag: removeAnimation,
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 0,
                        },

                        992 : {
                            items: 2,
                            margin: 0,
                        },
                    },
                });
            });
            function counter(event) {
                var element         = event.target;
                var itemCount       = event.item.count;
                var itenIndex       = event.item.index;
                var owlstageChildrens = $(element).find('.owl-stage').children().length;

                var theCloned       = owlstageChildrens - itemCount;
                var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                if(itenIndex < parseInt(theCloned / 2)) {
                    currentIndex = owlstageChildrens - theCloned;
                }else if(currentIndex > itemCount) {
                    currentIndex = currentIndex - itemCount;
                }

                $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
            }
            function removeAnimation(event) {
                // var $this = event.target;
                // var item = $($this).find('.owl-item');
                // $(item).find('.post__text').removeClass("fadeInText");
                // $(item).find('.post__text').addClass("opacity-default");
            }
            function showAnimation(event) {
                // var $this = event.target;
                // var item = $($this).find('.active');
                // $(item).find('.post__text').addClass("fadeInText");
                // $(item).find('.post__text').removeClass("opacity-default");
                // $(item).find('.post__thumb').removeClass("FadeOutThumb");
            }
        },
        carousel_2i50m_number_effect: function() {
            var $carousels = $('.js-carousel-2i50m-number-effect');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    loop: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 700,
                    onInitialized  : counter,
                    onTranslate : counter,
                    onTranslated: showAnimation,
                    onDrag: removeAnimation,
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 20,
                        },

                        991 : {
                            items: 1,
                            margin: 30,
                        },

                        992 : {
                            items: 2,
                            margin: 30,
                        },


                        1200 : {
                            items: 2,
                            margin: 50,
                        },
                    },
                });
            });
            function counter(event) {
                var element         = event.target;
                var itemCount       = event.item.count;
                var itenIndex       = event.item.index;
                var owlstageChildrens = $(element).find('.owl-stage').children().length;

                var theCloned       = owlstageChildrens - itemCount;
                var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                if(itenIndex < parseInt(theCloned / 2)) {
                    currentIndex = owlstageChildrens - theCloned;
                }else if(currentIndex > itemCount) {
                    currentIndex = currentIndex - itemCount;
                }

                $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
            }
            function removeAnimation(event) {
                // var $this = event.target;
                // var item = $($this).find('.owl-item');
                // $(item).find('.post__text').removeClass("fadeInText");
                // $(item).find('.post__text').addClass("opacity-default");
            }
            function showAnimation(event) {
                // var $this = event.target;
                // var item = $($this).find('.active');
                // $(item).find('.post__text').addClass("fadeInText");
                // $(item).find('.post__text').removeClass("opacity-default");
                // $(item).find('.post__thumb').removeClass("FadeOutThumb");
            }
        },
        
        carousel_2i30m_number_effect: function() {
            var $carousels = $('.js-carousel-2i30m-number-effect');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    loop: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 700,
                    onInitialized  : counter,
                    onTranslate : counter,
                    onTranslated: showAnimation,
                    onDrag: removeAnimation,
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 20,
                        },

                        480 : {
                            items: 1,
                            margin: 20,
                        },

                        481 : {
                            items: 2,
                            margin: 20,
                        },

                        577 : {
                            items: 3,
                            margin: 30,
                        },

                        991 : {
                            items: 3,
                            margin: 30,
                        },

                        992 : {
                            items: 2,
                            margin: 30,
                        },
                    },
                });
            });
            function counter(event) {
                var element         = event.target;
                var itemCount       = event.item.count;
                var itenIndex       = event.item.index;
                var owlstageChildrens = $(element).find('.owl-stage').children().length;

                var theCloned       = owlstageChildrens - itemCount;
                var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                if(itenIndex < parseInt(theCloned / 2)) {
                    currentIndex = owlstageChildrens - theCloned;
                }else if(currentIndex > itemCount) {
                    currentIndex = currentIndex - itemCount;
                }

                $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
            }
            function removeAnimation(event) {
                // var $this = event.target;
                // var item = $($this).find('.owl-item');
                // $(item).find('.post__text').removeClass("fadeInText");
                // $(item).find('.post__text').addClass("opacity-default");
            }
            function showAnimation(event) {
                // var $this = event.target;
                // var item = $($this).find('.active');
                // $(item).find('.post__text').addClass("fadeInText");
                // $(item).find('.post__text').removeClass("opacity-default");
                // $(item).find('.post__thumb').removeClass("FadeOutThumb");
            }
        },
        carousel_1i: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 1,
                    loop: true,
                    margin: 0,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                });
            })
        },
        /* ============================================================================
         * Carousel carousel_only_1i_loopdot
         * ==========================================================================*/
        carousel_only_1i_loopdot: function() {
            var $carousels = $('.js-atbs-ceris-carousel-only-1i-loopdot');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-chevron-thin-left"></i>', '<i class="mdicon mdicon-chevron-thin-right"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                        },

                    },
                });
            })
        },
        carousel_1i_get_background: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i-get-background');
            $carousels.each( function() {
                var $this = $(this);
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    nav: true,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    //autoHeight: true,
                    smartSpeed:450,
                    //animateOut: 'fadeOut',
                    navText: ['<i class="mdicon mdicon-chevron-thin-left"></i>', '<i class="mdicon mdicon-chevron-thin-right"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 30,
                        },

                        768 : {
                            items: 1,
                        },
                    },

                });
                $this.on('translate.owl.carousel', function(event) {
                    var element   = event.target;
                    var thebackgroundIMG = $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img');
                    var currentImgSrcData = $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src');
                    thebackgroundIMG.each(function () {
                        if($(this).hasClass('active')) {
                            $(this).removeClass('active');
                        }else {
                            $(this).find('img').removeAttr('src').attr('src', currentImgSrcData);
                            $(this).addClass('active');
                        }
                    });

                    if ( !($(element).parents('.atbs-ceris-block__inner').children('.owl-background img').hasClass('active'))){

                    }
                    var checkExist = setInterval(function() {
                        $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').find('img').attr('srcset', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('srcset'));
                        //$(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('href', $(element).find('.owl-item.active').find('h3 > a').attr('href'));
                        $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));                        
                        $(element).parents('.atbs-ceris-block__inner').find('.owl-background .owl-background-img.active').find('img').attr('src', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));

                        clearInterval(checkExist);
                    }, 100); // check every 100ms
                });

                // SetButtonNavDot($(this));
                $(window).resize(function () {
                    SetButtonNavDot($this);
                });
                function SetButtonNavDot(event) {
                    // set x
                    var width_button = parseFloat(event.find('.owl-nav .owl-next').css('width'));
                    var width_dots = parseFloat(event.find('.owl-dots').css('width'));
                    var spacing_x_owl_dots = width_button + 25;
                    var spacing_owl_next =  width_button + 25 + width_dots + 25;
                    // set y
                    var height_button = parseFloat(event.find('.owl-nav .owl-next').css('height'));
                    var height_dots = parseFloat(event.find('.owl-dots').css('height'));
                    var spacing_y_owl_dots =parseFloat( height_button / 2 - height_dots / 2 ) ;
                    if(   window.matchMedia("(max-width: 768px)").matches ){
                        width_button = parseFloat(event.find('.owl-nav .owl-next').css('width'));
                        width_dots = parseFloat(event.find('.owl-dots').css('width'));
                        spacing_x_owl_dots = width_button + 15;
                        spacing_owl_next =  width_button + 15 + width_dots + 15;

                        height_button = parseFloat(event.find('.owl-nav .owl-next').css('height'));
                        height_dots = parseFloat(event.find('.owl-dots').css('height'));
                        spacing_y_owl_dots =parseFloat( height_button / 2 - height_dots / 2 ) ;
                    }
                    event.find('.owl-dots').css({"left": spacing_x_owl_dots});
                    event.find('.owl-dots').css({"bottom": spacing_y_owl_dots});
                    event.find('.owl-nav .owl-next').css({"left": spacing_owl_next});
                }
            });
        },
        carousel_1i_not_nav: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i_not_nav');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                        },
                        481 : {
                            items: 1,
                        },


                        992 : {
                            items: 1,
                        },
                    },
                });
            })
        },

        carousel_1i_not_nav_2: function() {
            var $carousels = $('.js-atbs-ceris-carousel-1i_not_nav_2');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                        },
                        481 : {
                            items: 1,
                        },


                        992 : {
                            items: 1,
                        },
                    },
                });
            })
        },

        carousel_1i30m: function() {
            var $carousels = $('.js-carousel-1i30m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                });
            })
        },

        carousel_overlap: function() {
            var $carousels = $('.js-atbs-ceris-carousel-overlap');
            $carousels.each( function() {
                var $carousel = $(this);
                $carousel.flickity({
                    wrapAround: true,
                });

                $carousel.on( 'staticClick.flickity', function( event, pointer, cellElement, cellIndex ) {
                    if ( (typeof cellIndex === 'number') && ($carousel.data('flickity').selectedIndex != cellIndex) ) {
                        $carousel.flickity( 'selectCell', cellIndex );
                    }
                });
            })
        },
        carousel_2i10m: function() {
            var $carousels = $('.js-carousel-2i10m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 2,
                    margin: 10,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoplay: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 0,
                        },
                        769 : {
                            items: 2,
                        },
                    },


                });
            })
        },
        carousel_2i0m: function() {
            var $carousels = $('.js-carousel-2i0m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 2,
                    loop: true,
                    nav: true,
                    autoHeight:true,
                    dots: true,
                    smartSpeed: 600,
                    // animateOut: 'slideOutDown',
                    navText: ['<i class="mdicon mdicon-chevron-thin-left"></i>', '<i class="mdicon mdicon-chevron-thin-right"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },
                        992 : {
                            items: 2,
                        },

                    },
                });
            })
        },
        carousel_2i4m: function() {
            var $carousels = $('.js-carousel-2i4m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 2,
                    margin: 4,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },
                    },
                });
            })
        },
        carousel_2i30m5: function() {
            var $carousels = $('.js-carousel-2i30m5');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 3,
                    margin: 20,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoplay: false,
                    stagePadding: 100,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 15,
                            stagePadding: 0,
                        },
                        321:{
                            items: 1,
                            margin: 15,
                            stagePadding: 0,
                        },
                        381 : {
                            items: 1,
                            margin: 20,
                            stagePadding: 20,
                        },
                        421 : {
                            items: 1,
                            margin: 25,
                            stagePadding: 25,
                        },
                        481: {
                            items: 1,
                            margin: 30,
                            stagePadding: 50,
                        },
                        577: {
                            items: 1,
                            margin: 15,
                            stagePadding: 50,
                        },
                        681: {
                            items: 1,
                            margin: 30,
                            stagePadding: 100,
                        },
                        769 : {
                            items: 2,
                            stagePadding: 50,
                        },
                        992 : {
                            items: 2,
                            stagePadding: 100,
                        },
                        1600: {
                            items: 2,
                            margin: 30,
                            stagePadding: 200,
                        }
                    },
                });
            })
        },
        carousel_2i30m: function() {
            var $carousels = $('.js-carousel-2i30m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 2,
                    margin: 30,
                    smartSpeed: 910,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoplay: false,
                    mouseDrag: false,
                    touchDrag: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 0,
                            touchDrag: true,   
                        },
                        381 :{
                            items: 1,
                            margin: 25,
                            stagePadding: 0,
                        },
                        481 : {
                            items: 1,
                            margin:  10,
                        },
                        769 : {
                            items: 2,
                            margin:  15,
                        },
                        992 : {
                            items: 2,
                            margin: 30,
                        }
                    },

                });
                $(this).parent().find('.owl-background-item-left').css('background-image','url('+ $(this).find('.owl-item.active').first().prev().find('.post__thumb').attr('data-background') + ')');
                $(this).parent().find('.owl-background-item-front').css('background-image','url('+ $(this).find('.owl-item.active').first().find('.post__thumb').attr('data-background') + ')');
                $(this).parent().find('.owl-background-item-right').css('background-image','url('+ $(this).find('.owl-item.active').first().next().find('.post__thumb').attr('data-background') + ')');
                var img_front;
                var img_back;
                $(this).find('.owl-next').click(function() {
                    $(this).parents('.post-main').addClass('disable-owl-click');
                    $(this).parents('.post-main').find('.MoveLeftToRight').removeClass('MoveLeftToRight');
                    $(this).parents('.post-main').find('.owl-background-item-left').addClass('MoveRightToLeft owl-item-remove');
                    $(this).parent().parent().removeClass("StatusLeft");
                    $(this).parent().parent().addClass("StatusRight");
                    $(this).parents('.owl-carousel').removeClass("dragging");
                });
                $(this).find('.owl-prev').click(function() {
                    $(this).parents('.post-main').addClass('disable-owl-click');
                    $(this).parents('.post-main').find('.MoveLeftToRight').removeClass('MoveRightToLeft');
                    $(this).parents('.post-main').parent().find('.owl-background-item-left').addClass('MoveLeftToRight');
                    $(this).parent().parent().removeClass("StatusRight");
                    $(this).parent().parent().addClass("StatusLeft");
                    $(this).parents('.owl-carousel').removeClass("dragging");
                });
                $(this).on('translate.owl.carousel', function(event) {
                    var element   = event.target;
                    var checkExist = setInterval(function() {
                        if( $(element).hasClass('dragging') == false){
                            if($(element).hasClass('StatusRight')){
                                $(element).parent().find('.owl-background-item').children('div').css('margin-right', '0');
                                $(element).removeClass('StatusLeft');
                                var item_active_last = $(element).find('.owl-item.active').first().next();
                                img_back = $(item_active_last).find('.post__thumb').attr('data-background');

                                $(element).parent().find('.owl-background-item-front').first().addClass('owl-background-item-left');
                                $(element).parent().find('.owl-background-item-left').last().removeClass('owl-background-item-front');

                                $(element).parent().find('.owl-background-item-right').first().addClass('owl-background-item-front');
                                $(element).parent().find('.owl-background-item-front').removeClass('owl-background-item-right');
                                $(element).parent().find('.owl-background-item').append('<div class="owl-background-item-right" style="background-image: url(' + img_back  + ');"></div>');
                                clearInterval(checkExist);
                            }
                            else if( $(element).hasClass('StatusLeft')){
                                $(element).removeClass('StatusRight');
                                var item_active_first = $(element).find('.owl-item.active').first().prev();
                                img_front = $(item_active_first).find('.post__thumb').attr('data-background');

                                $(element).parent().find('.owl-background-item-left').first().addClass('owl-background-item-front');
                                $(element).parent().find('.owl-background-item-front').first().removeClass('owl-background-item-left');
                                $(element).parent().find('.owl-background-item-front').last().addClass('owl-background-item-right');
                                $(element).parent().find('.owl-background-item-right').removeClass('owl-background-item-front');
                                $(element).parent().find('.owl-background-item').prepend('<div class="owl-background-item-left margin-right-neg-100" style="background-image: url(' + img_front  + ');"></div>');

                                $(element).parent().find('.owl-background-item-right').last().remove();
                                clearInterval(checkExist);
                            }
                        }
                        clearInterval(checkExist);
                    }, 100); // check every 100ms
                });
                $(this).on('translated.owl.carousel', function(event) {
                    $(this).parent().find('.margin-right-neg-100').removeClass('margin-right-neg-100');
                    $(this).parent().find('.MoveLeftToRight').removeClass('MoveLeftToRight');
                    $(this).parent().find('.owl-background-item-front').removeClass('fade-in-fwd');
                    if($(this).hasClass('StatusRight')){
                        $(this).parent().find('.owl-item-remove').remove();
                    }
                    var $this = $(this);
                    var checkExist = setInterval(function() {

                        if($this.parents('.post-main').hasClass('disable-owl-click')) {
                            $this.parents('.post-main').removeClass('disable-owl-click');
                            clearInterval(checkExist);
                        }
                    }, 100); // check every 100ms
                });
                $(this).on("drag.owl.carousel", function (event) {
                    $(this).addClass("dragging");
                });
                $(this).on("dragged.owl.carousel", function (event) {
                    $(this).parent().find('.owl-background-item-front').addClass('fade-in-fwd');
                    $(this).parent().find('.owl-background-item-left').css('background-image','url('+ $(this).find('.owl-item.active').first().prev().find('.post__thumb').attr('data-background') + ')');
                    $(this).parent().find('.owl-background-item-front').css('background-image','url('+ $(this).find('.owl-item.active').first().find('.post__thumb').attr('data-background') + ')');
                    $(this).parent().find('.owl-background-item-right').css('background-image','url('+ $(this).find('.owl-item.active').last().find('.post__thumb').attr('data-background') + ')');

                    //console.log('event : ',event.relatedTarget['_drag']['direction']);
                    // touch right to left
                    // if( event.relatedTarget['_drag']['direction'] == 'left'){
                    //  console.log('a');
                    //
                    // }
                    // // touch left to right
                    // else{
                    //  console.log('b');
                    // }
                });
            })
        },

        carousel_3i: function() {
            var $carousels = $('.js-carousel-3i');
            $carousels.each( function() {
                $(this).owlCarousel({
                    loop: true,
                    nav: true,
                    dots: false,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },

                        992 : {
                            items: 3,
                        },
                    },
                });
            })
        },
        carousel_4i30m5_update: function() {
            var $carousels = $('.js-carousel-4i30m5-update');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 4,
                    margin: 20,
                    loop: true,
                    nav: false,
                    dots: true,
                    autoplay: false,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 15,
                        },
                        321:{
                            items: 1,
                            margin: 15,
                        },
                        380 : {
                            items: 1,
                            margin: 15,
                        },
                        481: {
                            items: 2,
                            margin: 15,
                        },
                        577: {
                            items: 2,
                            margin: 15,
                            stagePadding: 50,
                        },
                        680: {
                            items: 2,
                            margin: 15,
                        },
                        769 : {
                            items: 2,
                        },
                        992 : {
                            items: 3,
                        },
                        1600: {
                            items: 4,
                        }
                    },


                });
            })
        },
        
        carousel_3i30m5_update: function() {
            var $carousels = $('.js-carousel-3i30m5-update');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 3,
                    margin: 20,
                    loop: true,
                    nav: false,
                    dots: true,
                    autoplay: false,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 15,
                        },
                        321:{
                            items: 1,
                            margin: 15,
                        },
                        380 : {
                            items: 1,
                            margin: 15,
                        },
                        481: {
                            items: 2,
                            margin: 15,
                        },
                        577: {
                            items: 2,
                            margin: 15,
                            stagePadding: 50,
                        },
                        680: {
                            items: 2,
                            margin: 15,
                        },
                        769 : {
                            items: 2,
                        },
                        992 : {
                            items: 3,
                        },
                    },


                });
            })
        },
        carousel_3i30m5: function() {
            var $carousels = $('.js-carousel-3i30m5');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 3,
                    margin: 20,
                    loop: true,
                    nav: false,
                    dots: true,
                    autoplay: false,
                    autoWidth: true,
                    // stagePadding: 100,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 15,
                            // stagePadding: 0,
                        },
                        321:{
                            items: 1,
                            margin: 15,
                            // stagePadding: 30,
                        },
                        381 : {
                            items: 2,
                            margin: 15,
                            stagePadding: 30,
                        },
                        481: {
                            items: 2,
                            margin: 30,
                            // stagePadding: 50,
                            // stagePadding: 80,
                        },
                        577: {
                            items: 2,
                            margin: 15,
                            // stagePadding: 50,
                        },
                        680: {
                            items: 2,
                            margin: 15,
                            // stagePadding: 150,
                        },
                        769 : {
                            items: 3,
                            // stagePadding: 50,
                        },
                        992 : {
                            items: 3,
                            // stagePadding: 100,
                        },
                        1600: {
                            items: 4,
                        }
                    },


                });
            })
        },
        carousel_3i30m: function() {
            var $carousels = $('.js-carousel-3i30m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    margin: 30,
                    loop: true,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        781 : {
                            items: 2,
                        },

                        992 : {
                            items: 3,
                        },
                    },
                });
            })
        },

        carousel_3i4m: function() {
            var $carousels = $('.js-carousel-3i4m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 4,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },

                        992 : {
                            items: 2,
                        },
                        1200 : {
                            items: 3,
                        },
                    },
                });
            })
        },

        carousel_3i4m_small: function() {
            var $carousels = $('.js-carousel-3i4m-small');
            $carousels.each( function() {
                $(this).owlCarousel({
                    margin: 4,
                    loop: false,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    autoHeight: true,
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },

                        1200 : {
                            items: 3,
                        },
                    },
                });
            })
        },
        
        carousel_2i20m: function() {
            var $carousels = $('.js-carousel-2i20m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 20,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },
                    },
                });
            })
        },
        
        carousel_3i20m: function() {
            var $carousels = $('.js-carousel-3i20m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 20,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        481 : {
                            items: 2,
                        },

                        992 : {
                            items: 3,
                        },
                    },
                });
            })
        },

        carousel_headingAside_3i: function() {
            var $carousels = $('.js-atbs-ceris-carousel-heading-aside-3i');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 20,
                    nav: false,
                    dots: false,
                    loop: carousel_loop,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 10,
                            stagePadding: 40,
                            loop: false,
                        },

                        768 : {
                            items: 2,
                        },

                        992 : {
                            items: 3,
                        },
                    },
                });
            })
        },

        customCarouselNav: function() {
            if ( $.isFunction($.fn.owlCarousel) ) {
                var $carouselNexts = $('.js-carousel-next');
                $carouselNexts.each( function() {
                    var carouselNext = $(this);
                    var carouselID = carouselNext.parent('.atbs-ceris-carousel-nav-custom-holder').attr('data-carouselID');
                    var $carousel = $('#' + carouselID);

                    carouselNext.on('click', function() {
                        $carousel.trigger('next.owl.carousel');
                    });
                });

                var $carouselPrevs = $('.js-carousel-prev');
                $carouselPrevs.each( function() {
                    var carouselPrev = $(this);
                    var carouselID = carouselPrev.parent('.atbs-ceris-carousel-nav-custom-holder').attr('data-carouselID');
                    var $carousel = $('#' + carouselID);

                    carouselPrev.on('click', function() {
                        $carousel.trigger('prev.owl.carousel');
                    });
                });
            }
        },

        carousel_4i: function() {
            var $carousels = $('.js-carousel-4i');

            $carousels.each( function() {
                $(this).owlCarousel({
                    loop: true,
                    nav: true,
                    dots: false,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },

                        992 : {
                            items: 4,
                        },
                    },
                });
            })
        },
        carousel_4i0m: function() {
            var $carousels = $('.js-carousel-4i0m');

            $carousels.each( function() {
                $(this).owlCarousel({
                    loop: true,
                    nav: false,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            touchDrag: true,
                            mouseDrag  : true,
                            smartSpeed : 800,
                            margin: 20,
                        },
                        481: {
                            items: 2,
                            margin: 8,
                            touchDrag: true,
                            mouseDrag  : true,
                            smartSpeed : 800,
                        },
                        577: {
                            items: 2,
                            margin: 8,
                            touchDrag: true,
                            mouseDrag  : true,
                            smartSpeed : 800,
                        },
                        769 : {
                            items: 3,

                        },
                        992 : {
                            items: 3,
                        },
                        1200 : {
                            items: 4,
                        },
                    },
                });
            })
        },
        
        carousel_4i30m: function() {
            var $carousels = $('.js-carousel-4i30m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    loop: false,
                    nav: false,
                    margin: 30,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            touchDrag: true,
                            mouseDrag  : true,
                            smartSpeed : 800,
                        },
                        481: {
                            items: 2,
                            margin: 15,
                            touchDrag: true,
                            mouseDrag  : true,
                        },
                        577: {
                            items: 2,
                            margin: 15,
                            touchDrag: true,
                            mouseDrag  : true,
                        },
                        769 : {
                            items: 3,

                        },

                        992 : {
                            items: 4,
                        },
                    },
                });
            })
        },
        carousel_4i4m: function() {
            var $carousels = $('.js-carousel-4i4m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 4,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },

                        992 : {
                            items: 4,
                        },
                    },
                });
            })
        },
        carousel_4i20m: function() {
            var $carousels = $('.js-carousel-4i20m');

            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 4,
                    margin: 20,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                        },

                        768 : {
                            items: 2,
                        },

                        992 : {
                            items: 3,
                        },

                        1199 : {
                            items: 4,
                        },
                    },
                });
            })
        },

        carousel_5i0m: function() {
            var $carousels = $('.js-carousel-5i0m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 0,
                    // loop: carousel_loop,
                    loop:true,
                    nav: true,
                    dots: true,
                    center: true,
                    autoWidth: true,
                    autoHeight: true,
                    // autoplay: false,
                    // autoplayTimeout: 4000,
                    // autoplayHoverPause: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            center: false,
                            margin: 30,
                        },
                        381 : {
                            center: true,
                            margin: 30,
                        },
                        481 : {
                            items: 2,
                            margin: 30,
                        },
                        767 : {
                            items: 1,
                            margin: 30,
                        },
                        992 : {
                            margin: 0,
                        },
                        1199 : {
                            items: 5,
                        },
                    },
                });
            })
        },
        /* ============================================================================
         * Countdown timer
         * ==========================================================================*/
        countdown: function() {
            if ( $.isFunction($.fn.countdown) ) {
                var $countdown = $('.js-countdown');

                $countdown.each(function() {
                    var $this = $(this);
                    var finalDate = $this.data('countdown');

                    $this.countdown(finalDate, function(event) {
                        $(this).html(event.strftime(''
                        + '<div class="countdown__section"><span class="countdown__digit">%-D</span><span class="countdown__text meta-font">day%!D</span></div>'
                        + '<div class="countdown__section"><span class="countdown__digit">%H</span><span class="countdown__text meta-font">hr</span></div>'
                        + '<div class="countdown__section"><span class="countdown__digit">%M</span><span class="countdown__text meta-font">min</span></div>'
                        + '<div class="countdown__section"><span class="countdown__digit">%S</span><span class="countdown__text meta-font">sec</span></div>'));
                    });
                });
            };
        },

        /* ============================================================================
         * Scroll top
         * ==========================================================================*/
        goToTop: function() {
            if ($goToTopEl.length) {
                $goToTopEl.on('click', function() {
                    $('html,body').stop(true).animate({scrollTop:0},400);
                    return false;
                });
            }
        },

        /* ============================================================================
         * News ticker
         * ==========================================================================*/
        newsTicker: function() {
            var $tickers = $('.js-atbs-ceris-news-ticker');
            $tickers.each( function() {
                var $ticker = $(this);
                var $next = $ticker.siblings('.atbs-ceris-news-ticker__control').find('.atbs-ceris-news-ticker__next');
                var $prev = $ticker.siblings('.atbs-ceris-news-ticker__control').find('.atbs-ceris-news-ticker__prev');

                $ticker.addClass('initialized').vTicker('init', {
                    speed: 300,
                    pause: 3000,
                    showItems: 1,
                });

                $next.on('click', function() {
                    $ticker.vTicker('next', {animate:true});
                });

                $prev.on('click', function() {
                    $ticker.vTicker('prev', {animate:true});
                });
            })
        },

        /* ============================================================================
         * Lightbox
         * ==========================================================================*/
        lightBox: function() {
            if ( $.isFunction($.fn.magnificPopup) ) {
                var $imageLightbox = $('.js-atbs-ceris-lightbox-image');
                var $galleryLightbox = $('.js-atbs-ceris-lightbox-gallery');

                $imageLightbox.magnificPopup({
                    type: 'image',
                    mainClass: 'mfp-zoom-in',
                    removalDelay: 80,
                });

                $galleryLightbox.each(function() {
                    $(this).magnificPopup({
                        delegate: '.gallery-icon > a',
                        type: 'image',
                        gallery:{
                            enabled: true,
                        },
                        mainClass: 'mfp-zoom-in',
                        removalDelay: 80,
                    });
                });
            }
        },

        /* ============================================================================
         * Custom scrollbar
         * ==========================================================================*/
        perfectScrollbarInit: function() {
            var ps_area = $('.js-perfect-scrollbar');
            ps_area.each(function(index,element){
                const this_ps_area = element;
                new PerfectScrollbar(this_ps_area);
            });
        },

        /* ============================================================================
         * Sticky sidebar
         * ==========================================================================*/
        stickySidebar: function() {
            setTimeout(function() {
                var $stickySidebar = $('.js-sticky-sidebar');
                var $stickyHeader = $('.js-sticky-header');

                var marginTop = ($stickyHeader.length) ? ($stickyHeader.outerHeight() + 20) : 0; // check if there's sticky header

                if ( $( document.body ).hasClass( 'admin-bar' ) ) // check if admin bar is shown.
                    marginTop += 32;

                if ( $.isFunction($.fn.theiaStickySidebar) ) {
                    $stickySidebar.each(function () {
                        if($(this).hasClass('atbs-ceris-block__aside-left')) {
                            $(this).theiaStickySidebar({
                                additionalMarginTop: 0,
                                additionalMarginBottom: 0,
                            });
                        }else {
                            $(this).theiaStickySidebar({
                                additionalMarginTop: marginTop,
                                additionalMarginBottom: 20,
                            });   
                        }
                    });
                }
            }, 250); // wait a bit for precise height;
            var $stickySidebarMobileFixed = $('.js-sticky-sidebar.atbs-ceris-sub-col--mobile-fixed');
            $stickySidebarMobileFixed.each(function () {
                var $this = $(this);
                var $drop_sub_col = $($this).find('.drop-sub-col');
                var $open_sub_col = $($this).find('.open-sub-col');
                setTimeout(function () {
                    $($this).append('<div class="drop-sub-col"></div>');
                    // <i class="mdicon mdicon-arrow_forward"></i>
                    $($this).append('<div class="open-sub-col"><i class="mdicon mdicon-arrow_forward"></i></div>');

                    var checkExist = setInterval(function() {
                        if($drop_sub_col && $open_sub_col){
                            $drop_sub_col = $($this).find('.drop-sub-col');
                            $open_sub_col = $($this).find('.open-sub-col');
                            $drop_sub_col.on('click',function () {
                                $($this).removeClass('active');
                            });
                            $open_sub_col.on('click',function () {
                                $($this).addClass('active');
                            });
                            clearInterval(checkExist);
                        }
                    }, 100); // check every 100ms

                },250);
            });
        },

        /* ============================================================================
         * Bootstrap tooltip
         * ==========================================================================*/
        tooltipInit: function() {
            var $element = $('[data-toggle="tooltip"]');

            $element.tooltip();
        },
    };

    ATBS.documentOnLoad = {

        init: function() {
            ATBS.clippedBackground();
            ATBS.header.smartAffix.compute(); //recompute when all the page + logos are loaded
            ATBS.header.smartAffix.updateState(); // update state
            ATBS.header.stickyNavbarPadding(); // fix bootstrap modal backdrop causes sticky navbar to shift
            ATBS.documentOnReady.stickySidebar();
        }

    };

    /* ============================================================================
     * Blur background mask
     * ==========================================================================*/
    ATBS.clippedBackground = function() {
        if ($overlayBg.length) {
            $overlayBg.each(function() {
                var $mainArea = $(this).find('.js-overlay-bg-main-area');
                if (!$mainArea.length) {
                    $mainArea = $(this);
                }
                var $subArea = $(this).find('.js-overlay-bg-sub-area');
                var $subBg = $(this).find('.js-overlay-bg-sub');
                if(!$subArea.length){
                    return;
                }
                if(!$subBg.length){
                    return;
                }
                var leftOffset = $mainArea.offset().left - $subArea.offset().left;
                var topOffset = $mainArea.offset().top - $subArea.offset().top;
                
                $subBg.css('display', 'block');
                $subBg.css('position', 'absolute');
                $subBg.css('width', $mainArea.outerWidth() + 'px');
                $subBg.css('height', $mainArea.outerHeight() + 'px');
                $subBg.css('left', leftOffset + 'px');
                $subBg.css('top', topOffset + 'px');
            });
        };
    }

    /* ============================================================================
     * Priority+ menu
     * ==========================================================================*/
    ATBS.priorityNav = function($menu) {
        var $btn = $menu.find('button');
        var $menuWrap = $menu.find('.navigation');
        var $menuItem = $menuWrap.children('li');
        var hasMore = false;

        if(!$menuWrap.length) {
            return;
        }

        function calcWidth() {
            if ($menuWrap[0].getBoundingClientRect().width === 0)
                return;

            var navWidth = 0;

            $menuItem = $menuWrap.children('li');
            $menuItem.each(function() {
                navWidth += $(this)[0].getBoundingClientRect().width;
            });

            if (hasMore) {
                var $more = $menu.find('.priority-nav__more');
                var moreWidth = $more[0].getBoundingClientRect().width;
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
                //Remove the border width
                availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children('li:not(.priority-nav__more)');
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index){
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

                    $itemsToHide.each(function(index){
                        $(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
                    });

                    $itemsToHide.prependTo($more.children('ul'));
                } else {
                    var $moreItems = $more.children('ul').children('li');
                    var itemsToShowCount = 0;

                    if ($moreItems.length === 1) { // if there's only 1 item in "More" dropdown
                        if (availableSpace >= (navWidth - moreWidth + $moreItems.first().data('width'))) {
                            itemsToShowCount = 1;
                        }
                    } else {
                        $moreItems.each(function(index){
                            navWidth += $(this).data('width');
                            if (navWidth <= availableSpace) {
                                itemsToShowCount++;
                            } else {
                                return false;
                            }
                        });
                    }

                    if (itemsToShowCount > 0) {
                        var $itemsToShow = $moreItems.slice(0, itemsToShowCount);

                        $itemsToShow.insertBefore($menuWrap.children('.priority-nav__more'));
                        $moreItems = $more.children('ul').children('li');

                        if ($moreItems.length <= 0) {
                            $more.remove();
                            hasMore = false;
                        }
                    }
                }
            } else {
                var $more = $('<li class="priority-nav__more"><a href="#"><span><i class="mdicon mdicon-more_horiz"></i></span></a><ul class="sub-menu"></ul></li>');
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
                //Remove the border width
                availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children('li');
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index){
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

                    $itemsToHide.each(function(index){
                        $(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
                    });

                    $itemsToHide.prependTo($more.children('ul'));
                    $more.appendTo($menuWrap);
                    hasMore = true;
                }
            }
        }

        $window.on('load webfontLoaded', calcWidth );
        $window.on('resize', $.throttle( 50, calcWidth ));
    }

    $document.ready( ATBS.documentOnReady.init );
    $window.on('load', ATBS.documentOnLoad.init );
    $window.on( 'resize', ATBS.documentOnResize.init );

})(jQuery);
