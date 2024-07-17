import { useState, useEffect } from 'react'

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([])

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "FILE_UPLOAD") {
        setUploadedFiles(prev => [...prev, message.fileName])
      } else if (message.type === "FILE_UPLOAD_DETECTED") {
        setUploadedFiles(prev => [...prev, ...message.data.files.map(file => file.name)])
      }
    })
  }, [])

  return (
    <div>
      <h1>Detected File Uploads</h1>
      <ul>
        {uploadedFiles.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
