
//新增
var insert_submit=$('#insert_submit');
var AlertMsg=$('#Alert_msg');
var Msg='';


$('.allow-focus').on('click',function(e) {
    e.stopPropagation();
});

function checkSpecialChar(value){
    let specialChars= "~·`!！@#$￥%^…&*()（）—-=+[]{}【】、|\\;:；：'\"“‘,./<>《》?？，。";
    for (let i=0;i<specialChars.length;i++){
        if (value.indexOf(specialChars.substring(i,i+1)) != -1 ){
            return false;
        }
    }
    return true;
}

$('#insert_crops').on('hidden.bs.modal', function(e) {
    $(this).find('#insert_form')[0].reset();
});

insert_submit.on('click',()=>{
    let insert_speciesID=$('#insert_speciesID').val();
    let insert_speciesName=$('#insert_speciesID').find(':selected').data('name');
    let insert_quality=$('#insert_quality').val();
    let insert_quantity=$('#insert_quantity').val()
    let insert_time=$('#insert_time').val();
    let checkbox = $("input[name='Checkbox']");
    
    let form_field=[];
    if(checkbox.is(':checked')){
        $("input[name='Checkbox']:checked").each ( function() {
            form_field.push({fieldID:$(this).val(),fieldName:$(this).data('name')})
        });
    }
    if(insert_speciesID!==''){
        if(form_field.length!==0){
            if(insert_time!==''){
                if(insert_quality!=='' && insert_quantity!==''){
                    let insert_quality_check=checkSpecialChar(insert_quality)
                    let insert_quantity_check=checkSpecialChar(insert_quantity)
                    if(insert_quality_check==true && insert_quantity_check==true){
                        $.ajax({
                            url:'/crops_add',
                            dataType:'json',
                            type:'post',
                            async : false,
                            data:{plantID:insert_speciesID,plantName:insert_speciesName,field:JSON.stringify(form_field),time:insert_time,quality:insert_quality,quantily:parseInt(insert_quantity)},
                            success:function(res){
                                if(res.success===true){
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
                        Msg='請不要輸入特殊符號';
                        AlertMsgfunc(Msg);
                        Msg=''
                    }
                    
                }else{
                    Msg='請輸入完整';
                    AlertMsgfunc(Msg);
                    Msg=''
                }
            }else{
                Msg='請先輸入時間';
                AlertMsgfunc(Msg);
                Msg=''
            }
        }else{
            Msg='請先建立田區';
            AlertMsgfunc(Msg);
            Msg=''
        }        
    }else{
        Msg='請先建立作物';
        AlertMsgfunc(Msg);
        Msg=''
    }
})

//修改
$(function(){
    var update_submit=$('#update_submit');
    let obj_id;
    let crop_time;
    let crops_quantily;
    let crops_quality;
    let speciesName;
    let fieldName;
    if(window.location.pathname == "/crops_record"){
        $onupdate = $(".table tbody tr td a.update");
        $onupdate.click(function(){
            obj_id=$(this).attr("upd_data_ObjId");
            crop_time=$(this).attr("upd_data_time");
            crops_quality=$(this).attr("upd_data_quality"); 
            crops_quantily=$(this).attr("upd_data_quantily");
            speciesName=$(this).attr('speciesName');
            fieldName=$(this).attr('fieldName');
            $('#update_time').val(crop_time);
            $('#update_quality').val(crops_quality);
            $('#update_quantily').val(crops_quantily);

            $('#dialog_ID_show').val(obj_id);
            $('#dialog_speciesName_show').val(speciesName);
            $('#dialog_fieldName_show').val(fieldName);
            $('#dialog_time_show').val(crop_time);
            $('#dialog_quality_show').val(crops_quality);
            $('#dialog_quantily_show').val(crops_quantily);
        })    

        $('#update_crops').on('hidden.bs.modal', function(e) {
            $('#update_time').val(crop_time);
            $('#update_quality').val(crops_quality);
            $('#update_quantily').val(crops_quantily);

            $('#dialog_ID_show').val(obj_id);
            $('#dialog_speciesName_show').val(speciesName);
            $('#dialog_fieldName_show').val(fieldName);
            $('#dialog_time_show').val(crop_time);
            $('#dialog_quality_show').val(crops_quality);
            $('#dialog_quantily_show').val(crops_quantily);

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');
        });
    
        update_submit.on('click',()=>{
            let update_time=$('#update_time').val(); 
            let update_quality=$('#update_quality').val(); 
            let update_quantily=$('#update_quantily').val();
            if(update_quality!=='' && update_quantily!==''){
                let update_quality_check=checkSpecialChar(update_quality)
                let update_quantily_check=checkSpecialChar(update_quantily)
                if(update_quality_check==true && update_quantily_check==true){

                    $.ajax({
                        url:'/crops_update',
                        dataType:'json',
                        type:'post',
                        async : false,
                        data:{_id:obj_id,time:update_time,quality:update_quality,quantily:parseInt(update_quantily)},
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
                    Msg='請不要輸入特殊符號';
                    AlertMsgfunc(Msg);
                    Msg=''
                }
                
            }else{
                Msg='請輸入完整';
                AlertMsgfunc(Msg);
                Msg=''
            }
        })        
    }
})


//刪除
if(window.location.pathname == "/crops_record"){
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
            url:'/crops_delete',
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