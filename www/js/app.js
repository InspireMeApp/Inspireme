var app = (function()
        {
           document.addEventListener('deviceready', onDeviceReady, false); 
           document.addEventListener('documentready', onDeviceReady, false); 

            var app = {};
            var is_device = false
            
            function onDeviceReady(){
                
                              
            }
            
              if(checkConnection()){
                    login('user' , 'password');
                }

            function init(){
            
            }
           

         return app;

    })();
