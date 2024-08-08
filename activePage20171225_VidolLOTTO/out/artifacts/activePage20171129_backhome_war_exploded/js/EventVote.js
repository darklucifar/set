var run_obj;
var api_url = appConfig.API_URL;

var EventVote = function EventVote() {
	var myClass = '.EventVote';
	var _this = this;
	// var api_url = appConfig.API_URL;
	this.get_data = {};
	this.debug = function (){
		console.log('debug');
		console.log(_this.get_data);
	};
	this.load_data = function (mytoken){
		console.log('load_json');
		$.ajax({
			url: api_url + '/v1/votes/vote.json',
			type: 'GET',
			method: 'GET',
			cache: false,
			dataType: 'jsonp',
			data: { config_id: '1',default: '0' },
			timeout: 10000,//10秒
			error: function(xhr) {
				alert('Ajax request 發生錯誤');
			},
			success: function(data){
				console.log(data);
				$('input[name=config_id]').val(data.result.config_id);
				$.each(data.result.item, function(i, item) {
					$('.item_' + i + ' a').attr('href', item.url);
					$('.item_' + i + ' img').attr('src', item.img);
					$('.item_' + i + ' label').html( item.title + '<span class="score">得票率 ' + item.proportion + '％</span>');
					$('.item_' + i + ' input').val(item.item_id);
				});
			},
			statusCode: {
				200: function() {
					console.log('200 OK');
				}
			}
		});
	};
	this.login_vodel = function (mytoken){
		console.log('login_vodel');
		nowtime = $.now();
		user_username = $('input[name=username]').val();
		user_password = $('input[name=password]').val();
		fb_expires = $('input[name=fb_expires]').val();
		$.post( api_url + '/v1/auth/vidol', { random: nowtime, username: user_username, password: user_password, default: '0' } ).done(function( data ) {
			console.log(data);
			$('input[name=token]').val(data.result.access_token);
            $('.header .login').css("display","none");
			$('.header .login_inter').css("display","block");
	  		alert('您已成功登入!!');
            $('.content#step1').css("display","none");
            $('.content#step2').css("display","block");
		}).fail(function() {
			alert('請重新登入!!');
		});
	};
	this.login_facebook = function (mytoken){
        console.log('login_facebook');
        checkLoginState();
	};
	this.send_vote = function (mytoken){
		console.log('send_vote');
		nowtime = $.now();
		v_token = $('input[name=token]').val();
		v_config_id = $('input[name=config_id]').val();
		//v_item_id = $('input[name="item_id"]:checked').val();
        v_item_id = getVoteString;
        console.log("v_item_id : "+v_item_id);
		if(v_token.length > 1){
			$.post( api_url + '/v1/votes/vote', { random: nowtime, token: v_token, config_id: v_config_id, 'item_id': v_item_id, default: '0' } ).done(function( data ) {
				console.log(data);
				alert('感謝你的投票!!');
			}).error(function() {
				alert('今日已投過!!');
window.location.href="http://vidol.tv";
			});
		} else {
			alert('請登入再投票!!');
window.location.href="http://vidol.tv";
		}
	}

	this.restart_event = function (){
		$('.login').click(function(e) {
			console.log('login click');
			$( "#login" ).dialog();
		});
		$('.login_vidol').click(function(e) {
			console.log('login_vidol click');
			$( "#login" ).dialog( "close" );
			_this.login_vodel();
		});
		$('.login_facebook').click(function(e) {
			console.log('login_facebook click');
			$( "#login" ).dialog( "close" );
            _this.login_facebook();

		});
		$('.send_vote').click(function(e) {
			console.log('send_vote click');
			_this.send_vote();
		});

	}
}

$(document).ready(function(){
	run_obj = new EventVote();
	run_obj.debug();
	//run_obj.load_data();
	run_obj.restart_event();
});

function statusChangeCallback(response) {
	console.log('statusChangeCallback');
	console.log(response);
	if (response.status === 'connected') {
		$('input[name=fb_uid]').val(response.authResponse.userID);
		$('input[name=fb_token]').val(response.authResponse.accessToken);
		$('input[name=fb_expires]').val(response.authResponse.expiresIn);
		testAPI();
		/*LL**/
        nowtime = $.now();
        fb_uid = $('input[name=fb_uid]').val();
        fb_token = $('input[name=fb_token]').val();
        fb_expires = $('input[name=fb_expires]').val();
        console.log(fb_uid,fb_token,fb_expires);
        $.post( api_url + '/v1/auth/facebook', { random: nowtime, uid: fb_uid, facebook_token: fb_token, expiration: fb_expires, default: '0' } ).done(function( data ) {
            console.log(data);
            $('input[name=token]').val(data.result.access_token);
            $('.header .login').css("display","none");
            $('.header .login_inter').css("display","block");
            alert('您已成功登入!!');
            $('.content#step1').css("display","none");
            $('.content#step2').css("display","block");
        }).fail(function(){
            console.log('重新登入FB!!');
            // checkLoginState();
            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
        });

	} else {/* response.status === 'unknown'*/
        FB.login(function(response) {
            checkLoginState();
        }, {scope: 'public_profile,email'});
	}
}

function checkLoginState() {
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}

/*L--start*/
window.fbAsyncInit = function() {
    FB.init({
        appId            : '1044817312247946',
        //appId            : '1957260964597079',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.10',
		oauth: true
    });
    FB.AppEvents.logPageView();
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
/*L--end-------*/

function testAPI() {
	console.log('Welcome!  Fetching your information.... ');
	FB.api('/me', function(response) {
		console.log('Successful login for: ' + response.name);
	});
}

