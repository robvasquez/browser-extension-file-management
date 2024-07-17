function sendMessageToPopup(message) {
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Popup not ready, storing message for later");
    }
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.method === "POST" && details.requestBody) {
      let fileName = null;
      if (details.requestBody.formData) {
        for (let key in details.requestBody.formData) {
          if (details.requestBody.formData[key] instanceof File) {
            fileName = details.requestBody.formData[key].name;
            break;
          }
        }
      } else if (details.requestBody.raw) {
        fileName = "Unknown file (raw data)";
      }

      if (fileName) {
        console.log("File detected for upload:", fileName);
        chrome.runtime.sendMessage({
          type: "FILE_UPLOAD",
          fileName: fileName
        });

        // Open the popup
        chrome.action.openPopup();
      }
    }
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);
