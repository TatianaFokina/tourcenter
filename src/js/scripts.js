// Remove country
$(function($) {
	$('.region__remove-btn').on('click', function() {
		$(this).parent('.region__one-country').remove();
	});
});

// Select
$(function($) {
	var $selectBlockWrp = '.select-wrp', // Wrapper class
		$selectInput = '.select-input', // Input
		$selectBlock = '.select-block';	// Dropdown block class

	// Custom methods for showing/hiding dropdown block
	$.fn.hideBlock = function() {
		return this.hide().attr('aria-hidden', 'true');
	};
	$.fn.showBlock = function() {
		return this.show().attr('aria-hidden', 'false');
	};

	// Click on field
	$($selectInput).on('click, focus', function() {
		$(this).next($selectBlock).showBlock();
		$($selectInput).not(this).next($selectBlock).hideBlock();
	});
	// Close after item selection & copy city name
	$('.select-block__item').on('click', function() {
		var $cityName = $(this).text();
		$(this).parent($selectBlock).hideBlock().prev($selectInput).val($cityName);
	});

	// Hide when field lost focus (with tab button)
	$($selectInput).on('keydown', function(e) {
		var $keyCode = e.keyCode || e.which;
		if ($keyCode === 9) {
			$(this).next($selectBlock).hideBlock();
		}
	});


	$($selectBlockWrp).on('click', function(e) {
		e.stopPropagation();
	});
	// Close after click on document
	$(document).on('click', function() {
		$($selectBlock).hideBlock();
	});

});