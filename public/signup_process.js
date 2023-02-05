

//註冊
var signup_submit=$('#signup_submit');

signup_submit.on('click',(e)=>{
    let username=$('#username').val();
    let real_name=$('#real_name').val();
    let email=$('#email').val();
    let phone=$('#phone').val();
    let address=$('#address').val();
    let password=$('#password').val();
    let password_check=$('#password_check').val();
    let msg_div=$('#check_div');
    let msg=$('#check');
    msg.html('');
    $('#username_wrong').html('');
    $('#name_wrong').html('');
    $('#phone_wrong').html('');
    $('#email_wrong').html('');
    $('#password_wrong').html('');
    
    if(username!=='' && real_name!=='' && email!=='' && phone!=='' && address!=='' && password!=='' && password_check!==''){

        if(password===password_check){
            $.ajax({
                url:'/signup',
                dataType:'json',
                type:'post',
                async : false,
                data:{username:username,name:real_name,email:email,phone:phone,address:address,password:password},
                success:function(res){
                    if(res.success==true){
                        msg_div.html(res.msg);
                        msg_div.removeClass('alert-danger')
                        msg_div.addClass('alert alert-success')
                        signup_submit.prop('disabled',true);

                        setTimeout((
                            () =>window.location.assign('/login')
                        ), 1000)

                    }else{
                        msg_div.removeClass('alert alert-success');                        
                        if(typeof res.msg=='object'){
                            let username_wrong='';
                            let name_wrong='';
                            let email_wrong='';
                            let phone_worng='';
                            let password_wrong='';
                            let address_wrong='';
                            
                            res.msg.forEach(function(item){
                                if(item.param==='username'){
                                    username_wrong+=item.msg+',';
                                }
                                if(item.param==='name'){
                                    name_wrong+=item.msg+',';
                                }
                                if(item.param==='email'){
                                    email_wrong+=item.msg+',';
                                }
                                if(item.param==='phone'){
                                    phone_worng+=item.msg+',';                                
                                }
                                if(item.param==='address'){
                                    address_wrong+=item.msg+',';
                                }
                                if(item.param==='password'){
                                    password_wrong+=item.msg+',';  
                                }
                            })
    
                            username_wrong=username_wrong.substring(0, username_wrong.length - 1);
                            name_wrong=name_wrong.substring(0,name_wrong.length - 1);
                            email_wrong=email_wrong.substring(0,email_wrong.length - 1);
                            phone_worng=phone_worng.substring(0,phone_worng.length - 1);
                            address_wrong=address_wrong.substring(0,address_wrong.length-1);
                            password_wrong=password_wrong.substring(0,password_wrong.length - 1);
    
                            $('#username_wrong').html(username_wrong);
                            $('#name_wrong').html(name_wrong);
                            $('#phone_wrong').html(phone_worng);
                            $('#address_wrong').html(address_wrong);
                            $('#email_wrong').html(email_wrong);
                            $('#password_wrong').html(password_wrong);


                            msg_div.html('輸入內容格式有錯誤');
                            msg_div.addClass('alert alert-danger');
                        }else{
                            msg_div.html(res.msg);
                        }
                        msg_div.addClass('alert alert-danger');
                    }
                },
                error:function(error){
                    alert('與伺服器發生錯誤',error);
                }
            })
        }else{
            msg_div.html('密碼驗證錯誤，請重新輸入');
            msg_div.addClass('alert alert-danger')

        }  
    }else{
        msg_div.html('未輸入完整，請重新輸入');
        msg_div.addClass('alert alert-danger')
    }
    e.preventDefault()
})




