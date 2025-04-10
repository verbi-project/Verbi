// Import necessary functions from firebase.js
import {
  setUserWordList,
  getUserWordList,
  setUserProfile,
  getUserProfile,
  userProfile,
} from "/Global/firebase.js";

// Initialize variables
let dictionary = []; // Array to store dictionary data
let wordList = [];   // Array to store the current word list
let place = 0;       // Index of the current word being displayed
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords') || '[]');
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

// Sound effects
const sounds = {
  pop: new Audio('/sounds/pop.mp3'),
  click: new Audio('/sounds/click.mp3'),
  success: new Audio('/sounds/success.mp3')
};

function playSound(soundName) {
  if (soundEnabled && sounds[soundName]) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play();
  }
}

// Start the application
initializeApp();

async function initializeApp() {
  // Load user preferences
  loadUserPreferences();
  
  // Initialize the word list
  await start();
  
  // Setup event listeners
  setupEventListeners();
}

function loadUserPreferences() {
  // Load dark/light mode preference
  const darkMode = localStorage.getItem('darkMode') === 'true';
  document.documentElement.classList.toggle('dark-mode', darkMode);
  
  // Load custom background if set
  const customBackground = localStorage.getItem('customBackground');
  if (customBackground) {
    document.getElementById('backgroundImage').src = customBackground;
  }
}

function setupEventListeners() {
  // Word interaction buttons
  document.getElementById('shareWordButton').addEventListener('click', () => {
    shareWord();
    playSound('click');
  });
  
  document.getElementById('speakerButton').addEventListener('click', () => {
    speakWord();
    playSound('click');
  });
  
  document.getElementById('favorateWordButton').addEventListener('click', () => {
    toggleFavorite();
    playSound('pop');
  });
}

// Function to check if the URL has an "index" parameter
function hasIndexParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("index");
}

