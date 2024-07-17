document.addEventListener('change', (event) => {
    if (event.target.type === 'file') {
        const files = Array.from(event.target.files).map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
        }));

        chrome.runtime.sendMessage({
            type: 'FILE_UPLOAD_DETECTED',
            data: {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                files: files
            }
        });
    }
});
