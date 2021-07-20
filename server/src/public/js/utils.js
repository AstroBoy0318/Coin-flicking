function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function playSound(id)
{
    let mute = getMute();
    if(!mute)
        document.getElementById(id).play();
}

function setBackMusicVolume(val)
{
    document.getElementById("back-music").volume = val;
}

function pauseBackMusic()
{
    document.getElementById("back-music").pause();
}

function playBackMusic()
{
    document.getElementById("back-music").play();
}

function getMute()
{
    let mute = getCookie("midas-coinflip-mute");

    return mute == 1;
}

function toggleMute()
{
    let mute = getCookie("midas-coinflip-mute");
    if(mute == 1)
    {
        setCookie("midas-coinflip-mute",0,365);
    }
    else
    {
        setCookie("midas-coinflip-mute",1,365);
    }
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}