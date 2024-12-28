let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const apiKeyInput = document.getElementById('apiKey');

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

async function startRecording() {
  if (isRecording) return; // Prevent multiple recordings

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    statusEl.textContent = "Please enter your API key.";
    return;
  }

  statusEl.textContent = "Requesting microphone permission...";

  try {
    // Request audio stream from user's microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create a new MediaRecorder instance
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    // Fired every time data is available
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Fired when recording stops
    mediaRecorder.onstop = async () => {
      statusEl.textContent = "Transcribing audio...";
      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });

      // Send the audio blob to the transcription endpoint
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData,
        });

        if (response.ok) {
          console.log(response);
          console.log("Response ok");
          const data = await response.json();
          statusEl.textContent = "Sending transcription to the webpage...";
          console.log("Sending transcription to the webpage");

          // Send transcription to content script
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: 'TRANSCRIPTION_DATA',
                transcription: data.text,
                apiKey
              }, (response) => {
                if (response && response.status === 'Form filled successfully.') {
                  statusEl.textContent = "Form filled successfully.";
                } else {
                  console.error("Failed to fill form.");
                  statusEl.textContent = "Failed to fill form.";
                }
              });
            }
          });
        } else {
          statusEl.textContent = "Transcription failed.";
          console.error(await response.text());
        }
      } catch (err) {
        statusEl.textContent = "Error during transcription.";
        console.error(err);
      }
    };

    // Start recording
    mediaRecorder.start();
    isRecording = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusEl.textContent = "Recording...";
    statusEl.classList.add('recording');

  } catch (err) {
    statusEl.textContent = "Error accessing microphone.";
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop(); // triggers `onstop`
    isRecording = false;

    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusEl.classList.remove('recording');
  }
}
