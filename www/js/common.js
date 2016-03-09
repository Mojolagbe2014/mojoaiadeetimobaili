var siteRoot = 'http://localhost/iadet/';
//var siteRoot = "http://iadet.net/";
var webServLink = siteRoot+'REST/'; //location of the web services
var totalListedItems = 10; //Specifies the number of courses per page
var phoneNumber = '+2348151373643';
var companyMail = "info@iadet.net";
var payPalLink = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top"> <input type="hidden" name="cmd" value="_s-xclick"> <input type="hidden" name="hosted_button_id" value="R4YKGH9Z8YFZC"> <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal"> <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"> </form>';
//PAYPAL PLUGIN SETTINGS
var payPalEnvironmentProduction = "Acw7YS9ORKM1wYL6UWdnzvREE1u2gUorf529-iTyIUd9tTFFxgdZ4OTATlJq6m3DPR-Frhpuno6ZTmSK";//YOUR_PRODUCTION_CLIENT_ID
var payPalEnvironmentSandbox = "";//YOUR_SANDBOX_CLIENT_ID
var merchantName = "IADET E_COURSES"; // String business name to show
var merchantPrivacyPolicyURL = "http://iadet.net/privacy";//Url to company's privacy policy
var merchantUserAgreementURL = "http://iadet.net/user-agreement";//Url to company's user agreement
var courseItemCost = "1000.00";//cost of the item
var currencyType = "GBP";//currency
var courseItemName  = ""; //Name of the course to be purchased
var transactType = "Sale";//transaction type
var itemShippingCost = "0.00";//Cost of shipping
var itemSalesTax = "0.00";//Tax
var purchasedCourseId = 0;//Id of the course just purchased
var purchasedCourseLink = "";//Link to the media of the bought course
var itemType = ''; //course|category
var paymentMode = ''; //full|installment

/** Function that display separate html documnt as dialog pages
*  @param {string} page internal existing page to be opened as dialog
*  @param {string} transition Transition type
*/
function showDialog(page, transition){
    $.mobile.pageContainer.pagecontainer('change', page,{ 
        allowSamePageTransition: true,
        showLoadMsg : true,
        transition: transition,
        reloadPage: true
       //role: "dialog" 
    });
}
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
/* Log Out Handler */
function logout(){
    $.ajax({
        url: webServLink+"user-logout.php",
        success : function(data, status) {
            if(data.status === 1){
                sessionStorage.clear();
                $('#userLogingLink').show(); $('#userLogoutLink').hide();  $('#userSignUpLink').show();
                $('#indexMyCourses').hide();$('#indexMyLoggedCpds').hide(); $('#userProfileLink').hide();
                $("#message-dialog .ui-content h1").text("Logged Out !!!");
                $("#message-dialog .ui-content p").text(data.msg);
                showMessageDialog('flow');
            }
            else {
                sessionStorage.clear();
                $('#userLogingLink').show(); $('#userLogoutLink').hide();
                $("#message-dialog .ui-content h1").text("Logout Error !!!");
                $("#message-dialog .ui-content p").text(data.msg);
                showMessageDialog('flow');
            }
        }
    });
}

/** Message Box shown to non-loggedin users  */
function signInMessage(){
    $("#message-dialog .ui-content h1").text("Action Failed !!!");
    $("#message-dialog .ui-content p").text("You have to login/sign up to be able to access this. ");
    showMessageDialog('flow');
}

/**
 * fetchCoursesById fetches course details using the course's Id
 * @param {int} id Course's id
 */
function fetchCoursesById(id){
    $.ajax({
        url: webServLink+"fetch-courses-by-id.php",
        cache:false, data: {id :id},
        success : function(data, status) { 
            if(data.status === 1){ 
                $.each(data.info, function(i, item){
                    $('#filterablePurchasedLoggedCPDs').append('<li class="no-bottom one-half-responsive"><a href="'+item.link+'" data-rel="external" data-ajax="false">'+item.name+'</a></li>');
                });
            }  
        } 
    });
}
/**
 * fetchCoursesByCategory fetches course details using the course's Id
 * @param {int} id Course's id
 */
