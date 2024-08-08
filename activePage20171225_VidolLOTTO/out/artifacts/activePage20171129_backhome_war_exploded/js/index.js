$(function(){
    //document.domain = "vidol.tv";
    //share action
    $("#FB_share").click(function(){
        FB.ui({
            method: 'share',
            display: 'popup',
            href: 'http://event.vidol.tv/VidolLOTTO/index.html',
            picture: 'http://event.vidol.tv/VidolLOTTO/image/main.png'
        }, function(response){});
    });
    $("#line_share").click(function(){
        event.preventDefault();
        window.open("http://line.naver.jp/R/msg/text/?花火新春 Vidol轉轉樂 http://event.vidol.tv/VidolLOTTO/index.html");
    });

    //des change
    $(".descriptionBtn").click(function(){
        $(".footer-forMobilePage1").css("position","relative");
        $(".activeprice").css("display","none");
        $(".description").css("display","block");
    });
    $(".activepriceBtn").click(function(){
        $(".footer-forMobilePage1").css("position","relative");
        $(".activeprice").css("display","block");
        $(".description").css("display","none");
    });

    //member login check
    var remainTimes;
    var memberLevel;
    var login_url = "http://vidol.tv/users/login";
    token = getCookie('_user_session');
    if(token!=''){
        $.ajax({
            url: appConfig.API_URL + '/v1/Turntable/index.json',
            type: 'POST',
            method: 'POST',
            cache: false,
            data:{user_token: token,now_date:'2018-02-28'},
            dataType: 'json',
            timeout: 10000,//10秒
            error: function(xhr) {
                alert('Ajax request 發生錯誤');
                console.log(xhr);
            },
            success: function(data){
                console.log(data);
                memberLevel = data.result.member_type;
                if(memberLevel!='尚未登入'){
                    remainTimes = data.result.drawCount;
                    $('.status').css('display','block');
                    $('.status .memberLevel').text(data.result.member_type);
                    $('.status .times').text(data.result.drawCount);

                    console.log(memberLevel);
                    console.log(token);
                }
            },
            statusCode: {
                200: function() {
                    console.log('200 OK');
                }
            }
        });
    }

    //顯示目前戰利品
    $('#main .mainPic .lootBtn').click(function () {
        console.log('aa');
        var currentlyLootHtml = '';
        $('.awardBG > div').css("display","none");
        //戰利品ajax
        if(token!=''&&memberLevel!='尚未登入'){
            $.ajax({
                url: appConfig.API_URL + '/v1/Turntable/getMemberWinningPrize.json',
                type: 'POST',
                method: 'POST',
                cache: false,
                data:{user_token: token},
                dataType: 'json',
                timeout: 10000,//10秒
                error: function(xhr) {
                    alert('Ajax request 發生錯誤');
                    console.log(xhr);
                },
                success: function(data){
                    console.log(data);
                    var resultObj = data.result;
                    $('.awardBG').css('display','block');
                    $('.awardBG .currentlyLoot').css('display','block');
                    $("body").css('overflow-y','hidden');

                    if(resultObj.length > 0){
                        for(var i=0;i<resultObj.length;i++){
                            currentlyLootHtml = currentlyLootHtml + '<tr><td class="awardName">'+ resultObj[i].prize_name +'</td><td class="num">X<span class="count">1</span></td></tr>';
                        }
                        $('.awardBG .currentlyLoot .own .visible table').html(currentlyLootHtml);
                        $('.awardBG .currentlyLoot .empty').css('display','none');
                        //currentlotto scroll bar and show
                        $(".awardBG .currentlyLoot #scrollbar1").tinyscrollbar();
                        $(".awardBG .currentlyLoot #scrollbar1").css('display','block');

                    }else {
                        $('.currentlyLoot .empty').css('display','block');
                        $('.awardBG .currentlyLoot #scrollbar1').css('display','none');
                    }
                },
                statusCode: {
                    200: function() {
                        console.log('200 OK');
                    }
                }
            });
        }else {
            setCookie('user_signed_in_redirect_to', 'http://event.vidol.tv/VidolLOTTO/index.html', 1, "vidol.tv");
            location.href = login_url;
        }
    });


    //lottoturn js
    var bRotate = false;
    var rotateFn = function (awards, angles, name, imageUrl){
        bRotate = !bRotate;
        console.log(angles+1800);
        $('.prizeTray').stopRotate();
        $('.prizeTray').rotate({
            angle:0,
            animateTo:angles+1800,
            duration:8000,
            callback:function (){
               // alert(name);//將name跟img塞在指定的div
                bRotate = !bRotate;
                if(awards<0){
                    //沒有中獎
                    $(".notGetward").css("display","block");
                }else{
                    $(".awardBG").css("display","block");
                    $(".unclickMask").css('visibility','hidden');
                    $("body").css('overflow-y','hidden');
                    $(".awardBG .getRewarded_step1").css("display","block");
                    $(".awardBG .getRewarded_step1 .awardImage img").attr('src', imageUrl);
                    $(".awardBG .getRewarded_step1 .awardName img").attr('src', name);
                }
            }
        })
    };

    $(".notGetward img").click(function () {
        $(this).parent().css("display","none");
        $(".unclickMask").css('visibility','hidden');

        //點擊共估視窗Ｘ按鈕後,if memberLevel是一般會員則直接顯示一般會員抽完畫面
        if(memberLevel=='一般會員'){
            $('.awardBG').css('display','none');
            $('#main .mainPic').css('display','none');
            //顯示一般會員抽完畫面
            $('#main .becomeVIP').css('display','block');
            $('#main .organizer').css('display','block');
        }
    });

    var drawId;

    $(".priceBtn").click(function(){
        drawId='';
        token = getCookie('_user_session');
        if(token!=''&&memberLevel!='尚未登入'){
            $(".unclickMask").css('visibility','visible');
            console.log('剩餘次數: '+ remainTimes);
            if(remainTimes > 0){
                if(bRotate)return;
                $.ajax({
                    url: appConfig.API_URL + '/v1/Turntable/draw.json',
                    type: 'POST',
                    method: 'POST',
                    cache: false,
                    data:{now_date:'2018-02-28', user_token: token},
                    dataType: 'json',
                    timeout: 10000,//10秒
                    error: function(xhr) {
                        alert('Ajax request 發生錯誤');
                        console.log(xhr);
                    },
                    success: function(data){
                        console.log(data);
                        if(data.code=='E0600003'){
                            alert("活動尚未開始～敬請期待！");
                        }else if(data.code=='E0600004'){
                            alert("活動已結束囉～");
                        }else {
                            status = 1;
                            remainTimes = remainTimes-1;
                            $('.status .times').text(remainTimes);
                            console.log('目前剩餘次數: '+ remainTimes);

                            var id = data.result.prize_id;
                            var imgName = data.result.img_name_path;
                            var imgUrl = data.result.img_path;
                            var grid;
                            drawId = data.result.draw_id;
                            if(id<0){
                                grid = 8;//-1
                            }else {
                                grid = id;//0~7
                            }
                            console.log(id,grid);
                            var angle = (360/9)*(9-grid)+(360/9/4);
                            console.log(angle);
                            rotateFn(id, angle, imgName, imgUrl);
                        }
                    },
                    statusCode: {
                        200: function() {
                            console.log('200 OK');
                        }
                    }
                });
            }else{
                $('.footer-forMobilePage1').css('display','none');
                $('.footer').css('display','block');
                $('#main .organizer').css('display','block');
                if(memberLevel=='一般會員'){
                    $('.awardBG').css('display','none');
                    $('#main .mainPic').css('display','none');
                    //顯示一般會員抽完畫面
                    $('#main .becomeVIP').css('display','block');
                    $('#main .organizer').css('display','block');
                }else{
                    $('.awardBG').css('display','none');
                    $('#main .mainPic').css('display','none');
                    //顯示VIP會員抽完畫面
                    $('#main .useOverVIP').css('display','block');
                    $('#main .organizer').css('display','block');
                    //alert('顯示VIP會員抽完畫面');
                }
            }
        }else {
            setCookie('user_signed_in_redirect_to', 'http://event.vidol.tv/VidolLOTTO/index.html', 1, "vidol.tv");
            location.href = login_url;
        }
    });

    /*----Open getRewarded_step2 : info-fill---*/
    $('.awardBG .nextBtn').click(function () {
        $('.awardBG .getRewarded_step1').css('display','none');
        $('.awardBG .getRewarded_step2').css('display','block');
        console.log('drawId >> '+drawId);
        //自動帶入資料在[getRewarded_step2]
        $.ajax({
            url: appConfig.API_URL + '/v1/Turntable/getUserProfile.json',
            type: 'POST',
            method: 'POST',
            cache: false,
            data:{user_token: token},
            dataType: 'json',
            timeout: 10000,//10秒
            error: function(xhr) {
                alert('Ajax request 發生錯誤');
                console.log(xhr);
            },
            success: function(data){
                console.log(data);
                console.log('drawID = '+ drawId);
                var userInfo = data.result[0];
                console.log(userInfo.user_name);
                $("#name").val(userInfo.user_name);
                $("#sex").val(userInfo.user_gender);
                $("select.sel_year").val(userInfo.birth_year);
                $("select.sel_month").val(parseInt(userInfo.birth_month));
                $("select.sel_month").trigger('change');
                setTimeout(function(){
                    $("select.sel_day").val(parseInt(userInfo.birth_date));
                }, 100);

                $(".phone .ic").val(userInfo.user_country_code);
                $(".phone #phone").val(userInfo.user_phone);
                $("#email").val(userInfo.user_email);
                $("#country option[value="+userInfo.user_country+"]").prop("selected",true);
                $('#city').val(userInfo.user_city);
                document.querySelector('select#city').dispatchEvent(new Event('change', { 'bubbles': true }))
                setTimeout(function(){
                    $('#area').val(userInfo.user_district);
                }, 100);

                $("#zipcode").val(userInfo.user_zip_code);
                $("#address").val(userInfo.user_address);

                if($("#country").val()=="foreign"){
                    $('#city').hide();
                    $('#area').hide();
                }else if($("#country").val()=="taiwan"){
                    $('#city').show();
                    $('#area').show();
                }
                //帶入地址初始值
                //  $('#city').prop('selectedIndex',4)
            },
            statusCode: {
                200: function() {
                    console.log('200 OK');
                }
            }
        });

    });

    //set taiwain city selector from 'tw-city-selector.min.js'
    new TwCitySelector({
        el: ".address",
        elCounty: "#city", // 在 el 裡查找 dom
        elDistrict: "#area", // 在 el 裡查找 dom
        elZipcode: "#zipcode" // 在 el 裡查找 dom
    });
    new TwCitySelector({
        el: ".my-selector-c",
        elCounty: ".county", // 在 el 裡查找 dom
        elDistrict: ".district", // 在 el 裡查找 dom
        elZipcode: ".zipcode" // 在 el 裡查找 dom
    });


    //set date
    $.ms_DatePicker({
        YearSelector: ".sel_year",
        MonthSelector: ".sel_month",
        DaySelector: ".sel_day"
    });

    $(".btn2").click(function(){
        if($("#name").val()==""){
            alert("你尚未填寫姓名");
            eval("document.form1['name'].focus()");
        }else if(!isNaN($("#name").val())){
            alert("姓名不可輸入數字");
        }else if($("#sex").val()==""){
            alert("你尚未填寫性別");
            eval("document.form1['sex'].focus()");
        }else if($(".sel_month").val()==0||$(".sel_day").val()==0){
            alert("請選擇出生年月日");
            eval("document.form1['birthday'].focus()");
        }else if($("#phone").val()==""){
            alert("你尚未填寫電話");
            eval("document.form1['phone'].focus()");
        }else if($("#address").val()==""){
            alert("你尚未填寫地址");
            eval("document.form1['address'].focus()");
        }else if($("#country").val()=='taiwan'&&$("#area").val()==0){
            alert("請選擇行政區域");
            eval("document.form1['address'].focus()");
        }else if($("#email").val()=="") {
            alert("你尚未填寫E-mail");
            eval("document.form1['email'].focus()");

        }else if(!emailcheck($("#email").val())){
            alert("E-mail格式不正確");
            eval("document.form1['email'].focus()");
        }else{
            //submit and write data into database API
            //token = getCookie('_user_session');
            //var token = '30620bb855cd4b8fb924198e51362c74';
            if(token!=''){
                var userName, gender, birthday, phone, address, mailAddress,country,cityName,countryCode,zipName,zipCode;
                userName = $("#name").val();
                gender = $("#sex").val();
                birthday = $(".sel_year").val()+'-'+$(".sel_month").val()+'-'+$(".sel_day").val();
                phone = $(".phone .ic").val() + $(".phone #phone").val();
                mailAddress = $("#email").val();
                address = $("#address").val();
                country = $("#country").val();
                countryCode = 886;
                if(country=='foreign'){
                    cityName = null;
                    zipName = null;
                }else{
                    cityName = $("#city").val();
                    zipName = $("#area").val();
                }
                zipCode =  $("#zipcode").val();

                $.ajax({
                    url: appConfig.API_URL + '/v1/Turntable/setWinningProfile.json',
                    type: 'POST',
                    method: 'POST',
                    cache: false,
                    data:{user_token: token,
                        draw_id: drawId,
                        name: userName,
                        gender: gender,
                        birthday: birthday,
                        mobile: phone,
                        address: address,
                        email: mailAddress,
                        city_name: cityName,
                        zip_name: zipName,
                        zip_code: zipCode,
                        country_code: countryCode,
                        country: country
                    },
                    dataType: 'json',
                    timeout: 10000,//10秒
                    error: function(xhr) {
                        alert('Ajax request 發生錯誤');
                        console.log(xhr);
                    },
                    success: function(data){
                        console.log(data);
                        console.log('drawID = '+ drawId);
                        alert("資料已傳送成功");
                        console.log(userName, gender, birthday, phone, address, mailAddress,country,cityName,countryCode,zipName,zipCode);
                        $(".unclickMask").css("visibility","hidden");
                        if(remainTimes>0){
                            $('.awardBG').css('display','none');
                        }else if(memberLevel == '一般會員'){
                            $('.awardBG').css('display','none');
                            $('#main .mainPic').css('display','none');
                            //顯示一般會員抽完畫面
                            $('#main .becomeVIP').css('display','block');
                            alert('顯示一般會員抽完畫面');

                        }else{
                            $('.awardBG').css('display','none');
                            $('#main .mainPic').css('display','none');
                            //顯示VIP會員抽完畫面
                            $('#main .useOverVIP').css('display','block');
                        }
                    },
                    statusCode: {
                        200: function() {
                            console.log('200 OK');
                        }
                    }
                });
            }else{
                setCookie('user_signed_in_redirect_to', 'http://event.vidol.tv/VidolLOTTO/index.html', 1, "vidol.tv");
                location.href = login_url;
            }

            $("body").css('overflow-y','auto');
        }
    });

    $(".awardBG .btn_X").click(function () {
       $(".awardBG").css("display","none");
       $(".awardBG > div").css("display","none");
       $(".unclickMask").css("visibility","hidden");
       $("body").css('overflow-y','auto');
    });

    $(".descriptionBtn-mobile").click(function () {
        $(".footer-forMobilePage1").css("position","relative");
        $(".mainPic").css('display','none');
        $(".activeprice-forMobile").css('display','none');
        $(".description-forMobile").css('display','block')
    });

    $(".activepriceBtn-mobile").click(function () {
        $(".footer-forMobilePage1").css("position","relative");
        $(".mainPic").css('display','none');
        $(".description-forMobile").css('display','none');
        $(".activeprice-forMobile").css('display','block');
    });

    $(".backIndex").click(function () {
        $(".description-forMobile").css('display','none');
        $(".activeprice-forMobile").css('display','none');
        $(".mainPic").css('display','block');
    });

    $(".atentionBtn").click(function(){
        $(".footer-forMobilePage1").css('display','none');
        $(".footer").css('display','none');
        $(".atentionPage").css('display','block');
    });
    $(".atentionPage img").click(function(){
        $(".atentionPage").css('display','none');
        $(".footer-forMobilePage1").css('display','block');
    });
});

$(window).resize(function () {
    if($(window).width()>=1024){
        if($('.description-forMobile').css("display")=="block"||$('.activeprice-forMobile').css("display")=="block"&&$('.mainPic').css("display")=="none"){
            location.reload();
        }
    }
});
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function numcheck(id,time){
    var re = /^[0-9]+$/;
    if (!re.test(time.value)){
        alert("只能輸入數字");
        document.getElementById(id).value="";
    }
}
function emailcheck(mail) {
    //please input the test email to see is valid
    var strEmail = mail;

    //Regular expression Testing
    emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;

    //validate ok or not
    if(strEmail.search(emailRule)!= -1){
        return true;
    }else {
        return false;
    }
}
function setCountry(){
   // var countryValue = document.getElementsById("country").value;
    var country = $('#country').val();
    if(country=='foreign'){
        $('#city').hide();
        $('#area').hide();
    }else {
        $('#city').show();
        $('#area').show();
    }
}

function setCookie(c_name,value,expiredays,domain){
    var exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +escape(value) + ";domain="+ domain +";path=/"+((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();
if(Object.keys(urlParams).length > 0){
    setCookie('event_source', JSON.stringify(urlParams), 1, ".vidol.tv");
}