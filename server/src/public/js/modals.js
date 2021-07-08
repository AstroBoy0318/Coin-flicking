let reloadModal, alertModal;
$(function(){
    reloadModal = $(".reload-modal");
    reloadModal.on("hide.bs.modal",()=>{
        location.reload();
    });
    alertModal = $(".alert-modal");
});
function showReloadModal(msg){    
    $(".modal-body>p",reloadModal).html(msg);
    reloadModal.modal("show");
}
function showAlertModal(msg){    
    $(".modal-body>p",alertModal).html(msg);
    alertModal.modal("show");
}