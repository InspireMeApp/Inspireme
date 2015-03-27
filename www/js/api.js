var base_url = "http://dotnet.allmusic.eu/IM/api/";
var token = "sGhyuT62250kpLMsq12d3hqnMbhTIw";

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

