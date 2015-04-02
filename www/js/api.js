var base_url = "http://dotnet.allmusic.eu/IM/api/";
var token = "sGhyuT62250kpLMsq12d3hqnMbhTIw";

function communicate(params, callback) {
    checkConnection(function(){
        return $.ajax({
            url: base_url,
               type: 'GET',
               data : params,
               dataType:"json",
               cache: false,
        })
        .done(callback)
        .fail(function(jqXHR, textStatus, errorThrown) {
            //error
        });
    });
}

function checkConnection(callback) {
    return $.ajax({
        url: base_url,
        type: 'GET',
        data : {mode : 'get_connection'},
        dataType:"json",
        cache: false,
    })
    .done(function(data){
        if(data.connection[0].database == "true"){
        callback();
        }else{
        app.openModal("<p>Yikes , it's not possible to connect to the Inspire Me database at this moment</p>" , {reconnect : 'Try again'});
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        app.openModal("<p>Gosh, seems there's no internet connection.<br>Please try later!</p>" , {reconnect : 'Try again'});
    });
}

