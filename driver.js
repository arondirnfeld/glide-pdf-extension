window.addEventListener("message", async function(event) {
  const { origin, data: { key, params } } = event;

  console.log("Received message:", event);

  // Check if we've already processed this request (prevents refresh processing)
  const requestId = JSON.stringify(params);
  if (window.lastProcessedRequest === requestId) {
    // This is a duplicate request (refresh), send back the cached response
    if (window.lastResponse) {
      event.source.postMessage(window.lastResponse, "*");
    }
    return;
  }
  
  // Store this request as processed
  window.lastProcessedRequest = requestId;
  
  let result;
  let error;
  try {
    result = await window.function(...params);
  } catch (e) {
    result = undefined;
    try {
      error = e.toString();
    } catch (e) {
      error = "Exception can't be stringified.";
    }
  }

  const response = { key };
  if (result !== undefined) {
    // FIXME: Remove `type` once that's in staging
    response.result = result;
  } else {
    response.error = error;
  }

  // Cache the response
  window.lastResponse = response;

  // Send the response back to the source
  event.source.postMessage(response, "*");
});