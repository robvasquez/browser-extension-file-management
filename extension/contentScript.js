// content.js
console.log('Content script loaded');

function showDialog() {
    console.log('Showing dialog');
    const dialog = document.createElement('div');
    dialog.id = 'download-interrupt-dialog';
    dialog.innerHTML = `
    <div class="dialog-content">
      <h2>¿Desea continuar con la descarga?</h2>
      <button id="cancelButton">Cancelar Descarga</button>
      <button id="continueButton">Continuar Descarga</button>
    </div>
  `;
    document.body.appendChild(dialog);

    document.getElementById('cancelButton').addEventListener('click', function () {
        console.log('Cancel button clicked');
        chrome.runtime.sendMessage({ action: "cancelDownload" }, function (response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending cancelDownload message:', chrome.runtime.lastError);
            } else {
                console.log('cancelDownload message sent, response:', response);
                if (response && response.success) {
                    dialog.remove();
                }
            }
        });
    });

    document.getElementById('continueButton').addEventListener('click', function () {
        console.log('Continue button clicked');
        chrome.runtime.sendMessage({ action: "continueDownload" }, function (response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending continueDownload message:', chrome.runtime.lastError);
            } else {
                console.log('continueDownload message sent, response:', response);
                if (response && response.success) {
                    dialog.remove();
                }
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Message received in content script:', request);
    if (request.action === "showDialog") {
        showDialog();
        sendResponse({ success: true });
    }
    return true;  // Keeps the message channel open for asynchronous responses
});

//upload 

let originalFileInput = null;

function injectDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'custom-file-picker-dialog';
    dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    z-index: 9999;
  `;
    dialog.innerHTML = `
    <h2>Choose an option:</h2>
    <button id="upload-imanage">Upload to iManage</button>
    <button id="continue-file-picker">Continue with File Picker</button>
  `;
    document.body.appendChild(dialog);

    document.getElementById('upload-imanage').addEventListener('click', handleIManageUpload);
    document.getElementById('continue-file-picker').addEventListener('click', handleContinueFilePicker);
}

function handleIManageUpload() {
    console.log('iManage button clicked');
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "uploadToIManage" }, function (response) {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                alert('Error uploading to iManage: ' + chrome.runtime.lastError.message);
            } else {
                console.log("Response from background:", response);
                alert('Uploading to iManage');
            }
        });
    } else {
        console.warn('chrome.runtime.sendMessage is not available');
        alert('Uploading to iManage (fallback)');
    }
    document.getElementById('custom-file-picker-dialog').remove();
}

function handleContinueFilePicker() {
    console.log('Continue with File Picker button clicked');
    alert('Continuing with File Picker');
    document.getElementById('custom-file-picker-dialog').remove();
    if (originalFileInput) {
        // Remove our event listener temporarily
        window.removeEventListener('click', handleFileInputClick, true);

        // Use setTimeout to ensure the dialog is fully removed
        setTimeout(() => {
            // Trigger the original file input
            originalFileInput.click();

            // Re-add our event listener after a short delay
            setTimeout(() => {
                window.addEventListener('click', handleFileInputClick, true);
            }, 100);
        }, 0);
    }
}


function handleFileInputClick(event) {
    if (event.target.type === 'file') {
        event.preventDefault();
        originalFileInput = event.target;
        injectDialog();
    }
}

window.addEventListener('click', handleFileInputClick, true);
