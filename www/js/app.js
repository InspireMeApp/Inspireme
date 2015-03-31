var app = (function ()
{

    var app = {};
    var is_device = false;

    app.currentScreenId = null;
    app.sessionid = null;
    app.images = new Array();
    app.user = null;

    app.launch = function () {
        //preload images
        communicate({token: token, mode: 'get_values_categories'}, function (data) {
            imgs = [];
            $.each(data.categories, function () {
                imgs.push(this['artwork-m']);
                app.images[this.id] = new Image();
                app.images[this.id].src = this['artwork-m']
            });

            var buttons =
                    '<div class="buttons loadingIcon"><a class="load"></a></div>' +
                    '<div class="buttons noPlay"><a class="play" data-action="play"><span></span></a></div>' +
                    '<div class="buttons duringPlay">' +
                    '<a class="stepBackwards small" data-action="stepBackwards"><span></span></a>' +
                    '<a class="pause" data-action="pause"><span></span></a>' +
                    '<a class="stepForwards small" data-action="stepForwards"><span></span></a></div>';
            $.each(data.categories, function () {
                $('#categories').append(
                        '<div class="category-item" id="cat-' + this.id + '" data-tag="' + this.id + '"><h2>' + this.title + '</h2><div><img src="' + this['artwork-m'] + '" draggable="false">' + buttons + '</div>' +
                        '<div class="ulCont"><ul></ul></div></div>'
                        );
            });
            setTimeout(function () {
                $('.buttons a', $('#categories')).click(function () {
                    press($(this));
                    audioAction($(this));
                });
            }, 500);

        });

        $('#modalX').click(closeModal);

    };

    app.loadSongs = function (entity, callback) {
        console.log(entity.container);
        if (entity.type == 'fav') {
            communicate({token: token, mode: "get_values_songlist", type: entity.type, uid: app.sessionid}, function (data) {
                callback(data);
            });
        }
        else {
            communicate({token: token, mode: "get_values_songlist", type: entity.type, type_id: entity.type_id, uid: app.sessionid}, function (data) {
                callback(data);
            });
        }
    };

    app.renderSongs = function (container, data, callback) {
        $.each(data.songlist, function () {
            var li = $('<li data-id="' + this.id + '" data-url="' + this.streaming_url + '"/>');
            var buttons = $('<div class="bs"/>');
            $('<a class="proj"><span></span></a>').click(songProj).appendTo(buttons);
            $('<a class="fav"><span></span><u></u></a>').click(songFav).appendTo(buttons);
            $('<a class="i"><span></span></a>').click(songInfo).appendTo(buttons);
            buttons.appendTo(li);
            $('<div class="bar"><div class="favIcon"></div>' +
                    '<div class="info"><b>' + this.title + '</b><i>' +
                    this.title + '</i></div>' +
                    '<span class="duration" data-duration="' + this.duration_sec +
                    '" data-dur-sec="' + this.duration_notation + '">' +
                    this.duration_notation + '</span><u><i></i><u></u><b></b></u></div>'
                    ).click(songClick).swipe({swipeStatus:songSwipeStatus,allowPageScroll:"vertical"}).bind('touchstart',songTouchStart).appendTo(li);
            if (this.in_favourite == "true") {
                li.addClass('faved');
            }
            li.appendTo(container);
        });
        callback();
    };
    

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
    app.openModal = function (message, params, title, extraClass) {
        title = title || '';
        extraClass = extraClass || '';
        $('#modalTitle').text(title);
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

        $('#modal').attr('class', extraClass).show();
    }

    function guestVisit() {
        app.user = [];
        app.sessionid = "Guest";
        app.user.fullname = "Guest";
        $('#modal').hide();
        intro4.run();
    }

    app.openForgotPassword = function () {
        app.openModal("<p>Enter your email address below and we'll send you an email with your login details.</p><input id='sendEmail' type='email' placeholder='Enter e-mail address'> ", {sendEmail: 'Send'}, 'Forgot your password?', 'form');
    }

    function openForgotPassword() {
        app.openForgotPassword();
    }

    function sendEmail() {
        //TODO : SANITIZE EMAIL
        givenmail = $('#sendEmail').val();
        communicate({token: token, mode: "get_account_password", email: givenmail}, function (data) {
            if (data.getpassword[0].send == "true") {
                app.openModal("<p>Login details are on the way. Check your inbox!</p>", {closeModal: 'Ok'})
            } else {
                $('#modal').hide();
                app.openModal("<p>Oops , we don't have this email address on file</p>", {openForgotPassword: 'Close'})

            }
        });
    }

    function logout() {
        app.sessionid = null;
        window.localStorage.clear();
        console.log('logged out!');
        closeModal();
        $('#introSteps').removeClass('step3');
        if (media !== null) {
            media.stop();
            media = null;
        }
        var t = new timeline().add(400, function () {
            $('main, header .buttons').addClass('transparent');
            $('body').removeClass('menuOpen');
        }).add(800, function () {
            intro3.run();
        }).add(1050, function () {
            $('#headerI').removeClass('open');
            $('main, header .buttons').hide();
            $('main').removeClass('nobg');
            $('#categories').removeClass('animating').removeAttr('style');
            $('.category-item.open').each(function () {
                $('.active', $(this)).removeClass('active loading paused');
                $(this).removeClass('open playing');
                $('.ulCont', $(this)).css({'height': '0px'}).empty();
            });
            $('header u').removeClass('transparent');
        }).run();

    }

    function closeModal() {
        $('#modal').hide();
    }


    return app;

})();
