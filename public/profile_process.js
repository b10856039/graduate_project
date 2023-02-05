
//修改個人資料
var isAuthenticated_submit=$('#isAuthenticated_submit');
var setting_submit=$('#setting_submit');
var password_change=$("#password_change");
var wrong_message=$('#wrong_message');
var AlertMsg=$('#Alert_msg');
var Logout_msg=$('#Logout_msg');
var Line_update_submit=$('#Line_update_submit');
var Line_delete_submit=$('#Line_delete_submit');
var Email_activate_submit=$('#Email_activate_submit');
var Email_deactivate_submit=$('#Email_deactivate_submit');

var Msg=''

$('#indicator_bell').on('click',()=>{
    $('#indicator').addClass('d-none');
    $('#indicator').removeClass('d-block')
    $('#indicator').html('');
})


$('#password_isAuthenticated').on('hidden.bs.modal', function(e) {
    $(this).find('#isAuthenticated_form')[0].reset();
});

isAuthenticated_submit.on('click',(e)=>{
    let personal_password=$('#personal_password').val();
    if(personal_password!==''){
        $.ajax({
            url:'/profile_isAuthenticated',
            dataType:'json',
            type:'post',
            async : false,
            data:{password:personal_password},
            success:function(res){
                if(res.success===true){
                    $('#setting_process').removeClass('d-none');
                    $('#setting_process').addClass('d-block');
                    $('#setting_show').addClass('d-none');
                }else{
                    Msg='密碼錯誤，請重新輸入'
                    AlertMsgfunc(Msg);
                    Msg=''
                    $('#setting_show').removeClass('d-none');
                    $('#setting_process').removeClass('d-block');
                    $('#setting_process').addClass('d-none');
                }
            },
            error:function(error){
                // Msg='與伺服器發生錯誤連接'
                // AlertMsgfunc(Msg);
                // Msg=''
                alert('與伺服器發生錯誤',error);
            }
        })
    }else{
        Msg='請輸入完整'
        AlertMsgfunc(Msg);
        Msg=''
    }
})

$('#AlertMsg').on('hidden.bs.modal', function(e) {
    location.reload()
});



setting_submit.on('click',(e)=>{
    let name_setting=$('#name_setting').val();
    let email_setting=$('#email_setting').val();
    let phone_setting=$('#phone_setting').val();
    let address_setting=$('#address_setting').val()
    console.log(address_setting)
    if(name_setting!=='' && email_setting!=='' && phone_setting!=='' && address_setting!==''){
        $.ajax({
            url:'/profile_update_personalData',
            dataType:'json',
            type:'post',
            async : false,
            data:{name:name_setting,email:email_setting,phone:phone_setting,address:address_setting},
            success:async function(res){
                if(res.success==true){
                    Msg=res.msg
                    AlertMsgfunc(Msg);
                    Msg='';                    
                }else{
                    
                    if(typeof res.msg=='object'){
                        let wrong='';
                        res.msg.forEach(function(item){
                            wrong+=item.msg+',';
                        })
                        wrong=wrong.substring(0,wrong.length - 1);
                        AlertMsgfunc(wrong);                     
                    }else{
                        AlertMsgfunc(res.msg);
                    }
                }                
            },
            error:function(error){
                // Msg='與伺服器發生錯誤連接'
                // AlertMsgfunc(Msg);
                // Msg=''
                alert('與伺服器發生錯誤',error);
            }
        })
    }else{
        Msg='請輸入完整'
        AlertMsgfunc(Msg);
        Msg=''
    }

})

password_change.on('click',(e)=>{
    let old_password=$('#old_password').val();
    let new_password=$('#new_password').val();
    let check_password=$('#check_password').val();   

    if(old_password!=='' && new_password!=='' && check_password!==''){
        if(new_password===check_password){
            $.ajax({
                url:'/profile_update_password',
                dataType:'json',
                type:'post',
                async : false,
                data:{oldPassword:old_password,newPassword:new_password},
                success:function(res){
                    if(res.success==true){
                        alert(res.update_msg);
                        location.href='/logout'                      
                    }else{
                        AlertMsgfunc(res.update_msg);
                    }
                },
                error:function(error){
                    // Msg='與伺服器發生錯誤連接'
                    // AlertMsgfunc(Msg);
                    // Msg=''
                    alert('與伺服器發生錯誤',error);
                }
            })
        }else{
            Msg='新密碼與確認密碼有誤'
            AlertMsgfunc(Msg);
            Msg=''
        }
    }else{
        Msg='請輸入完整'
        AlertMsgfunc(Msg);
        Msg=''
    }

})

$('#Line_update_submit').on('hidden.bs.modal', function(e) {
    $(this).find('#update_LineToken').reset();
});

Line_update_submit.on('click',()=>{
    let update_LineToken=$('#update_LineToken').val();
    if(update_LineToken!==''){
        $.ajax({
            url:'/LineNotify_process',
            dataType:'json',
            type:'post',
            async : false,
            data:{LineToken:update_LineToken},
            success:function(res){
                if(res.success==true){
                    AlertMsgfunc(res.Lineprocess_msg);                    
                }else{
                    AlertMsgfunc(res.Lineprocess_msg);
                }
            },
            error:function(error){
                // Msg='與伺服器發生錯誤連接'
                // AlertMsgfunc(Msg);
                // Msg=''
                alert('與伺服器發生錯誤',error);
            }
        })
    }else{
        Msg='請輸入TOKEN'
        AlertMsgfunc(Msg);
        Msg=''
    }
})

Line_delete_submit.on('click',()=>{
    $.ajax({
        url:'/LineNotify_del',
        dataType:'json',
        type:'post',
        async : false,        
        success:function(res){
            if(res.success==true){
                AlertMsgfunc(res.Lineprocess_msg);                    
            }else{
                AlertMsgfunc(res.Lineprocess_msg);
            }
        },
        error:function(error){
            // Msg='與伺服器發生錯誤連接'
            // AlertMsgfunc(Msg);
            // Msg=''
            alert('與伺服器發生錯誤',error);
        }
    })
})


Email_activate_submit.on('click',()=>{
    $.ajax({
        url:'/EmailNotify_process',
        dataType:'json',
        type:'post',
        async : false,
        success:function(res){
            if(res.success==true){
                AlertMsgfunc(res.Emailprocess_msg);                    
            }else{
                AlertMsgfunc(res.Emailprocess_msg);
            }
        },
        error:function(error){
            alert('與伺服器發生錯誤',error);
        }
    })    
})

Email_deactivate_submit.on('click',()=>{
    $.ajax({
        url:'/EmailNotify_del',
        dataType:'json',
        type:'post',
        async : false,        
        success:function(res){
            if(res.success==true){
                AlertMsgfunc(res.Emailprocess_msg);                    
            }else{
                AlertMsgfunc(res.Emailprocess_msg);
            }
        },
        error:function(error){
            alert('與伺服器發生錯誤',error);
        }
    })
})


function AlertMsgfunc(msg){
    $('#AlertMsg').modal('show');
    AlertMsg.html(msg);
}