function fetchCoursesByCategory(id){
    $.ajax({
        url: webServLink+"fetch-courses-by-category.php",
        cache:false, data: {id :id},
        success : function(data, status) { 
            if(data.status === 1){ 
                $.each(data.info, function(i, item){
                    $('#filterablePurchasedLoggedCPDs').append('<li class="no-bottom one-half-responsive"><a href="'+item.link+'"  data-rel="external" data-ajax="false">'+item.name+'</a></li>');
                });
            }  
        } 
    });
}

/**
 *  loads all manually logged courses
 */
function fetchLoggedCpds(){
    $.ajax({
        url: webServLink+"manage-user-courses.php",
        cache:false, data: {LoggedInUserId:sessionStorage.IADETuserId, action: 'fetch'},
        success : function(data, status) { 
            var targetTableBody = $('#listOfAllLoggedCPDS table#table-column-toggle tbody');
            if(data.status === 1){ 
                //$('#filterableManuallyLoggedCPDs').empty();
                targetTableBody.empty(); var totalPoints =0, totalCourses =0, totalCertificates =0;
                $.each(data.info, function(i, item){
                    var logedCpdMedia = ''; totalCourses = parseInt(i+1); totalPoints = Number(totalPoints) + Number(item.point);
                    if(item.certificate!=''){totalCertificates++; logedCpdMedia = '<a class="ui-btn ui-mini ui-icon-action ui-btn-icon-left" href="'+siteRoot+'media/user-course-certificate/'+item.certificate+'" data-rel="external" data-ajax="false">View</a>';}
                    //$('#filterableManuallyLoggedCPDs').append('<li><a href="#" rel="external">'+item.topic+'</a></li>');
                    targetTableBody.append('<tr><th>'+parseInt(i+1)+'</th><td>'+item.speciality+'</td><td>'+item.topic+'</td><td>'+item.point+'</td><td>'+item.location+'</td><td>'+item.attendanceDate+'</td><td>'+item.comment+'</td><td>'+logedCpdMedia+'</td></tr>');
                });
                targetTableBody.append('<tr><th>TOTAL</th><td> --- </td><td>'+totalCourses+' Course(s) Logged</td><td>'+totalPoints+' Points/Hours Earned</td><td> --- </td><td> --- </td><td> --- </td><td>'+totalCertificates+' Certificate(s) Obtained</td></tr>');
            } 
        } 
    });
}

/**
 * Load all my purchased courses
 */
function fetchMyCourses(){
    $.ajax({
        url: webServLink+"manage-purchased-courses.php",
        cache:false, data: {LoggedInUserId:sessionStorage.IADETuserId, action: 'fetch'},
        success : function(data, status) { 
            if(data.status === 1){
                $('#filterablePurchasedLoggedCPDs').empty();
                $.each(data.info, function(i, item){
                    if(item.itemType=='course') fetchCoursesById(item.course);
                    if(item.itemType=='category') fetchCoursesByCategory(item.course);
                });
            } 
        } 
    });
}

