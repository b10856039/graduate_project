

//新增
var insert_submit=$('#insert_submit');
var AlertMsg=$('#Alert_msg');
var Msg='';

function checkSpecialChar(plantSpecies){
    let specialChars= "~·`!！@#$￥%^…&*()（）—-=+[]{}【】、|\\;:；：'\"“‘,./<>《》?？，。";
    for (let i=0;i<specialChars.length;i++){
        if (plantSpecies.indexOf(specialChars.substring(i,i+1)) != -1 ){
            return false;
        }
    }
    return true;
}


$('#insert_plant').on('hidden.bs.modal', function(e) {
    $(this).find('#test')[0].reset();
  });

insert_submit.on('click',()=>{
    let insert_plantName=$('#insert_plantName').val();
    if(insert_plantName!==''){

        let insert_plant_check=checkSpecialChar(insert_plantName);

        if(insert_plant_check==true){
            $.ajax({
                url:'/plant_add',
                dataType:'json',
                type:'post',
                async : false,
                data:{plantSpecies:insert_plantName},
                success:function(res){
                    if(res.success==true){
                        AlertMsgfunc(res.msg);
                    }else{
                        AlertMsgfunc(res.msg);
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


//修改
$(function(){
    var update_submit=$('#update_submit');
    let obj_id;
    let plant_species;
    if(window.location.pathname == "/plant_management"){
        $onupdate = $(".table tbody tr td a.update");
        $onupdate.click(function(){
            obj_id=$(this).attr("upd_data_ObjId");
            plant_species=$(this).attr("upd_data_species");  
            $('#update_plantSpecies').val(plant_species);
            $('#dialog_ID_show').val(obj_id);
            $('#dialog_plantName_show').val(plant_species);
        })    

        $('#update_plant').on('hidden.bs.modal', function(e) {
            $('#update_plantSpecies').val(plant_species);
            $('#dialog_ID_show').val(obj_id);
            $('#dialog_plantName_show').val(plant_species);

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');
        });
    
        update_submit.on('click',()=>{
            let update_Species=$('#update_plantSpecies').val(); 
            if(update_Species !==''){
                let update_plant_check=checkSpecialChar(update_Species);

                if(update_plant_check==true){
                    $.ajax({
                        url:'/plant_update',
                        dataType:'json',
                        type:'post',
                        async : false,
                        data:{_id:obj_id,species:update_Species},
                        success:function(res){
                            if(res.success==true){
                                AlertMsgfunc(res.msg);
                            }else{
                                AlertMsgfunc(res.msg);
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
if(window.location.pathname == "/plant_management"){
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
            url:'/plant_delete',
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