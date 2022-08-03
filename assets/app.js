// Section Shopify Shopify.theme editor events

$(document)
.on('shopify:section:reorder', function(e){

  var $target = $(e.target);
  var $parentSection = $('#shopify-section-' + e.detail.sectionId);

  if (Shopify.theme.jsHeader.enable_overlay == true) {
    Shopify.theme.jsHeader.unload();
    Shopify.theme.jsHeader.updateOverlayStyle(Shopify.theme.jsHeader.sectionUnderlayIsImage());
  }

});

$(document)
.on('shopify:section:load', function(e){

  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Blocks within section
  var $jsSectionBlocks = $section.find('.shopify-section[class*=js]');

  var sectionObjectUrl = $section.find('[data-theme-editor-load-script]').attr('src');

  // Check classes on schema and look for js (eg. jsMap)
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js"){
      var triggerClass = section.classList[i];

      // Check to see if section script exists
      if (typeof Shopify.theme[triggerClass] == 'undefined') {
        // make AJAX call to load script
        Shopify.theme.loadScript(triggerClass, sectionObjectUrl, function () {
          Shopify.theme[triggerClass].init($(section));
        });
      } else {
        if (Shopify.theme[triggerClass]) {
          // console.log('Section: ' + triggerClass + ' has been loaded.')
          Shopify.theme[triggerClass].init($(section));
        } else {
          // console.warn('Uh oh, ' + triggerClass + ' is referenced in section schema class, but can not be found. Make sure "z__' + triggerClass + '.js" and Shopify.theme.' + triggerClass + '.init() function exists.');
        }
      }
    }
  }

  // Check classes on block element and look for js (eg. jsMap)
  if ($jsSectionBlocks.length > 0) {
    var $jsSectionBlockNames = $jsSectionBlocks.each(function () {
      for (var i = 0; i < this.classList.length; i++) {
        if (this.classList[i].substring(0, 2) === "js") {
          var triggerClass = this.classList[i];
          var $block = $('.'+ triggerClass)
          var blockUrl = $block.find('[data-theme-editor-load-script]').attr('src');

          // Check to see if section script exists
          if (typeof Shopify.theme[triggerClass] == 'undefined') {
            // make AJAX call to load script
            Shopify.theme.loadScript(triggerClass, blockUrl, function () {
              Shopify.theme[triggerClass].init($block);
            });
          } else {
            if (Shopify.theme[triggerClass]) {
              // console.log('Block: ' + triggerClass + ' has been loaded.')
              Shopify.theme[triggerClass].init($(this));
            } else {
              // console.warn('Uh oh, ' + triggerClass + ' is referenced in block class, but can not be found. Make sure "z__' + triggerClass + '.js" and Shopify.theme.' + triggerClass + '.init() function exists.');
            }
          }

        }
      }
    });
  }

  // Load video feature
  Shopify.theme.video.init();

  // Scrolling animations
  Shopify.theme.animation.init();

  // Initialize reviews
  Shopify.theme.productReviews.init();

  // Object Fit Images
  Shopify.theme.objectFitImages.init();

  // Infinite scrolling
  Shopify.theme.infiniteScroll.init();

  // Disclosure menus
  Shopify.theme.disclosure.enable();

  // Search
  $(document).on('click',  '[data-show-search-trigger]', function(){
    Shopify.theme.jsHeader.showSearch();
  });

  $('.search-overlay__close').on('click', function(){
    Shopify.theme.jsHeader.hideSearch();
  });

  if (Shopify.theme_settings.enable_autocomplete == true) {
    Shopify.theme.predictiveSearch.init();
  }
  // Product review scroll
  Shopify.theme.productReviews.productReviewScroll();

});


$(document)
.on('shopify:section:unload', function(e){

  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Blocks within section
  var $jsSectionBlocks = $section.find('.shopify-section[class*=js]');

  // Check classes on schema and look for js (eg. jsMap)
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js"){
      var triggerClass = section.classList[i];
      if (Shopify.theme[triggerClass]) {
        // console.log('Section: ' + triggerClass + ' is unloaded.')
        Shopify.theme[triggerClass].unload($(section));
      } else {
        // console.warn('Uh oh, ' + triggerClass + ' is referenced in section schema class, but can not be found. Make sure "z__' + triggerClass + '.js" and Shopify.theme.' + triggerClass + '.unload() function exists.');
      }
    }
  }

  // Check classes on block element and look for js (eg. jsMap)
  if ($jsSectionBlocks.length > 0) {
    var $jsSectionBlockNames = $jsSectionBlocks.each(function () {
      for (var i = 0; i < this.classList.length; i++) {
        if (this.classList[i].substring(0, 2) === "js") {
          var triggerClass = this.classList[i];
          if (Shopify.theme[triggerClass]) {
            // console.log('Block: ' + triggerClass + ' is unloaded.')
            Shopify.theme[triggerClass].unload($(this));
          } else {
            // console.warn('Uh oh, ' + triggerClass + ' is referenced in block class, but can not be found. Make sure "z__' + triggerClass + '.js" and Shopify.theme.' + triggerClass + '.unload() function exists.');
          }

        }
      }
    });
  }

  // Scrolling animations
  Shopify.theme.animation.unload($section);

  // QuantityBox
  Shopify.theme.quantityBox.unload($section);

  // Infinite scrolling
  Shopify.theme.infiniteScroll.unload($section);

  // Disclosure menus
  Shopify.theme.disclosure.enable();

});