$(document).ready(function(){ 
    //Open External URL in external Browser
    $(document).on('click', 'a[data-rel=external]', function(e){
        e.stopPropagation();  e.preventDefault();
        window.open($(this).attr('href'), "_blank", "location=no");
        //navigator.app.loadUrl($(this).attr('href'), { openExternal:true });
    });
    //Courses links clicked 
     $('.isThisLoggedUser').click(function(e){ 
        if(sessionStorage.IADETuserId=="" || sessionStorage.IADETuserId==null || sessionStorage.IADETuserId == "undefined"){
            e.stopPropagation(); e.preventDefault();signInMessage();
        }
     });
     
    //On ABOUT US Link Click
    $('#aboutUSLink').click(function(){ 
        $('#tutorSlider').empty();
        $.ajax({
            url: webServLink+"fetch-tutors.php",
            cache:false, 
            success : function(data, status) { 
                if(data.status === 1){ 
                    $('#tutorSlider').empty();
                    $.each(data.info, function(i, item){
                        $('#tutorSlider').append('<div><div class="staff-item"><img src="'+siteRoot+'media/tutor/'+item.picture+'" alt=""/><h4>'+item.name+'</h4><em style="margin-bottom:3px">'+item.qualification+'</em><strong style="line-height: 1.3; text-align: justify;font-size:11px; margin-bottom:5px; padding: 0px">'+item.bio.substr(0, 450)+'..</strong></div></div><div class="decoration"></div>');
                    });
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
                $('#tutorSlider').append('<br/><div class="static-notification-red tap-dismiss-notification" style="padding:5px; margin:5px">'+erroMsg+'</div>');
            }, 
        });
        $.mobile.changePage("#tutorSliderPage",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'fade', reverse    : false, changeHash : true });
    });
    
    //Log CPD Link Clicked
    $('#addAnotherCpd').click(function(){
        if(sessionStorage.IADETuserId=="" || sessionStorage.IADETuserId==null || sessionStorage.IADETuserId == "undefined"){
            e.stopPropagation(); e.preventDefault();signInMessage();
        }else $.mobile.changePage("#logNewCPDPage",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'flip', reverse    : false, changeHash : true });
    });
    
    //Upcoming EVENTS Link Click
    $('#upcomingEventsLink').click(function(){ 
        $('#upcomingEvents').empty();
        $.ajax({
            url: webServLink+"fetch-events.php",
            cache:false, 
            success : function(data, status) { 
                if(data.status === 1){ 
                    $('#upcomingEvents').empty();
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                    $.each(data.info, function(i, item){
                        var dateTime = item.dateTime.split(" ");
                        var thisDate = dateTime[0].split('/');
                        $('#upcomingEvents').append('<div><div class="staff-item"><img src="'+siteRoot+'media/event/'+item.image+'" alt=""/><h4>'+item.name+'</h4><em style="margin-bottom:10px"><i class="fa fa-location-arrow"></i> '+item.location+'</em><em style="margin-bottom:10px"><i class="fa fa-calendar"></i> '+thisDate[2]+' '+months[thisDate[1]-1]+', '+thisDate[0]+'.</em><em style="margin-bottom:3px"><i class="fa fa-clock-o"></i> '+dateTime[1]+'</em><strong style="line-height: 1.3; text-align: justify;font-size:11px; margin-bottom:5px; padding: 0px">'+item.description.substr(0, 450)+'..</strong></div></div><div class="decoration"></div>');
                    });
                } 
                else if(data.status === 2){ 
                    $('#upcomingEvents').append('<div><div class="staff-item"><br/><div class="tap-dismiss-notification">No upcoming events. Please check back. Thanks<br/></div></div></div>');
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
                $('#upcomingEvents').append('<br/><div class="static-notification-red tap-dismiss-notification" style="padding:5px; margin:5px">'+erroMsg+'</div>');
            },
        });
        $.mobile.changePage("#upcomingEventsPage",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'flow', reverse    : false, changeHash : true });
    });
    
    //Check Login status
    if(sessionStorage.IADETuserId=="" || sessionStorage.IADETuserId==null || sessionStorage.IADETuserId == "undefined"){
        $('#userLogingLink').show();$('#userLogoutLink').hide(); $('#userSignUpLink').show(); $('#indexMyCourses').hide();$('#indexMyLoggedCpds').hide(); $('#userProfileLink').hide();
    }
    else{ 
        fetchLoggedCpds(); fetchMyCourses(); $('#userProfileLink').show();
        $('#userLogingLink').hide();$('#userLogoutLink').show(); $('#userSignUpLink').hide();$('#indexMyCourses').show();$('#indexMyLoggedCpds').show();
    }
    
    //Dismissable notification handler
    $(document).on('click','.tap-dismiss-notification',function(){$(this).hide();});
    
    //Contact Form Handler
    $(document).on('click','form #contactIadet',function(){//$('form #contactIadet').text('Submiting');
        var senderName = $('form #contactNameField').val();
        var senderEmail = $('form #contactEmailField').val();
        var senderMessage = $('form #contactMessageTextarea').val();
        $.ajax({
            url: webServLink+'contact.php',
            type: 'POST',
            data: {name:senderName, email:senderEmail, message:senderMessage },
            cache: false,
            success : function(data, status) {
                if(data.status === 0){ $("#contactMessageTextareaError").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase">Please enter: '+data.msg+'</p></div>'); }
                else { $("#contactMessageTextareaError").empty().html('<div class="static-notification-green tap-dismiss-notification"><p class="center-text uppercase">'+data.msg+'</p></div>');  }
                
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
                $("#contactMessageTextareaError").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase">'+erroMsg+'</p></div>').show();
            }
        });
        return false;
    });
    
    //CPD LOG Handler
    $(document).on('click','form #cpdLogger',function(){//$('form #cpdLogger').text('Submiting');
        var formData = new FormData($('form#lodcpdform')[0]);
        formData.append("LoggedInUserId", sessionStorage.IADETuserId);
        formData.append("user", sessionStorage.IADETuserId);
        $.ajax({
            url: webServLink+'add-user-course.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            async: false,
            success : function(data, status) {
                if(data.status === 0){ $("#cpdlogmessage").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase">Please fill all compulsory fields</p></div>').show(); }
                else if(data.status === 4 || data.status === 2 || data.status === 3){ $("#cpdlogmessage").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase"> '+data.msg+'</p></div>').show(); }
                else if(data.status === 1) { $("#cpdlogmessage").empty().html('<div class="static-notification-green tap-dismiss-notification">'+data.msg+'</p></div>').show();  }
                else { $("#cpdlogmessage").empty().html('<div class="static-notification-red tap-dismiss-notification">'+data+'</p></div>').show();  }
                
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
                $("#cpdlogmessage").empty().html('<div class="static-notification-red tap-dismiss-notification">'+erroMsg+'</div>').show();
            },
            processData: false
        });
        return false;
    });
    
    //Remeber Me Handler
    function remeberMe(){
        if (localStorage.IADETRememberMe !=null && localStorage.IADETRememberMe != '') {
            $('form#loginPageForm #email').val(localStorage.IADETRememberMeuserName);
            $('form#loginPageForm #passWord').val(localStorage.IADETRememberMepassWord);
            $('form#loginPageForm #rememberme').attr('checked','checked');
        }else{
            $('form#loginPageForm #email').val('');
            $('form#loginPageForm #passWord').val('');
        }
    }
    remeberMe();
    
    $(document).on('click','form#loginPageForm #login-button', function() {
        if ($('form#loginPageForm #rememberme').is(':checked')) {
            localStorage.IADETRememberMeuserName = $('form#loginPageForm #email').val();
            localStorage.IADETRememberMepassWord = $('form#loginPageForm #passWord').val();
            localStorage.IADETRememberMe = 'remembered';
        } else {
            localStorage.IADETRememberMeuserName = '';
            localStorage.IADETRememberMepassWord = '';
            localStorage.IADETRememberMe = '';
        }
    });
    
    //Login Link Click
    $('#userLogingLink').click(function(){ $("#loginPageForm p").html('Please enter your login credentials below.'); remeberMe(); $.mobile.changePage("#login-page",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'flow', reverse    : false, changeHash : true }); });
    
    //On Login Button click
    $(document).on('click','form#loginPageForm #login-button',function(){//$('form #cpdLogger').text('Submiting');
        var formData = new FormData($('form#loginPageForm')[0]);
        formData.append("loginstuff", "performLogin");
        $.ajax({
            url: webServLink+'user-login.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            async: false,
            success : function(data, status) {
                if(data.status === 1){
                    $.each(data.info, function(i, item) {
                        if (typeof localStorage !== "undefined") {
                            sessionStorage.IADETLoggedInUser = true;
                            sessionStorage.IADETUserName = item.userName;
                            sessionStorage.IADETUserFullName = item.firstName +' '+item.lastName;
                            sessionStorage.IADETUserFirstName = item.firstName;
                            sessionStorage.IADETUserLastName = item.lastName;
                            sessionStorage.IADETuserId = item.id;
                            sessionStorage.IADETuserPicture = item.picture;
                            sessionStorage.IADETuserPhone = item.phone;
                            sessionStorage.IADETuserAddress = item.address;
                            sessionStorage.IADETuserDateRegistered = new Date(item.dateRegistered*1000);
                            sessionStorage.IADETuserEmail = item.email;
                        }
                    });
                    fetchLoggedCpds(); fetchMyCourses(); 
                    $('#userLogingLink').hide(); $('#userSignUpLink').hide(); $('#userProfileLink').show();
                    $('#userLogoutLink').show();$('#indexMyCourses').show();$('#indexMyLoggedCpds').show();
                    $("#loginPageForm p").empty().html('<div class="static-notification-green tap-dismiss-notification">Welcome '+data.info[0].userName+', you are now logged  in. Redirecting ..</p></div>'); 
                    setInterval($.mobile.back(), 3000);
                }
                else if(data.status === 0){ $("#loginPageForm p").empty().html('<div class="static-notification-red tap-dismiss-notification">'+data.msg+'</div>'); }
                else if(data.status === 4 || data.status === 2 || data.status === 3){ $("#loginPageForm p").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase"> '+data.msg+'</p></div>'); }
                else { $("#loginPageForm p").empty().html('<div class="static-notification-green tap-dismiss-notification">'+data+'</p></div>');  }
                
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
                $("#loginPageForm p").html('<div class="static-notification-red tap-dismiss-notification">'+erroMsg+'</div>');
                //showMessageDialog('flow');
            },
            processData: false
        });
        return false;
    });
    
    //Logout Button Click
    $('#userLogoutLink').click(function(){ sessionStorage.clear(); logout(); });
    
    //Sign Up Link Click
    $('#userSignUpLink').click(function(){  //showDialog('sign-up.html', 'pop'); 
        $.mobile.changePage("#signupformpage",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'pop', reverse    : false, changeHash : true });
    });
    
    //Sign Up Button Click
    $(document).on('click','form #addIadetUser',function(){//$('form #cpdLogger').text('Submiting');
        var formData = new FormData($('form#iadetsignup')[0]);
        formData.append("addNewUser", "addNewUser");
        $.ajax({
            url: webServLink+'add-user.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            async: false,
            success : function(data, status) {
                if(data.status === 1){ $("form#iadetsignup p").empty().html('<div class="static-notification-green tap-dismiss-notification"><p class="center-text uppercase"> '+data.msg+'</p></div>'); }
                else if(data.status === 0){ $("form#iadetsignup p").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase">Please enter: '+data.msg+'</p></div>'); }
                else if(data.status === 2 || data.status === 3 ||  data.status === 1){ $("form#iadetsignup p").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase"> '+data.msg+'</p></div>'); }
                else { $("form#iadetsignup p").empty().html('<div class="static-notification-red tap-dismiss-notification">'+data+'</p></div>');  }
                
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
                $('form#iadetsignup p').empty().html('<br/><div class="static-notification-red tap-dismiss-notification" style="padding:5px; margin:5px">'+erroMsg+'</div>');
            },
            processData: false
        });
        return false;
    });
    
    //Profile Link Click
    $('#userProfileLink').click(function(){
        if(sessionStorage.IADETuserId=="" || sessionStorage.IADETuserId==null || sessionStorage.IADETuserId == "undefined"){signInMessage();}
        else{
            $.ajax({
                url: webServLink+"manage-user-courses.php",
                cache:false, data: {LoggedInUserId:sessionStorage.IADETuserId, action: 'fetch'},
                success : function(data, status) { 
                    if(data.status === 1){ 
                        $('#totalCoursesLogged').html('<a href="#">Total Manually Logged CPDs: '+(data.info.length)+"</a>"); 
                    } 
                    else { $('#totalCoursesLogged').text('Total Manually Logged CPDs: 0'); } 
                } 
            });
            $.ajax({
                url: webServLink+"manage-purchased-courses.php",
                cache:false, data: {LoggedInUserId:sessionStorage.IADETuserId, action: 'fetch'},
                success : function(data, status) { 
                    if(data.status === 1){
                        $('#totalCoursesPurchased').html('<a href="#">Total Courses Purchased: '+(data.info.length)+"</a>"); 
                    } 
                    else { $('#totalCoursesPurchased').text('Total Courses Purchased: 0'); } 
                } 
            });
            $('#loggedInUserNameinProfile').text(sessionStorage.IADETUserFullName);
            $('#loggedInPictureinProfile').html('<img  src="'+sessionStorage.IADETuserPicture+'" alt="UserPix">');
            $('#loggedInEmailinProfile').text(sessionStorage.IADETuserEmail);
            $('#loggedinUserDateRegistered').text('Date Registered: '+sessionStorage.IADETuserDateRegistered);
            $.mobile.changePage("#profilePage",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'fade', reverse    : false, changeHash : true });
        }
    });
    
    //Display list of all manually logged CPDs 
    $(document).on('click', '#listMyLoggedCourses', function(){
        $.mobile.changePage("#listOfAllLoggedCPDS",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'slidedown', reverse    : false, changeHash : true });
    });
    
    //Display list of all purchased courses
    $(document).on('click', '#listMyPurchasedCourses', function(){
        $.mobile.changePage("#listOfAllPurchasedCPDS",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'slidedown', reverse    : false, changeHash : true });
    });
    
    //Change Password Button Click on Profile
    $(document).on('click','#changeMyPassword', function(){
        $.mobile.changePage("#passWordChanger",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'fade', reverse    : false, changeHash : true });
    });
    
    //On CHANGE Button click on POPUP Password Changer dialog
    $(document).on('click','#changePasswordButton', function(){
        var formData = new FormData($('form#passWordChangerForm')[0]);
        formData.append("LoggedInUserId", sessionStorage.IADETuserId);
        $.ajax({
            url: webServLink+'change-user-password.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            async: false,
            success : function(data, status) {
                if(data.status === 1){ $("#passWordChanger span").empty().html('<div class="static-notification-green tap-dismiss-notification"><p class="center-text uppercase">'+data.msg+'</p></div>'); }
                else if(data.status === 0 || data.status === 2 || data.status === 3){ $("#passWordChanger span").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase"> ERROR: '+data.msg+'</p></div>'); }
                else { $("#passWordChanger span").empty().html('<div class="static-notification-red tap-dismiss-notification">'+data+'</p></div>');  }
                
            },
            processData: false
        });
        return false;
    });
    
    //ON Edit Profile Button/Link Click
    $(document).on('click','#editMyProfile', function(){
        $("#profileEditor #firstName").val(sessionStorage.IADETUserFirstName);
        $("#profileEditor #lastName").val(sessionStorage.IADETUserLastName);
        $("#profileEditor #phone").val(sessionStorage.IADETuserPhone);
        $("#profileEditor #address").val(sessionStorage.IADETuserAddress);
        $("#profileEditor #id").val(sessionStorage.IADETuserId);
        $.mobile.changePage("#profileEditor",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'fade', reverse    : false, changeHash : true });
    });
    
    //On Update Profile Button Click
    $(document).on('click','form#editProfileDetails #updateThisUserProfile',function(){//$('form #cpdLogger').text('Submiting');
        var formData = new FormData($('form#editProfileDetails')[0]);
        $.ajax({
            url: webServLink+'user-profile-update.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            async: false,
            success : function(data, status) {
                if(data.status === 1){ $("form#editProfileDetails p").empty().html('<div class="static-notification-green tap-dismiss-notification"><p class="center-text uppercase"> '+data.msg+'</p></div>'); logout(); }
                else if(data.status === 0){ $("form#editProfileDetails p").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase">Please enter: '+data.msg+'</p></div>'); }
                else if(data.status === 2 || data.status === 3 ||  data.status === 1){ $("form#editProfileDetails p").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase"> '+data.msg+'</p></div>'); }
                else { $("form#editProfileDetails p").empty().html('<div class="static-notification-red tap-dismiss-notification">'+data+'</p></div>');  }
                
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
               $('form#editProfileDetails p').empty().html('<br/><div class="static-notification-red tap-dismiss-notification" style="padding:5px; margin:5px">'+erroMsg+'</div>');
            },
            processData: false
        });
        return false;
    });
    
    //Forgot Password Link Click
    $(document).on('click','#iForgotMyPasswordLink', function(){
        showDialog('reset-password.html', 'pop');
    });
    
    //On RESET password button click
    $(document).on('click','#resetPasswordButton', function(){
        var formData = new FormData($('form#resetMyPasswordForm')[0]);
        $.ajax({
            url: webServLink+'user-reset-password.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            async: false,
            success : function(data, status) {
                if(data.status === 1){ $("#resetMyPassword span").empty().html('<div class="static-notification-green tap-dismiss-notification"><p class="center-text uppercase">'+data.msg+'</p></div>'); }
                else if(data.status === 0 || data.status === 2 || data.status === 3){ $("#resetMyPassword span").empty().html('<div class="static-notification-red tap-dismiss-notification"><p class="center-text uppercase"> '+data.msg+'</p></div>'); }
                else { $("#resetMyPassword span").empty().html('<div class="static-notification-red tap-dismiss-notification">'+data+'</p></div>');  }
                
            },
            error : function(xhr, status) {
                erroMsg = '';
                if(xhr.status===0){ erroMsg = 'There is a problem connecting to internet. Please review your internet connection.'; }
                else if(xhr.status===404){ erroMsg = 'Requested page not found.'; }
                else if(xhr.status===500){ erroMsg = 'Internal Server Error.';}
                else if(status==='parsererror'){ erroMsg = 'Error. Parsing JSON Request failed.'; }
                else if(status==='timeout'){  erroMsg = 'Request Time out.';}
                else { erroMsg = 'Unknow Error.\n'+xhr.responseText;}          
                $("#resetMyPassword span").html('<div class="static-notification-red tap-dismiss-notification">'+erroMsg+'</div>');
            },
            processData: false
        });
        return false;
    });
    
    //=== Load the spinner if an ajaxStart occurs; stop when it is finished ==//
    $(document).on({
        ajaxStart: function() {$.mobile.loading( 'show', {text: "Loading..",textVisible: true,theme: "a"  /*textonly: textonly,  html: html */ }); },
        ajaxStop: function() { $.mobile.loading('hide');}    
    });
    
    //My courses link click
    $(document).on('click', '#indexMyCourses', function(){
        $.mobile.changePage("#listOfAllPurchasedCPDS",{ allowSamePageTransition: true, showLoadMsg : true, transition : 'slidedown', reverse    : false, changeHash : true });
    });
    
    //Logged CPDs link click
    $(document).on('click', '#indexMyLoggedCpds', function(){
        $.mobile.changePage("#listOfAllLoggedCPDS",{ allowSamePageTransition: false, showLoadMsg : true, transition : 'slidedown', reverse    : false, changeHash : true });
    });
});