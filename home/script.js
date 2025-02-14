// Import necessary functions from firebase.js
import {
  setUserWordList,
  getUserWordList,
  setUserProfile,
  getUserProfile,
  userProfile,
} from "/Global/firebase.js";

// Initialize variables
var dictionary = []; // Array to store dictionary data (not used extensively in this code)
var wordList = [];     // Array to store the current word list
var place = 0;        // Index of the current word being displayed
var favoriteWords = [null]; // Array to store user's favorite words

// Start the application
start();

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

  // Get user's favorite word list from Firebase
  await getUserWordList(
    JSON.parse(localStorage.getItem("USER_PROFILE")).id,
    (data) => {
      favoriteWords = data;
    }
  );

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
  favoriteWords = JSON.parse(favoriteWords); // Parse the favoriteWords data (assuming it's stored as JSON)
  for (let i = 0; i < favoriteWords.length; i++) {
    if (favoriteWords[i].word == wordToCheck) {
      return true;
    }
  }
  return false;
}

// Function to populate the UI with word information
function populateUI(wordObject) {
  endSpeaker();
  var element = document.getElementById("speakerButton");
  element.classList.add("material-symbols-rounded");
  element.classList.remove("selected-material-symbol");
  document.getElementById(
    "word"
  ).textContent = `${wordObject.word[0].toUpperCase()}${wordObject.word
    .slice(1)
    .toLowerCase()}`;
  document.getElementById(
    "def"
  ).textContent = `${wordObject.def[0].toUpperCase()}${wordObject.def
    .slice(1)
    .toLowerCase()}`;
  document.getElementById("partOfSpeech").textContent = ``;
  document.getElementById("syllables").textContent = splitIntoSyllables(
    wordObject.word
  )

  // Update the favorite button based on whether the word is in the favorite list
  var element = document.getElementById("favorateWordButton");
  if (containsWord(wordObject.word)) {
    console.log("44r");
    element.classList.remove("material-symbols-rounded");
    element.classList.add("selected-material-symbol");
  } else {
    console.log("r");
    element.classList.add("material-symbols-rounded");
    element.classList.remove("selected-material-symbol");
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
  var element = document.getElementById("favorateWordButton");
  if (
    document.getElementById("favorateWordButton").classList[0] ==
    "material-symbols-rounded"
  ) {
    // Add the word to favorites
    getUserWordList(
      JSON.parse(localStorage.getItem("USER_PROFILE")).id,
      (data) => {
        data = JSON.parse(data);
        console.log(data);
        data.push(wordList[place]);
        console.log(data);
        setUserWordList(
          JSON.parse(localStorage.getItem("USER_PROFILE")).id,
          data
        );
      }
    );
    element.classList.remove("material-symbols-rounded");
    element.classList.add("selected-material-symbol");
  } else {
    // Remove the word from favorites
    var element = document.getElementById("favorateWordButton");
    getUserWordList(
      JSON.parse(localStorage.getItem("USER_PROFILE")).id,
      (data) => {
        var wordToRemove = wordList[place].word;
        const newWordArray = JSON.parse(data).filter(
          (wordObj) => wordObj.word !== wordToRemove
        );
        console.log(newWordArray);
        setUserWordList(
          JSON.parse(localStorage.getItem("USER_PROFILE")).id,
          newWordArray
        );
      }
    );
    element.classList.add("material-symbols-rounded");
    element.classList.remove("selected-material-symbol");
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
  var element = document.getElementById("shareWordButton");
  element.classList.toggle("material-symbols-rounded");
  element.classList.toggle("selected-material-symbol");
  console.log(wordList[place]);
  navigator.clipboard.writeText("https://verbi.glitch.me/home/?index=" + wordList[place].index.toString())
    .then(() => {
      // Create and show the alert with animation
      const alertContainer = document.createElement('div');
      alertContainer.classList.add('copy-alert-container');
      alertContainer.style.cssText = ` /* ... (styles remain the same) ... */ `;

      const icon = document.createElement('span');
      icon.classList.add('material-symbols-rounded');
      icon.textContent = 'content_copy';
      icon.style.cssText = ` /* ... (styles remain the same) ... */ `;

      const message = document.createElement('span');
      message.textContent = 'Copied!';
      message.style.cssText = ` /* ... (styles remain the same) ... */ `;

      alertContainer.appendChild(icon);
      alertContainer.appendChild(message);
      document.body.appendChild(alertContainer);

      // Fade in
      setTimeout(() => {
        alertContainer.style.opacity = 1;
      }, 10);

      // Fade out and remove
      setTimeout(() => {
        alertContainer.style.opacity = 0;
        setTimeout(() => {
          alertContainer.remove();
          var element = document.getElementById("shareWordButton");
          element.classList.toggle("material-symbols-rounded");
          element.classList.toggle("selected-material-symbol");
        }, 500); // Match the transition duration
      }, 1000); // Show for 2 seconds (including fade time)

    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      // Handle error
      const errorAlert = document.createElement('div');
      errorAlert.textContent = "Copy failed. Please try again.";
      document.body.appendChild(errorAlert);
      setTimeout(() => errorAlert.remove(), 3000);
    });
}


