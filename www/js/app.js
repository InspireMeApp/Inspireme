var app = (function ()
{
    document.addEventListener('deviceready', onDeviceReady, false);

    var app = {};
    var is_device = false;

    app.currentScreenId = null;
    app.sessionid = null;
    app.images = new Array();
    app.user = null;



    function onDeviceReady() {

    }

    app.launch = function () {
        //preload images
        communicate({token: token, mode: 'get_values_categories'}, function (data) {

            imgs = [];
            $.each(data.categories, function () {
                imgs.push(this.artwork);
                app.images[this.id] = new Image();
                app.images[this.id].src = this.artwork;
            });
            var buttons =
                    '<div class="buttons loadingIcon"><a class="load"></a></div>' +
                    '<div class="buttons noPlay"><a class="play" data-action="play"><span></span></a></div>' +
                    '<div class="buttons duringPlay">'+
                    '<a class="stepBackwards small" data-action="stepBackwards"><span></span></a>'+
                    '<a class="pause" data-action="pause"><span></span></a>'+
                    '<a class="stepForwards small" data-action="stepForwards"><span></span></a></div>';
            $.each(data.categories, function () {
                $('#categories').append(
                        '<div class="category-item" id="cat-' + this.id + '" data-tag="' + this.id + '"><h2>' + this.title + '</h2><div><img src="' + this.artwork + '">' + buttons + '</div>' +
                        '<div class="ulCont"><ul></ul></div></div>'
                        );
            });

        });

    }

    app.playAudio = function (src) {

        // Create Media object from src
        my_media = new Media(src, onSuccess, onError);

        // Play audio
        my_media.play();

        // Update my_media position every second
        if (mediaTimer == null) {
            mediaTimer = setInterval(function () {
                // get my_media position
                my_media.getCurrentPosition(
                    // success callback
                    function (position) {
                        if (position > -1) {
                            setAudioPosition((position) + " sec");
                        }
                    },
                    // error callback
                    function (e) {
                        console.log("Error getting pos=" + e);
                        setAudioPosition("Error: " + e);
                    }
                    );
            }, 1000);
        }
    };

    app.preload = function (obj) {
        cur = 0;
        console.log(obj);
        $.each(obj, function () {
            app.images[cur] = new Image();
            app.images[cur].src = obj[cur];
            cur++;
        });
    };

    //use : app.openModal('hoi' , {callbackfunction : 'text inside button'})
    app.openModal = function (message, params) {
        
        $('#textArea').html(message);
        $('#buttonArea').html('');
        var cur = 0;

        $.each(params, function (callback, txt) {
            $('#buttonArea').append("<button id='button-" + cur + "'>" + txt + "</button>");
            $('#button-' + cur).click(function () {
                eval(callback + "()");
            });

            cur++;

        });

        $('#modal').show();
    }

    function guestVisit(){
        app.user = [];
        app.sessionid = "Guest";
        app.user.fullname = "Guest";
        $('#modal').hide();
        intro4.run();
    }

    app.openForgotPassword = function(){
        app.openModal("Enter your email address below and we'll send you an email with your login details <input id='sendEmail' type='email' placeholder='Enter e-mail address'> ", {closeModal : 'Close'  , sendEmail : 'Send'});
     }

    function openForgotPassword(){
        app.openForgotPassword();
    }


    function sendEmail(){
        //TODO : SANITIZE EMAIL
        givenmail = $('#sendEmail').val();
        communicate({token: token, mode: "get_account_password" , email : givenmail} ,function (data) {
            if(data.getpassword[0].send == "true"){
                app.openModal("Login details are on the way. Check your inbox!" , {closeModal : 'Ok'})
            }else{
                $('#modal').hide();
                app.openModal("Oops , we don't have this email address on file" , {openForgotPassword : 'Close'})

            }
        });
    }


  
    function closeModal() {
        console.log('hi');
        $('#modal').hide();
    }


    return app;

})();
