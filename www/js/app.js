var app = (function()
        {
            document.addEventListener('deviceready', onDeviceReady, false); 

        var app = {};
        var is_device = false
        app.currentScreenId = null;
        app.sessionid = null;

        app.launch = function(){
            //init here
            
            app.gotoscreen('screen-1');

            //wait here ?
           
            if(app.sessionid == null){
               app.gotoscreen('screen-2');
            }else{
               app.gotoscreen('screen-3');
            }
        }

        app.gotoscreen = function(screenId){

        if (app.currentScreenId != null){
        $('#' + app.currentScreenId).hide();
        }

        app.currentScreenId = screenId;
        $('#' + app.currentScreenId).show();
        document.body.scrollTop = 0;

        }      

        function onDeviceReady(){
            alert(checkConnection());
        }

        return app;
        
})();
