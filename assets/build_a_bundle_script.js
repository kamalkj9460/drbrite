// console.log('Build a Bundle script loaded !');
/*============================================================================
  Build a Bundles Script Start
==============================================================================*/

/* Shopify Helpers
======================================================*/

Shopify.helpers = {
	getParameter: function(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");

		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);

		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	},
	formatMoney: function(cents, format) {
		var formats, money_format, formatted_response;

		formats = ['money', 'money_with_currency', 'money_without_trailing_zeros', 'money_without_currency'];
		money_format = (format && formats.indexOf(format) > -1) ? format : Shopify.moneyFormat;

    if (cents == 0) {
      formatted_response = 'FREE';
    } else {
      formatted_response = Shopify.formatMoney(cents, Shopify.moneyFormat);
    }

		return formatted_response;
	},
	formatDate: function(date) {
		if (Object.prototype.toString.call(date) !== '[object Date]') {
			date = new Date(date);
		}

		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		var day = date.getDate();
		var month_index = date.getMonth();
		var year = date.getFullYear();

		return months[month_index] + ' ' + day + ', ' + year;
	},
	formatPercentage: function(percent, decimals) {
		var number = Number(percent);

		percent = (number < 1) ? percent * 100 : percent;

		if (typeof decimals == 'number') {
			percent = percent.toFixed(decimals);
		}

		return  percent + '%';
	},
	formatNumber: function(number, decimals) {
		var number = Number(number);

		if (typeof decimals == 'number') {
			number = number.toFixed(decimals);
		}

		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},
	sizeImage: function(url, size) {
		var extension = url.split('.').pop();
		size = (typeof size == 'undefined') ? '' : '_' + size;
		return url.replace('.' + extension, size + '.' + extension);
	},
	handlize: function(str) {
		return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
	},
	formatMonies: function(cents) { return cents; },
	addParameter: function(url, key, value) {
		var arr, parts, params, replaced;

		// Define arr to keep track of key/value pairs
		arr =[];

		// Break url into parts
		parts = url.split('?');

		// Assign url and params
		url = parts[0];
		params = parts[1];

		// Define replaced as false
		replaced = false;

		// Collect and update existing parameters
		if (params) {
			params = params.split('&');

			for (var i = 0; i < params.length; i++) {
				var param = params[i].split('=');

				if (param[0] == key) {
					arr.push(param[0] + '=' + encodeURIComponent(value));
					replaced = true;
				} else {
					arr.push(param[0] + '=' + param[1]);
				}
			}
		}

		// Add new parameter if we haven't replaced it
		if (!replaced) {
			arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
		}

		// Return url with parameters
		return (url + '?' + arr.join('&'));
	},
    amountToCents: function(amount) {
          if (typeof amount != 'string') {
              amount = amount.toString();
          }

          if (amount.indexOf('.') != -1) {
              amount = ((parseFloat(amount)).toFixed(2) * 100);
          } else {
              amount = ((parseInt(amount)));
          }

          return amount;
      },
    imageExtension: function(url) {
      return url.split(/\#|\?/)[0].split('.').pop().trim();
    },
	roundHalfDown: function(num) {
		return -Math.round(-num);
	}
};

/* Global variables
=========================================================*/

   var collection_handle = jQuery('#bb_collection_handle').val();
   var collection_max =  jQuery('#bb_collection_max').val();
   var bundle_line_items = [];
   var bundle_line_items_count = 0;
   var timestamp = new Date().getTime();
   var subscriptionText = 'Free';

   
   // Server Path
   var shop_permanent_domain = $('#bb_shop_domain').val();
   var server_url = 'http://codingkloud.com/shopify/apps/drbite/dr_create_bundle.php?shop='+shop_permanent_domain;
   var server_config = {server_path: server_url};

