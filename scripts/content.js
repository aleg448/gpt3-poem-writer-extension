const insert = (content) => {}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'inject') {
      const { content } = request;
      const result = insert(content);
      // If something went wrong, send a failed status
      if (!result) {
        sendResponse({ status: 'failed' });
      }

    console.log(content);

    sendResponse({ status: 'success' });
  }
});