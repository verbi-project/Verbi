const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
// Import necessary functions from firebase.js
import {
    setUserWordList,
    getUserWordList,
    setUserProfile,
    getUserProfile,
    userProfile,
    getUserCollections,
    setUserCollections,
    initializeUserData,
} from "/Global/firebase.js";

// Initialize variables
let dictionary = []; // Array to store dictionary data
let wordList = []; // Array to store the current word list
let place = 0; // Index of the current word being displayed
let favoriteWords = JSON.parse(localStorage.getItem("favoriteWords") || "[]");
let localFavoriteWordsCache = [...favoriteWords]; // Initialize local cache
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";
let collections = JSON.parse(localStorage.getItem("collections") || "[]");

// Sound effects
const sounds = {
    pop: new Audio("/sounds/pop.mp3"),
    click: new Audio("/sounds/click.mp3"),
    success: new Audio("/sounds/success.mp3"),
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
    console.log("euuuddd");
    await loadUserPreferences(); // Make sure this is awaited
    initializeUserData();
    // Initialize the word list
    await start();

    // Setup event listeners
    setupEventListeners();
// Add initial words to the word list (if no index parameter or after fetching specific word)
    for (let i = 0; i < 9; i++) {
        addWordToStack();
    }
    selectAndDisplayWord('f')
}

async function loadUserPreferences() {
    // Load dark/light mode preference
    const darkMode = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark-mode", darkMode);

    // Check profile.json for customBackgroundURL in Firebase Storage
    if (userId) {
        try {
            const profileData = await getUserProfile(userId, (profileData)=> {
              if (profileData) {
                try {
                    const profile = JSON.parse(profileData);
                    if (profile && profile.customBackgroundURL) {
                        const backgroundImageElement = document.getElementById("backgroundImage");
                        if (backgroundImageElement) {
                            backgroundImageElement.src = profile.customBackgroundURL;
                            // Update localStorage to cache it for subsequent loads
                            localStorage.setItem("customBackground", profile.customBackgroundURL);
                        }
                    } else {
                        // If not found in Firebase, check localStorage as a fallback
                        const customBackground = localStorage.getItem("customBackground");
                        if (customBackground) {
                            document.getElementById("backgroundImage").src = customBackground;
                        }
                    }
                } catch (error) {
                    console.error("Error parsing profile data:", error);
                    // If parsing fails, you might want to check localStorage as a fallback
                    const customBackground = localStorage.getItem("customBackground");
                    if (customBackground) {
                        document.getElementById("backgroundImage").src = customBackground;
                    }
                }
            } else {
                // If profile data is not found in Firebase, check localStorage as a fallback
                const customBackground = localStorage.getItem("customBackground");
                if (customBackground) {
                    document.getElementById("backgroundImage").src = customBackground;
                }
            }
            });
            
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // If there's an error fetching, you might want to check localStorage as a fallback
            const customBackground = localStorage.getItem("customBackground");
            if (customBackground) {
                document.getElementById("backgroundImage").src = customBackground;
            }
        }
    } else {
        // If no userId, fallback to localStorage
        const customBackground = localStorage.getItem("customBackground");
        if (customBackground) {
            document.getElementById("backgroundImage").src = customBackground;
        }
    }
}

