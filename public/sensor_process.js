



$('.allow-focus').on('click',function(e) {
    e.stopPropagation();
});

//新增
var insert_submit=$('#insert_submit');
var AlertMsg=$('#Alert_msg');
var Msg='';


$('#insert_sensor').on('hidden.bs.modal', function(e) {
    $(this).find('#insert_form')[0].reset();
});

function checkSpecialChar(sensorID){
    let specialChars= "~·`!！@#$￥%^…&*()（）—-=+[]{}【】、|\\;:；：'\"“‘,./<>《》?？，。";
    for (let i=0;i<specialChars.length;i++){
        if (sensorID.indexOf(specialChars.substring(i,i+1)) != -1 ){
            return false;
        }
    }
    return true;
}


insert_submit.on('click',()=>{    

    let insert_sensorID=$('#insert_sensorID').val();
    let insert_fieldID=$('#insert_fieldID').val();
   

    let checkbox = $("input[name='Checkbox']");    
    let form_sensorType=[];
    if(checkbox.is(':checked')){
        $("input[name='Checkbox']:checked").each ( function() {
            form_sensorType.push($(this).val())
        });
    }

    if(insert_sensorID!==''){
        let check_insert_ID=checkSpecialChar(insert_sensorID);
        if(check_insert_ID==true){
            if(insert_fieldID!==""){
                if(form_sensorType.length>0){
                    $.ajax({
                        url:'/sensor_add',
                        dataType:'json',
                        type:'post',
                        async : false,
                        data:{sensorID:insert_sensorID,fieldID:insert_fieldID,sensorType:JSON.stringify(form_sensorType)},
                        success:function(res){
                            if(res.success==true){                            
                                AlertMsgfunc(res.message);
                            }else{
                                AlertMsgfunc(res.message);
                            }
                        },
                        error:function(error){
                            alert('與伺服器發生錯誤',error);
                        }
                    })
                }else{
                    Msg='請至少選一種感測種類';
                    AlertMsgfunc(Msg);
                    Msg=''
                }
                
            }else{
                Msg='請先建立田區';
                AlertMsgfunc(Msg);
                Msg=''
            }
        }else{
            Msg='請不要輸入特殊符號';
            AlertMsgfunc(Msg);
            Msg=''     
        }
        

    }else{
        Msg='請輸入感測器ID';
        AlertMsgfunc(Msg);
        Msg=''
    }
})






//修改