/* Bundles Events
=========================================================*/

  jQuery(document).ready(function(){
   
    // Add to Bundle
    jQuery(document).on('click','.addToBundle',function(e){
      e.preventDefault();
      var $this = $(this);
      addToBundle($this);
    });
    
    
    // Remove From Bundle
    jQuery(document).on('click','.removeFromBundle',function(e){
      e.preventDefault();
      var $this = $(this);
      removeFromBundle($this);
    });

    // Remove From Bundle Products
    jQuery(document).on('click','.bb_product_remove',function(e){
      e.preventDefault();
      var $this = $(this);
      removeProductsFromBundleLineItems($this);
    });
    
     // Create Bundle 
    jQuery(document).on('click','.bb-create-bundle-btn',function(e){
      e.preventDefault();
      var $this = $(this);
      createBundle($this);
    });
  });


/* Bundles Functions
=========================================================*/

   function ShowNotification(){
      if (!$('.fancybox-active').length) {
        $('.bb-notification-modal').addClass('');
        $.fancybox.open($('.bb-notification-modal'), {
          hash: false,
          infobar: false,
          toolbar: false,
          loop: true,
          smallBtn: true,
          touch: false,
          video: {
            autoStart: false
          },
          mobile: {
            preventCaptionOverlap: false,
            toolbar: true
          },
          beforeLoad: function beforeLoad(instance, slide) {
            // Use unique identifier for the product gallery
            var src = slide.src;
            
          },
          afterLoad: function afterLoad(instance, slide) {
            
          },
          afterShow: function afterShow(e, instance) {
           
          },
          beforeClose: function beforeClose(e, instance) {
            // Use unique identifier for the product gallery
           $('body').removeClass('model-loaded');
          }
        });
      }
   }


   function parseInteger(number){
     number = isNaN(number) ? 0 : parseInt(number);
     return number;
   }
 
   function remainingCollectionMaximum(){
      var as_array = 0;
      var remaining_count = 0;
      var product_count = 0;

      // collection maximum reached
      if (collection_max == 0) {
          return as_array ? new Array(Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
      }
      // collection has specific maximums...
      else {
          remaining_count = Math.max((collection_max - bundle_line_items.length), 0);

          return as_array ? new Array(remaining_count) : remaining_count;
      }
   }

   // add to bundle line items product
   function addBundleLineItem(productId, $this){
     for (var i = 0; i < collection_data.products.length; i++) {
       if( parseInt(collection_data.products[i].id) == parseInt(productId)){
          // Add to array
		  bundle_line_items.push(collection_data.products[i]);
       }
     }
   }


  // Remove from  array
  function removeBundleLineItem(item, bundle_line_items, $this){
    
    var last_index = -1;
    
    for (var i = bundle_line_items.length, index, line_item; i > 0; i--) {
        
        index = i - 1;
        line_item = bundle_line_items[index];
      
        if (line_item.id == item.productId && line_item.variant_id == item.variantId) {
            bundle_line_items.splice(index, 1);
            break;
        }
    }
  }

        
  function updateRightSideHTML($this){
     var productImageSrc = $this.parents('.bbProduct_item').find('.bbProduct_image img').attr('src');
     var productTitle = $this.parents('.bbProduct_item').find('.bbProduct_content h3').text();
     
     jQuery('.yb_product_item').each(function(){
      	if(jQuery(this).hasClass('yb_product_placeholder')) {
          
          	jQuery(this).find('.yb_product_image img').attr('src',productImageSrc);
          	jQuery(this).find('.yb_product_title h3').text(productTitle);
          	
          	jQuery(this).removeClass('yb_product_placeholder');
          	jQuery(this).addClass('yb_product_added');
            return false;
            // breaks
        }
     });
   }
   
   function updateTimestamp() {
	 timestamp = new Date().getTime();
   }

   function update_product_qty($this, qty){
     qty = parseInteger(qty);
     
     $this.parents('.bbProduct_item').find('.bbProduct_qty').text(qty);
     $this.parents('.bbProduct_item').find('.bb_product_qty_input').attr('value',qty);
   }

   /* Add TO BUNDLE
   ====================================================*/
   function addToBundle($this) {
         
        var productId = $this.parents('.bbProduct_item').attr('data-product-id');
        var buttonType = $this.attr('data-type');
        var remaining_count = remainingCollectionMaximum();
        
        if (remaining_count > 0) {
            // get quantity
            var quantity = $this.parents('.bbProduct_item').find('.bb_product_qty_input').val();
          
            quantity = parseInteger(quantity);
           
            // Increase quantity
            quantity += 1;
            
            if(parseInt(quantity) == 1 && buttonType == 'true'){
              $this.parents('.bbProduct_item').find('.bbProduct_addtobundle_qty_action').removeClass('bb-hidden');
              $this.addClass('bb-hidden');
            }
           
            // update quantity val
            update_product_qty($this, quantity);
        
            // Add to array
            addBundleLineItem( productId, $this);
          
            // Refresh bundles product
            updateRightBundleLineItems(bundle_line_items);
           
            // updatePrice
            updateBundlePrice(bundle_line_items);
          
            // Update timestamp
            updateTimestamp();
        } else {
            alert('Maximum Reached !');
//             ShowNotification();
        }
    }
  
   /* REMOVE FROM BUNDLE
   ====================================================*/
    function removeFromBundle($this) {
       // get product id 
        var productId = $this.parents('.bbProduct_item').attr('data-product-id');
        var variantId = $this.parents('.bbProduct_item').attr('data-variant-id');

        var item = {"productId": productId, "variantId" : variantId};
      
       // get quantity
        var quantity = $this.parents('.bbProduct_item').find('.bb_product_qty_input').val();

        quantity = parseInteger(quantity);

        // Reduce quantity
        quantity -= 1;

        if(quantity <= 0){
          $this.parents('.bbProduct_item').find('.bbProduct_addtobundle').removeClass('bb-hidden');
          $this.parents('.bbProduct_item').find('.bbProduct_addtobundle_qty_action').addClass('bb-hidden');
        }
      
        // Update buttons 
        update_product_qty($this, quantity);

        // Remove last instance
        removeBundleLineItem(item, bundle_line_items, $this);
       
        // update right side bundles product html
        updateRightBundleLineItems(bundle_line_items);
      
        // updatePrice
        updateBundlePrice(bundle_line_items);
      
        // Update timestamp
        updateTimestamp();
   }

  function removeProductsFromBundleLineItems($this){
       // get product id 
        var productId = $this.attr('data-product-id');
        var variantId = $this.attr('data-variant-id');

        var item = {"productId": productId, "variantId" : variantId};
      
        // get quantity
        var bbProductId = '#bbProduct_'+ productId;
        
        var quantity = $(bbProductId).find('.bb_product_qty_input').val();

        quantity = parseInteger(quantity);

        // Reduce quantity
        quantity -= 1;
       
        if(quantity <= 0){
          $(bbProductId).find('.bbProduct_addtobundle').removeClass('bb-hidden');
          $(bbProductId).find('.bbProduct_addtobundle_qty_action').addClass('bb-hidden');
        }
        
        $(bbProductId).find('.bb_product_qty_input').attr('value', quantity);
        $(bbProductId).find('.bbProduct_qty').text(quantity);

       
        // Remove last instance
        removeBundleLineItem(item, bundle_line_items, $this);
       
        // update right side bundles product html
        updateRightBundleLineItems(bundle_line_items);
      
        // updatePrice
        updateBundlePrice(bundle_line_items);
    
        // Update timestamp
        updateTimestamp();
  }


  // Update Bundle Product added Listing    
  function updateRightBundleLineItems(bundle_line_items){
    var line_items_div = $('#bb_bundle_line_item_loop');
    var lineItemHTML = "";
    var line_item_counter = bundle_line_items.length;
    var product_placeholder_counter = parseInt(collection_max) - parseInt(line_item_counter);
    
    if(line_item_counter > 0){
      for (var i = 0; i < bundle_line_items.length; i++) { 
        lineItemHTML += '<div class="yb_product_item yb_product_added">';
        lineItemHTML += '<div class="yb_product_image">';
        lineItemHTML += '<img src="'+ bundle_line_items[i].thumbnail +'">';
        lineItemHTML += '</div>';
        lineItemHTML += '<div class="yb_product_title">';
        lineItemHTML += '<h3>'+ bundle_line_items[i].title +'</h3>';
        lineItemHTML += '</div>';
        lineItemHTML += '<a class="yb_product_remove bb_product_remove" data-variant-id="'+ bundle_line_items[i].variant_id + '" data-product-id="'+ bundle_line_items[i].id + '">x</a>';
        lineItemHTML += '</div>'; 
     }
      
     if(product_placeholder_counter > 0){
       for (var i = 1; i <= product_placeholder_counter; i++) { 
        lineItemHTML += '<div class="yb_product_item yb_product_placeholder">';
        lineItemHTML += '<div class="yb_product_image">';
        lineItemHTML += '<img src="https://cdn.shopify.com/s/files/1/0083/5036/7804/t/77/assets/ProductIcon.png?v=8459142815598837924">';
        lineItemHTML += '</div>';
        lineItemHTML += '<div class="yb_product_title">';
        lineItemHTML += '<h3>(Add a Product)</h3>';
        lineItemHTML += '</div>';
        lineItemHTML += '<a class="yb_product_remove">x</a>';
        lineItemHTML += '</div>'; 
       }
     }
    }else{
    
     for (var pindex = 0; pindex < collection_max; pindex++) { 
      lineItemHTML += '<div class="yb_product_item yb_product_placeholder">';
      lineItemHTML += '<div class="yb_product_image">';
      lineItemHTML += '<img src="https://cdn.shopify.com/s/files/1/0083/5036/7804/t/77/assets/ProductIcon.png?v=8459142815598837924">';
      lineItemHTML += '</div>';
      lineItemHTML += '<div class="yb_product_title">';
      lineItemHTML += '<h3>(Add a Product)</h3>';
      lineItemHTML += '</div>';
      lineItemHTML += '<a class="yb_product_remove" >x</a>';
      lineItemHTML += '</div>'; 
     }
    }
    line_items_div.html(lineItemHTML);
   }
  
  /* Get Substotal Price */
  function getWithoutSubscriptionPrice(bundle_line_items){ 
     var line_items = bundle_line_items;
     var totalPrice = 0; 
     if(line_items.length > 0){
       for (var index = 0; index < line_items.length; index++) { 
          totalPrice += line_items[index].price;
       }
     }
     return totalPrice;
  }
 
  function getWithSubscriptionPrice(bundle_line_items){ 
     var line_items = bundle_line_items;
     var totalPrice = 0; 
     if(line_items.length > 0){
       for (var index = 0; index < line_items.length; index++) { 
         let price = line_items[index].price;
         let subscription_price = line_items[index].subscription_price;
         if(parseInt(price) > parseInt(subscription_price)){
          totalPrice += line_items[index].subscription_price;
         }else{
          totalPrice += line_items[index].price;
         }
       }
     }
     return totalPrice;
  }

  // update cart subtotal price
  function updateBundlePrice(bundle_line_items){
     var totalPrice = 0; 
     
     if(bundle_line_items.length > 0){
       
       if(bundle_data.subscriptionSave == 'true'){
       // active subscription
       totalPrice = getWithSubscriptionPrice(bundle_line_items);
       }else{
       // unsubscribe
       totalPrice = getWithoutSubscriptionPrice(bundle_line_items);
       }
       
       $('#bb_subscription').find('.sub_counter').html(bundle_line_items.length);
     }else{
       $('#bb_subscription').find('.sub_price').html(subscriptionText);
       $('#bb_subscription').find('.sub_counter').html(bundle_line_items.length);
     } 
     
     // update add to cart btn
     if(parseInt(bundle_line_items.length) === parseInt(collection_max)){
       $('.subscription_action a').removeClass('bb-btn-deactive');
       $('.subscription_action a').addClass('bb-create-bundle-btn');
     }else{
       $('.subscription_action a').addClass('bb-btn-deactive');
       $('.subscription_action a').removeClass('bb-create-bundle-btn');
     }
    
     bundle_data.subtotal = totalPrice;
     updateSubcriptionPrice( bundle_data.subscription.is_subscription );
   }


 /* Bundle Subscription
=========================================================*/
 jQuery(document).on('change','#subscribeSave', function(e){
   e.preventDefault();
   var status = 'false';
   if ($(this).is(':checked')) {
     status = 'true';
     $(this).val(status);
     bundle_data.subscriptionSave = status;
     $(this).parents('.subscription-box').find('.subscription_options').removeClass('rc_hidden');
   }else{
     status = 'false';
     $(this).val(status);
     bundle_data.subscriptionSave = status;
     $(this).parents('.subscription-box').find('.subscription_options').addClass('rc_hidden');
   }
   updateSubcriptionPrice();
 });

 function updateSubcriptionPrice(){
   var subtotal = bundle_data.subtotal;
   var subscription_savings = 0;
   var discount = 0;
   
   // if subscription bundle active or not
   if(bundle_data.subscriptionSave == 'true' && bundle_data.subtotal > 0){
     
     // interval frequency
     bundle_data.subscription.selected_frequency = $('.subscription_options option:selected').val();
     
     // total subscrption price
     discount = getWithSubscriptionPrice(bundle_line_items); 
     bundle_data.subscription.discounted_price = discount;
     bundle_data.total_subscription_price = discount;
       
     subscription_savings = subscriptionSavings();
     
     if(bundle_data.subscription.discounted_price != bundle_data.subtotal){
     $('.subscription-box').find('.subscription-save-price').text(Shopify.formatMoney(subscription_savings, $('body').data('money-format')));
     $('.subscription-box').find('.sub-save-box').removeClass('rc_hidden');
     
     $('#bb_subscription').find('.sub_price').html('<span style="color:#f46f63;">'+Shopify.formatMoney(bundle_data.subscription.discounted_price, $('body').data('money-format'))+'</span><span style="text-decoration: line-through;">'+Shopify.formatMoney(bundle_data.subtotal, $('body').data('money-format'))+'</span>');
     }else{
     $('#bb_subscription').find('.sub_price').html(Shopify.formatMoney(bundle_data.subtotal, $('body').data('money-format')));
     }
   }else{
     
     bundle_data.subscription.discounted_price = discount;
     
     $('.subscription-box').find('.subscription-save-price').text(Shopify.formatMoney(bundle_data.subscription.discounted_price, $('body').data('money-format')));
     $('.subscription-box').find('.sub-save-box').addClass('rc_hidden');
     
     if(bundle_data.subtotal > 0){
      $('#bb_subscription').find('.sub_price').html(Shopify.formatMoney(bundle_data.subtotal, $('body').data('money-format')));
      bundle_data.total_subscription_price = subtotal;
     }else{
      $('#bb_subscription').find('.sub_price').text(subscriptionText);
      bundle_data.total_subscription_price = subtotal;
     }
   }
 }

 function subscriptionSavings() {
  	return (bundle_data.subtotal - bundle_data.subscription.discounted_price);
 }


 /* Add To Cart Functions
=========================================================*/

  var bundleComponentTitles = function() {
      var titles = [];

      for (var i = 0; i < bundle_line_items.length; i++) {
          titles.push(bundle_line_items[i].title.replace(',', '&comma;'));
      }

      return titles.join(', ');
   }
  
  var bundleVariants = function() {
      var bundle_variants = [], product, variant_id, data;

      for (var i = 0; i < bundle_line_items.length; i++) {
          product = bundle_line_items[i];
          variant_id = product.variant_id;
          data = variant_id + ':' + 1;

          bundle_variants.push(data);
      }

      return bundle_variants.join(',');
  }
  
  var bundleSusbcriptionVariants = function() {
      var bundle_variants = [], product, variant_id, data;

      for (var i = 0; i < bundle_line_items.length; i++) {
          product = bundle_line_items[i];
         
          if(parseInt(product.price) > parseInt(product.subscription_price) && bundle_data.subscriptionSave == 'true'){
          variant_id = product.subscription_id;
          }else{
          variant_id = product.variant_id;
          }
          data = variant_id + ':' + 1;

          bundle_variants.push(data);
      }

      return bundle_variants.join(',');
  }
   
  function createBundle($this){
     $this.html('Adding...').prop('disabled', true);
     $this.addClass('bb-btn-deactive');
    
     // Update timestamp
     updateTimestamp();
    
     addToAllItems( $this );
  }

// Add to All Items
 function addToAllItems( $this ) {
    
	Shopify.queue = [];
    
	var quantity = parseInt($('#bb_cart_count').val());
    var bundle_selected_frequency = $('.subscription_select option:selected').val();
        
  	for (var i = 0; i < bundle_line_items.length; i++) { 
	    product = bundle_line_items[i];
        var subscription_status = false;
        if(parseInt(product.price) > parseInt(product.subscription_price) && bundle_data.subscriptionSave == 'true'){
          subscription_status = true;
        }
        
	    Shopify.queue.push({
	      variant_id: product.variant_id,
          subscription_id:product.subscription_id,
          handle: product.handle,
          title: product.title,
          properties: product.properties,
          subscription_status:subscription_status
        });
        
    }
   
	Shopify.moveAlong = function() {
	  // If we still have requests in the queue, let's process the next one.
      
	  if (Shopify.queue.length) {
        var properties_collection = [];
	    var request = Shopify.queue.shift();
        var variant_id = request.variant_id;
        if(request.subscription_status){
         variant_id = request.subscription_id;
        }
        
        
        let properties = {
            '_bundle_type': 'Build Your Own',
            '_bundle_id': timestamp,
            '_bundle_context': collection_data.title,
            '_bundle_title': collection_data.bundle_title,
            '_bundle_img': collection_data.image,
            '_bundle_url': '/pages/' + collection_data.bundle_handle,
            '_bundle_handle': collection_data.handle,
            '_bundle_item_titles': bundleComponentTitles(),
            '_bundle_item_count': bundle_line_items.length,
            '_bundle_variants': bundleVariants(),
            '_bundle_subscription_variants': bundleSusbcriptionVariants(),
            '_bundle_item_index': Shopify.queue.length,
            '_bundle_item_total': getWithoutSubscriptionPrice(bundle_line_items),
            '_bundle_item_subscription_total': getWithSubscriptionPrice(bundle_line_items),
            '_ck_variant_id': request.variant_id,
            '_ck_has_subscription': request.subscription_status,
            '_ck_discount_percentage': request.properties._ck_discount_percentage,
            '_ck_subscription_interval_frequency': request.properties._ck_subscription_interval_frequency,
            '_ck_subscription_interval_unit_type': request.properties._ck_subscription_interval_unit_type,
            '_ck_subscription_id': request.subscription_id,
            '_bundle_subscription_status':bundle_data.subscriptionSave,
            
        }
        
        var data = {
            id: variant_id,
            quantity: 1,
            properties:properties
        };
        
        // Override one-time item with subscription settings
        if (bundle_data.subscriptionSave == 'true') {
            data.properties._bundle_subscription_selected_frequency= bundle_selected_frequency;
            data.properties._bundle_free_shipping = true;
            data.properties.shipping_interval_frequency = bundle_selected_frequency;
            data.properties.shipping_interval_unit_type = request.properties._ck_subscription_interval_unit_type;
        }
        
        $.ajax({
	      type: 'POST',
          url: '/cart/add.js',
	      dataType: 'json',
	      data: data,
	      success: function(res){
	        Shopify.moveAlong();
		    quantity = parseInt(quantity) + 1;
	      },
          error: function(){
	     // if it's not last one Move Along else update the cart number with the current quantity
		   if (Shopify.queue.length){
		    Shopify.moveAlong()
           } else {
             $this.removeClass('bb-btn-deactive');
             $this.html('Add to Cart').prop('disabled', false);
           }
	      }
       });
     }
      
	// If the queue is empty, we add 1 to cart
	else {
	  quantity = parseInt(quantity) + 1;
      $this.removeClass('bb-btn-deactive');
      $this.html('Add to Cart').prop('disabled', false);
      
      showCartCounter(quantity);
      
	  window.Rebuy.SmartCart.show();
	}
   }
    
   Shopify.moveAlong();
 }

 function showCartCounter(qty){
   $('#cartCounter').html(qty);
   $('#mobileCartCounter').html(qty);
 }

 