function setupEventListeners() {
    // Word interaction buttons
    document.getElementById("goBackButton").addEventListener("click", () => {
        selectAndDisplayWord("p");
    });

    document.getElementById("goForwardButton").addEventListener("click", () => {
        selectAndDisplayWord("f");
    });

    // Favorite button
    document
        .getElementById("favorateWordButton")
        .addEventListener("click", () => {
            toggleFavoriteWord();
            playSound("pop");
        });

    // Speaker button
    document.getElementById("speakerButton").addEventListener("click", () => {
        speakWord();
        playSound("click");
    });

    // Share button
    document.getElementById("shareWordButton").addEventListener("click", () => {
        copyAndShowAlert();
    });

    // Collection button
    document
        .getElementById("addToCollectionButton")
        .addEventListener("click", () => {
            showCollectionModal();
            playSound("click");
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
    return getRandomWord((word) => {
        wordList.push(word); // Add the fetched word to the wordList array
        console.log(word); // Log the fetched word to the console
        callback(word); // Call the callback function with the added word
    });
}



// Asynchronous function to start the application
async function start() {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;

    if (userId) {
        try {
            // Initialize user data structures
            await initializeUserData(userId);

            // Load and merge favorites
            await getUserWordList(userId, (data) => {
                if (data) {
                    const firebaseWords = JSON.parse(data);
                    const localWords = JSON.parse(
                        localStorage.getItem("favoriteWords") || "[]"
                    );

                    // Merge and deduplicate
                    const mergedWords = [...firebaseWords, ...localWords].reduce(
                        (acc, word) => {
                            if (!acc.some((w) => w.word === word.word)) {
                                acc.push(word);
                            }
                            return acc;
                        },
                        []
                    );

                    favoriteWords = mergedWords;
                    localFavoriteWordsCache = [...mergedWords]; // Initialize local cache with merged data
                } else {
                    localFavoriteWordsCache = [...favoriteWords]; // Initialize local cache from localStorage if no Firebase data
                }
            });

            // Load and merge collections
            await getUserCollections(userId, (data) => {
                if (data) {
                    const firebaseCollections = JSON.parse(data);
                    const localCollections = JSON.parse(
                        localStorage.getItem("collections") || "[]"
                    );

                    // Merge and deduplicate
                    const mergedCollections = [
                        ...firebaseCollections,
                        ...localCollections,
                    ].reduce((acc, collection) => {
                        if (!acc.some((c) => c.id === collection.id)) {
                            acc.push(collection);
                        }
                        return acc;
                    }, []);

                    collections = mergedCollections;
                    localStorage.setItem(
                        "collections",
                        JSON.stringify(mergedCollections)
                    );
                    setUserCollections(userId, mergedCollections);
                }
            });
        } catch (error) {
            console.error("Error syncing data:", error);
            showAlert("Error syncing your data");
        }
    } else {
        localFavoriteWordsCache = [...favoriteWords]; // Initialize local cache from localStorage if no user ID
    }

    // Check if the URL has an "index" parameter
    if (hasIndexParameter()) {
        var index = new URLSearchParams(window.location.search).get("index");
        // Fetch a specific word from the API based on the index
        await fetch(
            "https://verbi-three.vercel.app/api/get-word?index=" + index.toString()
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((word) => {
                wordList[0] = word; // Set the first word in the list to the fetched word
                populateUI(word); // Populate the UI with the fetched word
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    } else {
        addWordToStack(populateUI);
    }


}

// Function to check if a word is in the user's favorite word list
async function containsWord(wordToCheck) {
    if (!userId) {
        console.log("User ID is not available.");
        return false; // Return false if no user ID
    }
    return localFavoriteWordsCache.some((favWord) => favWord.word === wordToCheck);
}

// Function to populate the UI with word information
function populateUI(wordObject) {
    // Reset speaker state
    endSpeaker();
    const speakerBtn = document.getElementById("speakerButton");
    speakerBtn.classList.add("material-symbols-rounded");
    speakerBtn.classList.remove("selected-material-symbol");

    // Prepare new content
    const newWord = `${wordObject.word[0].toUpperCase()}${wordObject.word
        .slice(1)
        .toLowerCase()}`;
    const newDef = `${wordObject.def[0].toUpperCase()}${wordObject.def
        .slice(1)
        .toLowerCase()}`;
    const newSyllables = splitIntoSyllables(wordObject.word);

    // Animate out current content
    ["word", "def", "partOfSpeech", "syllables"].forEach((id) => {
        const element = document.getElementById(id);
        element.style.opacity = "0";
        element.style.transform = "translateY(-10px)";
        element.style.transition = "all 0.2s ease-out";
    });

    // Update and animate in new content
    setTimeout(() => {
        document.getElementById("word").textContent = newWord;
        document.getElementById("def").textContent = newDef;
        document.getElementById("partOfSpeech").textContent = "";
        document.getElementById("syllables").textContent = newSyllables;

        ["word", "def", "partOfSpeech", "syllables"].forEach((id) => {
            const element = document.getElementById(id);
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        });

        playSound("click");
    }, 200);

    // Update favorite button state
    const favoriteBtn = document.getElementById("favorateWordButton");

    // Clear existing classes
    favoriteBtn.className = "";

    // Add appropriate class based on favorite status
    containsWord(wordObject.word).then((isFavorite) => {
        if (isFavorite) {
            favoriteBtn.classList.add("selected-material-symbol");
            favoriteBtn.style.color = "var(--user-background-color)";
        } else {
            favoriteBtn.classList.add("material-symbols-rounded");
        }
    });

    // Initialize collections if not already done
    if (userId) {
        getUserCollections(userId, (data) => {
            if (data) {
                collections = JSON.parse(data);
            }
        });
    }
}

// Function to get the next word in the list (or previous if direction is not "forward")
function getNextWord(direction) {
    console.log("e");
    if (direction == "forward" || direction == "f") {
        if (place + 1 == wordList.length) {
            console.log("generating new word");
            addWordToStack();

            return wordList[place];
        } else {
            return wordList[place];
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
function selectAndDisplayWord(direction = "f") {
    console.log(wordList.length);
    console.log(place);
    if (direction === "f" || direction === "forward") {
        console.log("ss");
        if (place <= 1 && wordList.length >= 10) {
            //		place = wordList.length - 1;

            getNextWord(direction);
        }
        place++;
    } else {
        place = Math.max(0, place - 1);
    }
    playSound("click");
    const nextWord = getNextWord(direction);
console.log(nextWord)
    populateUI(nextWord);
}

// Event listener for keyboard input (space and arrow keys)
document.addEventListener("keyup", (event) => {
    if (event.code === "Space" || event.code === "ArrowDown") {
        selectAndDisplayWord("f");
    }
    if (event.code === "ArrowUp") {
        selectAndDisplayWord("p");
    }
});

// Swipe detection
detectswipe("body", (el, direction) => {
    if (direction === "l") {
        selectAndDisplayWord("f");
    } else if (direction === "r") {
        selectAndDisplayWord("p");
    }
});

// Function to toggle the favorite status of the current word
async function toggleFavoriteWord() {
    const currentWord = wordList[place];
    const element = document.getElementById("favorateWordButton");

    if (!userId) {
        showAlert("Please login to save favorites");
        return;
    }

    const wordData = {
        word: currentWord.word,
        def: currentWord.def,
        partOfSpeech: currentWord.partOfSpeech || "",
        timestamp: Date.now(),
    };

    try {
        const isCurrentlyFavorited = localFavoriteWordsCache.some(
            (word) => word.word === wordData.word
        );

        if (!isCurrentlyFavorited) {
            // Add to favorites
            localFavoriteWordsCache.push(wordData);
            playSound("success");
            showAlert("Added to favorites");
            element.classList.remove("material-symbols-rounded");
            element.classList.add("selected-material-symbol");
            element.style.color = "var(--user-background-color)";
        } else {
            // Remove from favorites
            localFavoriteWordsCache = localFavoriteWordsCache.filter(
                (word) => word.word !== currentWord.word
            );
            showAlert("Removed from favorites");
            element.classList.remove("selected-material-symbol");
            element.classList.add("material-symbols-rounded");
            element.style.color = ""; // Revert to default color
            playSound("pop");
        }

        // Update both storages
        localStorage.setItem("favoriteWords", JSON.stringify(localFavoriteWordsCache));
        setUserWordList(userId, JSON.stringify(localFavoriteWordsCache));
        console.log("Local favorite words cache:", localFavoriteWordsCache);
    } catch (error) {
        console.error("Error updating favorites:", error);
        showAlert("Failed to update favorites");
        playSound("pop");
    }
}

// Initialize the app
async function initApp() {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (userId) {
        // Initialize user data
        await initializeUserData(userId);

        // Load collections
        getUserCollections(userId, (data) => {
            if (data) {
                collections = JSON.parse(data);
            }
        });

        // Load favorites (already handled in start())
    }

    start();
}

// Start the application
initApp();

// Function to speak the current word and def
const speakWord = () => {
    var element = document.getElementById("speakerButton");

    if (window.speechSynthesis.speaking) {
        endSpeaker(); // Stop ongoing speech
        return;
    }

    element.classList.remove("material-symbols-rounded");
    element.classList.add("selected-material-symbol");
    window.speechSynthesis.cancel(); // Cancel any queued speech

    const wordUtterance = new SpeechSynthesisUtterance(
        document.getElementById("word").textContent
    );
    const defUtterance = new SpeechSynthesisUtterance(
        document.getElementById("def").textContent
    );

    window.speechSynthesis.speak(wordUtterance);
    window.speechSynthesis.speak(defUtterance);

    defUtterance.onend = () => {
        element.classList.add("material-symbols-rounded");
        element.classList.remove("selected-material-symbol");
    };
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
    const shareword = `${currentWord.word} - ${currentWord.partOfSpeech}\n${currentWord.def}\n\nShared from Verbi`;

    const alert = document.createElement("div");
    alert.className = "alert glass-morphism";

    navigator.clipboard
        .writeText(shareword)
        .then(() => {
            alert.innerHTML =
                '<span class="material-symbols-rounded">check_circle</span> Word copied!';
            playSound("success");

            const shareBtn = document.getElementById("shareWordButton");
            shareBtn.classList.add("selected-material-symbol");

            setTimeout(() => {
                shareBtn.classList.remove("selected-material-symbol");
            }, 1000);
        })
        .catch(() => {
            alert.innerHTML =
                '<span class="material-symbols-rounded">error</span> Failed to copy';
            playSound("pop");
        });

    document.body.appendChild(alert);
    setTimeout(() => {
        alert.classList.add("fade-out");
        setTimeout(() => alert.remove(), 300);
    }, 2000);
}

async function addToCollection(collectionId) {
    const currentWord = wordList[place];
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;

    if (!userId) {
        showAlert("Please login to use collections");
        return;
    }

    const wordData = {
        word: currentWord.word,
        def: currentWord.def,
        partOfSpeech: currentWord.partOfSpeech || "",
    };

    try {
        // Find the collection and add the word
        const collection = collections.find((c) => c.id === collectionId);
        if (collection) {
            if (!collection.words.some((w) => w.word === wordData.word)) {
                collection.words.push(wordData);

                // Update both storages
                localStorage.setItem("collections", JSON.stringify(collections));
                await setUserCollections(userId, collections);

                const modalsToRemove = document.querySelectorAll(".modal.active");
                modalsToRemove.forEach((modal) => {
                    modal.remove();
                });
                playSound("success");
                showAlert("Word added to collection");
            } else {
                showAlert("Word already in collection");
                playSound("pop");
            }
        }
    } catch (error) {
        console.error("Error adding to collection:", error);
        showAlert("Failed to add to collection");
        playSound("pop");
    }
}

function showCollectionModal() {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;

    if (!userId) {
        showAlert("Please login to use collections");
        return;
    }

    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.innerHTML = `
        <div class="modal-content glass-morphism">
            <h3>Add to Collection</h3>
            <div class="collections-list">
                ${
                    collections.length
                        ? collections
                              .map(
                                  (collection) => `
                    <button class="collection-item" dataid="${collection.id}">
                        <span class="material-symbols-rounded">collections_bookmark</span>
                        <span>${collection.name}</span>
                        <span class="word-count">${
                            collection.words?.length || 0
                        } words</span>
                    </button>
                `
                              )
                              .join("")
                        : '<p class="empty-state">No collections yet. Create your first collection!</p>'
                }
            </div>
            <button class="btn" id="createNewCollection">
                <span class="material-symbols-rounded">add</span>
                Create New Collection
            </button>
        </div>
    `;

    // Add collection list styles
    const style = document.createElement("style");
    style.textContent = `
        .collections-list { max-height: 300px; overflow-y: auto; }
        .collection-item { width: 100%; justify-content: space-between; }
        .word-count { font-size: 0.9em; opacity: 0.7; }
        .empty-state { text-align: center; opacity: 0.7; padding: 2rem; }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Add event listeners
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    modal.querySelectorAll(".collection-item").forEach((button) => {
        button.addEventListener("click", () => {
            addToCollection(button.dataset.dataid);
            modal.remove();
        });
    });

    modal.querySelector("#createNewCollection").addEventListener("click", () => {
        showCreateCollectionModal();
        modal.remove();
    });
}

async function showCreateCollectionModal() {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;

    if (!userId) {
        showAlert("Please login to create collections");
        return;
    }

    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.innerHTML = `
        <div class="modal-content glass-morphism">
            <h3>Create New Collection</h3>
            <input type="text" class="input" placeholder="Collection Name" />
            <button class="btn" id="saveCollection">Create</button>
        </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector("input");
    const saveBtn = modal.querySelector("#saveCollection");

    saveBtn.addEventListener("click", async () => {
        const name = input.value.trim();
        if (name) {
            try {
                const newCollection = {
                    id: Date.now().toString(),
                    name,
                    words: [],
                    timestamp: Date.now(),
                };

                collections.push(newCollection);

                // Update both storages
                localStorage.setItem("collections", JSON.stringify(collections));
                await setUserCollections(userId, collections);

                // Add current word if exists
                if (wordList[place]) {
                    await addToCollection(newCollection.id);
                }

                modal.remove();
                playSound("success");
                showAlert("Collection created");
            } catch (error) {
                console.error("Error creating collection:", error);
                showAlert("Failed to create collection");
                playSound("pop");
            }
        }
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.remove();
            playSound("pop");
        }
    });
}

// Add collection button to word buttons
document.getElementById("wordButtons").innerHTML += `
    <span class="material-symbols-rounded" id="addToCollectionButton">
        collections_bookmark
    </span>
`;

document
    .getElementById("addToCollectionButton")
    .addEventListener("click", () => {
        showCollectionModal();
        playSound("click");
    });

// Alert function for feedback
function showAlert(message) {
    const alert = document.createElement("div");
    alert.className = "alert glass-morphism";
    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add("fade-out");
        setTimeout(() => alert.remove(), 300);
    }, 2000);
}

// Function to toggle the favorite status of the current word (now direct add/remove)
async function toggleFavorite() {
    toggleFavoriteWord();
}

// Function to share the current word (implementation needed)
function shareWord() {
    const currentWord = wordList[place];
    const shareword = `Check out this word on Verbi: ${currentWord.word} - ${currentWord.def}`;
    // You would typically use the Web Share API here if supported
    if (navigator.share) {
        navigator
            .share({
                title: "Verbi Word",
                text: shareword,
                url: window.location.href, // Or a specific link to the word if you have one
            })
            .then(() => console.log("Successful share"))
            .catch((error) => console.log("Error sharing", error));
    } else {
        // Fallback for browsers that don't support the Web Share API
        copyAndShowAlert(); // As a fallback, copy the word
        showAlert("Link copied to clipboard (Sharing API not supported)");
    }
}