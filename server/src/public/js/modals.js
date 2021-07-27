let reloadModal, alertModal, avatarModal,createRoomModal,topListModal,helpModal,disclaimerModal;
$(function(){
    reloadModal = $("#reload-modal");
    reloadModal.on("hide.bs.modal",()=>{
        location.reload();
    });
    alertModal = $("#alert-modal");
    avatarModal = $("#avatar-modal");
    createRoomModal = $("#create-room-modal");
    topListModal = $("#toplist-modal");
    helpModal = $("#help-modal");
    disclaimerModal = $("#disclaimer-modal");
});
function showReloadModal(msg){    
    playSound("alert");

    $(".modal-body>p",reloadModal).html(msg);
    reloadModal.modal("show");
}
function showAlertModal(msg){    
    playSound("alert");

    $(".modal-body>p",alertModal).html(msg);
    alertModal.modal("show");
}
function showAvatarModal(){    
    playSound("alert");
    
    avatarModal.modal("show");
}
function showCreateRoomModal(callback){
    playSound("alert");

    createRoomModal.modal("show");
    let okBnt = $(".btn-primary", createRoomModal);
    okBnt.off("click");
    okBnt.on("click",function(){
        let roomName = $("#room-name-input").val();
        if(roomName == "")
            return;
        createRoomModal.modal("hide");
        callback();
    });
}
function showHelpModal(){    
    playSound("alert");
    
    helpModal.modal("show");
}
function showDisclaimerModal()
{
    disclaimerModal.modal("show");
    $("#have-read").on('click',()=>{        
        let haveRead = $("#have-read").prop("checked");
        if(haveRead)
        {            
            setBackMusicVolume(0.08);
            //get mute state
            let mute = getMute();
            if(mute)
            {
                $(".btn-sound").addClass("btn-mute");
                pauseBackMusic();
            }
            else
            {
                playBackMusic();
            }

            playSound("button-click");
            disclaimerModal.modal("hide");
        }
    });
    disclaimerModal.on("hidden.bs.modal",()=>{
        let haveRead = $("#have-read").prop("checked");
        if(!haveRead){
            tata.error('Warning', 'You have to tick "I have read."');
            disclaimerModal.modal("show");
        }
        else
        {
            onConnect();
        }
    })
}