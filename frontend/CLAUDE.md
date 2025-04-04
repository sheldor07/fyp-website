- ion

## User Flow
1. User performs 5 searches on CCDS FIP search
2. Upon attempting a 6th search, system identifies the user has reached their limit
3. Search interface transitions to a "Search Limit Reached" screen with embedded Shabdify game
4. User plays and completes Shabdify game within the embedded frame
5. Upon game completion, user receives additional search credits
6. Interface automatically transitions back to search functionality

## Technical Components

### 1. Search Limit Tracking
- Track searches per user session using browser localStorage or sessionStorage
- Store a simple counter that increments with each search
- Reset counter when additional credits are earned

### 2. Iframe Implementation
- Create a dedicated container div in the CCDS interface for the iframe
- Recommended iframe dimensions: 100% width, minimum 500px height (responsive)
- Example implementation:
```html
<div id="shabdify-container" class="hidden">
  <div class="limit-message">
    <h3>You've reached your free search limit</h3>
    <p>Play a quick game of Shabdify to unlock more searches!</p>
  </div>
  <iframe 
    id="shabdify-frame" 
    src="https://shabdify.example.com/embedded?source=ccds" 
    width="100%" 
    height="550px" 
    frameborder="0"
  ></iframe>
</div>
```

### 3. Cross-Domain Communication
- Use the `postMessage` API for secure communication between iframe and parent window
- Shabdify game sends completion message to parent CCDS application
- Example message handler:
```javascript
// In CCDS parent window
window.addEventListener('message', function(event) {
  // Verify origin for security
  if (event.origin !== "https://shabdify.example.com") return;
  
  // Process completion message
  if (event.data.type === "gameCompleted" && event.data.success === true) {
    // Grant additional searches
    grantAdditionalSearches(10); // Grant 10 more searches
    // Hide iframe, show search interface
    toggleShabdifyInterface(false);
    // Show success message
    showNotification("You've earned 10 more searches!");
  }
});

// In Shabdify iframe
function notifyGameCompletion() {
  window.parent.postMessage({
    type: "gameCompleted",
    success: true,
    timestamp: Date.now()
  }, "https://ccds.example.com"); // Parent origin
}
```

### 4. Styling & UX Considerations
- Style the iframe container to match CCDS design system
- Add a subtle loading indicator while iframe loads
- Include a visible counter showing available searches remaining
- Provide a small info icon explaining the Shabdify integration

### 5. Fallback Mechanism
- If iframe fails to load (detected via onerror handler):
  - Offer direct link to Shabdify in new tab
  - Provide manual code entry field for verification after completion

## Additional Features

### Search Credit System
- Grant 10 additional searches per completed game
- Store search credits in localStorage with expiration (e.g., 24 hours)
- Display remaining searches in the UI

### Analytics Integration
- Track conversion rate: % of users who play Shabdify when reaching limit
- Measure completion rate: % of users who successfully complete game
- Monitor search continuation: % of users who continue searching after game

### "Powered by Shabdify" Badge
- Add small branded badge in corner of search interface
- Link to Shabdify homepage for users interested in playing directly

## Technical Requirements

### Shabdify Modifications
- Create special embedded version of Shabdify:
  - Streamlined UI optimized for iframe
  - Removal of unnecessary navigation elements
  - Addition of postMessage API for completion notification
  - URL parameter to identify source (CCDS)

### CCDS Modifications
- Add iframe container to search interface
- Implement search limit tracking
- Add message event listeners
- Create state management for search credits