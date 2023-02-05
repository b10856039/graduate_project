
var getSensor=JSON.parse(sensorData)
var getDateFindData=JSON.parse(dateFindData)


const socket=io();




$('#indicator_bell').on('click',()=>{
    $('#indicator').addClass('d-none');
    $('#indicator').removeClass('d-block')
    $('#indicator').html('');
})

for(let i=0;i<getSensor.length;i++){   
    if(getDateFindData[i].data.length==0){
        $('#NoData_'+i).html('未有範圍內的資料');
    }
    $('#TimeChangeChartPopup_ModalLabel_'+i).html('1個月內的歷史資料');
    ChangeTimeRenderChart(getDateFindData[i].data,getDateFindData[i].time,i,getDateFindData[i].sensorType)
}






$(function(){
    for(let i=0;i<getSensor.length;i++){
        $('#TimeSet1_'+i).on('click',()=>{
            let time=$('#change_time_'+i).val();
            let sensorID=$('#sensorID_'+i).text();
            let API_KEY=$('#API_KEY_'+i).text();
            sendTime(time,sensorID,API_KEY,i)
        })

        $('#change_time_'+i).on('input', function(){
            val = $('#change_time_'+i).val();
            $('div.change_time_t_'+i).text(val+'個月');
        });

        $('#TimeChangeChartPopup_'+i).on('hidden.bs.modal', function(e) {         
            $('div.change_time_t_'+i).text('1個月');
            $('#change_time_'+i).val(1);
            $('#TimeChangeChartPopup_ModalLabel_'+i).html('1個月內的歷史資料');
            ChangeTimeRenderChart(getDateFindData[i].data,getDateFindData[i].time,i,getDateFindData[i].sensorType)
        });
    }

    function sendTime(time,sensorID,API_KEY,i){
        $.ajax({
            url:'/',
            dataType:'json',
            type:'post',
            async : false,
            data:{sensorID:sensorID,API_KEY:API_KEY,timeChange:time},
            success:function(res){
                if(res.success==true){
                    if(res.dateFindData.length==0){
                        $('#NoData_'+i).html('未有範圍內的資料');
                    }
                    $('#TimeChangeChartPopup_ModalLabel_'+i).html(time+'個月內的歷史資料');
                    ChangeTimeRenderChart(res.dateFindData[0].data,res.dateFindData[0].time,i,res.dateFindData[0].sensorType)
                    
                }else{

                }
            },
            error:function(error){
                alert('與伺服器發生錯誤',error);
            }
        })
    }

})



for(let i=0;i<getSensor.length;i++){   
    socket.on('data_'+getSensor[i].position, function(data) {
        // 當socket開始連線時，接收資料
        // console.log('data:'+data);
        tempData = data.series; // 溫度陣列
        timeData = data.time; // 時間陣列
        sensorType=data.type;
        if(tempData.length==0){
            $('#immediate_NoData_'+i).html('未有24小時內的資料');
        }else{
            $('#immediate_NoData_'+i).html('');
        }       
        TempRenderChart(tempData, timeData,i,sensorType); // 產生溫度圖表
    });
      
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
        categories: timeData, // X軸資料
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


function ChangeTimeRenderChart(tempData,timeData,SensorCount,sensorType){
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
    Highcharts.chart('TimeChangeChart_'+SensorCount, {
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


