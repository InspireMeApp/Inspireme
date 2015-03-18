var base_url = "http://dotnet.allmusic.eu/IM/api/";
var token = "sGhyuT62250kpLMsq12d3hqnMbhTIw";

function checkConnection(){
    
    url = '?mode=get_connection';
    var result = false;

    $.ajax({
        url: base_url + url,
        type: "GET",
        async:false,
        dataType: "json",
        success: function(data) {
            //data.connection[0].database;
            result = true;
        },
        error: function(data){
            result = false;
        }
    });

    return result;
};

function callback(url){
    return json;
};

function login(user , pass){
    url = "?token="+ token +"&mode=post_account_login&uname="+ user +"&pword="+ pass +"&res=xml"
    GoToScreen(5);
}


