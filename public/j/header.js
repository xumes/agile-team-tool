$( document ).ready(function() {
 
	$('#dropdown-display-li').on('mouseenter', function() {
	     
		$('#dropdown-display-li').attr("class","ibm-masthead-item-signin ibm-active");

	}).on('mouseleave', function(){
	     
		$('#dropdown-display-li').attr("class","ibm-masthead-item-signin");
	});
 
	$('#ibm-signin-minimenu-container').on('mouseenter', function() {
	     
		$('#dropdown-display-li').attr("class","ibm-masthead-item-signin ibm-active");

	}).on('mouseleave', function(){
	     
		$('#dropdown-display-li').attr("class","ibm-masthead-item-signin");
	});

});