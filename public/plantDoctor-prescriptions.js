

var AlertMsg=$('#Alert_msg');
var Msg='';

//資料顯示
$(function(){
    let username;
    let name;
    let dateline;
    let date;
    let solution;
    let recommendation;
    let due;
    let AlluserSensordataRecord;
    let AlluserIdentifyData;

    if(window.location.pathname == "/prescriptions"){
        
        $onupdate = $("#prescriptions_table .table tbody tr td a.update");
        $onupdate.click(function(){
            username=$(this).attr("data_username");
            name=$(this).attr("data_name");
            dateline=$(this).attr("data_dateline");
            date=$(this).attr("data_date");
            solution=$(this).attr("data_solution");
            recommendation=$(this).attr("data_recommendation");
            due=$(this).attr("data_due");
            AlluserSensordataRecord=$(this).attr("data_AlluserSensordataRecord");
            AlluserIdentifyData=$(this).attr("data_AlluserIdentifyData");

            AlluserSensordataRecord=JSON.parse(AlluserSensordataRecord)
            AlluserIdentifyData=JSON.parse(AlluserIdentifyData)

            $('#dialog_username_show').val(username);
            $('#dialog_name_show').val(name);
            $('#dialog_dateline_show').val(dateline);
            $('#dialog_date_show').val(date);
            $('#dialog_solution_show').val(solution);
            $('#dialog_recommendation_show').val(recommendation);
            $('#dialog_due_show').val(due);


            let chartHtml='';

            for(let i=0;i<AlluserSensordataRecord.length;i++){
                let chartPrepare="<div class='col-12 col-lg-6'>"+
                    "<div class='card flex-fill'>"+
                        "<div class='card-header'>"+
                            "<div class='mb-3 mt-3'>"+
                                "<div class='d-flex justify-content-between align-items-center'>"+
                                    "<div class='align-self-center'>"+
                                        "<p class='h3 fw-bold'>"+AlluserSensordataRecord[i].fieldName+"</p>"+
                                    "</div>"+
                                "</div>"+
                            "</div>"+
                            "<hr>"+
                            "<div class='mb-3 mt-3'>"+
                                "<p class='h3 fw-bold text-center'>"+AlluserSensordataRecord[i].sensorID+"</p>"+
                            "</div>"+
                        "</div>"+
                        "<div class='card-body'>"+
                            "<div>"+
                                "<p id='NoData_"+i+"'></p>"+
                            "</div>"+
                            "<div>"+
                                "<div id='temp-chart_"+i+"' style='width:100%; height:400px;'></div>"+
                            "</div>"+
                        "</div>"+
                    "</div>"+
                "</div>" 
                chartHtml+=chartPrepare;
            }


            let identifyHtml=''
            for(let x=0;x<AlluserIdentifyData.length;x++){
                let identifyPrepare="<tr class='text-nowrap'><td class='type'>"+AlluserIdentifyData[x].type+"</td><td class='identifyResult'>"+AlluserIdentifyData[x].identifyResult+"</td><td class='time'>"+AlluserIdentifyData[x].time+"</td></tr>"
                identifyHtml+=identifyPrepare;
            }
            
            $('#identifyHtml').html(identifyHtml);
            $('#sensorDataRecordRow').html(chartHtml);
            
            for(let j=0;j<AlluserSensordataRecord.length;j++){
                if(AlluserSensordataRecord[j].data.length==0){
                    $('#NoData_'+j).html('無藥單有效期間之資料');
                }
                TempRenderChart(AlluserSensordataRecord[j].data,AlluserSensordataRecord[j].time,j,AlluserSensordataRecord[j].sensorType) 
            }
        })    
      
        $('#insert_prescriptions').on('hidden.bs.modal', function(e) {

            $('#dialog_username_show').val(username);
            $('#dialog_name_show').val(name);
            $('#dialog_dateline_show').val(dateline);
            $('#dialog_date_show').val(date);
            $('#dialog_solution_show').val(solution);
            $('#dialog_recommendation_show').val(recommendation);
            $('#dialog_due_show').val(due);

            $('#sensorDataRecordRow').html('');
            $('#identifyHtml').html('');

            $('#show-tab').tab('show');
            $('#setting-tab').tab('dispose');            
        });               
    }
})

$('#AlertMsg').on('hidden.bs.modal', function(e) {
    location.reload()
});

function AlertMsgfunc(msg){
    $('#AlertMsg').modal('show');
    AlertMsg.html(msg);
}


function TempRenderChart(tempData, timeData,SensorCount,sensorType) {

    let yAxis_text='';
    for(let i=0;i<sensorType.length;i++){
        let TypeText=sensorType[i].slice(0, 1).toLowerCase();
        if(TypeText=='t'){
            yAxis_text+='ﾟC/'
        }else if(TypeText=='h'){
            yAxis_text+='RH/'
        }else if(TypeText=='l'){
            yAxis_text+='Lux/'
        }else if(TypeText=='d'){
            yAxis_text+='cm/'
        }
    }
    yAxis_text=yAxis_text.slice(0, -1);

    Highcharts.setOptions({
        lang: {
          shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        }
    })

    Highcharts.chart('temp-chart_'+SensorCount, {
        // 在 div id="chart" 中繪製Highcharts圖表
        chart: {
        type: 'line', // 圖表種類
        animation: false,
        zoomType: 'x'
        },
        title: {
            text:''
        },
        xAxis: {     
        //  X軸
        type: 'datetime',
        labels: {
            format: '{value:%Y-%b-%e}',
            rotation:65
        }
        },
        yAxis: {
        title: {
            text: yAxis_text,
        },
        },
        plotOptions: {
        line: {
            dataLabels: {
            enabled: true,
            },
        },
        },
        series:tempData,
    });
}



//結單

if(window.location.pathname == "/prescriptions"){
    $ondelete = $(".table tbody tr td a.check");
    $ondelete.click(function(){ 
        let data_ObjId=$(this).attr("process_data_ObjId");
        sendCheck(data_ObjId);
    })
    
}

function sendCheck(data_ObjId){
    $('#confirm_Alert').modal('show');
    $('#process_submit').on('click',()=>{
        $.ajax({
            url:'/prescriptions_check',
            dataType:'json',
            type:'post',
            async : false,
            data:{_id:data_ObjId},
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
    }) 
}