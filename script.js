chrome.runtime.onMessage.addListener(function(request,sender,response) {
  document.querySelector("#_result").innerHTML = request.message;
});

document.addEventListener('DOMContentLoaded', function() {
  var y = document.getElementById("git_link");
  y.addEventListener("click", openIndex);
  
  var x = document.getElementById("reload_extension");
  x.addEventListener("click", reloadExtension);
})

function openIndex() {
  chrome.tabs.create({active: true, url: "https://github.com/Jungmin-Park/WZ_WTC/releases"});
}

function reloadExtension() {
  chrome.runtime.reload(); 
}

/* 분을 시:분 Format 문자열로 변경 */
function convertMinToHourFormat(mins){
  if (mins ==0)
		return "0";
  return (mins < 0 ? "-" : "")+ parseInt(Math.abs(mins) / 60)+ ":" + parseInt(Math.round(Math.abs(mins) % 60)).toString().padStart(2, "0");
}

/* 시:분 Fortmat 문자열을 분으로 변경 */
function convertHourFormatToMin(hourFormat){
  return hourFormat.split(":")[0]*60 + hourFormat.split(":")[1]*1
}

document.addEventListener("DOMContentLoaded", function () {

  //변수 선언
  var today = new Date(); 
  var _year = today.getFullYear(); 
  var _month = new String(today.getMonth()+1).padStart(2, '0'); 
  var _day = new String(today.getDate()).padStart(2, '0'); 
  var _today = _month.toString() + _day.toString();
  var _compSeq = "";
  var _deptName = "";
  var _empSeq = "";
  
  var base_work_day ="";  //월 기준근무 일수
  var sumWorkTime = 0;  // 총 근무시간
  var v_sumWorkTime =""; // 총 근무시간(시:분포맷)
  var basedDay = "어제";	// 기준일
  var workedDay = 0;  //누적 근무일수
  var advanceWorkDay = 0;	//사전 인정 근무일(휴가 등)
  
  var totWorkDay = 0; // 총근무 일수 workedDay + advanceWorkDay
  var remWorkDay = 0;  //"잔여 근무일수
  
  var avrWorkTime =""; // 평균 근무시간
  var remAvrWorkTime =""; // 잔여 평균 근무시간
  var overWorkTime = 0;
  var currentTime = new String(today.getHours()).padStart(2, '0')+":"+new String(today.getMinutes()).padStart(2, '0'); //현재시간
  var longCurrentTime = new String(today.getHours()).padStart(2, '0')+":"+new String(today.getMinutes()).padStart(2, '0')+":"+new String(today.getSeconds()).padStart(2, '0'); //현재시간
  var workedToday = 0; //근무일수에 오늘 카운트 여부, 카운트 됐으면 1
  var todayWorkTime = 0; // 오늘 근무시간, 출근시간 ~ 현재
  
  var todayLeftHour = "";
  
  checkVersion();   //버전 체크
  getUserInfo();  //근무시간 계산
  
  /* 버전 체크 */
  function checkVersion(){
	  
    //버전 읽어오기
    var manifestData = chrome.runtime.getManifest();
    var _version = manifestData.version
    document.querySelector("#version").innerText = _version;
    
    //신규 버전 확인
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.github.com/repos/jungmin-park/wz_wtc/releases", true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var rtnJson = JSON.parse(xhr.responseText);
        //버전이 다르면 git 링크 노출
        if(_version != rtnJson[0].tag_name){
          $("#check_ver").css("visibility","visible");
        }
      }
    }
    xhr.send();
  }

  /* 정보 조회 */
  function getUserInfo(){
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (xhr.status === 200 || xhr.status === 201) {
        var rtnJson = JSON.parse(xhr.responseText);

        for(var i =0 ; i< rtnJson["positionList"].length; i++){
          //alert(rtnJson["positionList"][i]["deptName"])
          if(rtnJson["positionList"][i]["mainCompYn"]=="Y" && rtnJson["positionList"][i]["mainDeptYn"]=="Y"){
            _compSeq = rtnJson["positionList"][i]["compSeq"];
            _deptName = rtnJson["positionList"][i]["deptName"];
            _empSeq = rtnJson["positionList"][i]["empSeq"];
          }
        }
        getAttendSummary();
      } else if (xhr.status === 500) {
        document.querySelector("#_result").innerHTML = '그룹웨어에 로그인 해 주세요';
      } else {
        document.querySelector("#_result").innerHTML = 'Error : '+xhr.responseText;
      }
    };
    xhr.open('GET', 'http://gwa.webzen.co.kr/gw/getPositionList.do');
    xhr.setRequestHeader('Content-Type', 'application/json'); 
    xhr.send(); 
  };

  /* 월별 근태 현황 집계 조회*/
  function getAttendSummary(){
    var xhr = new XMLHttpRequest();
    var data = {
      compSeq: _compSeq,
      deptName: _deptName,
      empSeq: _empSeq,
      month: _month,
      year: _year,
    };
    xhr.onload = function() {
      if (xhr.status === 200 || xhr.status === 201) {
        var rtnJson = JSON.parse(xhr.responseText);
        v_base_work = rtnJson.attDeptMgrList[0].v_base_work;
        base_workTime = rtnJson.attDeptMgrList[0].sum_base_work;
        base_work_day = Number(rtnJson.attDeptMgrList[0].v_base_work_days.replace("일",""));
        sumWorkTime = rtnJson.attDeptMgrList[0].sum_tot_min;
        v_sumWorkTime = rtnJson.attDeptMgrList[0].v_tot_min;
        v_pos_time = rtnJson.attDeptMgrList[0].v_pos_time;
        pos_time = rtnJson.attDeptMgrList[0].pos_time;

        getAttendDetail();
        
      } else {
        document.querySelector("#_result").innerHTML = 'Error : '+xhr.responseText;
      }
    };
    xhr.open('POST', 'http://gwa.webzen.co.kr/wz/reward/searchRewardAttendEmpList');
    xhr.setRequestHeader('Content-Type', 'application/json'); 
    xhr.send(JSON.stringify(data)); 
  }

  /* 일별 근태현황 조회*/
  function getAttendDetail(){
      var xhr = new XMLHttpRequest();
      var data = {
        compSeq: _compSeq,
        deptName: _deptName,
        empSeq: _empSeq,
        month: _month,
        year: _year,
      };
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
          parseAttDetailData(xhr.responseText)
          drawResult();
        } else {
          document.querySelector("#_result").innerHTML = '일별 근태 현황 조회 중 오류 발생 : '+xhr.responseText;
        }
    
      };
      xhr.open('POST', 'http://gwa.webzen.co.kr/wz/reward/searchRewardAttendList');
      xhr.setRequestHeader('Content-Type', 'application/json'); 
      xhr.send(JSON.stringify(data)); 
  }
  
  /* 근태 상세 데이터 파싱*/
  function parseAttDetailData(jsonText){
    try{
      var jsonObj = JSON.parse(jsonText);
      for(var i=0; i <jsonObj.attDeptMgrList.length; i++){
        
        if(jsonObj.attDeptMgrList[i].dateMD == "계"){
          break;
        }
        var dayOfList = jsonObj.attDeptMgrList[i].dateMD.replace("월 ","").replace("일","")
        
        if(jsonObj.attDeptMgrList[i].tot_min > 0 && jsonObj.attDeptMgrList[i].h_title == ""){
          if( dayOfList < _today){
            workedDay++;
          }else{
            advanceWorkDay++;
          }
        }

        if( dayOfList.toString() == _today.toString()){
          
		  if(jsonObj.attDeptMgrList[i].tot_min > 0){
            basedDay = "오늘";
          }else{
            if(jsonObj.attDeptMgrList[i].come_dt != ""){
              workedToday++;
              var todayComeTime = jsonObj.attDeptMgrList[i].come_dt;
              todayWorkTime = convertHourFormatToMin(currentTime) - convertHourFormatToMin(todayComeTime)
              //점심시간(13시~14시)이 지난경우 60분(중식) 차감
              if(convertHourFormatToMin(currentTime) > 14*60){
                todayWorkTime = todayWorkTime - 60;
              }
			  
			  //휴게시간을 체크 한 경우
			  if(jsonObj.attDeptMgrList[i].tot_min < 0){
				  todayWorkTime = todayWorkTime + jsonObj.attDeptMgrList[i].tot_min;
			  }
			  
            }
          }
        }
      }
      //누적 근무 일수
      totWorkDay = workedDay+advanceWorkDay;
      //잔여 근무 일수 
      remWorkDay = base_work_day- totWorkDay
      //누적 일 평균 근무시간
      if(sumWorkTime==0)
          avrWorkTime = 0;
      else
          avrWorkTime = Math.round(sumWorkTime/(totWorkDay));
      //잔여 일 평균 근무시간
      if(base_workTime - sumWorkTime==0)
        remAvrWorkTime = 0
      else 
		remAvrWorkTime = Math.round((base_workTime - sumWorkTime)/remWorkDay);
      //초과 근무시간
      overWorkTime = sumWorkTime - ((totWorkDay) * 480);
      //overWorkTimeToday = (sumWorkTime + todayWorkTime) - ((totWorkDay + workedToday) * 480)
	  if(totWorkDay < base_work_day)
		overWorkTimeToday = (sumWorkTime + todayWorkTime) - ((totWorkDay + workedToday) * 480)
	  else
		overWorkTimeToday = (sumWorkTime + todayWorkTime) - ( base_work_day * 480) 
	  //오늘 퇴근 시간
	  if(overWorkTimeToday < 0){
		  //점심시간(13시~14시)이 지나지 않은 경우 60분(중식) 계산
		  var remainWorktime = overWorkTimeToday;
		  if(convertHourFormatToMin(currentTime) <= 13*60){
			remainWorktime = remainWorktime - 60;
		  }
			  
		today.setMinutes(today.getMinutes()+Math.abs(remainWorktime));
		todayLeftHour = "data-toggle='tooltip' data-placement='top' title=' 오늘 "+ new String(today.getHours()).padStart(2, '0')+":"+new String(today.getMinutes()).padStart(2, '0') +" 퇴근 시 플러스 전환'";
	  }
	  
    }catch(e){
          showError(e.message);
    }
  }
  
  /* 계산 결과 표시 */
  function drawResult(){
    message = "<table id='summary' width='100%'>"+
			"	<tr>"+
			"		<th width='50%'>인정 근무 일수</th>"+
			"		<th width='50%'>인정 근무 시간</th>"+
			"	</tr>"+
			"	<tr>"+
			"		<td>"+workedDay+"일";
			if(advanceWorkDay >0){
				message += "("+advanceWorkDay+"일)";
			}
message += 	" / "+base_work_day+"일</td>"+
			"		<td>"+v_sumWorkTime+"</td>"+

      
            "	</tr>"+
            "	<tr>"+
            "		<th>진행 평균 근무</th>"+
            "		<th>잔여 평균 근무</th>"+
            "	</tr>"+
            "	<tr>"+
            "		<td>"+convertMinToHourFormat(avrWorkTime)+"</td>"+
            "		<td>"+convertMinToHourFormat(remAvrWorkTime)+"</td>"+
            "	</tr>"+
            "	<tr>"+
            "		<th>초과 시간(" + basedDay + "기준)</th>"+
            "		<th>초과 시간(현재기준)</th>"+
            "	</tr>"+
            "	<tr>"+
            "		<td class='"+ (overWorkTime < 0 ? "alert-danger":"alert-success") +"'>"+convertMinToHourFormat(overWorkTime)+"</td>"+
            "		<td class='"+ (overWorkTimeToday < 0 ? "alert-danger":"alert-success") +"' "+todayLeftHour+">"+convertMinToHourFormat(overWorkTimeToday)+"</td>"+
            "	</tr>"+
            "</table>";

      document.querySelector("#_result").innerHTML = message;
      document.querySelector("#_current_time").innerText = longCurrentTime;
  }
  
  function showError(message){
    document.querySelector("#_result").innerHTML = "Error<br>"+message;
  }
    
});
 