// Asynchronous function to fetch a random word from the API
async function getRandomWord(callback = () => {}) {
  await fetch("https://verbi-three.vercel.app/api/get-random-word")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((word) => {
      callback(word); // Call the callback function with the fetched word
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to add a word to the word list stack
function addWordToStack(callback = () => {}) {
  getRandomWord((word) => {
    wordList.push(word); // Add the fetched word to the wordList array
    console.log(word); // Log the fetched word to the console
    callback(word); // Call the callback function with the added word
  });
}

// Log the result of getRandomWord() (this will log a Promise)
console.log(getRandomWord());

// Asynchronous function to start the application
async function start(dict) {
  dictionary = dict; // Assign the dictionary data (if any)

  // Sync favorite words between Firebase and local storage
  const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
  if (userId) {
    await getUserWordList(userId, (data) => {
      if (data) {
        // Merge Firebase data with local storage
        const firebaseWords = JSON.parse(data);
        const localWords = JSON.parse(localStorage.getItem('favoriteWords') || '[]');
        
        // Combine and deduplicate words based on text property
        const mergedWords = [...firebaseWords, ...localWords]
          .reduce((acc, word) => {
            if (!acc.some(w => w.text === word.text)) {
              acc.push(word);
            }
            return acc;
          }, []);
        
        // Update both storages
        favoriteWords = mergedWords;
        localStorage.setItem('favoriteWords', JSON.stringify(mergedWords));
        setUserWordList(userId, JSON.stringify(mergedWords));
      }
    });
  }

  // Check if the URL has an "index" parameter
  if (hasIndexParameter()) {
    var index = new URLSearchParams(window.location.search).get("index");
    // Fetch a specific word from the API based on the index
    await fetch("https://verbi-three.vercel.app/api/get-word?index=" + index.toString())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((word) => {
        wordList[0] = word; // Set the first word in the list to the fetched word
        populateUI(word);   // Populate the UI with the fetched word
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else{
  addWordToStack(populateUI);
    
  }

  // Add initial words to the word list (if no index parameter or after fetching specific word)
  for (let i = 0; i < 9; i++) {
    addWordToStack();
  }
}

// Function to check if a word is in the user's favorite word list
function containsWord(wordToCheck) {
  return favoriteWords.some(word => word.text === wordToCheck);
}

// Function to populate the UI with word information
function populateUI(wordObject) {
  // Reset speaker state
  endSpeaker();
  const speakerBtn = document.getElementById("speakerButton");
  speakerBtn.classList.add("material-symbols-rounded");
  speakerBtn.classList.remove("selected-material-symbol");

  // Prepare new content
  const newWord = `${wordObject.word[0].toUpperCase()}${wordObject.word.slice(1).toLowerCase()}`;
  const newDef = `${wordObject.def[0].toUpperCase()}${wordObject.def.slice(1).toLowerCase()}`;
  const newSyllables = splitIntoSyllables(wordObject.word);

  // Animate out current content
  ['word', 'def', 'partOfSpeech', 'syllables'].forEach(id => {
    const element = document.getElementById(id);
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    element.style.transition = 'all 0.2s ease-out';
  });

  // Update and animate in new content
  setTimeout(() => {
    document.getElementById("word").textContent = newWord;
    document.getElementById("def").textContent = newDef;
    document.getElementById("partOfSpeech").textContent = '';
    document.getElementById("syllables").textContent = newSyllables;

    ['word', 'def', 'partOfSpeech', 'syllables'].forEach(id => {
      const element = document.getElementById(id);
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });

    playSound('click');
  }, 200);

  // Update favorite button state
  const favoriteBtn = document.getElementById("favorateWordButton");
  if (containsWord(wordObject.word)) {
    favoriteBtn.classList.remove("material-symbols-rounded");
    favoriteBtn.classList.add("selected-material-symbol");
  } else {
    favoriteBtn.classList.add("material-symbols-rounded");
    favoriteBtn.classList.remove("selected-material-symbol");
  }
}

// Function to get the next word in the list (or previous if direction is not "forward")
function getNextWord(direction) {
  getUserWordList(
    JSON.parse(localStorage.getItem("USER_PROFILE")).id,
    (data) => {
      favoriteWords = data;
    }
  );

  if (direction == "forward" || direction == "f") {
    if (place + 1 == wordList.length) {
      console.log("generating new word");
      addWordToStack();
      return wordList[wordList.length - 1];
    } else {
      return wordList[place + 1];
    }
  } else {
    console.log("going to a previous word");
    if (place - 1 <= 0) {
      return wordList[0]; // Returns the first word if trying to go back from the first word
    } else {
      return wordList[place - 1];
    }
  }
}

// Function to split a word into syllables (simple algorithm)
function splitIntoSyllables(word) {
  word = word.toLowerCase(); // Convert to lowercase for consistency

  const vowels = "aeiouy";
  const vowelRegex = new RegExp(`[${vowels}]`, "g");

  let syllables = [];
  let currentSyllable = "";

  for (let i = 0; i < word.length; i++) {
    const char = word[i];

    // Single vowels at the beginning or end of a word:
    if (vowelRegex.test(char) && (i === 0 || i === word.length - 1)) {
      syllables.push(char);
      continue;
    }

    // Handle vowel combinations as single syllables:
    if (vowelRegex.test(char) && vowelRegex.test(word[i + 1])) {
      currentSyllable += char;

      // Check for trailing consonant after a vowel pair:
      if (i + 2 < word.length && !vowelRegex.test(word[i + 2])) {
        currentSyllable += word[i + 1];
        i++; // Skip the next vowel
      }

      continue;
    }

    // Handle consonant-vowel pairs:
    if (!vowelRegex.test(char) && vowelRegex.test(word[i + 1])) {
      if (currentSyllable) {
        syllables.push(currentSyllable);
        currentSyllable = "";
      }
      currentSyllable += char;
      continue;
    }

    currentSyllable += char;
  }
  return `${syllables.join("•")}${currentSyllable}`;
}

// Function to detect swipe gestures
function detectswipe(el, func) {
  var swipe_det = new Object();
  swipe_det.sX = 0;
  swipe_det.sY = 0;
  swipe_det.eX = 0;
  swipe_det.eY = 0;
  var min_x = 30; //min x swipe for horizontal swipe
  var max_x = 30; //max x difference for vertical swipe
  var min_y = 50; //min y swipe for vertical swipe
  var max_y = 60; //max y difference for horizontal swipe
  var direc = "";
  var ele = document.getElementById(el);
  ele.addEventListener(
    "touchstart",
    function (e) {
      var t = e.touches[0];
      swipe_det.sX = t.screenX;
      swipe_det.sY = t.screenY;
    },
    false
  );
  ele.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      var t = e.touches[0];
      swipe_det.eX = t.screenX;
      swipe_det.eY = t.screenY;
    },
    false
  );
  ele.addEventListener(
    "touchend",
    function (e) {
      //horizontal detection
      if (
        (swipe_det.eX - min_x > swipe_det.sX ||
          swipe_det.eX + min_x < swipe_det.sX) &&
        swipe_det.eY < swipe_det.sY + max_y &&
        swipe_det.sY > swipe_det.eY - max_y &&
        swipe_det.eX > 0
      ) {
        if (swipe_det.eX > swipe_det.sX) direc = "r";
        else direc = "l";
      }
      //vertical detection
      else if (
        (swipe_det.eY - min_y > swipe_det.sY ||
          swipe_det.eY + min_y < swipe_det.sY) &&
        swipe_det.eX < swipe_det.sX + max_x &&
        swipe_det.sX > swipe_det.eX - max_x &&
        swipe_det.eY > 0
      ) {
        if (swipe_det.eY > swipe_det.sY) direc = "d";
        else direc = "u";
      }

      if (direc != "") {
        if (typeof func == "function") func(el, direc);
      }
      direc = "";
      swipe_det.sX = 0;
      swipe_det.sY = 0;
      swipe_det.eX = 0;
      swipe_det.eY = 0;
    },
    false
  );
}

// Debug function (not used in the core logic)
function myfunction(el, d) {
  alert("you swiped on element with id '" + el + "' to " + d + " direction");
}

// Detect swipes on the "backgroundImage" element
detectswipe("body", selectAndDisplayWord);

// Function to handle word selection and display based on swipes
function selectAndDisplayWord() {
  populateUI(getNextWord("f"));
  place++;
}

// Event listener for keyboard input (space and arrow keys)
document.addEventListener("keyup", (event) => {
  if (event.code === "Space" || event.code === "ArrowDown") {
    populateUI(getNextWord("f"));
    place++;
  }
  if (event.code === "ArrowUp") {
    populateUI(getNextWord("p"));
    place--;
  }
});

// Function to update the user's favorite word list
export function updateFavorateWordList() {
  const currentWord = wordList[place];
  const element = document.getElementById("favorateWordButton");
  const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;

  const wordData = {
    text: currentWord.word,
    definition: currentWord.definition,
    partOfSpeech: currentWord.partOfSpeech,
    timestamp: Date.now()
  };

  if (element.classList.contains("material-symbols-rounded")) {
    // Add to favorites
    favoriteWords.push(wordData);
    element.classList.remove("material-symbols-rounded");
    element.classList.add("selected-material-symbol");
    playSound('success');
  } else {
    // Remove from favorites
    favoriteWords = favoriteWords.filter(word => word.text !== currentWord.word);
    element.classList.remove("selected-material-symbol");
    element.classList.add("material-symbols-rounded");
    playSound('pop');
  }

  // Update local storage
  localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));

  // Update Firebase if user is logged in
  if (userId) {
    getUserWordList(userId, (data) => {
      const updatedData = JSON.stringify(favoriteWords);
      setUserWordList(userId, updatedData);
    });
  }
}

// Event listener for the favorite button
document.getElementById("favorateWordButton").addEventListener("click", () => {
  updateFavorateWordList();
});

// Event listener for the speaker button
document.getElementById("speakerButton").addEventListener("click", () => {
  speakWord();
});

// Event listener for the share button
document.getElementById("shareWordButton").addEventListener("click", () => {
  copyAndShowAlert();
});

// Function to speak the current word and definition
const speakWord = () => {
  var element = document.getElementById("speakerButton");

  if (window.speechSynthesis.speaking) {
    endSpeaker(); // Stop ongoing speech
    return;
  }

  element.classList.remove("material-symbols-rounded");
  element.classList.add("selected-material-symbol");
  window.speechSynthesis.cancel(); // Cancel any queued speech

  const wordUtterance = new SpeechSynthesisUtterance(document.getElementById("word").textContent);
  const defUtterance = new SpeechSynthesisUtterance(document.getElementById("def").textContent);

  window.speechSynthesis.speak(wordUtterance);
  window.speechSynthesis.speak(defUtterance);


    defUtterance.onend = () => {
       element.classList.add("material-symbols-rounded");
       element.classList.remove("selected-material-symbol");
    }
};

// Function to stop speech
function endSpeaker() {
  var element = document.getElementById("speakerButton");

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    element.classList.add("material-symbols-rounded");
    element.classList.remove("selected-material-symbol");
    return;
  }
}

// Function to copy the share URL and show an alert
function copyAndShowAlert() {
  const currentWord = wordList[place];
  const shareText = `${currentWord.word} - ${currentWord.partOfSpeech}\n${currentWord.definition}\n\nShared from Verbi`;
  
  const alert = document.createElement('div');
  alert.className = 'alert glass-morphism';
  
  navigator.clipboard.writeText(shareText)
    .then(() => {
      alert.innerHTML = '<span class="material-symbols-rounded">check_circle</span> Word copied!';
      playSound('success');
      
      const shareBtn = document.getElementById("shareWordButton");
      shareBtn.classList.add("selected-material-symbol");
      
      setTimeout(() => {
        shareBtn.classList.remove("selected-material-symbol");
      }, 1000);
    })
    .catch(() => {
      alert.innerHTML = '<span class="material-symbols-rounded">error</span> Failed to copy';
      playSound('pop');
    });

  document.body.appendChild(alert);
  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  }, 2000);
}


