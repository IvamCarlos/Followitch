const url = "https://api.twitch.tv/helix"
const url_token = "https://id.twitch.tv"
const kraken_url = "https://api.twitch.tv/kraken"
const user_display_name = "ivanzerafn"
const client_id = "zq5itk4g82egjosj9cgc7pevrcnqkk"
const access_token = "twz60qlhxhb81xaulb8eal6beqyq4h"
const formSearch = document.querySelector('.form-search')
const formFollow = document.querySelector('.form-follow')
const formAuth = document.querySelector('.form-auth')
const formUser = document.querySelector('.form-user')
const resultSearch = document.querySelector("#result_search")
const resultFollowChannels = document.querySelector("#result_follow_channels");

const showData = (result) => {
    let resultHTML = ""

    $.each(result.data, function(index, element) {
        console.log(result.data)
        resultHTML += 
            `<div class="twitch-channel">
                <img class="thumbnail" src="${element.thumbnail_url}" alt="${element.title}">
                <h5>${element.display_name}</h5>
                <h5>${element.title}</h5>
                <h5>${(element.is_live == true) ? 'Online' : 'Offline'}</h5>
            </div>`
    })

    $('#result_search').html(resultHTML)
}

const showModal = (result) => {
    let resultHTML = ""

    $.each(result.data, function(index, element) {
        resultHTML += 
            `<img class="thumbnail" src="${element.profile_image_url}" alt="${element.diplay_name}">
            <h5>${element.display_name}</h5>
            <h5>${element.email}</h5>
            <h5>${element.created_at}</h5>`

        $('.modal-body').html(resultHTML)
    })
}

const showFollowChannels = (result) => {
    let resultHTML = ""

    $.each(result.data, function(index, element) {
        var photo = ""
        photo = element.thumbnail_url.replace("{width}x{height}", '400x300')

        resultHTML += 
            `<img src="${photo}" alt="${element.user_name}">
            <h4><b>${element.title}</b></h4>
            <h5>${element.user_name}</h5>
            <h5>${element.game_name}</h5>
            <h5>${element.language}</h5>
            <h5>${element.type}</h5>
            <h5>${element.viewer_count} visualizações</h5>`

        $('#result_follow_channels').html(resultHTML)
    })
}

const buscarCanalTwitch = async () => {
    try {
        const query = await document.getElementById("query").value
        const response = await fetch(`${url}/search/channels?query=${query}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Client-Id': client_id,
                }
            } 
        ).then(response => response.json())
        .then(data => showData(data))
        .catch(error => console.log(error));
    }catch (error) {
        console.log("erro: ", error.message)
    }
};

const twitchAuth = async () => {
    var CALLBACK_URL = 'https://'+chrome.runtime.id+'.chromiumapp.org'
    var AUTH_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${client_id}&redirect_uri=${CALLBACK_URL}&scope=user:read:email user:read:follows channel:manage:polls channel:read:polls&force_verify=true&response_type=token`

    chrome.identity.launchWebAuthFlow({
        url: AUTH_URL,
        interactive: true,
    }, 
    function(redirectURL) {
        var q = redirectURL.substring(redirectURL.indexOf('#')+1);
        var parts = q.split('&');
        for (var i = 0; i < parts.length; i++) {
            var kv = parts[i].split('=');
            if (kv[0] == 'access_token') {
                token = kv[1];
                $('#token').val(token)

                if(token.val != ""){
                    $('.form-user').css('display', 'block')
                }else{
                    console.log('usuário não autenticado')
                }
            }
        }
    });
}

const getUser = async() => {
    try{
        var token = document.querySelector('#token').value

        const response = await fetch(`${url}/users?scope=user:read:email?login=${user_display_name}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Client-Id': client_id
            }
        } 
        ).then(response => response.json())
        .then(data => {
            showModal(data),
            $('#user_id').val(data.data[0].id)

            if(token.val != ""){
                $('.form-follow').css('display', 'block')
            }else{
                console.log('usuário não autenticado')
            }
        })
        .catch(error => console.log(error));
    }catch(error){
        console.log('erro: ' + error.message)
    }
}

const canaisSeguidos = async (result) => {
    try {

        var token = document.querySelector('#token').value
        var user = document.querySelector('#user_id').value

        const response = await fetch(`${url}/streams/followed?user_id=${user}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Client-Id': client_id,
                }
            } 
        ).then(response => response.json())
        .then(data => showFollowChannels(data))
        .catch(error => console.log(error));
    }catch (error) {
        console.log("erro: ", error.message)
    }
}

$('.nav-tabs > li > button').on("click", function(e){
    e.preventDefault();
    $('#result_search').html("");
    $('#result_follow_channels').html("");
});

const searchSubmit = async e => {
    e.preventDefault()
    buscarCanalTwitch()
};

const followSubmit = async e => {
    e.preventDefault()
    canaisSeguidos()
};

const authEvent = async e => {
    e.preventDefault()
    twitchAuth()
}

const userSubmit = async e => {
    e.preventDefault()
    getUser()
}

formSearch.addEventListener("submit", e => searchSubmit(e))
formFollow.addEventListener("submit", e => followSubmit(e))
formUser.addEventListener("click", e => userSubmit(e))
formAuth.addEventListener("click", e => authEvent(e))
