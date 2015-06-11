var app = (function ()
{

    var app = {};
    var is_device = false;

    app.currentScreenId = null;
    app.sessionid = null;
    app.images = new Array();
    app.user = null;

    app.getImageSize = function () {
        var ww = $(window).width();
        if (ww > 1200) {
            app.imageFormat = 'xl';
        } else if (ww > 800) {
            app.imageFormat = 'm';
        } else {
            app.imageFormat = 's'
        }
    };

    app.launch = function () {
        //preload images

        app.getImageSize();

        communicate({token: token, mode: 'get_values_categories'}, function (data) {
            imgs = [];
            $.each(data.categories, function () {
                imgs.push(this['artwork-'] + app.imageFormat);
                app.images[this.id] = new Image();
                app.images[this.id].src = this['artwork-' + app.imageFormat]
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
                        '<div class="category-item" id="cat-' + this.id + '" data-tag="' + this.id + '"><div class="top"><h2>' + this.title + '</h2><img src="' + this['artwork-' + app.imageFormat] + '" draggable="false">' + buttons + '</div>' +
                        '<div class="ulCont"><ul></ul></div></div>'
                        );
            });
            var cyu = $('<div id="cyu">See you next week</div>');
            $('#categories').append(cyu);
            setTimeout(function () {
                $('.buttons a', $('#categories')).click(function () {
                    press($(this));
                    audioAction($(this));
                });
            }, 500);

        });

        $('#modalX').click(closeModal);

    };

    app.loadProjects = function (callback) {
        communicate({token: token, mode: "get_account_projects", uid: app.sessionid}, function (data) {
            var html = "";
            $.each(data.projects, function () {
                var li = '<li class="project-item" data-tag="' + this.id + '">' + this.name + '</li>';
                html += li;
            });
            callback(html);
        });
    }

    app.loadSongs = function (entity, callback) {
        var func = function (data) {
            if (data == 0) {
                if (entity.type == 'fav') {
                    app.openModal("<p>You don't have any favourite tracks as yet. Swipe to the left on the track you want to add to your favourites and hit the gem!</p>", {});
                } else {
                    if($('#project-container li').length>0){
                        return;
                    }
                    app.openModal("<p>This project does not contain any songs as of yet. Swipe to the left on the track you want to add to your project and hit the plus!</p>", {});
                }
                app.fader(function () {
                    $('#topFixed').empty();
                    $('main').unbind('.cat');
                    if (media !== null) {
                        media.stop();
                        media = null;
                    }
                    $('.category-item, #cyu').show();
                    $('main').scrollTop(0);
                    $('#project-container').hide();
                    app.endInfiniteScroll();
                });

            } else {
                callback(data);
            }
        };
        if (entity.type === 'fav') {
            communicate({token: token, mode: "get_values_songlist", type: entity.type, uid: app.sessionid, page: entity.page}, func);
        } else {
            communicate({token: token, mode: "get_values_songlist", type: entity.type, type_id: entity.type_id, uid: app.sessionid, page: entity.page}, func);
        }
    };

    app.renderSongs = function (container, data, callback, extra) {
        extra = extra || '';
        $.each(data.songlist, function () {
            var li = $('<li data-id="' + this.id + '" data-url="' + this.streaming_url + '" ' + extra + '/>');
            var buttons = $('<div class="bs"/>');
            $('<a class="proj"><span></span></a>').click(songProj).appendTo(buttons);
            $('<a class="fav"><span></span><u></u></a>').click(songFav).appendTo(buttons);
            $('<a class="i"><span></span></a>').click(songInfo).appendTo(buttons);
            buttons.appendTo(li);
            $('<div class="bar"><div class="favIcon"></div>' +
                    '<div class="info"><b>' + this.title + '</b><i>' +
                    this.library + '</i></div>' +
                    '<span class="duration" data-duration="' + this.duration_sec +
                    '" data-dur-sec="' + this.duration_notation + '">' +
                    this.duration_notation + '</span><u><i></i><u></u><b></b></u></div>'
                    ).click(function () {
                songClick($(this), true);
            }).swipe({swipeStatus: songSwipeStatus, allowPageScroll: "vertical"}) /*.bind('touchstart', songTouchStart)*/.appendTo(li);
            if (this.in_favourite == "true") {
                li.addClass('inFav');
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
                press($(this));
                setTimeout(function () {
                    eval(callback + "()");
                }, 450);
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
        $('main').unbind('.cat');
        $('#topFixed').empty();
        topFixed = $('');
        app.endInfiniteScroll();
        closeModal();
        $('#introSteps').removeClass('step3 transparent');
        if (media !== null) {
            media.stop();
            media = null;
        }
        var t = new timeline().add(400, function () {
            $('main, header .buttons').addClass('transparent');
            $('body').removeClass('menuOpen');
            $('#menuCloseOverlay').hide();
        }).add(800, function () {
            intro3.run();
        }).add(1050, function () {
            $('#headerI').removeClass('open');
            $('main, header .buttons').hide();
            $('header .buttons,main').removeAttr('style');
            $('main').removeClass('nobg');
            $('#categories').removeClass('animating').removeAttr('style');
            $('.category-item.open').each(function () {
                $('.active', $(this)).removeClass('active loading paused');
                $(this).removeClass('open playing');
                $('.ulCont', $(this)).css({'height': '0px'}).empty();
            });
            $('.category-item').show();
            setTimeout(function () {
                $('#project-container').hide();
            }, 1);
            $('header u').removeClass('transparent');
        }).run();
    }

    function closeModal() {
        $('#modal').fadeOut(280, function () {
            $(this).hide();
        }).swipe('destroy');
    }

    app.addToProject = function (proj_id, song_id, callback) {
        communicate({token: token, mode: 'post_account_inproject', project: proj_id, song: song_id, uid: app.sessionid}, function (data) {
            callback(data);
            closeSwipe($('.bar'));
        });
    };

    app.createProject = function (type) {
        var title = $('#proj_title').val();
        if (!title.length) {
            return;
        }
        communicate({token: token, mode: 'post_account_newproject', uid: app.sessionid, name: title, type: type}, function (data) {
            proj_id = data.newproject[0].id;
            app.addToProject(proj_id, song_id, function (data) {
                app.openModal('<p>New project created and track succesfully added to project</p>', {closeModal: 'Ok'});
            });
        });
    };

    //TODO unbind when not needed anymore..
    app.startInfiniteScroll = function (type, proj_id) {
        var main = $('main');
        var counter = 2;
        console.log($('#project-container ul li').length);
        if ($('#project-container ul li').length == 10) {
            main.bind('scroll.inf touchmove.inf', function () {

                var hh = $('header').height();
                var wh = $('body').height() - hh;

                if ($(this).scrollTop() + wh + 5 >= $('#project-container').height())
                {
                    app.loadSongs({type: type, type_id: proj_id, page: counter}, function (data) {
                        console.log(data);
                        counter++;
                        if (data == 0) {
                            app.endInfiniteScroll();
                        } else {
                            app.renderSongs($('#project-container ul'), data, function () {
                            });
                        }
                    });
                }
            });
        }
    };

    app.endInfiniteScroll = function () {
        $('main').unbind('.inf');
    };

    app.fader = function (callback) {
        var f = $('#fader');
        $('body').removeClass('menuOpen');
        $('#menuCloseOverlay').hide();
        new timeline().add(1, function () {
            f.show();
        }).add(10, function () {
            f.addClass('show');
        }).add(340, function () {
            try {
                callback();
            } catch (e) {
            }
            if ($('#headerI').hasClass('open')) {
                $('#headerI').click();
            }
        }).add(750, function () {
            f.removeClass('show');
        }).add(1050, function () {
            f.hide();
        }).run();
    };

    app.openHowTo = function () {
        app.openModal("<div class='howTo'></div>", {}, 'How to use', 'titleOnTop how opacity');
        app.howToAnimation('#modal .howTo', false);
        $('#modal').swipe({
            swipeLeft: function (event, distance, duration, fingerCount, fingerData) {
                if (howtopos === 3) {
                    closeModal();
                    return;
                }
                $('#modal .instrux div').stop().fadeOut();
                window['howto' + howtopos].stop();
                window['howto' + (howtopos + 1)].run();
                $('#dots').removeAttr('class').addClass('d' + (howtopos + 1));
            },
            swipeRight: function (event, distance, duration, fingerCount, fingerData) {
                if (howtopos === 1) {
                    closeModal();
                    return;
                }
                $('#modal .instrux div').fadeOut();
                window['howto' + howtopos].stop();
                window['howto' + (howtopos - 1)].run();
                $('#dots').removeAttr('class').addClass('d' + (howtopos - 1));
            }
        });
        setTimeout(function () {
            $('#headerI').click();
        }, 100);
    };
    var howtopos;
    app.howToAnimation = function (selector, welcome) {
        var container = $(selector);
        if ($('.howToAnim', container).length > 0) {
            return;
        }
        var openli, sfw;
        var ratio = $(window).height() / $(window).width();
        var listlength;
        var nm = 4;
        if (welcome && ratio < 1.54) {
            listlength = 4;
            nm = 2;
        } else if (!welcome && ratio < 1.4 || welcome && ratio < 1.65) {
            listlength = 5;
            nm = 3;
        } else if (!welcome && ratio < 1.6 || welcome && ratio < 1.75) {
            listlength = 6;
        } else if (!welcome && ratio < 1.7 || welcome && ratio < 1.85) {
            listlength = 7;
        } else {
            listlength = 8;
        }
        howtopos = 1;
        container.append('<div class="howToAnim"><div class="menulist"><b>Menu</b><i>Projects</i><i>Favourites</i><i>Profile</i><i>Contact</i><i>Logout</i></div><div class="inner">' +
                '<header> <h1 class=""> <span>Inspire Me</span> </h1> <div class="buttons" style="display: block;"> <a class="i"><span></span></a> <a class="menu"><span></span></a> </div> </header>' +
                '<div class="category-item categories playing">' +
                '<div class="top"><h2>Focus</h2><img src="media/defaultCatImg.jpg" draggable="false"><div class="buttons loadingIcon" style="padding-bottom: 0px;"><a class="load"></a></div><div class="buttons noPlay" style="padding-bottom: 0px;"><a class="play"><span></span></a></div><div class="buttons duringPlay" style="padding-bottom: 0px;"><a class="stepBackwards small"><span></span></a><a class="pause"><span></span></a><a class="stepForwards small"><span></span></a></div></div>' +
                '<div class="ulCont" style="height: auto;"><ul>' +
                (new Array(listlength).join('<li><div class="bs"><a class="proj"><span></span></a><a class="fav"><span></span><u></u></a><a class="i"><span></span></a></div><div class="bar"><div class="favIcon"></div><div class="info"><b>Title</b><i>Producer</i></div><span class="duration">02:12</span><u><i></i><u></u><b></b></u></div></li>')) +
                '</ul></div>' +
                '</div></div>' +
                '<div class="instrux">' +
                '<div class="t1">Open the track menu<div class="t2">By swiping the track to the left</div></div>' +
                '<div class="t3">Get information about the track</div>' +
                '<div class="t4">Add track to favourites</div>' +
                '<div class="t5">Add track to project</div>' +
                '<div class="t6">Fastforward in a track</div>' +
                '<div class="t7">Open main menu</div>' +
                '<span id="dots"><span></span><span></span><span></span></span></div>' +
                '</div>');
        var instrux = $('.instrux', container);
        window.howto1 = new timeline().add(1, function () {
            howtopos = 1;
            $('.stepForwards', container).removeClass('pressed');
            $('.menulist', container).hide();
        }).add(2000, function () {
            openli = $('li:nth-child(' + nm + ')', container);
            openli.addClass('active');
            $('.t1', instrux).fadeIn();
        }).add(3000, function () {
            openli.addClass('open');
        }).add(4000, function () {
            openli.removeClass('open');
        }).add(5000, function () {
            if (welcome) {
                window.howto1.stop();
                $('.t1', instrux).fadeOut();
                window.howto2.run();
            } else {
                openli.addClass('open');
                $('.t2', instrux).fadeIn();
            }
        }).add(6000, function () {
            openli.removeClass('open');
        }).add(7000, function () {
            openli.addClass('open');
            $('.t1', instrux).fadeOut();
        }).add(9500, function () {
            $('.bs>.i', openli).addClass('pressed');
            $('.t3', instrux).fadeIn();
        }).add(11000, function () {
            $('.t3', instrux).fadeOut();
        }).add(11500, function () {
            $('.bs>.i', openli).removeClass('pressed');
            $('.bs>.fav', openli).addClass('pressed');
            $('.t4', instrux).fadeIn();
        }).add(13000, function () {
            $('.t4', instrux).fadeOut();
        }).add(13500, function () {
            $('.bs>.fav', openli).removeClass('pressed');
            $('.bs>.proj', openli).addClass('pressed');
            $('.t5', instrux).fadeIn();
        }).add(15500, function () {
            $('.bs>.proj', openli).removeClass('pressed');
            $('.t5', instrux).fadeOut();
        }).add(17000, function () {
            openli.removeClass('open');
        }).add(18000, function () {
            openli.removeClass('active');
        });
        window.howto1.run();

        window.howto2 = new timeline().add(1, function () {
            howtopos = 2;
            sfw = $('.stepForwards', container);
            $('.active, .open, .pressed', container).removeClass('active open pressed');
            $('.howToAnim', container).removeClass('menuOpen');
        }).add(1000, function () {
            $('.menulist', container).hide();
            sfw.addClass('pressed');
            $('.t6', instrux).fadeIn();
        }).add(3000, function () {
            sfw.removeClass('pressed');
        }).add(3200, function () {
            sfw.addClass('pressed');
        }).add(3400, function () {
            sfw.removeClass('pressed');
        }).add(3600, function () {
            sfw.addClass('pressed');
        }).add(3800, function () {
            sfw.removeClass('pressed');
        }).add(4000, function () {
            sfw.addClass('pressed');
        }).add(4200, function () {
            sfw.removeClass('pressed');
        }).add(4400, function () {
            sfw.addClass('pressed');
        }).add(5000, function () {
            sfw.removeClass('pressed');
            $('.t6', instrux).fadeOut();
            if (welcome) {
                window.howto3.run();
            }
        });

        window.howto3 = new timeline().add(1, function () {
            howtopos = 3;
            $('.stepForwards', container).removeClass('pressed');
            $('.menulist', container).show();
        }).add(1000, function () {
            var sp = $('header .menu span');
            var t = new timeline();
            for (var i = 0; i < 5; i++) {
                t.add(i * 200, function () {
                    sp.addClass('big');
                }).add(i * 200 + 100, function () {
                    sp.removeClass('big');
                });
            }
            t.run();
        }).add(2300, function () {
            $('.howToAnim', container).addClass('menuOpen');
            $('.t7', instrux).fadeIn();
        }).add(5300, function () {
            $('.howToAnim', container).removeClass('menuOpen');
        }).add(6000, function () {
            if (welcome) {
                window.introEnd.run();
            }
        });

    };


    //temp functions
    function reconnect() {
        closeModal();
        app.launch();
    }

    function postProject() {
        var type = $('.proj_button.active').attr('data-tag');
        app.createProject(type);
    }

    return app;

})();
