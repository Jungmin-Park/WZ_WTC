/* 분을 시:분 Format 문자열로 변경 */
function convertMinToHourFormat(mins){
    return (mins < 0 ? "-" : "")+ parseInt(Math.abs(mins) / 60)+ ":" + parseInt(Math.round(Math.abs(mins) % 60)).toString().padStart(2, "0");
}
/* 시:분 Fortmat 문자열을 분으로 변경 */
function convertHourFormatToMin(hourFormat){
    return hourFormat.split(":")[0]*60 + hourFormat.split(":")[1]*1
}

var message;
    /*당월 소정근무일수 */
    str_totWorkDay =  document.querySelector("#topGrid > div.k-grid-content > table > tbody > tr > td:nth-child(4)").innerText.replace("일","");

    /*당월 누적 근무일*/
    records = document.querySelectorAll("#grid > div.k-grid-content-locked > table > tbody > tr");
    if(records.length != 0){
    var today = new Date();
    var dd = today.getDate();
    var workedDay = 0;
	var advanceWorkDay = 0;	//사전 인정 근무일(휴가 등)
	var totWorkDay = 0;
    //for (i=0; i < dd ; i++){
	for (i=0; i < 35 ; i++){
    record = records[i];
    if(typeof(record) != 'undefined'){
            datas = record.querySelectorAll("td");
            //console.log("|"+datas[3].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") + "|")
			if(datas[0].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") == "계"){
				break;
			}
            if(datas[3].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") != ""){
				if( i <=dd)
					workedDay++;
				else
					advanceWorkDay++;
                datas[0].innerText  = datas[0].innerText.split("(")[0] + "("+ workedDay+")";
                datas[0].style.color  = "blue";
                datas[0].style.fontWeight = "bold";
                datas[0].style.fontSize  = "10px";
            }else{
                datas[0].style.color  = "inherit";
                datas[0].style.fontWeight = "normal";
                datas[0].style.fontSize  = "inherit";
            }
        }
    }
	totWorkDay = workedDay+advanceWorkDay;
    /*당월 잔여 근무일수 */
    str_remainWorkDay =  str_totWorkDay - (totWorkDay);

    /*당월 현재진행시간(누적근무시간)*/
    str_sumWorkTime =  document.querySelector("#topGrid > div.k-grid-content > table > tbody > tr > td:nth-child(6)").innerText;
    convertedWorkTime = convertHourFormatToMin(str_sumWorkTime);

    /*당월 근무가능시간 */
    str_reqWorkTime =  document.querySelector("#topGrid > div.k-grid-content > table > tbody > tr > td:nth-child(7)").innerText;
    convertedreqWorkTime = convertHourFormatToMin(str_reqWorkTime);

    /*누적 일 평균 근무시간*/
    if(convertedWorkTime==0)
        avrWorkTime = 0;
    else
        avrWorkTime = Math.round(convertedWorkTime/(totWorkDay));

    /*잔여 일 평균 근무시간*/
    avrRemWorkTime = Math.round(convertedreqWorkTime/str_remainWorkDay);

    /*초과 근무시간*/
    overWorkTime = convertedWorkTime - ((totWorkDay) * 480);
/*
    message = "<ul>"+
                "<li>당월 누적 근무일 : "+workedDay+"일 / "+str_totWorkDay+"일</li>"+
                "<li>당월 누적 근무시간 : "+str_sumWorkTime+" ("+convertedWorkTime+"분)</li>"+
                "<li>누적 평균 근무시간 : "+convertMinToHourFormat(avrWorkTime)+" ("+avrWorkTime+"분)</li>"+
                "<li>필요 평균 근무시간 : "+convertMinToHourFormat(avrRemWorkTime)+" ("+avrRemWorkTime+"분)</li>"+
                "<li>초과근무 시간 : <font style='color:red'>"+convertMinToHourFormat(overWorkTime)+" ("+overWorkTime+"분)</font></li>"+
            "</ul>"
*/	
    message = "<ul>"+
				"<li>당월 누적 근무일 : "+workedDay+"일";
	if(advanceWorkDay >0){
		message += "("+advanceWorkDay+"일)";
	}
	message += " / "+str_totWorkDay+"일</li>"+
                "<li>당월 누적 근무시간 : "+str_sumWorkTime+" ("+convertedWorkTime+"분)</li>"+
                "<li>누적 평균 근무시간 : "+convertMinToHourFormat(avrWorkTime)+" ("+avrWorkTime+"분)</li>"+
                "<li>필요 평균 근무시간 : "+convertMinToHourFormat(avrRemWorkTime)+" ("+avrRemWorkTime+"분)</li>"+
                "<li>초과근무 시간 : <font style='color:red'>"+convertMinToHourFormat(overWorkTime)+" ("+overWorkTime+"분)</font></li>"+
            "</ul>"
    chrome.runtime.sendMessage({'message': message})
}