$(function(){
    let update_submit=$('#update_submit');
    let update_alert_submit=$('#update_alert_submit');
    let update_sensor_id;
    let sensor_ID;
    let sensor_type;
    let fieldName;

    let upd_alert_form=document.querySelector('#update_alert_form');

    if(window.location.pathname == "/sensor"){
        $onupdate = $(".table tbody tr td a.update");
        $onupdate.click(function(){
            update_sensor_id=$(this).attr("upd_sensor_objId");
            sensor_ID=$(this).attr("upd_sensor_ID");
            sensor_type=$(this).attr("upd_sensorType");  
            fieldName=$(this).attr('fieldName');
            $('#update_sensorID').val(sensor_ID);
            $('#dialog_Object_id_show').val(update_sensor_id);
            $('#dialog_ID_show').val(sensor_ID);
            $('#dialog_fieldName_show').val(fieldName);



            sensor_type=JSON.parse(sensor_type)
            for(let i=0;i<sensor_type.length;i++){
                let key=Object.keys(sensor_type[i]);  
                switch(key[0]){
                    case "temp":
                        $('#upd_type_temp').prop("checked", true);
                        break
                    case "humid":
                        $('#upd_type_humid').prop("checked", true);
                        break
                    case "light":
                        $('#upd_type_light').prop("checked", true);
                        break
                    case "distance":
                        $('#upd_type_distance').prop("checked", true);
                        break
                }

                upd_alert_form.innerHTML+="<div class='form-group row mb-2 mt-2'><label name=value_dataType>"+key+"</label><br><div class=col><label>小值<small class='text-danger'>*</small></label><input type=text id="+i+"_0 class='form-control'></div><div class=col><label>大值<small class='text-danger'>*</small></label><input type=text id="+i+"_1 class='form-control'></div></div>"
            }
            for(let i=0;i<sensor_type.length;i++){
                let key=Object.keys(sensor_type[i]);
                $('#'+i+'_0').val(sensor_type[i][key[0]].small);
                $('#'+i+'_1').val(sensor_type[i][key[0]].big);
            }

        })    

        $('#update_sensor').on('hidden.bs.modal', function(e) {
            $('#update_sensorID').val(sensor_ID);
            $('#dialog_Object_id_show').val(update_sensor_id);
            $('#dialog_ID_show').val(sensor_ID);
            $('#dialog_fieldName_show').val(fieldName);

            upd_alert_form.innerHTML=''
            $('#upd_type_temp').prop("checked",false);
            $('#upd_type_humid').prop("checked",false);
            $('#upd_type_light').prop("checked",false);
            $('#upd_type_distance').prop("checked",false);

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');
        });
    
        update_submit.on('click',()=>{
            let update_sensor_ID=$('#update_sensorID').val();
            let upd_checkbox = $("input[name='upd_Checkbox']");    
            let upd_sensorType=[];


            let check_update_ID=checkSpecialChar(update_sensor_ID);

            if(upd_checkbox.is(':checked')){
                $("input[name='upd_Checkbox']:checked").each ( function() {
                    upd_sensorType.push($(this).val())
                });
            }


            if(update_sensor_ID !==''){
                if(check_update_ID==true){
                    if(upd_sensorType.length>0){
                        $.ajax({
                            url:'/sensor_update',
                            dataType:'json',
                            type:'post',
                            async : false,
                            data:{_id:update_sensor_id,sensorID:update_sensor_ID,sensorType:JSON.stringify(upd_sensorType)},
                            success:function(res){
                                if(res.success==true){
                                    AlertMsgfunc(res.message);
    
                                }else{
                                    AlertMsgfunc(res.message);
                                }
                            },
                            error:function(error){
                                alert('與伺服器發生錯誤',error);
                            }
                        })
                    }else{
                        Msg='請至少選一種感測種類';
                        AlertMsgfunc(Msg);
                        Msg=''
                    }
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

        update_alert_submit.on('click',()=>{ 
            let type_key=[];
            $("label[name='value_dataType']").each ( function() {
                type_key.push($(this).text());
            });

            let dataTypeValue=[];
            let value_right=true;
            for(let i=0;i<type_key.length;i++){
                let small=$('#'+i+'_0').val();
                let big=$('#'+i+'_1').val();
                small=parseFloat(small);
                big=parseFloat(big);
                if(isNaN(small)==true || isNaN(big)==true){
                    value_right=false
                    Msg='閥值請輸入正確';
                    AlertMsgfunc(Msg);
                    Msg=''
                    break;                
                }else if(small<0 || big<0){
                    value_right=false
                    Msg='閥值請不要設置負數';
                    AlertMsgfunc(Msg);
                    Msg=''
                    break;
                }else if(small>=big){
                    value_right=false
                    Msg='大值不得小於小值';
                    AlertMsgfunc(Msg);
                    Msg=''
                    break;
                }else{
                    dataTypeValue.push({[type_key[i]]:{small:small,big:big}})
                }
            }
            if(value_right==true){
                $.ajax({
                    url:'/sensor_threshold_update',
                    dataType:'json',
                    type:'post',
                    async : false,
                    data:{_id:update_sensor_id,sensorID:sensor_ID,sensorType:JSON.stringify(dataTypeValue)},
                    success:function(res){
                        if(res.success==true){
                            Msg='閥值修改成功';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }else{
                            Msg='閥值修改失敗';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }
                    },
                    error:function(error){
                        alert('與伺服器發生錯誤',error);
                    }
                })                
            }

        })
    }
})


//刪除
if(window.location.pathname == "/sensor"){
    $ondelete = $(".table tbody tr td a.delete");
    $ondelete.click(function(){ 
        let del_sensor_objId=$(this).attr("del_sensor_objId");
        let del_field_objId=$(this).attr("del_field_objId");
        modalDelete(del_sensor_objId,del_field_objId)
    })    
}

function modalDelete(del_sensor_objId,del_field_objId){
    $('#confirm_Alert').modal('show');
    $('#delete_submit').on('click',()=>{
        $.ajax({
            url:'/sensor_delete',
            dataType:'json',
            type:'post',
            async : false,
            data:{_id:del_sensor_objId,fieldID:del_field_objId},
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
    location.href='/sensor';
});

function AlertMsgfunc(msg){
    $('#AlertMsg').modal('show');
    AlertMsg.html(msg);
}