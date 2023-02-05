





//新增
var insert_submit=$('#insert_submit');
var AlertMsg=$('#Alert_msg');
var Msg='';
var map;
if (map != undefined){
    map.remove();
}   

$('#insert_field').on('hidden.bs.modal', function(e) {
    $(this).find('#insert_form')[0].reset();
});

function checkSpecialChar(fieldName){
    let specialChars= "~·`!！@#$￥%^…&*()（）—-=+[]{}【】、|\\;:；：'\"“‘,./<>《》?？，。";
    for (let i=0;i<specialChars.length;i++){
        if (fieldName.indexOf(specialChars.substring(i,i+1)) != -1 ){
            return false;
        }
    }
    return true;
}

function isNumber(value){

    if(isNaN(Number(value))==true){
        return false;
    }else{
        return true;
    }
}

insert_submit.on('click',()=>{
    let insert_fieldName=$('#insert_fieldName').val();
    let insert_latitude=$('#insert_latitude').val();
    let insert_longitude=$('#insert_longitude').val();

    if(insert_fieldName !=='' && insert_latitude!=='' && insert_longitude!==''){

        let insert_fieldName_check=checkSpecialChar(insert_fieldName);
        if(insert_fieldName_check==true){
            let insert_lat_check=isNumber(insert_latitude);
            let insert_lon_check=isNumber(insert_latitude);
            if(insert_lat_check==true && insert_lon_check==true){
                $.ajax({
                    url:'/field_add',
                    dataType:'json',
                    type:'post',
                    async : false,
                    data:{field_name:insert_fieldName,latitude:insert_latitude,longitude:insert_longitude},
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
                Msg='座標請輸入數字';
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

//修改
$(function(){
    var update_submit=$('#update_submit');
    let obj_id;
    let field_name;
    let API_KEY;
    let latitude;
    let longitude;
    if(window.location.pathname == "/field"){
        $onupdate = $(".table tbody tr td a.update");
        $onupdate.click(function(){
            obj_id=$(this).attr("upd_data_ObjId");
            field_name=$(this).attr("upd_data_name"); 
            API_KEY=$(this).attr('apikey');
            latitude=$(this).attr('upd_latitude');
            longitude=$(this).attr('upd_longitude');
            $('#update_fieldName').val(field_name);
            $('#update_latitude').val(latitude);
            $('#update_longitude').val(longitude);

            $('#dialog_ID_show').val(obj_id);
            $('#dialog_fieldName_show').val(field_name);
            $('#dialog_API-KEY').val(API_KEY);
            $('#dialog_latitude').val(latitude);
            $('#dialog_longitude').val(longitude);
            Show_map(latitude,longitude)
        })    
      
        $('#update_field').on('hidden.bs.modal', function(e) {
            $('#update_fieldName').val(field_name);
            $('#update_latitude').val(latitude);
            $('#update_longitude').val(longitude);

            $('#dialog_ID_show').val(obj_id);
            $('#dialog_fieldName_show').val(field_name);
            $('#dialog_API-KEY').val(API_KEY)
            $('#dialog_latitude').val(latitude);
            $('#dialog_longitude').val(longitude);
            map.remove();

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');
            
        });

        //載入地圖 避免modal顯示時因畫面大小造成地圖載入不全
        $('#map-tab').on('click',()=>{
            setTimeout(function () {
                window.dispatchEvent(new Event('resize'));
            }, 1000);
        })
    
        update_submit.on('click',()=>{
            let update_fieldName=$('#update_fieldName').val(); 
            let update_latitude=$('#update_latitude').val();            
            let update_longitude=$('#update_longitude').val();
            if(update_fieldName !=='' && update_latitude!=="" && update_longitude!==""){

                let update_fieldName_check=checkSpecialChar(update_fieldName);
                if(update_fieldName_check==true){

                    let update_lat_check=isNumber(update_latitude);
                    let update_lon_check=isNumber(update_latitude);

                    if(update_lat_check==true && update_lon_check==true){
                        $.ajax({
                            url:'/field_update',
                            dataType:'json',
                            type:'post',
                            async :false,
                            data:{obj_id:obj_id,field_name:update_fieldName,latitude:update_latitude,longitude:update_longitude},
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
                        Msg='座標請輸入數字';
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
    }

    function Show_map(latitude,longitude){
        let lat=Number(latitude);
        let long=Number(longitude);                
        map = L.map('map').setView([lat,long], 15);       

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            maxZoom: 18,
        }).addTo(map);

        var marker = L.marker([lat,long]);
        marker.addTo(map);



    }
})

//刪除
if(window.location.pathname == "/field"){
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
            url:'/field_delete',
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



