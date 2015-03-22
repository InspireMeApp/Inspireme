var base_url = "http://dotnet.allmusic.eu/IM/api/";
var token = "sGhyuT62250kpLMsq12d3hqnMbhTIw";

function checkConnection(){
    // needs work , use communicate();
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

function communicate(params, callback) {
    return $.ajax({
        url: base_url,
        type: 'GET',
        data : params,
        dataType:"json",
        cache: false,
    })
    .done(callback)
    .fail(function(jqXHR, textStatus, errorThrown) {
        alert('error');
    });
}

function getCategory(){
    //placeholder
    alert(url);
}

