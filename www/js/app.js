var app = (function()
        {
        document.addEventListener('deviceready', onDeviceReady, false); 

        var app = {};
        var is_device = false
        app.currentScreenId = null;
        app.sessionid = null;
        app.images = new Array();
        app.user = null;

        app.launch = function(){
            //preload images
            communicate({token: token , mode : 'get_values_categories' } , function(data){

                imgs = [];
                $.each(data.categories , function(){
                         imgs.push(this.artwork);
                         app.images[this.id] = new Image();
                         app.images[this.id].src = this.artwork;
                    });

                
                $.each(data.categories , function(){
                    $('#categories').append(
                '<div class="category-item" id="cat-'+this.id+'" data-tag="'+this.id+'"><h2>'+this.title+'</h2><div><div class="button"> <a class="play"><img src="'+this.artwork+'"></a></div></div></div>'
                        );

                 });
                    
                });
            
        }
    
        app.preload = function(obj){
            cur = 0;
            console.log(obj);
            $.each(obj , function(){
                app.images[cur] = new Image();
                app.images[cur].src = obj[cur];
                cur++;
            });
         };
       
        //use : app.openModal('hoi' , {callbackfunction : 'text inside button'})
        app.openModal = function(message , params){

            $('#textArea').html(message);
            var cur = 0;
            $.each( params, function( callback, txt ){
                $('#buttonArea').append("<button id='button-"+cur+"'>"+txt+"</button>");
                $('#button-'+cur).click(function(){
                    eval(callback+"()");
                });
            cur++;

            });

        }

        function closeModal(){
            $('#modal').hide();
        }

        //handlers

        function onDeviceReady(){
        };

        return app;
        
})();
