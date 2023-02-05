const callDoctor = $('#isCall');
const cancelCallDoctor = $('#cancelisCall');


$(()=>{
    let tr_len=$('#show_tbody').find('tr').length;
    for(let i=0;i<tr_len;i++){
        let due_td=$('.due_'+i);
        let due_status=due_td.text().trim();

        if(due_status=='今天'){
            due_td.css('color','red');
        }
    }

})

callDoctor.on('click', () => {
    $.ajax({
        url: '/iscall',
        dataType: 'json',
        type: 'post',
        async: false,
        success: function(res) {
            location.reload()
        },
        error: function(error) {
            alert('與伺服器發生錯誤', error);
        }
    })
})

cancelCallDoctor.on('click', () => {
    $.ajax({
        url: '/canceliscall',
        dataType: 'json',
        type: 'post',
        async: false,
        success: function(res) {
            location.reload()
        },
        error: function(error) {
            alert('與伺服器發生錯誤', error);
        }
    })
})