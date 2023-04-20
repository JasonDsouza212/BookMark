document.getElementById('save-btn').addEventListener('click', saveBookmark);

// Displaying the saved bookmarks when the popup is opened
chrome.storage.local.get(['bookmarks'], (result) => {
  if (result.bookmarks) {
    displayBookmarks(result.bookmarks);
  }
});

// Saving the current website as a bookmark
function saveBookmark() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { url } = tabs[0];
    const title = prompt("Enter bookmark title:") || getBookmarkTitle({url}); // prompt user to enter title or use default
    chrome.bookmarks.create({ title, url }, (bookmark) => {
      // To Save the bookmark to local storage
      chrome.storage.local.get(['bookmarks'], (result) => {
        const bookmarks = result.bookmarks || [];
        bookmarks.push(bookmark);
        chrome.storage.local.set({ bookmarks });
        // To Display the saved bookmarks
        displayBookmarks(bookmarks);
      });
    });
  });
}

// To Remove a bookmark from local storage and display the updated bookmarks
function removeBookmark(id) {
  chrome.bookmarks.remove(id, () => {
    chrome.storage.local.get(['bookmarks'], (result) => {
      const bookmarks = result.bookmarks || [];
      const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
      chrome.storage.local.set({ bookmarks: updatedBookmarks });
      // Display the updated bookmarks
      displayBookmarks(updatedBookmarks);
    });
  });
}

// Displaying the bookmarks in the popup.html file
function displayBookmarks(bookmarks) {
  const container = document.getElementById('bookmarks-container');
  container.innerHTML = '';
  bookmarks.forEach((bookmark) => {
    const bookmarkEl = document.createElement('div');
    bookmarkEl.classList.add('bookmark');
    const titleEl = document.createElement('div');
    titleEl.classList.add('bookmark-title');
    const imgEl = document.createElement('img'); 
    imgEl.src = `https://www.google.com/s2/favicons?domain=${bookmark.url}`; // set image source
    imgEl.width = 24;
    imgEl.height = 24; 
    imgEl.style.marginRight = '20px'; 
    const linkEl = document.createElement('div'); 
    linkEl.textContent = getBookmarkTitle(bookmark);
    linkEl.classList.add('bookmark-url'); 
    linkEl.addEventListener('click', () => {
      chrome.tabs.create({ url: bookmark.url });
    });
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeBookmark(bookmark.id));
    removeBtn.classList.add('deletebtn');
    titleEl.appendChild(imgEl); // To add image element to title element
    titleEl.appendChild(linkEl);
    bookmarkEl.appendChild(titleEl);
    bookmarkEl.appendChild(removeBtn);
    container.appendChild(bookmarkEl);
  });
}

// Get the bookmark title based on the website's real name or its domain name
function getBookmarkTitle(bookmark) {
  const url = new URL(bookmark.url);
  return bookmark.title || url.hostname;
}

// Trigger save bookmark function when the user presses Ctrl+B
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'b') {
    saveBookmark();
  }
});

