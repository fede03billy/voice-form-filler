// contentScript.js

// Function to extract form fields and relevant information from the webpage
// Function to extract form fields and relevant information from the webpage
function extractPageData() {
  const formFields = [];

  const inputs = document.querySelectorAll('input');
  const textareas = document.querySelectorAll('textarea');
  const selects = document.querySelectorAll('select');

  // Helper to find label text associated with an element
  function getLabelText(element) {
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.innerText.trim();
      }
    }
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.innerText.trim();
    }
    return "";
  }

  // Collect inputs
  inputs.forEach(input => {
    formFields.push({
      tagName: 'input',
      type: input.type,
      id: input.id || '',
      name: input.name || '',
      placeholder: input.placeholder || '',
      label: getLabelText(input),
      element: input,
      value: "" // Placeholder for GPT-provided value
    });
  });

  // Collect textareas
  textareas.forEach(textarea => {
    formFields.push({
      tagName: 'textarea',
      id: textarea.id || '',
      name: textarea.name || '',
      placeholder: textarea.placeholder || '',
      label: getLabelText(textarea),
      element: textarea,
      value: "" // Placeholder for GPT-provided value
    });
  });

  // Collect selects
  selects.forEach(select => {
    formFields.push({
      tagName: 'select',
      id: select.id || '',
      name: select.name || '',
      label: getLabelText(select),
      element: select,
      options: Array.from(select.options).map(option => ({
        value: option.value,
        text: option.text,
        selected: option.selected
      })),
      value: "" // Placeholder for GPT-provided value
    });
  });

  return formFields;
}

// Function to fill the form fields based on transcription topics
async function fillFormWithTranscription(transcription, apiKey) {
  const formFields = extractPageData();

  // Prepare data for GPT API
  const labels = formFields.map(field => field.label);
  const prompt = `
    Match the following form field labels to the transcription content:
    Labels: ${JSON.stringify(labels)}
    Transcription: "${transcription}"
    Respond with a JSON object mapping each label to its corresponding transcription content. Express the content in the appropriate data type.
    Only output a valid JSON object with no additional text or formatting. Example:
    {"Label1": "Value1", "Label2": "Value2", ...}
  `;

  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        stream: false // streaming is disabled
      })
    });

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const cleanedContent = rawContent.replace(/```(?:json)?|```/g, '').trim(); // Remove markdown syntax
    const mapping = JSON.parse(cleanedContent); // Parse cleaned JSON

    // Update formFields with GPT-provided values
    formFields.forEach(field => {
      if (mapping[field.label] !== undefined) {
        field.value = mapping[field.label]; // Assign value from GPT response
      }
    });

    // Iterate over form fields and apply values
    formFields.forEach(field => {
      if (field.value !== undefined) {
        if (field.tagName === 'input' || field.tagName === 'textarea') {
          field.element.value = field.value; // Set input or textarea value
        } else if (field.tagName === 'select') {
          const matchingOption = field.options.find(option => option.text === field.value);
          if (matchingOption) {
            field.element.value = matchingOption.value; // Set select option value
          }
        }
      }
    });
  } catch (error) {
    console.error('Error during GPT matching or form filling:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRANSCRIPTION_DATA') {
    console.log('Received transcription:', request.transcription);
    
    try {
      fillFormWithTranscription(request.transcription, request.apiKey);
      sendResponse({ status: 'Form filled successfully.' });
    } catch (error) {
      console.error('Error filling form:', error);
      sendResponse({ status: 'Failed to fill form.' });
    }

    // Return true to indicate asynchronous response, if applicable
    return true;
  }
});
