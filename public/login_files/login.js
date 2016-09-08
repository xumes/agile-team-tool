/*jslint  */
/**
 * @author manabsarkar@in.ibm.com v1.0 2015/08/13
 * @description
 * <p>
 * Contains triggers required for Signin Page  functionality hosted within iDaaS.
 * </p>
 */
jQuery(function() {
  jQuery('#username, #password').on('keypress', function(event) {
    if (event.which === 13) {
      var emailAddress = jQuery.trim(jQuery('#username').val());
      var password = jQuery.trim(jQuery('#password').val());
      // condition changed for legecy Ids
      if (emailAddress !== "" && password !== "") {
        document.forms['ibmid-signin-form'].submit();
        event.preventDefault();
      } else if (emailAddress !== "" && password === "") {
        jQuery('#password').focus();
        jQuery('#password').removeClass('success').addClass('error');
        event.preventDefault();
      } else if (emailAddress === "" && password !== "") {
        jQuery('#username').removeClass('success').addClass('error');
        jQuery('#username').focus();
        event.preventDefault();
      } else {
        jQuery('#username').removeClass('success').addClass('error');
        jQuery('#username').focus();
        event.preventDefault();
      }
      event.preventDefault();
    }
  });
  jQuery('#signinbutton').on('click', function(event) {
    var emailAddress = jQuery.trim(jQuery('#username').val());
    var password = jQuery.trim(jQuery('#password').val());

    if (emailAddress !== "" && password !== "") {
      document.forms['ibmid-signin-form'].submit();
      event.preventDefault();
    } else if (emailAddress !== "" && password === "") {
      jQuery('#password').focus();
      jQuery('#password').removeClass('success').addClass('error');
      event.preventDefault();
    } else if (emailAddress === "" && password !== "") {
      jQuery('#username').removeClass('success').addClass('error');
      jQuery('#username').focus();
      event.preventDefault();
    } else {
      jQuery('#username').removeClass('success').addClass('error');
      jQuery('#username').focus();
      event.preventDefault();
    }
    event.preventDefault();
  });
  jQuery(":input").on('keyup', function() {
    if (jQuery(this).val() !== '') {
      jQuery(this).removeClass('error');
    }
  });
  jQuery('#showpass, #showpass2').on('click', function(e) {
    if (jQuery('input:password').attr('type') === 'password') {
      jQuery('input:password').attr('type', 'text');
      jQuery('#showpass').addClass('hide');
      jQuery('#showpass2').addClass('hide');
    } else {
      jQuery('input:text').filter('#password, #new_password, #confirmPassword, #ng_pwr_password, #ng_pwr_confirmPassword').attr('type', 'password');
      jQuery('#showpass,#showpass2').removeClass('hide');
    }
    e.preventDefault();
  });
  jQuery('#ibmid-signin-form').trigger("reset");
});