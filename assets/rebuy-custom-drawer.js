/**********************************************************************
-  Custom Cart Widget 
**********************************************************************/
 var downgradingText = 'Downgrading...'; 
 var upgradingText = 'Upgrading...'; 
 var cart_refresh = 0;
 
 document.addEventListener('rebuy:smartcart.ready', function(event){
    console.log('rebuy:smartcart.ready event', event.detail);
    beforeShowCart(event.detail.smartcart.cart);
    updateBubbleCount(event.detail.smartcart.cart);
 });

 document.addEventListener('rebuy:smartcart.show', function(event){
    console.log('rebuy:smartcart.show event', event.detail);
    beforeShowCart(event.detail.smartcart.cart);
    updateBubbleCount(event.detail.smartcart.cart);
 });
 
 document.addEventListener('rebuy:cart.add', function(event){
    console.log('rebuy:cart.add event', event.detail);
    beforeShowCart(event.detail.cart);
    updateBubbleCount(event.detail.cart.cart);
 });

 document.addEventListener('rebuy:cart.change', function(event){
    console.log('rebuy:cart.change event', event.detail);
    beforeShowCart(event.detail.cart);
    updateBubbleCount(event.detail.cart.cart);
 });

 document.addEventListener('rebuy.remove', function(event){
    console.log('rebuy.remove event', event.detail);
    beforeShowCart(event.detail.cart);
    updateBubbleCount(event.detail.cart.cart);
 });


 var isBundleProduct = function(item) {
    return (item.properties && item.properties._bundle_id);
 }
 
 function cart_data(){
    var cartItems = [];
    $.ajax({
        type: 'GET',
        async: false,
        url: '/cart.js',
        dataType: 'json',
        success: function success(cart) {
           cartItems = cart;
        },
        error: function(error){
         console.log(error);
        }
    });
    return cartItems;
 }
 

 function shipping_interval_arr(){
  const shipping_interval_arr = [30,45,60,90];
  return shipping_interval_arr;
 }
 
 function shipping_unit_type(){
  const shipping_unit_type = 'Days';
  return shipping_unit_type;
 }

 function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   // Directly return the joined string
   return splitStr.join(' '); 
 }

 function shipping_interval_unit_type(str){
    let unit_type = '';
    switch(str) {
      case 'day':
        unit_type = 'Days';
        break;
      case 'week':
        unit_type = 'Weeks';
        break;
      case 'month':
        unit_type = 'Months';
        break;
      default:
        unit_type = 'Days';
    }
    return unit_type;
 }


 function single_product_content(items){
  
   var sp_html_content = '';
   
   // Get subscription Id
   let subscription_id = 0;
   if(items.properties){
    if(items.properties._ck_subscription_id != 'undefined' && items.properties._ck_subscription_id != ''){
      subscription_id = items.properties._ck_subscription_id;
    }
   }
   
   // Get variants Id
   let id = '';
   if(items.properties){
   if(items.properties._ck_variant_id != '' && items.properties._ck_variant_id != null){
   id = items.properties._ck_variant_id;
   }else{
   id = items.product_id;
   } }
   
   sp_html_content += '<div class="rebuy-cart__flyout-item product-'+items.handle+' single_items" id="rebuy_id_'+items.id+'" data-key="'+items.key+'" data-item-id="'+items.variant_id+'" data-variant-id="'+id+'" data-subscription-id="'+subscription_id+'">';
   sp_html_content += '<div class="rebuy-cart__flyout-item-media">';
   sp_html_content += '<a href="'+items.url+'">';
   sp_html_content += '<img src="'+items.image+'" alt="'+items.product_title+'">';
   sp_html_content += '</a>';
   sp_html_content += '</div>';
   
   // single item info
   sp_html_content += '<div class="rebuy-cart__flyout-item-info">';
   sp_html_content += '<button type="button" class="rebuy-cart__flyout-item-remove rebuy_single_product_remove" data-id="'+items.id+'">';
   sp_html_content += '<i class="far fa-trash"></i>';
   sp_html_content += '<i class="fas fa-sync fa-spin rc_hidden"></i>';
   sp_html_content += '</button>';
   
   sp_html_content += '<a href="'+items.url+'" class="rebuy-cart__flyout-item-product-title">';          
   sp_html_content +=  items.product_title+'</a>';        
   sp_html_content += '<div class="rebuy-cart__flyout-item-quantity">';
   sp_html_content += '<div class="rebuy-cart__flyout-item-quantity-widget">';
   sp_html_content += '<button type="button" class="rebuy-cart__flyout-item-quantity-widget-button rebuy-quantity-control rebuy-decrease-item" data-id="'+items.id+'" > ';
   sp_html_content += '<i class="far fa-minus"></i>';
   sp_html_content += '</button>';
   sp_html_content += '<span class="rebuy-cart__flyout-item-quantity-widget-label">';
   sp_html_content +=  items.quantity+'</span>';
   sp_html_content += '<button type="button" class="rebuy-cart__flyout-item-quantity-widget-button rebuy-quantity-control rebuy-increase-item" data-id="'+items.id+'">';
   sp_html_content += '<i class="far fa-plus"></i>';
   sp_html_content += '</button>';
   sp_html_content += '<input type="hidden" class="rebuy-single-line-item-qty" value="'+items.quantity+'">';
   sp_html_content += '<span class="rebuy_input_change_spinner rc_hidden"><i class="fas fa-spinner fa-spin"></i></span>';
   
   sp_html_content += '</div>';
   sp_html_content += '</div>';
   sp_html_content += '<div class="rebuy-cart__flyout-item-price">';
   sp_html_content += '<div>';
   
   if(items.properties){
    let hasShipping = items.properties.shipping_interval_frequency;
    if(hasShipping != undefined && hasShipping != ''){
     sp_html_content += '<span class="rebuy-money">'+Shopify.formatMoney(items.price, $('body').data('money-format'))+'</span>';
     if(items.price != items.properties._ck_variant_price){
     sp_html_content += '<span class="rebuy-money was-price">'+Shopify.formatMoney(parseInt(items.properties._ck_variant_price), $('body').data('money-format'))+'</span>';
     }
    }else{
     sp_html_content += '<span class="rebuy-money">'+Shopify.formatMoney(items.price, $('body').data('money-format'))+'</span>';
    }
   }else{
    sp_html_content += '<span class="rebuy-money">'+Shopify.formatMoney(items.price, $('body').data('money-format'))+'</span>';
   }
   
   sp_html_content += '</div></div></div>';
   
   // Subscription
   sp_html_content += '<div class="rebuy-cart__flyout-item-subscription">';
   
   if(items.properties) {
     sp_html_content += '<span style="display:none;" class="rebuy_item_properties">'+JSON.stringify(items.properties)+'</span>';
     
     let has_subscription = items.properties._ck_has_subscription;
     let discount_percentage = items.properties._ck_discount_percentage;
     discount_percentage = parseInt(discount_percentage);
     
     if(has_subscription == 'true'){
       
     // Subscription details
       
     let has_shipping = items.properties.shipping_interval_frequency;
     let all_interval_frequency = items.properties._ck_subscription_interval_frequency; // get all intervals
     all_interval_frequency = all_interval_frequency.split(',');
     all_interval_frequency = all_interval_frequency.reverse();
      
     let interval_unit_type = items.properties._ck_subscription_interval_unit_type;
     interval_unit_type = shipping_interval_unit_type(interval_unit_type);
         
     /* If already susbcription exist */
     if(has_shipping != undefined && has_shipping != ''){
     
       // upgraded subscription html
       sp_html_content += '<select class="rebuy-select rebuy-single-product-subscription rebuy-subscription-select" data-unit-type="'+interval_unit_type+'">';
       sp_html_content += '<optgroup label="Pay Full Price">';
       sp_html_content += '<option value="onetime" >One-Time Only</option>';
       sp_html_content += '</optgroup>';
       sp_html_content += '<optgroup label="Subscribe &amp; Save '+discount_percentage+'%">';

       let selected_interval_frequency = items.properties.shipping_interval_frequency;
       let selected_unit_type = items.properties.shipping_interval_unit_type;
     
       $.each(all_interval_frequency, function( index, value ) {
         if(parseInt(value) == parseInt(selected_interval_frequency)){
           sp_html_content += '<option value="'+value+'" selected="selected">Delivers every '+value+' '+interval_unit_type+'</option>';
         }else{
           sp_html_content += '<option value="'+value+'">Delivers every '+value+' '+interval_unit_type+'</option>';
         }
       });
       sp_html_content += '</optgroup></select>';
     }else{
       // non-upgraded subscription
       let default_frequency = '';
       if(all_interval_frequency != ''){
        default_frequency = all_interval_frequency[0];
       }
       sp_html_content += '<button type="button" class="rebuy-button outline rebuy-subscription-btn rebuy-single-subscription-btn" data-type="autodeliver" data-interval-frequency="'+default_frequency+'" data-unit-type="'+interval_unit_type+'">';
       sp_html_content += '<span>Upgrade to Subscription &amp; Save '+discount_percentage+'%';
       sp_html_content += '</span></button> ';
     }
    }
   }
  
   // button working
   sp_html_content += '<a class="rebuy_button rc_hidden rebuy_button_working">';
   sp_html_content += '<span><span></a>';
 
   sp_html_content += '</div></div>';
       
   return sp_html_content;
 }
 
 function bundle_product_content(items){
   
   var bp_html_content = '';
   var bundle_variants = '';
   var bundle_price = 0;
   
   if(items._bundle_subscription_status == 'true' || items._bundle_subscription_status ==  true ){
   bundle_variants = items._bundle_subscription_variants;
   }else{
   bundle_variants = items._bundle_variants;
   }
   
   bp_html_content += '<div class="rebuy-cart__flyout-item product-'+items._bundle_handle+' bundle_items" id="rebuy_id_'+items._bundle_id+'">';
  
   bp_html_content += '<div class="rebuy-cart__flyout-item-media rebuy_bundle_media_item">';
  
   bp_html_content += '<a href="'+items._bundle_url+'">';
   bp_html_content += '<img src="'+items._bundle_img+'" alt="'+items._bundle_title+'">';
   bp_html_content += '</a>';
   bp_html_content += '</div>';
   
   // bundle item info
   bp_html_content += '<div class="rebuy-cart__flyout-item-info">';
   bp_html_content += '<span class="rebuy-bundle_susbcription-ids" style="display:none;">'+items._bundle_subscription_variants+'</span>';
   bp_html_content += '<span class="rebuy-bundle_variant-ids" style="display:none;">'+items._bundle_variants+'</span>';
 
   bp_html_content += '<button type="button" class="rebuy-cart__flyout-item-remove rebuy-remove-bundle" data-ids="'+bundle_variants+'">';
   bp_html_content += '<i class="far fa-trash"></i>';
   bp_html_content += '</button>';
   bp_html_content += '<a href="'+items._bundle_url+'" class="rebuy-cart__flyout-item-product-title">';          
   bp_html_content +=  items._bundle_title+'</a>';
   
   // bundle contents
   bp_html_content +=  bundleContents(items);
   
   bp_html_content += '<div class="rebuy-cart__flyout-item-quantity">';
   bp_html_content += '<div class="rebuy-cart__flyout-item-quantity-widget">';
   bp_html_content += '<button type="button" class="rebuy-cart__flyout-item-quantity-widget-button rebuy-decrease-bundle" data-id="'+items._bundle_id+'"> ';
   
   bp_html_content += '<i class="far fa-minus"></i>';
   bp_html_content += '</button>';
   bp_html_content += '<span class="rebuy-cart__flyout-item-quantity-widget-label">';
   bp_html_content +=  items._bundle_quantity+'</span>';
   bp_html_content += '<button type="button" class="rebuy-cart__flyout-item-quantity-widget-button rebuy-increase-bundle" data-id="'+items._bundle_id+'">';
   bp_html_content += '<i class="far fa-plus"></i>';
   bp_html_content += '</button>';
   bp_html_content += '<input type="hidden" class="rebuy-single-line-item-qty" value="'+items._bundle_quantity+'">';
   bp_html_content += '<span class="rebuy_input_change_spinner rc_hidden"><i class="fas fa-spinner fa-spin"></i></span>';
   
   bp_html_content += '</div>';
   bp_html_content += '</div>';
   bp_html_content += '<div class="rebuy-cart__flyout-item-price">';
   bp_html_content += '<div>';
   
   if(items._bundle_subscription_status == 'true' || items._bundle_subscription_status ==  true ){
     bp_html_content  += '<span class="rebuy-money">'+Shopify.formatMoney(items._bundle_item_subscription_total, $('body').data('money-format'))+'</span>';
     if(items._bundle_item_subscription_total != items._bundle_item_total){
     bp_html_content  += '<span class="rebuy-money was-price">'+Shopify.formatMoney(parseInt(items._bundle_item_total), $('body').data('money-format'))+'</span>';
     }
   }else{
     bp_html_content  += '<span class="rebuy-money">'+Shopify.formatMoney(items._bundle_item_total, $('body').data('money-format'))+'</span>';
   }
   
   bp_html_content += '</div></div></div>';
   
   // Subscription
   bp_html_content += '<div class="rebuy-cart__flyout-item-subscription">';
   
   bp_html_content += '<span style="display:none;" class="rebuy_item_properties">'+JSON.stringify(items)+'</span>';

   let has_subscription = items._bundle_subscription_status;
   let discount_percentage = items._ck_discount_percentage;
   discount_percentage = parseInt(discount_percentage);
   
   let all_interval_frequency = items._ck_subscription_interval_frequency; // get all intervals
   all_interval_frequency = all_interval_frequency.split(',');
   all_interval_frequency = all_interval_frequency.reverse();
   
   let interval_unit_type = items._ck_subscription_interval_unit_type;
   interval_unit_type = shipping_interval_unit_type(interval_unit_type);
   
   if(has_subscription == 'true'){

   // Subscription details
   let has_shipping = items.shipping_interval_frequency;
   
   /* If already susbcription exist */
   if(has_shipping != undefined && has_shipping != ''){

     // upgraded subscription html
     bp_html_content += '<select class="rebuy-select rebuy-bundle-product-subscription rebuy-subscription-select" id="rebuy_bundle_'+items._bundle_id+'" data-id="'+items._bundle_id+'" data-unit-type="'+interval_unit_type+'">';
     bp_html_content += '<optgroup label="Pay Full Price">';
     bp_html_content += '<option value="onetime" >One-Time Only</option>';
     bp_html_content += '</optgroup>';
     bp_html_content += '<optgroup label="Subscribe &amp; Save '+discount_percentage+'%">';

     let selected_interval_frequency = items.shipping_interval_frequency;
     let selected_unit_type = items.shipping_interval_unit_type;
     
       $.each(all_interval_frequency, function( index, value ) {
         if(parseInt(value) == parseInt(selected_interval_frequency)){
           bp_html_content += '<option value="'+value+'" selected="selected">Delivers every '+value+' '+interval_unit_type+'</option>';
         }else{
           bp_html_content += '<option value="'+value+'">Delivers every '+value+' '+interval_unit_type+'</option>';
         }
       });
       bp_html_content += '</optgroup></select>';
   }else{
       // non-upgraded subscription
       let default_frequency = '';
       if(all_interval_frequency != ''){
        default_frequency = all_interval_frequency[0];
       }
       bp_html_content += '<button type="button" class="rebuy-button outline rebuy-bundle-subscription-btn rebuy-subscription-btn" data-type="autodeliver" data-interval-frequency="'+default_frequency+'" data-unit-type="'+interval_unit_type+'">';
       bp_html_content += '<span>Upgrade to Subscription &amp; Save '+discount_percentage+'%';
       bp_html_content += '</span></button> ';
   }
   }else{
     // non-upgraded subscription
     let default_frequency = '';
     if(all_interval_frequency != ''){
      default_frequency = all_interval_frequency[0];
     }
     bp_html_content += '<button type="button" class="rebuy-button outline rebuy-bundle-subscription-btn rebuy-subscription-btn" data-type="autodeliver" data-interval-frequency="'+default_frequency+'" data-unit-type="'+interval_unit_type+'">';
     bp_html_content += '<span>Upgrade to Subscription &amp; Save '+discount_percentage+'%';
     bp_html_content += '</span></button> ';
   }
   
 
   // button working
   bp_html_content += '<a class="rebuy_button rc_hidden rebuy_button_working">';
   bp_html_content += '<span><span></a>';
   
   bp_html_content += '</div></div>';
       
   return bp_html_content;
 }

 function bundleContents(item) {
    var contents = '';

    if (item) {
        var items = item._bundle_item_titles.split(', ');

        contents += '<ul class="rebuy_bundle_contents">';

        for (var i = 0; i < items.length; i++) {
            contents += '<li><span class="label"><i class="icon fas fa-circle"></i> ' + items[i] + '</span></li>';
        }

        contents += '</ul>';
    }

    return contents;
 }


 function hasMatchBundle(bundles, handle, bundleId){
   var matchIndex = null;
   for (var index = 0; index < bundles.length; ++index) {
     let item = bundles[index];
     let item_handle = item._bundle_handle;
     let bundle_id = item._bundle_id;
     let status = item._bundle_status;
     if(item_handle == handle && status && bundle_id == bundleId){
       matchIndex = index;
     }
   }
   
   return matchIndex;
 }

 function getCollectionOfLineItems(items){
    var cart_collections = [];
    var bundle_collection = [];
    var single_collection = [];   
    var initial_qty = 1;
   
    // collection of items
    for (var i = 0; i < items.length; i++) {
      
      if(isBundleProduct(items[i])){
       // Bundles Products
       var properties = items[i].properties;
       properties._bundle_status = true;
       properties._bundle_quantity = items[i].quantity;
        
       if(bundle_collection.length > 0){
         let matchKey = hasMatchBundle(bundle_collection, properties._bundle_handle, properties._bundle_id);
         if(matchKey != null){
          bundle_collection[matchKey] = properties;
         }else{
          bundle_collection.push(properties);
         }
       }else{
        bundle_collection.push(properties);
       }
      }else{
       // Single Products
        items[i]._bundle_status = false;
        single_collection.push(items[i]);
      }
    }
     
    cart_collections = bundle_collection.concat(single_collection);
    cart_collections = cart_collections.reverse();
    
    return cart_collections;
 }
 


 function beforeShowCart(smartcart){
   var cart = [];
   if( typeof smartcart === 'undefined' || smartcart === null ){
     cart = window.Rebuy.Cart.cart.items;
   }else{
     cart = smartcart.items;
   }
   
   if(cart.length > 0){
     var items = cart;
     var $cart_flyout_items = $('.rebuy-cart').find('.rebuy-cart__flyout-items');
     var $cart_content = '';
   
     var cart_items = getCollectionOfLineItems(items);
     if(cart_items.length > 0){
      for (var j = 0; j < cart_items.length; j++) {
        
        if(cart_items[j]._bundle_status == true){
          // For Bundle Content
          $cart_content += bundle_product_content(cart_items[j]);
        }else{
          // For Single Content
          $cart_content += single_product_content(cart_items[j]);
        }
      }
      }
     $cart_flyout_items.html($cart_content);
   }
 }


 /* Update Input Change Items
 ================================================*/
 function removeCartItem(id, quantity, $this) {
    id = parseInt(id);
    $.ajax({
      type: 'POST',
      url: '/cart/change.js',
      data: "quantity="+quantity+"&id="+id,
      dataType: 'json',
      success: function success(cart) {
       hideLoader($this);
      }
    });
 }

 function addCartItem(data){
    
   var xhr = $.ajax({
          type: 'POST',
          url: '/cart/add.js',
          data: data,
          dataType: 'json',
          success: function(cart){
             console.log('add !');
             let result = cart_data();
             console.log(result);
 //              // refresh cart
//              beforeShowCart(result);
		  },
          error: function(){
          }
    });
    //kill the request
   xhr.abort()
 }
 
 function updateCartItem(data){
    $.ajax({
          type: 'POST',
          url: '/cart/update.js',
          data: data,
          dataType: 'json',
          success: function success(cart) {
             let result = cart_data();
             // refresh cart
             beforeShowCart(result);
		  },
          error: function(){
          }
    });
 }

 function changeCartItem(data){
    $.ajax({
          type: 'POST',
          url: '/cart/change.js',
          data: data,
          dataType: 'json',
          success: function success(cart) {
             let result = cart_data();
             // refresh cart
             beforeShowCart(result);
		  },
          error: function(){
          }
    });
 }

 /* Remove Cart Item
 ================================================*/

 jQuery(document).on('click','.rebuy_single_product_remove', function(e){
   e.preventDefault();
   var $this = $(this);
   var id = $this.attr('data-id');
   let quantity = 0;
   showLoader($this);

   clearTimeout($.data(this, 'timer'));
   $(this).data('timer', setTimeout($.proxy(removeCartItem(id, quantity, $this), this), 3000));
    
 });

 /* Increase Item
 ================================================*/
 $(document).on('click','.rebuy-increase-item', function(e){
   e.preventDefault();
   let $this = $(this);
   let quantity = $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val();
   let properties = $(this).parents('.single_items').find('.rebuy_item_properties').text();
   properties = JSON.parse(properties);
   let id = $(this).attr('data-id');
   quantity = parseInt(quantity) + 1;
   quantity = quantity < 0 ? 0 : quantity ; 
   
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val(quantity);
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-cart__flyout-item-quantity-widget-label').text(quantity);
   
   inputChangeShowLoader($this,id);
   
   let data = {
      id: id,
      quantity: quantity,
      properties: properties
   } 
   window.Rebuy.Cart.changeItem(data);
    
   setTimeout(function() {
      inputChangeHideLoader($this,id);
    },3500);
 });
 

  /* Decrease Item
 ================================================*/
 $(document).on('click','.rebuy-decrease-item', function(e){
   e.preventDefault();
   let $this = $(this);
   let quantity = $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val();
   let properties = $(this).parents('.single_items').find('.rebuy_item_properties').text();
   properties = JSON.parse(properties);
   
   let id = $(this).attr('data-id');
   quantity = parseInt(quantity) - 1;
   quantity = quantity < 0 ? 0 : quantity ; 
   
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val(quantity);
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-cart__flyout-item-quantity-widget-label').text(quantity);
   
   inputChangeShowLoader($this,id);
   
   let data = {
      id: id,
      quantity: quantity,
      properties: properties
   } 
   
   window.Rebuy.Cart.changeItem(data);
    
   setTimeout(function() {
           inputChangeHideLoader($this,id);
    },3500);
   
 });


 /* Remove Bundle Item
 ================================================*/
 $(document).on('click','.rebuy-remove-bundle', function(e){
   e.preventDefault();
   let $this = $(this);
   let properties = $this.parents('.bundle_items').find('.rebuy_item_properties').html();
   properties = JSON.parse(properties);
   
   showLoader($this);
   
   clearTimeout($.data(this, 'timer1'));
   $(this).data('timer1', setTimeout($.proxy(removeBundle(properties, $this), this), 15000));
 });


 /* Update Input Change Bundle Item
 ================================================*/

 /* Increase Item
 ================================================*/
 $(document).on('click','.rebuy-increase-bundle', function(e){
   e.preventDefault();
   let $this = $(this);
   let bundle_qty = $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val();
   let bundle_id = $(this).attr('data-id');
   
   bundle_qty = parseInt(bundle_qty) + 1 ;
   bundle_qty = bundle_qty < 0 ? 0 : bundle_qty ; 
  
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val(bundle_qty);
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-cart__flyout-item-quantity-widget-label').text(bundle_qty);
   
   inputChangeShowLoader($this,bundle_id);
   
   updateBundleCartItem(bundle_id, bundle_qty);
   
   setTimeout(function() {
           inputChangeHideLoader($this,bundle_id);
    },3500);
 });
 
  /* Decrease Item
 ================================================*/
 $(document).on('click','.rebuy-decrease-bundle', function(e){
   e.preventDefault();
   let $this = $(this);
   let bundle_dec_qty = $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val();
   let bundle_id = $(this).attr('data-id');
   
   bundle_dec_qty = parseInt(bundle_dec_qty) - 1;
   bundle_dec_qty = bundle_dec_qty < 0 ? 0 : bundle_dec_qty; 
  
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-single-line-item-qty').val(bundle_dec_qty);
   $(this).closest('.rebuy-cart__flyout-item-quantity-widget').find('.rebuy-cart__flyout-item-quantity-widget-label').text(bundle_dec_qty);
 
   inputChangeShowLoader($this,bundle_id);
   
   updateBundleCartItem(bundle_id, bundle_dec_qty);
   
    
   setTimeout(function() {
           inputChangeHideLoader($this,bundle_id);
    },3500);
 });

  /* Update Products
 ================================================*/
 function updateBundleCartItem(bundle_id, quantity){
   var cart_items = cart_data();
   
   if (!isNaN(quantity)) {
        
        var data = {
            updates: {}
        };

        for (var i = 0, bundle_item; i < cart_items.items.length; i++) {
            if (cart_items.items[i].properties._bundle_id == bundle_id) {
                bundle_item = cart_items.items[i];
                data.updates[bundle_item.key] = quantity;
            }
        }
        
        // Post change data
        $.ajax({
          type: 'POST',
          url: '/cart/update.js',
          data: data,
          dataType: 'json',
          success: function success(cart) {
             refreshCartPage();
	         beforeShowCart(cart);
		  },
          error: function(){
          }
       });
   }
 }


 /* Subscriptions
 =============================================================*/

 // EVENTS
 var SubscriptionData = {
     variant_id : 0,
     subscription_variant_id : 0,
     quantity: 0,
     properties:{},
     purchase_type: '',
 };

 // upgrade first time subscription
 $(document).on('click','.rebuy-single-subscription-btn',function(e){
    e.preventDefault();
    let $this = $(this);
    let subscription_variant_id = $this.parents('.single_items').attr('data-subscription-id');
    let item_key = $this.parents('.single_items').attr('data-key');
    let quantity = $this.parents('.single_items').find('.rebuy-single-line-item-qty').val();
    let interval_frequency = $this.attr('data-interval-frequency');
    let unit_type = $this.attr('data-unit-type');
    let purchase_type = $this.attr('data-type');
    
    // additional details
    let properties = $this.parents('.single_items').find('.rebuy_item_properties').text();
    properties = JSON.parse(properties);
    properties._attribution = 'Rebuy Switch to Subscription';
    properties._source = 'Rebuy';
    properties.shipping_interval_frequency = interval_frequency;
    properties.shipping_interval_unit_type = unit_type;
   
    SubscriptionData.variant_id = item_key;
    SubscriptionData.subscription_variant_id = subscription_variant_id;
    SubscriptionData.quantity = quantity;
    SubscriptionData.properties = properties;
    SubscriptionData.purchase_type = purchase_type;
    
    showWorkingButton($this, upgradingText);
   
    clearTimeout($.data(this, 'timer'));
    $(this).data('timer', setTimeout($.proxy(sp_UpgradeToSubscription(SubscriptionData), this), 3500));
    
 });

 $(document).on('change','.rebuy-single-product-subscription',function(e){
   e.preventDefault();
   var $this = $(this);
   
   let subscription_variant_id = $this.parents('.single_items').attr('data-subscription-id');
   let variant_id = $this.parents('.single_items').attr('data-variant-id');
   let item_key = $this.parents('.single_items').attr('data-key');
   let item_id = $this.parents('.single_items').attr('data-item-id');
   let quantity = $this.parents('.single_items').find('.rebuy-single-line-item-qty').val();
   let interval_frequency = $this.val();
   let unit_type = $this.attr('data-unit-type');
   
   let properties = $this.parents('.single_items').find('.rebuy_item_properties').text();
   properties = JSON.parse(properties);
   SubscriptionData.subscription_variant_id = subscription_variant_id;
   SubscriptionData.quantity = quantity;
   SubscriptionData.properties = properties;
   
   if(interval_frequency == 'onetime'){
    
    showWorkingButton($this, downgradingText);
     
    SubscriptionData.item_key = item_key;
    SubscriptionData.variant_id = variant_id;
    SubscriptionData.purchase_type = 'onetime';
    
    let interval_unit_type = SubscriptionData.properties.shipping_interval_frequency;
    if(interval_unit_type != 'undefined' && interval_unit_type != ''){
      SubscriptionData.properties = Object.assign({}, SubscriptionData.properties);
     
      delete SubscriptionData.properties.subscription_id; 
      delete SubscriptionData.properties.shipping_interval_frequency;
      delete SubscriptionData.properties.shipping_interval_unit_type;
      delete SubscriptionData.properties._attribution;
      delete SubscriptionData.properties._source;
    }
    
    // downgrade to one time product
    sp_DowngradeToOneTime( SubscriptionData );
    
   }else{
    
    showWorkingButton($this, upgradingText);
     
    SubscriptionData.purchase_type = 'autodeliver';
    SubscriptionData.properties.shipping_interval_frequency = interval_frequency;
    SubscriptionData.properties.shipping_interval_unit_type = unit_type;
    SubscriptionData.variant_id = item_key;
    
    // upgrade to subscription
    sp_ChangeToSubscription( SubscriptionData );
   }
   
 });
 
 // Bundle Events

 // upgrade first time subscription
 $(document).on('click','.rebuy-bundle-subscription-btn',function(e){
    e.preventDefault();
    let $this = $(this);
    let subscription_variant_ids = $this.parents('.bundle_items').find('rebuy-bundle-subscription-ids').text();
    let variant_ids = $this.parents('.bundle_items').find('rebuy-bundle-variant-ids').text();
    let quantity = $this.parents('.bundle_items').find('.rebuy-single-line-item-qty').val();
    let interval_frequency = $this.attr('data-interval-frequency');
    let unit_type = $this.attr('data-unit-type');
    let purchase_type = $this.attr('data-type');
    
    // additional details
    let properties = $this.parents('.bundle_items').find('.rebuy_item_properties').text();
    
    properties = JSON.parse(properties);
    properties._attribution = 'Rebuy Switch to Subscription';
    properties._source = 'Rebuy';
    properties.shipping_interval_frequency = interval_frequency;
    properties.shipping_interval_unit_type = unit_type;
    properties._bundle_subscription_status = true;
   
    SubscriptionData.variant_id = variant_ids;
    SubscriptionData.subscription_variant_id = subscription_variant_ids;
    SubscriptionData.quantity = quantity;
    SubscriptionData.properties = properties;
    SubscriptionData.purchase_type = purchase_type;
    
    showWorkingButton($this, upgradingText);
    
    clearTimeout($.data(this, 'timer'));
    $(this).data('timer', setTimeout($.proxy( upgradeBundleToSubscription(SubscriptionData, $this), this), 15000));
   
 });


 $(document).on('change','.rebuy-bundle-product-subscription',function(e){
   e.preventDefault();
   var $this = $(this);
   var optionSelected = $("option:selected", this);
  
   let interval_frequency = $this.val();
   let data_id = $this.attr('data-id');
   data_id = '#rebuy_bundle_'+data_id+' option[value="'+interval_frequency+'"]';
   $(data_id).prop("selected", true);
   
   let unit_type = $this.attr('data-unit-type');
   
   let properties = $this.parents('.bundle_items').find('.rebuy_item_properties').html();
   properties = JSON.parse(properties);
   properties.shipping_interval_frequency = interval_frequency;
   properties.shipping_unit_type = unit_type;
  
   if(interval_frequency == 'onetime'){
    showWorkingButton($this, downgradingText);
      
    downgradeBundleToOneTime(properties, $this);
   }else{
    showWorkingButton($this, upgradingText);
    
    updateBundleProperties(properties, $this)
   }
   
 });


 // FUNCTIONS

 function sp_UpgradeToSubscription( SubscriptionData ){
     
     // Step 1. Remove one-time version from cart (do not refresh after change)
//       removeCartItem(SubscriptionData.variant_id, 0);
      var cart = cart_data();
      if(cart.items.length > 0){
          for (var i = 0; i < cart.items.length; i++) {
            console.log(parseInt(cart.items[i].variant_id)+' == '+parseInt(SubscriptionData.variant_id));
            if(parseInt(cart.items[i].variant_id) == parseInt(SubscriptionData.variant_id)){
             window.Rebuy.Cart.removeItem(cart.items[i]);

            }
          }
      }
     
      // Step 2. Add subscription version to cart
      var variantId = parseInt(SubscriptionData.subscription_variant_id);
      var qty = parseInt(SubscriptionData.quantity);
      var data = {
          id: variantId,
          purchase_type: SubscriptionData.purchase_type,
          quantity: qty,
          properties: SubscriptionData.properties
      } 
      window.Rebuy.Cart.addItem(data);
//     addCartItem(data);
 }

 function sp_ChangeToSubscription( SubscriptionData ){
   let data = {
      id: SubscriptionData.variant_id,
      purchase_type: SubscriptionData.purchase_type,
      quantity: SubscriptionData.quantity,
      properties: SubscriptionData.properties
   } 
   
   changeCartItem(data);
 }

 function sp_DowngradeToOneTime( SubscriptionData ){
    
    // Step 1. Remove one-time version from cart (do not refresh after change)
    var cart = cart_data();
    if(cart.items.length > 0){
      for (var i = 0; i < cart.items.length; i++) {
        if(cart.items[i].key == SubscriptionData.item_key){
         window.Rebuy.Cart.removeItem(cart.items[i]);

        }
      }
    }
   
    // Step 2. Add one-time version to cart
    var variantId = parseInt(SubscriptionData.variant_id);
    var qty = parseInt(SubscriptionData.quantity);
    var data = {
        id: variantId,
        purchase_type: SubscriptionData.purchase_type,
        quantity: qty,
        properties: SubscriptionData.properties
    } 
    
    window.Rebuy.Cart.addItem(data);
 }

 // Bundle Functions
 function upgradeBundleToSubscription(SubscriptionData, $this){
      var current_properties = SubscriptionData.properties;
   
      // Step 1. Collect bundle items
      var items = [];
     
      var cart = cart_data();
      for (var i = 0; i < cart.items.length; i++) {
          if (cart.items[i].properties._bundle_id == current_properties._bundle_id) {
              items.push(cart.items[i]);
          }
      }

      // Step 2. Add subscription bundle
      for (var i = 0, bundle_item; i < items.length; i++) {
          bundle_item = items[i];
          
          var data = {
              id: bundle_item.properties._ck_subscription_id,
              quantity: bundle_item.quantity,
          };

          var properties = Object.assign({}, bundle_item.properties);

          properties.shipping_interval_frequency = current_properties.shipping_interval_frequency;
          properties.shipping_interval_unit_type = current_properties.shipping_interval_unit_type;
          properties._bundle_subscription_status = true;

          data.properties = properties;
          
          // Add to queue
          window.Rebuy.Cart.addItem(data);
      }

      // Step 3. Remove one-time bundle
      removeBundle(current_properties, $this);
   
      // hidden loader button
       setTimeout(function() {
           hideWorkingButton($this);
       },3500);
 }


 function removeBundle(item, $this){
     
      var data = {
          updates: {}
      };

      // Fill up the queue
      var cart = cart_data();
      for (var i = 0, bundle_item; i < cart.items.length; i++) {
          if (cart.items[i].properties._bundle_id == item._bundle_id) {
              bundle_item = cart.items[i];
              data.updates[bundle_item.key] = 0;
          }
      }
      
      // Post change data
      window.Rebuy.Cart.updateItem(data);
   
     
 }

 function downgradeBundleToOneTime(item, $this) {
     
      // Step 1. Collect bundle items
      var items = [];
      
      var cart = cart_data();
      for (var i = 0; i < cart.items.length; i++) {
          if (cart.items[i].properties._bundle_id == item._bundle_id) {
              items.push(cart.items[i]);
          }
      }

      // Step 2. Add one-time bundle
      for (var i = 0, bundle_item; i < items.length; i++) {
          bundle_item = items[i];

          var data = {
              id: bundle_item.properties._ck_variant_id,
              quantity: bundle_item.quantity,
          };

          var properties = Object.assign({}, bundle_item.properties);
        
          properties._bundle_subscription_status = false;
          delete properties.shipping_interval_frequency;
          delete properties.shipping_interval_unit_type;

          data.properties = properties;
          
          // Add to queue
          window.Rebuy.Cart.addItem(data);
      }

      // Step 3. Remove subscription bundle
      removeBundle(item, $this);
   
      // hidden loader button
      setTimeout(function() { hideWorkingButton($this); },3500);
 }

 function updateBundleProperties(item, $this) {
    
    // Fill up the queue
    var cart = cart_data();
    var total = cart.items.length;
    for (var i = 0, bundle_item; i < cart.items.length; i++) {
        if (cart.items[i].properties._bundle_id == item._bundle_id) {
            bundle_item = cart.items[i];

            var data = {
                id: bundle_item.key,
                quantity: bundle_item.quantity
            }

            var properties = Object.assign({}, bundle_item.properties);
          
            properties.shipping_interval_frequency = item.shipping_interval_frequency;
            properties.shipping_interval_unit_type = item.shipping_unit_type;
            properties._bundle_subscription_status = true;
          
            data.properties = properties;
           
            // Post change data
            window.Rebuy.Cart.changeItem(data);
           
        }
    }
   
    // hidden loader button
    setTimeout(function() {
       hideWorkingButton($this);
    },3500);
 
 }

 function updateBubbleCount(cart){
   var bubblecounter = 0;
   if(cart != null && cart != ''){
     bubblecounter = cart.item_count;
   }else{
     let cart_dt = cart_data();
     bubblecounter = cart_dt.item_count;
   }
   if(bubblecounter > 0){
   $('.header-cart').removeClass('action-area__link');
   $('.header-cart').addClass('has-cart-count');
   }else{
   $('.header-cart').addClass('action-area__link');
   $('.header-cart').removeClass('has-cart-count');
   }
   $('#cartCounter').html(bubblecounter);
   $('#mobileCartCounter').html(bubblecounter);
   
   refreshCartPage(bubblecounter);
 }
 
 function refreshCartPage(bubblecounter){
   if (window.location.href.indexOf("/cart") > -1 ) {
     if(parseInt(bubblecounter) == 0){
        $('#cart-empty-section').removeClass('is-hidden');
        $('#cart-container-section').addClass('is-hidden');
   
     }else{
        $('#cart-empty-section').addClass('is-hidden');
        $('#cart-container-section').removeClass('is-hidden');
     }
   }
 }


 // Loaders
 
 function showWorkingButton($this, text){
  $this.parents('.rebuy-cart__flyout-item').find('.rebuy-subscription-btn').addClass('rc_hidden');
  $this.parents('.rebuy-cart__flyout-item').find('.rebuy-subscription-select').addClass('rc_hidden');

  $this.parents('.rebuy-cart__flyout-item').find('.rebuy_button_working').removeClass('rc_hidden'); 
  $this.parents('.rebuy-cart__flyout-item').find('.rebuy_button_working span').html(text);
 }


 function hideWorkingButton($this){
  $this.removeClass('rc_hidden');
 
  $this.parents('.rebuy-cart__flyout-item').find('.rebuy_button_working').addClass('rc_hidden'); 
  $this.parents('.rebuy-cart__flyout-item').find('.rebuy_button_working span').html('');
 }

 function showLoader($this){
    $this.html('<i class="fas fa-sync fa-spin"></i>');
 }

 function hideLoader($this){
    $this.html('<i class="far fa-trash"></i>');
 }

 function inputChangeShowLoader($this, id){
  let parentsid = '#rebuy_id_'+id;
  $this.parents(parentsid).find('.rebuy_input_change_spinner').removeClass('rc_hidden');

 }

 function inputChangeHideLoader($this, id){
  let parentsid = '#rebuy_id_'+id;
  $this.parents(parentsid).find('.rebuy_input_change_spinner').addClass('rc_hidden');

 }