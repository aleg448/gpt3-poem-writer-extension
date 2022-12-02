const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};
const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: 'inject', content },
      (response) => {
        if (response.status === 'failed') {
          console.log('injection failed.');
        }
      }
    );
  });
};

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';
	
  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.8,
    }),
  });
	
  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
    try {
      // Send mesage with "generating text"
    sendMessage('generating...');
    const { selectionText } = info;
    const basePromptPrefix = `
	Write a new verse to the poem below.
    Poem: 
	`;
    const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);
    const secondPrompt = `
      Take the following poem and write a new verse.
      
      Verse 1: ${selectionText}
      
      Verse 2: ${baseCompletion.text}
      
      Verse 3:
      `;

    // Call our second prompt
    const secondPromptCompletion = await generate(secondPrompt);

     console.log(baseCompletion.text);
     sendMessage(secondPromptCompletion.text);   
  } catch (error) {
        console.log(error);
        sendMessage(error.toString());
  }
};

chrome.contextMenus.create({
  id: 'context-run',
  title: 'Generate poem',
  contexts: ['selection'],
});
// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);