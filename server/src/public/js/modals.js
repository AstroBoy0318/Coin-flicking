let reloadModal, alertModal, avatarModal,createRoomModal;
$(function(){
    reloadModal = $("#reload-modal");
    reloadModal.on("hide.bs.modal",()=>{
        location.reload();
    });
    alertModal = $("#alert-modal");
    avatarModal = $("#avatar-modal");
    createRoomModal = $("#create-room-modal");
});
function showReloadModal(msg){    
    $(".modal-body>p",reloadModal).html(msg);
    reloadModal.modal("show");
}
function showAlertModal(msg){    
    $(".modal-body>p",alertModal).html(msg);
    alertModal.modal("show");
}
function showAvatarModal(){    
    avatarModal.modal("show");
}
function showCreateRoomModal(callback){
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