let reloadModal, alertModal, avatarModal,createRoomModal,topListModal;
$(function(){
    reloadModal = $("#reload-modal");
    reloadModal.on("hide.bs.modal",()=>{
        location.reload();
    });
    alertModal = $("#alert-modal");
    avatarModal = $("#avatar-modal");
    createRoomModal = $("#create-room-modal");
    topListModal = $("#toplist-modal");
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
function showTopListModal(){    
    topListModal.modal("show");
    $("#toplist-type", topListModal).off('change');
    $("#toplist-type", topListModal).on('change',()=>{
        updateTopList();
    });

    let updateTopList = ()=>{        
        $.ajax({
            url: "getTopList",
            method: 'post',
            data: {
                type: $("#toplist-type").val(),
                limit: 10
            },
            dataType: 'json',
            success: (resp)=>{
                let html = '';
                let mark = {1:'gold-medal',2:'silver-medal',3:'bronze-medal'};
                for(let i = 0; i < resp.length; i++)
                {
                    html += '<tr>';

                    html += '<td>';
                    if(typeof mark[i+1] != "undefined")
                        html += '<div class="medal '+mark[i+1]+'"></div>';
                    else
                        html += '<div class="medal"></div>';
                    html += '</td>';
                    html += '<td>';
                    html += '<div class="avatar avatar-'+resp[i]['avatar']+'"></div><div class="player-name">'+resp[i]['name']+'</div>';
                    html += '</td>';
                    html += '<td>';
                    html += resp[i].reward;
                    html += '</td>';

                    html += '</tr>';
                }
                if(html == '')
                    html = '<tr><td colspan=3>No data</td></tr>';
                $("tbody",topListModal).html(html);
            }
        });
    }
    updateTopList();
}