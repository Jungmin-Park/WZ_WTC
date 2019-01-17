function convertMinToHour(mins){
    return (mins < 0 ? "-" : "")+ parseInt(Math.abs(mins) / 60)+ ":" + parseInt(Math.round(Math.abs(mins) % 60)).toString().padStart(2, "0");
}

var message;
/*당월 누적 근무일*/
records = document.querySelectorAll("#grid > div.k-grid-content-locked > table > tbody > tr");
    if(records.length != 0){
    var today = new Date();
    var dd = today.getDate();
    var workedDay = 0;
    for (i=0; i < dd ; i++){
    record = records[i];
    if(typeof(record) != 'undefined'){
            datas = record.querySelectorAll("td");
            //console.log("|"+datas[3].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") + "|")
            if(datas[3].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") != ""){
                workedDay++;
                datas[0].innerText  = datas[0].innerText.split("(")[0] + "("+ workedDay+"일차)";
                datas[0].style.color  = "blue";
            }else{
                datas[0].style.color  = "black";
            }
        }
    }

    /*당월 누적 근무시간*/
    str_sumWorkTime =  document.querySelector("#topGrid > div.k-grid-content > table > tbody > tr > td:nth-child(6)").innerText;
    convertedWorkTime = str_sumWorkTime.split(":")[0]*60 + str_sumWorkTime.split(":")[1]*1;

    /*1일 평균 근무시간*/
    avrWorkTime = Math.round(convertedWorkTime/workedDay);

    /*초과 근무시간*/
    overWorkTime = convertedWorkTime - (workedDay * 480);

    message = "<ul>"+
                "<li>당월 누적 근무일 : "+workedDay+"일</li>"+
                "<li>당월 누적 근무시간 : "+str_sumWorkTime+" ("+convertedWorkTime+"분)</li>"+
                "<li>1일 평균 근무시간 : "+convertMinToHour(avrWorkTime)+" ("+avrWorkTime+"분)</li>"+
                "<li>초과근무 시간 : <font style='color:red'>"+convertMinToHour(overWorkTime)+" ("+overWorkTime+"분)</font></li>"+
                "</ul>"
    chrome.runtime.sendMessage({'message': message})
}
