$("#go").on("click",function() {
        iframeWin = document.getElementById("zooziframe").contentWindow,
        console.log('Message before send');
        
        var dataToSend = {
            action: "checkFormData"
        };
 
 /* 	make sure that the browsers you target all supoort sending an object in postMessage. Otherwise serialize the object as string using 
  		JSON.stringify and consume it after deserialization
  */
        iframeWin.postMessage(dataToSend, zoozDomain);
    	console.log('Message after send');
    });