$(document)
.on('shopify:section:select', function(e){

  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Force show state when section is selected in theme editor
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js") {
      var triggerClass = section.classList[i];
      if (Shopify.theme[triggerClass].showThemeEditorState) {
        Shopify.theme[triggerClass].showThemeEditorState(e.detail.sectionId, $section);
      }
    }
  }

  // Predictive search
  if (Shopify.theme_settings.enable_autocomplete == true) {
    Shopify.theme.predictiveSearch.init();
  }

  if($('.tabs').length > 0) {
    Shopify.theme.tabs.enableTabs();
  }

  if(isScreenSizeLarge() && Shopify.theme.jsHeader.enable_overlay === true) {
    Shopify.theme.jsHeader.updateOverlayStyle(Shopify.theme.jsHeader.sectionUnderlayIsImage());
  }

  if ($('.block__recommended-products').length > 0) {
    var $productPage = $('.block__recommended-products').parents('.product-page');
    Shopify.theme.jsRecommendedProducts.init($productPage);
  }

});

$(document)
.on('shopify:section:deselect', function(e){

  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Force hide state when section is selected in theme editor
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js") {
      var triggerClass = section.classList[i];
      if (Shopify.theme[triggerClass].showThemeEditorState) {
        Shopify.theme[triggerClass].hideThemeEditorState(e.detail.sectionId, $(section));
      }
    }
  }

});

// Block Shopify Shopify.theme editor events

$(document)
.on('shopify:block:select', function(e){

  var blockId = e.detail.blockId;
  var $parentSection = $('#shopify-section-' + e.detail.sectionId);
  var $block = $('#shopify-section-' + blockId);

  if($('.jsFeaturedPromos').length > 0) {
    Shopify.theme.jsFeaturedPromos.blockSelect($parentSection, blockId);
  }

  if($('.jsSlideshowWithText').length > 0) {
    Shopify.theme.jsSlideshowWithText.blockSelect($parentSection, blockId);
  }

  if ($('.jsSlideshowClassic').length > 0) {
    Shopify.theme.jsSlideshowClassic.blockSelect($parentSection, blockId);
  }

  if($('.jsTestimonials').length > 0) {
    Shopify.theme.jsTestimonials.blockSelect($parentSection, blockId);
  }

  // Sidebar collection multi-tag filter
  if ($block.hasClass('sidebar__block')) {
    var $toggleBtn = $block.find('[data-sidebar-block__toggle="closed"]');
    if ($toggleBtn) {
      Shopify.theme.jsSidebar.openSidebarBlock($toggleBtn);
    }
  }

  // Predictive search
  if (Shopify.theme_settings.enable_autocomplete == true) {
    Shopify.theme.predictiveSearch.init();
  }

  // Scrolling animations
  Shopify.theme.animation.init();

  // Object Fit Images
  Shopify.theme.objectFitImages.init();

});

$(document)
.on('shopify:block:deselect', function(e){

  var $block = $('#shopify-section-' + e.detail.blockId);

  if ($block.hasClass('sidebar__block')) {
    var $toggleBtn = $block.find('[data-sidebar-block__toggle="open"]');
    if ($toggleBtn) {
      Shopify.theme.jsSidebar.closeSidebarBlock($toggleBtn);
    }
  }

});

$(document)
.on('shopify:block:load', function(e){



});

