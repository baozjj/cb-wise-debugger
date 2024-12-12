
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log('Message received in background:', message);
    
    // if (message.type === 'openFile') {
    //   const srcid = message.srcid;
  
    //   chrome.runtime.sendNativeMessage(
    //     'com.example.san_file_opener',
    //     { srcid },
    //     (response) => {
    //         console.log('收到',response);
    //         console.log('收到',chrome.runtime.lastError);
            
    //       if (chrome.runtime.lastError) {
    //         console.error('Native Messaging Error:', chrome.runtime.lastError.message);
    //         sendResponse({ success: false, error: chrome.runtime.lastError.message });
    //       } else {
    //         sendResponse(response);
    //       }
    //     }
    //   );
  
    //   // 表示响应是异步的
    //   return true;
    // }

    if (message.type === 'openFile') {
      fetch('http://localhost:6975/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srcid: message.srcid }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log('File successfully opened:', data.path);
            sendResponse({ success: true, path: data.path });
          } else {
            console.error('Error:', data.error);
            sendResponse({ success: false, error: data.error });
          }
        })
        .catch((error) => {
          console.error('Fetch Error:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // 表示异步响应
    }
  });
  
  