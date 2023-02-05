

//品質辨識
var img_submit=$('#img_submit');
var AlertMsg=$('#Alert_msg');
var Msg='';
img_submit.on('click',()=>{
    $('#img').removeClass('d-block');
    $('#img').addClass('d-none');
    let file=document.getElementById('file');
    let file_type=$('#file').val().split('.').pop().toLowerCase();
    let type=$('#identify_type').val();    
    let formData=new FormData();
    if(file.files[0]!==undefined && type!==""){
        if(file_type==='jpg' || file_type==='png'){
            img_submit.prop('disabled', true);
            $('#result').text(`辨識中...`);
            $('#process_msg').text('辨識過程請勿關閉或切換頁面');
            formData.append('file',file.files[0])
            formData.append('type',type);
            $.ajax({
                url:'/quality_identify',
                dataType:'json',
                type:'post',
                cache:false,
                data:formData,
                contentType:false,
                processData:false,
                success:function(res){
                    if(res.code===200){
                        img_submit.prop('disabled',false);
                        $('#img').removeClass('d-none');
                        $('#img').addClass('d-block');
                        $('#result').text(`辨識結果為：第${res.ans}級`);
                        $('#img').attr('src',res.data);
                        $('#process_msg').text('');    
                    }else{
                        img_submit.prop('disabled',false);
                        Msg='辨識失敗，請重新測試';
                        AlertMsgfunc(Msg);
                        $('#result').text('');
                        $('#process_msg').text('');
                        Msg=''
                    }
                },
                error:function(error){
                    alert('與伺服器發生錯誤');
                    $('#result').text('');
                }
            })
        }else{
            Msg='請選擇jpg或png格式';
            AlertMsgfunc(Msg);
            $('#result').text('');
            Msg=''
        }        
    }else if(type!==""){
        Msg='請選擇圖片後再執行'
        AlertMsgfunc(Msg);
        $('#result').text('');
        Msg=''
    }else if(file.files[0]!==undefined){
        Msg='請選擇辨識類型後再執行'
        AlertMsgfunc(Msg);
        $('#result').text('');
        Msg=''
    }else{
        Msg='請先選擇檔案與辨識類型後再執行'
        AlertMsgfunc(Msg);
        Msg=''
        $('#result').text('');
    }
})

function AlertMsgfunc(msg){
    $('#AlertMsg').modal('show');
    AlertMsg.html(msg);
}