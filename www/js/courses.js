/* global webServLink */ /* global siteRoot */ /* global totalListedItems */ /* global courseItemCost */
//var currentPage = parseInt($("#all-courses").attr('data-end')); //Hold the currentPage

(function ($) {
$(document).ready(function(){
     if(sessionStorage.IADETuserId=="" || sessionStorage.IADETuserId==null || sessionStorage.IADETuserId == "undefined"){window.location="index.html";}
     //Hold the currentPage
    var currentCategory = parseInt($("#all-courses").attr('data-current-category'));//current course category
    var currentPage = parseInt($("#all-courses").attr('data-end'));
    
    //=== Load the spinner if an ajaxStart occurs; stop when it is finished ==//
    $(document).on({
        ajaxStart: function() {$.mobile.loading( 'show', {text: "Loading..",textVisible: true,theme: "a"  /*textonly: textonly,  html: html */ }); },
        ajaxStop: function() { $.mobile.loading('hide');}    
    });
    
    //Load all available courses
    $(document).on('click', '#viewAllCourses', function(){
        $(".div-courses-categories").addClass('hidden'); 
        $(".div-course-list").removeClass('hidden'); 
        $(".footer").addClass('hidden');
        $("#all-courses").attr('data-current-category', '0');
        $("#all-courses").attr('data-end', '1'); 
        currentPage = 1; currentCategory = 0;
        $('#course-list-h4').html('All Available Courses');
        currentPage = 1; currentCategory = 0;
        fetchCourses(totalListedItems, (currentPage - 1) * totalListedItems, currentCategory);
    });
    
    
    /** Function that displays internal multi pages as dialog pages 
    * @param {int} transition Transition 
    */
    var showMessageDialog = function(transition){
        $.mobile.changePage("#message-dialog",{
            allowSamePageTransition: true,
            showLoadMsg : true,
            transition : transition,
            reverse    : false,
            changeHash : true
        });
    };
    
    $("#backto-category").bind({ click: function(){ toggleContent(); }  });//Back Button handler
    $("#refresh-button").bind({ click: function(){ refreshContent(); }  });//Refresh Button handler
    $('#next-courses').on('tap', swipeLeftHandler);
    $('#prev-courses').bind({tap: swipeRightHandler});
    // Bind the swipeHandler callback function to the swipe events 
    $("#all-courses" ).bind({"swipeleft":swipeLeftHandler,"swiperight":swipeRightHandler });
    $(".courses-touch-pad" ).bind({"swipeleft":swipeLeftHandler,"swiperight":swipeRightHandler});
    
     /** Callback function for 'swipe left' courses */
    function swipeLeftHandler(){
        currentPage = parseInt($('#all-courses').attr('data-end'))+1; //fetch the last page number nd increment it 
        currentCategory = parseInt($("#all-courses").attr('data-current-category'));
        $('#all-courses').attr('data-end', currentPage); //Update the pagenumber holder [data-end]
        fetchCourses(totalListedItems, (currentPage - 1) * totalListedItems, currentCategory);
    }
    
    /** Callback function for 'swipe right' courses */
    function swipeRightHandler(){
        currentPage = parseInt($('#all-courses').attr('data-end')); //fetch the last page number 
        currentCategory = parseInt($("#all-courses").attr('data-current-category'));
        if(currentPage>1){//Check if at least it is not d home page
            currentPage -=1; //Decrement the page number to go prevous page 
            $('#all-courses').attr('data-end', currentPage); //Update the pagenumber holder [data-end] 
            fetchCourses(totalListedItems, (currentPage - 1) * totalListedItems, currentCategory);
        }
    }

    /** Callback function for refresh operation */
    function refreshContent(){
        currentPage = parseInt($('#all-courses').attr('data-end'));//if last page no is greater than zero
        if(currentPage<1) {currentPage =1;}//incase of negative or zero value set page number to be 1
        $('#all-courses').attr('data-end', currentPage); //Update the pagenumber holder [data-end]
        currentCategory = parseInt($("#all-courses").attr('data-current-category'));
        fetchCourses(totalListedItems, (currentPage - 1) * totalListedItems, currentCategory);
    }
    
    fetchCourseCategories(); //Fetch all categories as page finished loading
    
    /** Callback function for fetching categories */
    function fetchCourseCategories() {
        $.ajax({
            url : webServLink+'fetch-course-categories.php',
            type : 'GET', cache: false, dataType : 'JSON',
            success : function(data, status) {
                if(data.status === 0){ 
                    $("#message-dialog .ui-content h1").text("Error fetching categories");
                    $("#message-dialog .ui-content p").text(data.msg);
                    showMessageDialog('flow');
                }
                else if(data.status === 2){ 
                    $("#message-dialog .ui-content h1").text("Empty Course category");
                    $("#message-dialog .ui-content p").text(data.msg);
                    showMessageDialog('slidedown');
                }
                else if(data.status ===1 && data.info.length > 0){
                    var catContent = ''; var catTotal, categoryAmount, catAmount;
                    $.each(data.info, function(i, item) {
                        categoryAmount = '<b>&pound;'+item.amount+'</b>';
                        catAmount = item.amount;
                        if(item.status == 1){ catAmount = item.promotionAmount; categoryAmount = '<b style="text-decoration:line-through">&pound;'+item.amount+'</b> &nbsp;<br/> <b style="color:green">Promotion: &pound;'+item.promotionAmount+'</b>';}
                        if(item.image ===''){logo='images/no_logo.png';}
                        else{logo = siteRoot+'media/category/'+item.image;}
                        catContent += '<div><div class="staff-item"><img src="'+logo+'" alt="img"><h4>'+item.name+'</h4> <strong style="color:#000">'+item.description+'</strong><br/> <strong><em>Amount: '+categoryAmount+'</b></em></strong><br/><a href="#fullCategoryPopup" data-transition="slidedown" id="cat'+item.id+'" data-description="'+item.description+'" data-id="'+item.id+'" data-name="'+item.name+'" data-amount="'+catAmount+'" class="button button-green center-button c-pay-category" style="color:#fff"><i class="fa fa-file"></i> Details</a> <a href="#" data-category-id="'+item.id+'" data-category-name="'+item.name+'" class="button button-red center-button course-category-link" style="color:#fff"><i class="fa fa-folder"></i> Courses</a></div></div>';
                        catTotal = i+1;
                    });
                    $('#all-courses-categories').html(catContent);
                    /** Create handler for a category selection */
                    $("#all-courses-categories .course-category-link").on("click", function() {
                        toggleContent();
                        $(".div-course-list #course-list-h4").html($(this).attr('data-category-name')+' Category');
                        var currentPage = parseInt($("#all-courses").attr('data-end'));
                        currentCategory = $(this).attr('data-category-id');
                        $("#all-courses").attr('data-current-category', currentCategory)
                        fetchCourses(totalListedItems, (currentPage - 1) * totalListedItems, currentCategory);
                    });
                    var owlStaffControls = $("#all-courses-categories");
                    owlStaffControls.owlCarousel({ items : catTotal, itemsDesktop : [1199,3], itemsDesktopSmall : [980,3], itemsTablet: [768,2], itemsTabletSmall: [480,1], itemsMobile : [370,1], singleItem : false, itemsScaleUp : false, slideSpeed : 250, paginationSpeed : 250, rewindSpeed : 250, pagination:false, autoPlay : false, autoHeight: false });
                    $(".next-staff").click(function(){ owlStaffControls.trigger('owl.next'); return false; });
                    $(".prev-staff").click(function(){ owlStaffControls.trigger('owl.prev'); return false; });
                    
                    //Category payment button click
                    var idHolder, target;
                    $(".c-pay-category").on( "click", function() {
                        idHolder = $(this).attr('data-id');
                        target = $("#cat"+idHolder+"");
                        itemType = 'category'; paymentMode = 'full';
                        courseItemName = target.attr('data-name');
                        courseItemCost = target.attr('data-amount');
                        purchasedCourseId = parseInt(target.attr('data-id'));
                        purchasedCourseLink = siteRoot+'ecourse/my/';
                        $("#fullCategoryPopup #cat-name").html(courseItemName);
                        $("#fullCategoryPopup #cat-name2").html(courseItemName);
                        $("#fullCategoryPopup #cat-amount").html('&pound;'+courseItemCost);
                        $("#fullCategoryPopup #cat-description").html(target.attr('data-description'));
                        initPaymentUI();
                    });
                }
                else{
                    $("#message-dialog .ui-content h1").text("Unknown Error");
                    $("#message-dialog .ui-content p").text(data);
                    showMessageDialog('flow');
                }
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
                $("#message-dialog .ui-content h1").text("Course Categories Error !!!");
                $("#message-dialog .ui-content p").text(erroMsg);
                showMessageDialog('flow');
            },
            complete : function(xhr, status) { }
        });
    };
    
    /** Callback function for fetching courses */
    function fetchCourses(totalNo, offset, category) {
        $.ajax({
            url : webServLink+'fetch-courses.php',
            type : 'GET', cache: false, dataType : 'JSON', data: {totalNo:totalNo, offset:offset, category:category},
            success : function(data, status) {
                if(data.status === 0){ 
                    $("#message-dialog .ui-content h1").text("Error fetching courses");
                    $("#message-dialog .ui-content p").text(data.msg);
                    showMessageDialog('flow');
                }
                else if(data.status === 2){ 
                    $("#message-dialog .ui-content h1").text("No courses to display ");
                    $("#message-dialog .ui-content p").text(data.msg+' There are no mores courses to be loaded or there are no courses uploaded yet for the selected category.');
                    if(currentPage>1) {currentPage = currentPage-1;}//incase of negative or zero value set page number to be 1
                    $('#all-courses').attr('data-end', currentPage);
                    showMessageDialog('slidedown');
                }
                else if(data.status ===1 && data.info.length > 0){
                    $('#all-courses').empty();
                    $.each(data.info, function(i, item) {
                        if(item.image ==''){logo='images/no_logo.png';} else{logo = item.image;}
                        var priceBar = '<span class="fa fa-money"></span>  &pound;'+item.formatedAmount+'</span><br>';
                        if(item.promoStatus !=0){
                            priceBar = '<span id="camount" style="text-decoration:line-through;color:red"><span class="fa fa-money"></span>  &pound;'+item.formatedAmount+'</span><br>';
                            priceBar += '<span style="color:green"><span class="fa fa-money"></span>  &pound;'+item.formatedPromoAmount+' (Promotional Amount)</span><br>';
                        }
                        var startDate = new Date(item.startDate*1000); startDate = startDate.toString().substr(0, 16);
                        $('#all-courses').append('<li class="no-bottom one-half-responsive" data-id="'+item.id+'" id="'+item.id+'" data-event-marker="0">\n\
                            <a href="#fullCoursePopup" data-transition="slidedown">\n\
                                <img src="'+logo+'" alt="img" id="c-logo" class="ui-li-icon ui-corner-none">\n\
                                <h2 id="cname">'+item.name+'</h2>\n\
                                <p style="font-size:12px">'+priceBar+'\n\
                                <span id="cdate"><span class="fa fa-calendar"></span> '+startDate+'</span></p>\n\
                                <i style="display:none" class="hidden-course-details"\n\
                                data-h-id="'+item.id+'" data-h-name="'+item.name+'" \n\
                                data-h-short-name="'+item.shortName+'" data-h-category="'+item.category+'" \n\
                                data-h-start-date="'+startDate+'" data-h-code="'+item.code+'" \n\
                                data-h-description="'+item.description+'" data-h-image="'+item.image+'" data-h-media="'+item.media+'" \n\
                                data-h-amount="'+item.amount+'" data-h-date-registered="'+item.dateRegistered+'"\n\
                                data-h-formated-amount="'+item.formatedAmount+'" data-h-promo-status="'+item.promoStatus+'" \n\
                                data-h-promotion-amount="'+item.promotionAmount+'" data-h-formated-promo-amount="'+item.formatedPromoAmount+'">\n\
                                </i>\n\
                            </a><a href="#" data-icon="action"></a>\n\
                        <div class="decoration hide-if-responsive"></div></li>\n\
                        ');
                    });
                    /** Create handler for displaying full event details */
                    var idHolder, target, promoStatus;
                    $(".one-half-responsive").on( "tap", function() {
                        idHolder = $(this).attr('data-id');
                        target = $("#"+idHolder+""); 
                        itemType = 'course'; paymentMode = 'full';
                        promoStatus = parseInt(target.find(".hidden-course-details").attr('data-h-promo-status'));
                        courseItemCost = parseInt(target.find(".hidden-course-details").attr('data-h-amount'))+1;
                        if(promoStatus !=0){ courseItemCost = parseInt(target.find(".hidden-course-details").attr('data-h-promotion-amount'))+1; }
                        
                        courseItemName = target.find(".hidden-course-details").attr('data-h-short-name');
                        purchasedCourseId = idHolder;
                        purchasedCourseLink = siteRoot+'ecourse/my/';
                        $("#fullCoursePopup #c-name").html(' '+target.find( "#cname" ).text());
                        $("#fullCoursePopup #c-shortName").text(target.find(".hidden-course-details").attr('data-h-short-name'));
                        $("#fullCoursePopup #c-date").text(target.find("#cdate").text());
                        $("#fullCoursePopup #c-code").text(target.find(".hidden-course-details").attr('data-h-code'));
                        if(promoStatus !=0){
                            $("#fullCoursePopup #c-amount").html("<span style='color:red;text-decoration:line-through'> &pound;"+target.find(".hidden-course-details").attr('data-h-formated-amount')+"</span> <span style='color:green'> (&pound;"+target.find(".hidden-course-details").attr('data-h-formated-promo-amount')+")</span>");
                        }else{
                            $("#fullCoursePopup #c-amount").html(" &pound;"+target.find(".hidden-course-details").attr('data-h-formated-amount'));
                        }
                        //$("#fullCoursePopup #c-pay").html(payPalLink);
                        $("#fullCoursePopup #c-description").html(target.find(".hidden-course-details").attr('data-h-description'));
//                        $("#fullCoursePopup #c-mail").attr('href','mailto:'+companyMail);
//                        $("#fullCoursePopup #c-call").attr('href','tel:'+phoneNumber.replace(" ", "").replace(/[^a-zA-Z 0-9]+/g,""));
                        initPaymentUI();
                    });
                }
                else{
                    $("#message-dialog .ui-content h1").text("Unknown Error");
                    $("#message-dialog .ui-content p").text(data);
                    showMessageDialog('flow');
                }
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
                $("#message-dialog .ui-content h1").text("Course Categories Error !!!");
                $("#message-dialog .ui-content p").text(erroMsg);
                showMessageDialog('flow');
            },
            complete : function(xhr, status) { }
        });
    };
    
    /** Callback function for switching between categories and list of courses */
    function toggleContent(){
        $(".div-courses-categories").toggleClass('hidden'); 
        $(".div-course-list").toggleClass('hidden'); 
        $(".footer").toggleClass('hidden');
        $("#all-courses").attr('data-current-category', '0');
        $("#all-courses").attr('data-end', '1'); 
        currentPage = 1; currentCategory = 0;
    }
    //PAYPAL HANDLERS
    function initPaymentUI(){var clientIDs = { "PayPalEnvironmentProduction": payPalEnvironmentProduction, "PayPalEnvironmentSandbox": payPalEnvironmentSandbox  }; PayPalMobile.init(clientIDs, onPayPalMobileInit);}
    function onSuccesfulPayment(payment) { 
        //console.log("payment success: " + JSON.stringify(payment, null, 4));
        var formData = new FormData();
        formData.append("user", sessionStorage.IADETuserId);
        formData.append("course", purchasedCourseId);
        formData.append("itemType", itemType);
        formData.append("mode", paymentMode);//create_time
        formData.append("transactionId", payment.response.id);
        formData.append("amount", courseItemCost);
        formData.append("currency", currencyType);
        formData.append("method", "Mobile Payment");
        formData.append("state", payment.response.state);
        formData.append("datePurchased", payment.response.create_time);
        $.ajax({
            url: webServLink+'add-purchase-course.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            async: false,
            success : function(data, status) {
                if(data.status === 1){
                    $("#message-dialog .ui-content h1").text("Payment Success!");
                    $("#message-dialog .ui-content p").html(data.msg+'<br/><br/>  Your transaction ID is: '+payment.response.id+'. <br/> <a href="'+purchasedCourseLink+'">View the purchased course</a>');
                    showMessageDialog('flow');
                }
                else if(data.status === 0 || data.status === 2 || data.status === 3){ 
                    $("#message-dialog .ui-content h1").text("Payment Record Error");
                    $("#message-dialog .ui-content p").html('Error submitting payment record. Please contact the ADMIN.'+data.msg+'<br/> Your transaction ID is: '+payment.response.id+'. <br/>  <a href="'+purchasedCourseLink+'">View the purchased course</a>');
                    showMessageDialog('flow');
                }
                else { 
                    $("#message-dialog .ui-content h1").text("Payment Record Error");
                    $("#message-dialog .ui-content p").html('Error submitting payment record. Please contact the ADMIN.'+data+'<br/> Your transaction ID is: '+payment.response.id+'. <br/> <a href="'+purchasedCourseLink+'">View the purchased course</a>');
                    showMessageDialog('flow');
                }
                
            },
            processData: false
        });
    }
    function onAuthorizationCallback(authorization) { console.log("authorization: " + JSON.stringify(authorization, null, 4)); }
    function createPayment() {
     // for simplicity use predefined amount
     var paymentDetails = new PayPalPaymentDetails(courseItemCost, itemShippingCost, itemSalesTax);
     var payment = new PayPalPayment(courseItemCost, currencyType, courseItemName, transactType, paymentDetails);
     return payment;
   }
    function configuration() { var config = new PayPalConfiguration({ merchantName: merchantName, merchantPrivacyPolicyURL: merchantPrivacyPolicyURL, merchantUserAgreementURL: merchantUserAgreementURL }); return config; }
    function onPrepareRender() { 
     var buyNowBtn = document.getElementById("c-pay"); 
     var buyNowBtnCat = document.getElementById("cat-pay");
     var buyInFutureBtn = document.getElementById("c-pay-later");
     var profileSharingBtn = document.getElementById("c-pay-share");
     buyNowBtn.onclick = function(e) {PayPalMobile.renderSinglePaymentUI(createPayment(), onSuccesfulPayment, onUserCanceled); };
     buyNowBtnCat.onclick = function(e) {PayPalMobile.renderSinglePaymentUI(createPayment(), onSuccesfulPayment, onUserCanceled); };
     buyInFutureBtn.onclick = function(e) {
       // future payment
       PayPalMobile.renderFuturePaymentUI(onAuthorizationCallback, app
         .onUserCanceled);
     };
     profileSharingBtn.onclick = function(e) {
       // profile sharing
       PayPalMobile.renderProfileSharingUI(["profile", "email", "phone",
         "address", "futurepayments", "paypalattributes"
       ], onAuthorizationCallback, onUserCanceled);
     };
   }
    function onPayPalMobileInit() { PayPalMobile.prepareToRender("PayPalEnvironmentProduction", configuration(), onPrepareRender); }//PayPalEnvironmentNoNetwork|PayPalEnvironmentSandbox
    function onUserCanceled(result) { console.log(result); alert(result); }
   
});

}(jQuery));


//    $("#all-courses-categories").owlCarousel({
//        jsonPath : webServLink+'fetch-course-categories.php',
//        jsonSuccess : customDataSuccess
//    }); 
//    
//    function customDataSuccess(data){
//        var content = "";
//        for(var i in data["info"]){
//           var logo = data["info"][i].image;
//           if(logo =="") logo = 'images/no_logo.png'; else logo = siteRoot+'media/category/'+data["info"][i].image;
//           content += '<div><div class="staff-item"><img src="'+logo+'" alt="img"><h4>'+data["info"][i].name+'</h4> <strong>'+data["info"][i].description+'</strong> <a href="#" class="button button-red center-button">Select</a></div></div>';
//        }
//        $("#all-courses-categories").html(content);
//    }