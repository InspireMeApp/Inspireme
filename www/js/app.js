var app = (function()
        {
        
        document.addEventListener('deviceready', onDeviceReady, false);

        function onDeviceReady()
        {
            is_device = true;
            init();
        }
        
        app.init = function(){
            alert('test');
        };

        return app;

        })()
