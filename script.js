
chrome.runtime.onMessage.addListener(function(request,sender,response) {
  document.querySelector("#_result").innerHTML = request.message;
});

document.addEventListener("DOMContentLoaded", function () {
  console.log('main script loaded')
  chrome.tabs.executeScript({
    file: "content-script.js",
    allFrames: true
    });
  });
 
