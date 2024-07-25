let currentDownloadId = null;

chrome.downloads.onCreated.addListener(function (downloadItem) {
  chrome.downloads.pause(downloadItem.id);
  currentDownloadId = downloadItem.id;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: showDialog
      }, (injectionResults) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          // Fallback to popup if injection fails
          chrome.windows.create({
            url: 'dialog.html',
            type: 'popup',
            width: 400,
            height: 200
          });
        }
      });
    }
  });
});

function showDialog() {
  const dialog = document.createElement('div');
  dialog.id = 'download-interrupt-dialog';
  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999999;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
  `;

  content.innerHTML = `
    <h2>Do you want to continue with the download?</h2>
    <button id="continueButton">Continue</button>
    <button id="cancelButton">Cancel</button>
  `;

  dialog.appendChild(content);
  document.body.appendChild(dialog);

  document.getElementById('continueButton').addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'continueDownload' });
    dialog.remove();
  });

  document.getElementById('cancelButton').addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'cancelDownload' });
    dialog.remove();
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (currentDownloadId !== null) {
    if (request.action === 'continueDownload') {
      chrome.downloads.resume(currentDownloadId);
      console.log('Download continued:', currentDownloadId);
    } else if (request.action === 'cancelDownload') {
      chrome.downloads.cancel(currentDownloadId);
      console.log('Download canceled:', currentDownloadId);
    }
    currentDownloadId = null;
  }
});

//upload
function sendMessageToPopup(message) {
  if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: "uploadToIManage" }, function (response) {
      if (chrome.runtime.lastError) {
        console.log("Error sending message:", chrome.runtime.lastError);
      } else {
        console.log("Response from background:", response);
      }
    });
  } else {
    console.log("Chrome runtime API not available");
    // Fallback behavior here
  }
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

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === "uploadToIManage") {
      console.log("Uploading to iManage...");
      // Here you would add the logic to upload to iManage
      sendResponse({ status: "success" });
    }
  }
);