// Collections Management
let collections = JSON.parse(localStorage.getItem('collections') || '[]');

function addToCollection(collectionId) {
  const currentWord = wordList[place];
  const wordData = {
    text: currentWord.word,
    definition: currentWord.definition,
    partOfSpeech: currentWord.partOfSpeech,
    timestamp: Date.now()
  };

  // Find the collection and add the word
  const collection = collections.find(c => c.id === collectionId);
  if (collection) {
    if (!collection.words.some(w => w.text === wordData.text)) {
      collection.words.push(wordData);
      localStorage.setItem('collections', JSON.stringify(collections));
      playSound('success');
      showAlert('Word added to collection');
    }
  }
}

function showCollectionModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content glass-morphism">
      <h3>Add to Collection</h3>
      <div class="collections-list">
        ${collections.map(collection => `
          <button class="collection-item" data-id="${collection.id}">
            <span class="material-symbols-rounded">collections_bookmark</span>
            <span>${collection.name}</span>
          </button>
        `).join('')}
      </div>
      <button class="btn" id="createNewCollection">
        <span class="material-symbols-rounded">add</span>
        Create New Collection
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modal.querySelectorAll('.collection-item').forEach(button => {
    button.addEventListener('click', () => {
      addToCollection(button.dataset.id);
      modal.remove();
    });
  });

  modal.querySelector('#createNewCollection').addEventListener('click', () => {
    showCreateCollectionModal();
    modal.remove();
  });
}

function showCreateCollectionModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content glass-morphism">
      <h3>Create New Collection</h3>
      <input type="text" class="input" placeholder="Collection Name" />
      <button class="btn" id="saveCollection">Create</button>
    </div>
  `;

  document.body.appendChild(modal);

  const input = modal.querySelector('input');
  const saveBtn = modal.querySelector('#saveCollection');

  saveBtn.addEventListener('click', () => {
    const name = input.value.trim();
    if (name) {
      const newCollection = {
        id: Date.now().toString(),
        name,
        words: [],
        timestamp: Date.now()
      };
      collections.push(newCollection);
      localStorage.setItem('collections', JSON.stringify(collections));
      addToCollection(newCollection.id);
      modal.remove();
      playSound('success');
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Add collection button to word buttons
document.getElementById('wordButtons').innerHTML += `
  <span class="material-symbols-rounded" id="addToCollectionButton">
    collections_bookmark
  </span>
`;

document.getElementById('addToCollectionButton').addEventListener('click', () => {
  showCollectionModal();
  playSound('click');
});

// Alert function for feedback
function showAlert(message) {
  const alert = document.createElement('div');
  alert.className = 'alert glass-morphism';
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  }, 2000);
}