// Document ready
$(function() {

  var $jsSections = $('.shopify-section[class*=js]');

  // Loop through sections with js classes and load them in
  var $jsSectionNames = $jsSections.each(function () {
    for (var i = 0; i < this.classList.length; i++) {
      if (this.classList[i].substring(0, 2) === "js"){
        var triggerClass = this.classList[i];
        if (Shopify.theme[triggerClass]) {
          // console.log('Section: ' + triggerClass + ' has been loaded.')
          Shopify.theme[triggerClass].init($(this));
        } else {
          // console.warn('Uh oh, ' + triggerClass + ' is referenced in section schema class, but can not be found. Make sure "z__' + triggerClass + '.js" and Shopify.theme.' + triggerClass + '.init() function exists.');
        }

      }
    }
  });

  var resizeTimer;

  // Store window width in variable
  var width = $(window).width(), height = $(window).height();

  $(window).on('resize', function(e) {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {

      Shopify.theme.objectFitImages.calculateAspectRatio();

      if (Shopify.theme.jsHeader.header_layout === 'vertical') {
        Shopify.theme.predictiveSearch.alignVerticalSearch()
      }

      if (!isScreenSizeLarge()){
        // When 798 or less
        Shopify.theme.mobileMenu.init();

      } else {

        // When larger than 798
        Shopify.theme.mobileMenu.unload();

        // Swatches
        if(Shopify.theme_settings.product_form_style == 'swatches') {
          Shopify.theme.thumbnail.enableSwatches();
        }
      }

    }, 250);

  });

  //Enable plyr
  Shopify.theme.video.init();

  // Predictive search
  if (Shopify.theme_settings.enable_autocomplete == true) {
    Shopify.theme.predictiveSearch.init();
  }

  Shopify.theme.dropdownMenu();

  Shopify.theme.disclosure.enable();

  // Scrolling animations
  Shopify.theme.animation.init();

  // QuantityBox
  Shopify.theme.quantityBox.init();

  /* Show secondary image on hover */
  if (Shopify.theme_settings.show_secondary_image == true) {
    Shopify.theme.thumbnail.showVariantImage();
  }

  // Collection swatches
  if (Shopify.theme_settings.show_collection_swatches) {
    Shopify.theme.thumbnail.enableSwatches();
  }

  // Quick shop
  if (Shopify.theme_settings.enable_quickshop) {
    Shopify.theme.thumbnail.showQuickShop();
  }

  // Currency converter
  if (Currency.show_multiple_currencies || Currency.native_multi_currency) {
    Shopify.theme.currencyConverter.init();
  }

  //Infinite scrolling
  if ($('[data-custom-pagination]').length) {
    Shopify.theme.infiniteScroll.init();
  }

  //Select event for native multi currency checkout
  $('.shopify-currency-form select').on('change', function () {
    $(this)
      .parents('form')
      .submit();
  });

  // Tabs
  if($('.tabs').length > 0) {
    Shopify.theme.tabs.enableTabs();
  }

  // Additional checkout buttons
  if (!isScreenSizeLarge()) {
    $('.additional-checkout-buttons').addClass('additional-checkout-buttons--vertical');
  }

  // Accordion
  if($('.accordion, [data-cc-accordion]').length > 0) {
    Shopify.contentCreator.accordion.init();
  }

  // Backwards compatiblity for Flexslider
  if($('.slider, .flexslider').length > 0) {
    Shopify.contentCreator.slideshow.init();
  }

  // Object Fit Images
  Shopify.theme.objectFitImages.init();

  // Responsive Video
  Shopify.theme.responsiveVideo.init();

  // Flickity IOS Fix
  Shopify.theme.flickityIosFix();

  // Product review scroll
  Shopify.theme.productReviews.productReviewScroll();

});

/*============================================================================
Slideshow arrows
==============================================================================*/


if(Shopify.theme_settings.icon_style == 'icon_solid') {
  var arrowShape = 'M95.04 46 21.68 46 48.18 22.8 42.91 16.78 4.96 50 42.91 83.22 48.18 77.2 21.68 54 95.04 54 95.04 46z';
} else {
  var arrowShape = 'M95,48H9.83L41,16.86A2,2,0,0,0,38.14,14L3.59,48.58a1.79,1.79,0,0,0-.25.31,1.19,1.19,0,0,0-.09.15l-.1.2-.06.2a.84.84,0,0,0,0,.17,2,2,0,0,0,0,.78.84.84,0,0,0,0,.17l.06.2.1.2a1.19,1.19,0,0,0,.09.15,1.79,1.79,0,0,0,.25.31L38.14,86A2,2,0,0,0,41,86a2,2,0,0,0,0-2.83L9.83,52H95a2,2,0,0,0,0-4Z';
}


/*============ drawer checkout js =============*/

  function reChargeGetCookie(name) {
    return (document.cookie.match('(^|; )' + name + '=([^;]*)')||0)[2];
  }

  function reChargeReDirection(redirect_url) {
    // Re-direct customer to desired URL
    window.location.href = redirect_url;
  }

  function reChargeBuildCheckoutURL() {
    // Build the Checkout URL
    var myshopify_domain = 'drbritenaturals.myshopify.com';

    var token = reChargeGetCookie('cart');
    try {
      // Cross-domain tracking with Google Analytics
      var ga_linker = ga.getAll()[0].get('linkerParam');
    } catch (e) {
      // 'ga' is not available
      var ga_linker = '';
    }
    // Customer email address for use in the Checkout URL
    var customer_param = '';

    var checkout_url = 'https://checkout.rechargeapps.com/r/checkout?myshopify_domain=' + myshopify_domain + '&cart_token=' + token + '&' + ga_linker + '&' + customer_param;
    
    window.location.href = checkout_url;
  }

  $('body').on('touchstart click', '.ajaxcart__checkout', function(e) {
    e.preventDefault();
    var token = reChargeGetCookie('cart');

    if($('body').find('.ajaxcart__product_inner').hasClass('subcribe_product')){
      reChargeBuildCheckoutURL();
    }else{
      window.location.href = '/checkout';     
    }    
  });
  

$(document).ready(function(){
  if($('.fixed-message__container').length > 0){
    var get_height_fix = $('.fixed-message__container').outerHeight();
    $('.footer__container').css('padding-bottom', get_height_fix+'px');
  }
});

$(window).resize(function(){
  if($('.fixed-message__container').length > 0){
    var get_height_fix = $('.fixed-message__container').outerHeight();
    $('.footer__container').css('padding-bottom', get_height_fix+'px');
  }
});