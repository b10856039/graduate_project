

//新增
var insert_submit=$('#insert_submit');
var AlertMsg=$('#Alert_msg');
var Msg='';

$('#insert_grow').on('hidden.bs.modal', function(e) {
    $(this).find('#grow_form')[0].reset();
});



insert_submit.on('click',()=>{
    let insert_fieldID=$('#insert_fieldID').val();
    let insert_fieldName=$('#insert_fieldID').find(':selected').data('name');
    let insert_time=$('#insert_time').val();
    let insert_message=$('#insert_message').val();

    if(insert_time!==''){
        if(insert_fieldID!==''){

            if(insert_message.length<=50){
                $.ajax({
                    url:'/grow_add',
                    dataType:'json',
                    type:'post',
                    async : false,
                    data:{fieldID:insert_fieldID,fieldName:insert_fieldName,time:insert_time,msg:insert_message},
                    success:function(res){
                        if(res.success==true){
                            Msg='新增成功';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }else{
                            Msg='新增失敗';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }
                    },
                    error:function(error){
                        alert('與伺服器發生錯誤',error);
                    }
                })
            }else{
                Msg='事項字數限制50字內';
                AlertMsgfunc(Msg);
                Msg=''
            }

        }else{
            Msg='請先建立田區';
            AlertMsgfunc(Msg);
            Msg=''
        }
    }else{
        Msg='請輸入完整';
        AlertMsgfunc(Msg);
        Msg=''
    }
})

//修改
$(function(){
    var update_submit=$('#update_submit');
    let obj_id;
    let grow_msg;
    let grow_time;
    let fieldName;
    if(window.location.pathname == "/grow_record"){
        $onupdate = $(".table tbody tr td a.update");
        $onupdate.click(function(){
            obj_id=$(this).attr("upd_data_ObjId");
            grow_msg=$(this).attr("upd_data_msg");
            grow_time=$(this).attr("upd_data_time");
            fieldName=$(this).attr("fieldName");
            $('#update_message').val(grow_msg);
            $('#update_time').val(grow_time);

            $('#dialog_ID_show').val(obj_id)
            $('#dialog_fieldName_show').val(fieldName)
            $('#dialog_time_show').val(grow_time)
            $('#dialog_growingMsg_show').val(grow_msg)
        })    

        $('#update_plant').on('hidden.bs.modal', function(e) {
            $('#update_message').val(grow_msg);
            $('#update_time').val(grow_time);

            $('#dialog_ID_show').val(obj_id)
            $('#dialog_fieldName_show').val(fieldName)
            $('#dialog_time_show').val(grow_time)
            $('#dialog_growingMsg_show').val(grow_msg)

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');
        });
    
        update_submit.on('click',()=>{
            let update_message=$('#update_message').val(); 
            let update_time=$('#update_time').val(); 
            if(update_message.length<=50){
                $.ajax({
                    url:'/grow_update',
                    dataType:'json',
                    type:'post',
                    async : false,
                    data:{_id:obj_id,msg:update_message,time:update_time},
                    success:function(res){
                        if(res.success==true){
                            Msg='修改成功';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }else{
                            Msg='修改失敗';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }
                    },
                    error:function(error){
                        alert('與伺服器發生錯誤',error);
                    }
                })
            }else{
                Msg='事項字數限制50字內';
                AlertMsgfunc(Msg);
                Msg=''
            }
        })        
    }
})

//刪除
if(window.location.pathname == "/grow_record"){
    $ondelete = $(".table tbody tr td a.delete");
    $ondelete.click(function(){ 
        let del_objId=$(this).attr("del_data_ObjId");
        modalDelete(del_objId)
    })    
}

function modalDelete(del_objId){
    $('#confirm_Alert').modal('show');
    $('#delete_submit').on('click',()=>{
        $.ajax({
            url:'/grow_delete',
            dataType:'json',
            type:'post',
            async : false,
            data:{_id:del_objId},
            success:function(res){
                if(res.success==true){
                    Msg='刪除成功';
                    AlertMsgfunc(Msg);
                    Msg=''
                }else{
                    Msg='刪除失敗';
                    AlertMsgfunc(Msg);
                    Msg=''
                }
            },
            error:function(error){
                alert('與伺服器發生錯誤',error);
            }
        })
          
    }) 
}

$('#AlertMsg').on('hidden.bs.modal', function(e) {
    location.reload()
});

function AlertMsgfunc(msg){
    $('#AlertMsg').modal('show');
    AlertMsg.html(msg);
}