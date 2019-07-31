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
var workedToday = 0;
var advanceWorkDay = 0;	//사전 인정 근무일(휴가 등)
var totWorkDay = 0;

var lastDate; //기준일
var formatted_today = (today.getMonth()+1).toString().padStart(2, "0")+"월 "+ today.getDate().toString().padStart(2, "0")+"일";
var todayComeTime;
var currentTime = today.getHours()+":"+today.getMinutes();
var todayWorkTime= 0 ; //오늘 근무시간
var overWorkTime = 0;	//초과근무시간
var overWorkTimeToday = 0; //초과 근무시간 오늘까지
var basedDay = "어제";	// 기준일

for (i=0; i < records.length ; i++){
	record = records[i];
	if(typeof(record) != 'undefined'){
		datas = record.querySelectorAll("td");
		
		if(datas[0].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") == "계"){
			break;
		}
		if(datas[3].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") != ""){
			if( i < dd){
				workedDay++;
			}else{
				advanceWorkDay++;
			}

			lastDate = datas[0].innerText.split("(")[0] ;
			datas[0].innerText  = datas[0].innerText.split("(")[0] + "("+ (workedDay+advanceWorkDay)+")";
			datas[0].style.color  = "blue";
			datas[0].style.fontWeight = "bold";
			datas[0].style.fontSize  = "10px";
			
		}else{
			datas[0].style.color  = "inherit";
			datas[0].style.fontWeight = "normal";
			datas[0].style.fontSize  = "inherit";
		}
		
		//if(datas[0].innerText == formatted_today && datas[9].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") != ""){
		if(datas[0].innerText == formatted_today){
			if(datas[9].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") != ""){
				todayComeTime = datas[9].innerText;
				todayWorkTime = convertHourFormatToMin(currentTime)- convertHourFormatToMin(todayComeTime)
				//점심시간(13시~14시)이 지난경우 60분 차감
				if(convertHourFormatToMin(currentTime) > 14*60){
					todayWorkTime = todayWorkTime - 60;
				}
			}
			if(datas[3].innerText.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(" ", "") == "")
				workedToday++;
			else
				basedDay = "오늘";
		}
	}
	else{
		break;
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
overWorkTimeToday = (convertedWorkTime + todayWorkTime) - ((totWorkDay + workedToday) * 480)


message = "<table id='summary' width='100%'>"+
			"	<tr>"+
			"		<th width='50%'>총 근무 시간</th>"+
			"		<th width='50%'>총 근무 일수</th>"+
			"	</tr>"+
			"	<tr>"+
			"		<td>"+str_sumWorkTime+"</td>"+
			"		<td>"+workedDay+"일";

if(advanceWorkDay >0){
	message += "("+advanceWorkDay+"일)";
}

message += 	" / "+str_totWorkDay+"일</td>"+
			"	</tr>"+
			"	<tr>"+
			"		<th>일 평균 근무</th>"+
			"		<th>잔여 평균 근무</th>"+
			"	</tr>"+
			"	<tr>"+
			"		<td>"+convertMinToHourFormat(avrWorkTime)+"</td>"+
			"		<td>"+convertMinToHourFormat(avrRemWorkTime)+"</td>"+
			"	</tr>"+
			"	<tr>"+
			"		<th>초과 시간(" + basedDay + "기준)</th>"+
			"		<th>초과 시간(현재기준)</th>"+
			"	</tr>"+
			"	<tr>"+
			"		<td style='background:"+ (overWorkTime < 0 ? "#FF9999":"#E5FFCC") +"'>"+convertMinToHourFormat(overWorkTime)+"</td>"+
			"		<td style='background:"+ (overWorkTimeToday < 0 ? "#FF9999":"#E5FFCC") +"'>"+convertMinToHourFormat(overWorkTimeToday)+"</td>"+
			"	</tr>"+
			"</table>";
				
chrome.runtime.sendMessage({'message': message})
}

