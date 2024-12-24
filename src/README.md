# Voice Form Filler Chrome Extension

## Overview
The **Voice Form Filler** is a Chrome extension that simplifies form filling on web pages using voice transcription. This extension leverages OpenAI's Whisper and GPT APIs to transcribe spoken input and intelligently map it to form fields on the active webpage.

### Key Features:
- Record your voice input directly from the extension's popup interface.
- Automatically transcribe the recorded audio using OpenAI's Whisper API.
- Use GPT to analyze transcription and populate relevant form fields.
- Seamless integration with any webpage containing forms.

---

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the directory containing this extension.
5. Ensure the extension appears in your browser toolbar.

---

## Usage

### Step 1: Configure the API Key
1. Click on the extension's icon in your browser toolbar.
2. In the popup, enter your OpenAI API Key in the provided field.

### Step 2: Start Recording
1. Click the **Start Recording** button to capture your voice input.
2. Speak clearly, then click **Stop Recording** when finished.

### Step 3: Fill the Form
1. The extension will process your voice input:
   - Transcribe the audio using OpenAI's Whisper API.
   - Analyze the transcription and match it with the form fields on the active webpage using GPT.
2. Once processed, the form fields identified correctly will be populated automatically.

---

## Files in the Project

### 1. `manifest.json`
Defines the Chrome extension configuration, including permissions and the default popup file【9†source】.

### 2. `background.js`
Handles events related to the lifecycle of the extension, such as installation. It also sets up a basic message listener【10†source】.

### 3. `contentScript.js`
Contains the logic for:
- Extracting form fields from the current webpage.
- Communicating with the GPT API to match transcription data with form fields【11†source】.

### 4. `popup.html`
Provides the user interface for the extension, including buttons for starting and stopping the recording, and an input field for the API key【12†source】.

### 5. `popup.js`
Implements functionality for:
- Recording audio using the browser's microphone.
- Sending audio to the Whisper API for transcription.
- Communicating the transcription data to the content script for form filling【13†source】.

---

## Permissions
The extension requests the following permissions:
- **activeTab**: To interact with the currently active webpage.
- **scripting**: To inject scripts into the webpage.
- **tabs**: To identify the active tab for communication【9†source】.

---

## Future Enhancements
- Add support for more languages in transcription.
- Improve form field matching for complex forms.
- Introduce error handling and validation for better user experience.
- Enable real-time streaming transcription.

---

## Contributing
Contributions are welcome! If you'd like to improve the extension:
1. Fork this repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a description of the changes.

---

## License
This project is licensed under the MIT License. Feel free to use, modify, and distribute as per the license terms.

