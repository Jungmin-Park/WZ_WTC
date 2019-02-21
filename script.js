
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


document.addEventListener("DOMContentLoaded", function () {
  //버전 읽어오기
  var manifestData = chrome.runtime.getManifest();
  var _version = manifestData.version
  document.querySelector("#version").innerText = _version;
   /*
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
*/
  chrome.tabs.executeScript({
    file: "content-script.js",
    allFrames: true
    });
  });
 
