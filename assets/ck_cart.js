console.log('cart script load !');

// EVENTS

/* Remove Bundle Item
================================================*/
 $(document).on('click','.ck-remove-bundle', function(e){
   e.preventDefault();
   let $this = $(this);
   let properties = $this.parents('.bundle_cart_items').find('.ck_item_properties').html();
   let item_id = $this.attr('data-item-id');
   item_id = '#cart_bundle_item_'+item_id
   properties = JSON.parse(properties);
   properties.page_type = 'cart';
   
   // remove item
   $(item_id).remove();
   
   clearTimeout($.data(this, 'timer'));
   $(this).data('timer', setTimeout($.proxy(removeBundle(properties, $this), this), 2500));
 });
 
 /* Increase Item
 ================================================*/
 $(document).on('click','.ck-increase-bundle', function(e){
   e.preventDefault();
   let bundle_qty = $(this).closest('.cart__quantity').find('.quantity-input').val();
   let bundle_id = $(this).parents('.bundle_cart_items').attr('data-bundle-id');
   bundle_qty = parseInt(bundle_qty);
  
   $(this).closest('.cart__quantity').find('.quantity-input').val(bundle_qty);
   updateBundleCartItem(bundle_id, bundle_qty);
 });
 

 /* Decrease Item
 ================================================*/
 $(document).on('click','.ck-decrease-bundle', function(e){
   e.preventDefault();
   let bundle_dec_qty = $(this).closest('.cart__quantity').find('.quantity-input').val();
   let bundle_id = $(this).parents('.bundle_cart_items').attr('data-bundle-id');
   bundle_dec_qty = parseInt(bundle_dec_qty);
   
   $(this).closest('.cart__quantity').find('.quantity-input').val(bundle_dec_qty);
   updateBundleCartItem(bundle_id, bundle_dec_qty);
 });


// FUNCTIONS
 