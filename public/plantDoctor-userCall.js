


var AlertMsg=$('#Alert_msg');
var Msg='';

//修改
$(function(){
    var insert_submit=$('#insert_submit');
    let obj_id;
    let username;
    let name;
    let email;
    let phone;
    let address;

    if(window.location.pathname == "/userCall"){
        
        $onupdate = $(".table tbody tr td a.update");
        $onupdate.click(function(){
            obj_id=$(this).attr("insert_data_ObjId");
            username=$(this).attr("insert_data_username");
            name=$(this).attr("insert_data_name");
            email=$(this).attr("insert_data_email");
            phone=$(this).attr("insert_data_phone");
            address=$(this).attr("insert_data_address");

            $('#dialog_username_show').val(username);
            $('#dialog_name_show').val(name);
            $('#dialog_email_show').val(email);
            $('#dialog_phone_show').val(phone);
            $('#dialog_address_show').val(address);

        })    
      
        $('#insert_prescriptions').on('hidden.bs.modal', function(e) {
          
            $('#insert_solution').val('');    
            $('#insert_recommendation').val('');
            $('#insert_due').val(1);
            $('#insert_dateline').val(1)
            $('div.dateline_t').text('1個月');
            $('div.due_t').text('1天');

            $('#dialog_username_show').val(username);
            $('#dialog_name_show').val(name);
            $('#dialog_email_show').val(email);
            $('#dialog_phone_show').val(phone);
            $('#dialog_address_show').val(address);

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');
            
        });

        $('#insert_dateline').on('input', function(){
            val = $('#insert_dateline').val();
            $('div.dateline_t').text(val+'個月');
        });

        $('#insert_due').on('input', function(){
            val = $('#insert_due').val();
            $('div.due_t').text(val+'天');
        });
    
        insert_submit.on('click',()=>{
            let insert_dateline=$('#insert_dateline').val(); 
            let insert_solution=$('#insert_solution').val();            
            let insert_recommendation=$('#insert_recommendation').val();
            let insert_due=$('#insert_due').val();
            if(insert_dateline !=='' && insert_solution!=="" && insert_recommendation!=="" && insert_due!==""){
                $.ajax({
                    url:'/userCall_add',
                    dataType:'json',
                    type:'post',
                    async :false,
                    data:{user_id:obj_id,username:username,dateline:insert_dateline,solution:insert_solution,recommendation:insert_recommendation,due:insert_due},
                    success:function(res){
                        if(res.success==true){
                            Msg='提交成功';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }else{
                            Msg='提交失敗';
                            AlertMsgfunc(Msg);
                            Msg=''
                        }
                    },
                    error:function(error){
                        alert('與伺服器發生錯誤',error);
                    }
                }) 
            }else{
                Msg='請輸入完整';
                AlertMsgfunc(Msg);
                Msg=''
            }
        })        
    }
})

$('#AlertMsg').on('hidden.bs.modal', function(e) {
    location.reload()
});

function AlertMsgfunc(msg){
    $('#AlertMsg').modal('show');
    AlertMsg.html(msg);
}



