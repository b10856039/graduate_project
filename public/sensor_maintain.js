

//新增
var insert_submit=$('#insert_submit');
var AlertMsg=$('#Alert_msg');
var Msg='';

$('#insert_sensor_maintain').on('hidden.bs.modal', function(e) {
    $(this).find('#insert_form')[0].reset();
});

insert_submit.on('click',()=>{
    let insert_sensor_ObjID=$('#insert_sensor_ObjID').val();
    let insert_time=$('#insert_time').val();
    let insert_message=$('#insert_message').val();

    if(insert_sensor_ObjID!==''){
        if(insert_time!==''){
            if(insert_message.length<=50){
                $.ajax({
                    url:'/sensor_maintain_add',
                    dataType:'json',
                    type:'post',
                    async : false,
                    data:{sensor_ObjID:insert_sensor_ObjID,time:insert_time,message:insert_message},
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
            Msg='請輸入完整';
            AlertMsgfunc(Msg);
            Msg=''
        }
    }else{
        Msg='請先選擇感測器';
        AlertMsgfunc(Msg);
        Msg=''
    }
})


//修改
$(function(){
    var update_submit=$('#update_submit');
    let obj_id;
    let maintain_time;
    let sensorID;
    let sensor_ObjID;
    let fixCount;
    let maintain_message;
    if(window.location.pathname == "/sensor_maintain"){
        $onupdate = $(".table tbody tr td a.update");
        $onupdate.click(function(){
            obj_id=$(this).attr("upd_maintain_id");
            sensor_ObjID=$(this).attr("upd_sensor_objID");
            sensorID=$(this).attr("upd_sensorID");
            maintain_time=$(this).attr("upd_maintain_time");
            maintain_message=$(this).attr("upd_maintain_message")
            sensorName=$(this).attr("sensorName");
            fixCount=$(this).attr("fixCount");

            $('#update_time').val(maintain_time);
            $('#update_message').val(maintain_message);

            $('#dialog_ID_show').val(obj_id);
            $('#dialog_sensorID_show').val(sensorID);
            $('#dialog_time_show').val(maintain_time);
            $('#dialog_message_show').val(maintain_message);
            $('#dialog_fixCount_show').val(fixCount);
        })    

        $('#update_sensor_maintain').on('hidden.bs.modal', function(e) {
            $('#update_time').val(maintain_time);
            $('#update_message').val(maintain_message);

            $('#dialog_ID_show').val(obj_id);
            $('#dialog_sensorID_show').val(sensorID);
            $('#dialog_time_show').val(maintain_time);
            $('#dialog_message_show').val(maintain_message);
            $('#dialog_fixCount_show').val(fixCount);

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');
        });
    
        update_submit.on('click',()=>{ 
            let update_time=$('#update_time').val(); 
            let update_message=$('#update_message').val();
            $.ajax({
                url:'/sensor_maintain_update',
                dataType:'json',
                type:'post',
                async : false,
                data:{_id:obj_id,time:update_time,message:update_message},
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
        })        
    }
})


//刪除
if(window.location.pathname == "/sensor_maintain"){
    $ondelete = $(".table tbody tr td a.delete");
    $ondelete.click(function(){ 
        let del_maintain_objId=$(this).attr("del_maintain_objId");
        let del_sensor_ObjID=$(this).attr('del_sensor_ObjID');
        let del_maintain_count=$(this).attr("del_maintain_count");
        modalDelete(del_maintain_objId,del_sensor_ObjID,del_maintain_count)
    })
    
}

function modalDelete(del_maintain_objId,del_sensor_ObjID,del_maintain_count){
    $('#confirm_Alert').modal('show');
    $('#delete_submit').on('click',()=>{
        $.ajax({
            url:'/sensor_maintain_delete',
            dataType:'json',
            type:'post',
            async:false,
            data:{_id:del_maintain_objId,sensor_ObjID:del_sensor_ObjID,count:del_maintain_count},
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