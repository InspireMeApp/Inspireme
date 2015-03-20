var base_url = "http://dotnet.allmusic.eu/IM/api/";
var token = "sGhyuT62250kpLMsq12d3hqnMbhTIw";

function checkConnection(){
    
    url = '?mode=get_connection';
    var result = false;

    $.ajax({
        url: base_url + url,
        type: "GET",
        dataType: "json",
        success: function(data) {
            //data.connection[0].database;
            result = true;
            return 'test';
        },
        error: function(data){
            result = false;
        }
    });

    return result;
};

function login(user , pass){

    url = "?token="+ token +"&mode=post_account_login&uname="+ user +"&pword="+ pass;

    $.ajax({
        url: base_url + url,
        dataType: "json",
        type: "GET",
        async: false,
        success: function(data) {
            login = data.login[0].login;
            if(login == "true"){
                app.sessionid = data.login[0].session;
                getCategory();
                app.gotoscreen('screen-1');
            }
        }
    });

   return session; 
}

function getCategory(){
    url = "?token="+ token +"&mode=get_values_categories&res=xml";
    alert(url);
}

