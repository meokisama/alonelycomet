jQuery(document).ready(function($){
    //for sorting the social networks
    $('.network-settings').sortable({
        containment: "parent"
    });

    //for the tabs
    $('.apsl-settings-tab').click(function(){
        $( '.apsl-settings-tab' ).removeClass( 'apsl-active-tab' );
        $(this).addClass( 'apsl-active-tab' );
        var tab_id = 'tab-'+$(this).attr('id');
        $('.apsl-tab-contents').hide();
        $('#'+tab_id).show();
    });


    $('.apsl-label').click(function(){
        $(this).closest('.apsl-settings').find('.apsl_network_settings_wrapper').toggle('slow', function(){
            if ($(this).closest('.apsl-settings').find('.apsl_network_settings_wrapper').is(':visible')) {
                $(this).closest('.apsl-settings').find('.apsl_show_hide i').removeClass('fa-caret-down');
                $(this).closest('.apsl-settings').find('.apsl_show_hide i').addClass('fa-caret-up');
            }else {
                $(this).closest('.apsl-settings').find('.apsl_show_hide i').removeClass('fa-caret-up');
                $(this).closest('.apsl-settings').find('.apsl_show_hide i').addClass('fa-caret-down');
             }

        });
    });

    // for hide show options based on logout redirect options
    $('.apsl_custom_logout_redirect_options').click(function(){
       if($(this).val()==='custom_page') {
            $('.apsl-custom-logout-redirect-link').show('slow');
        }else{
            $('.apsl-custom-logout-redirect-link').hide('show');
        }
    });

    // for hide show options based on logout redirect options
    $('.apsl_custom_login_redirect_options').click(function(){
       if($(this).val()==='custom_page') {
            $('.apsl-custom-login-redirect-link').show('slow');
        }else{
            $('.apsl-custom-login-redirect-link').hide('show');
        }
    });

});