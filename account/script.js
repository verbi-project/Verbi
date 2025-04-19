// Import necessary functions from your local firebase.js file
        import {
            setUserWordList,
            getUserWordList,
            setUserProfile,
            getUserProfile,
            userProfile,
            getUserCollections,
            setUserCollections,
            initializeUserData, firebaseConfig
        } from "/Global/firebase.js";
        // Get userId from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;

        
       

        document.addEventListener('DOMContentLoaded', function() {
            const profileNameElement = document.querySelector('.profile-name');
            
            // Get profile directly from Firebase
            getUserProfile(userId, (profileData) => {
                if (profileData) {
                    try {
                        const userProfile = JSON.parse(profileData);
                        if (userProfile && userProfile.username) {
                            profileNameElement.textContent = userProfile.username;
                        } else {
                            console.warn("Username not found in profile");
                            profileNameElement.textContent = "User";
                        }
                    } catch (error) {
                        console.error("Error parsing profile data:", error);
                        profileNameElement.textContent = "User";
                    }
                } else {
                    console.warn("No profile data found for user");
                    profileNameElement.textContent = "User";
                }
            });
        });
        // Sound effects management
        const sounds = {
            pop: document.getElementById('popSound'),
            click: document.getElementById('clickSound'),
            success: document.getElementById('successSound')
        };

        let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

        function playSound(soundName) {
            if (soundEnabled && sounds[soundName]) {
                sounds[soundName].currentTime = 0;
                sounds[soundName].play();
            }
        }

        // Theme management

// Helper function to convert RGB to Hex
function convertRGBToHex(rgb) {
    // Handle both rgb(r,g,b) and #hex formats
    if (rgb.startsWith('#')) return rgb;
    const rgbArr = rgb.match(/\d+/g);
    if (!rgbArr) return '#ffffff';
    const [r, g, b] = rgbArr;
    return '#' + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1);
}

async function loadUISettings() {
  const cornerRadiusSelect = document.getElementById('cornerRadius');
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeSelect = document.getElementById('fontSize');
const textColorInput = document.getElementById('textColor');
const backgroundColorInput = document.getElementById('backgroundColor');
const accentColorInput = document.getElementById('accentColor');
const opacityInput = document.getElementById('uiOpacity');
const opacityValue = document.getElementById('opacityValue');
const saveUISettingsButton = document.getElementById('saveUISettings');
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (!userId) return;

    try {
        const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
        if (profileData) {
            const profile = JSON.parse(profileData);
            const settings = profile.uiSettings || {};

            // Apply settings if they exist
            if (settings.cornerRadius) {
                document.documentElement.style.setProperty('--user-corner-radius', `var(${settings.cornerRadius})`);
                cornerRadiusSelect.value = settings.cornerRadius;
            }
            if (settings.fontFamily) {
                document.documentElement.style.setProperty('--user-font-family', `var(${settings.fontFamily})`);
                fontFamilySelect.value = settings.fontFamily;
            }
            if (settings.fontSize) {
                document.documentElement.style.setProperty('--user-font-size', `var(${settings.fontSize})`);
                fontSizeSelect.value = settings.fontSize;
            }
            if (settings.textColor) {
                document.documentElement.style.setProperty('--user-text-color', settings.textColor);
                textColorInput.value = settings.textColor;
            }
            if (settings.backgroundColor) {
                document.documentElement.style.setProperty('--user-background-color', settings.backgroundColor);
                
                // Handle both preset and custom colors for background
                if (settings.backgroundColor.startsWith('var(--bg-color-')) {
                    const activePreset = document.querySelector(`[data-color="${settings.backgroundColor}"]`);
                    if (activePreset) {
                        activePreset.classList.add('active');
                        
                        const computedColor = getComputedStyle(document.documentElement)
                            .getPropertyValue(settings.backgroundColor.replace('var(', '').replace(')', ''))
                            .trim();
                        backgroundColorInput.value = convertRGBToHex(computedColor);
                    }
                } else {
                    backgroundColorInput.value = settings.backgroundColor;
                }
            }
            if (settings.accentColor) {
                document.documentElement.style.setProperty('--user-accent-color', settings.accentColor);
                document.documentElement.style.setProperty('--icon-color', settings.accentColor);
                
                if (settings.accentColor.startsWith('var(')) {
                    const activePreset = document.querySelector(`[data-color="${settings.accentColor}"]`);
                    if (activePreset) {
                        activePreset.classList.add('active');
                        
                        const computedColor = getComputedStyle(document.documentElement)
                            .getPropertyValue(settings.accentColor.replace('var(', '').replace(')', ''))
                            .trim();
                        accentColorInput.value = convertRGBToHex(computedColor);
                    }
                } else {
                    accentColorInput.value = settings.accentColor;
                }
            }
            if (settings.uiOpacity !== undefined) {
                document.documentElement.style.setProperty('--user-opacity', settings.uiOpacity);
                opacityInput.value = settings.uiOpacity * 100;
                opacityValue.textContent = Math.round(settings.uiOpacity * 100) + '%';
            }
        }
    } catch (error) {
        console.error('Error loading UI settings:', error);
    }
}
// Load settings on page load
loadUISettings()
loadUserPreferences()
async function loadBackground() {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (!userId) return;

    try {
        const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
        if (profileData) {
            const profile = JSON.parse(profileData);
            if (profile.backgroundImage) {
              var currentBackground = document.getElementById("backgroundImage");
                currentBackground.src = profile.backgroundImage;
                document.body.style.backgroundImage = `url(${profile.backgroundImage})`;
            }
        }
    } catch (error) {
        console.error('Error loading background:', error);
    }
}
loadBackground()

async function loadUserPreferences() {
  // Load dark/light mode preference
  console.log(":s")
  var darkMode = localStorage.getItem("darkMode") === "true";
  document.documentElement.classList.toggle("dark-mode", darkMode);
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;

  // Check profile.json for customBackgroundURL in Firebase Storage
  if (userId) {
    try {
      var profileData = await getUserProfile(userId, (profileData) => {
        
        if (profileData) {
          try {
           
            var profile = JSON.parse(profileData);
            if (profile.backgroundImage) {
         
              var backgroundImageElement =
                document.getElementById("backgroundImage");
              if (backgroundImageElement) {
                     
                backgroundImageElement.src = profile.backgroundImage;
                console.log(backgroundImageElement)
                // Update localStorage to cache it for subsequent loads
                localStorage.setItem(
                  "customBackground",
                  profile.backgroundImage
                );
              }
            } else {
              // If not found in Firebase, check localStorage as a fallback
              var customBackground = localStorage.getItem("USER_PROFILE").uiSettings.backgroundImage;
              if (customBackground) {
                document.getElementById("backgroundImage").src =
                  customBackground;
              }
            }
          } catch (error) {
            console.error("Error parsing profile data:", error);
            // If parsing fails, you might want to check localStorage as a fallback
            var customBackground = localStorage.getItem("USER_PROFILE").uiSettings.backgroundImage;
            if (customBackground) {
              document.getElementById("backgroundImage").src = customBackground;
            }
          }
        } else {
          // If profile data is not found in Firebase, check localStorage as a fallback
          var customBackground = localStorage.getItem("USER_PROFILE").uiSettings.backgroundImage;
          if (customBackground) {
            document.getElementById("backgroundImage").src = customBackground;
          }
        }
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If there's an error fetching, you might want to check localStorage as a fallback
      var customBackground = localStorage.getItem("USER_PROFILE").uiSettings.backgroundImage;
      if (customBackground) {
        document.getElementById("backgroundImage").src = customBackground;
      }
    }
  } else {
    // If no userId, fallback to localStorage
    var customBackground = localStorage.getItem("USER_PROFILE").uiSettings.backgroundImage;
    if (customBackground) {
      document.getElementById("backgroundImage").src = customBackground;
    }
  }
}

        

        // Collection management
        const collectionModal = document.getElementById('collectionModal');
        const collectionsGrid = document.getElementById('collections');
        let collections = []; // Initialize as an empty array

        function createCollectionCard(collection) {
            const card = document.createElement('div');
            card.className = 'collection-card';
            card.innerHTML = `
                <span class="material-symbols-rounded">collections_bookmark</span>
                <h3>${collection.name}</h3>
                <p>${collection.words.length} words</p>
            `;
            card.addEventListener('click', () => {
                openCollectionDetailModal(collection);
                playSound('click');
            });
            return card;
        }

        function updateCollectionsDisplay() {
            collectionsGrid.innerHTML = '';
            collections.forEach(collection => {
                collectionsGrid.appendChild(createCollectionCard(collection));
            });
            document.getElementById('collectionsCount').textContent = collections.length;
        }

        document.getElementById('createCollection').addEventListener('click', () => {
            collectionModal.classList.add('active');
            playSound('click');
        });

        document.getElementById('saveCollection').addEventListener('click', () => {
            const input = collectionModal.querySelector('input');
            const name = input.value.trim();
            if (name) {
                const newCollection = { name, words: [] , id: Date.now().toString()};
                collections.push(newCollection);
                localStorage.setItem('collections', JSON.stringify(collections));
                setUserCollections(userId, collections)
                updateCollectionsDisplay();
                collectionModal.classList.remove('active');
                input.value = '';
                playSound('success');
            }
        });

        // Collection Detail Modal
        function openCollectionDetailModal(collection) {
            const modal = document.createElement('div');
            modal.className = 'modal active collection-detail-modal';
            modal.innerHTML = `
                <div class="modal-content glass-morphism">
                    <div class="modal-header">
                        <h3>${collection.name}</h3>
                        <button class="close-modal-btn icon-btn">
                            <span class="material-symbols-rounded">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <ul class="collection-words-list">
                            ${collection.words.map((word, index) => `
                                <li class="collection-word-item">
                                    <span>${word.word}</span>
                                    <p>${word.def}</p>
                                    <button class="icon-btn remove-from-collection" data-collection-id="${collection.id}" data-word-text="${word.word}">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                </li>
                            `).join('')}
                            ${collection.words.length === 0 ? '<p class="empty-collection">This collection is empty.</p>' : ''}
                        </ul>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.close-modal-btn').addEventListener('click', () => {
                modal.remove();
                playSound('pop');
            });

            modal.querySelectorAll('.remove-from-collection').forEach(button => {
                button.addEventListener('click', () => {
                    const collectionId = button.dataset.collectionId;
                    const wordToRemove = button.dataset.wordText;
                    removeWordFromCollection(collectionId, wordToRemove);
                    modal.remove(); // Close the modal after removing the word
                    playSound('pop');
                });
            });

            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('collection-detail-modal')) {
                    modal.remove();
                    playSound('pop');
                }
            });
        }

        function removeWordFromCollection(collectionId, wordTextToRemove) {
            getUserCollections(userId, (firebaseCollections) => {
                console.log("GGGG");
                if (firebaseCollections) {
                    const parsedCollections = JSON.parse(firebaseCollections);
                    const collectionIndex = parsedCollections.findIndex(c => c.id === collectionId);
                    console.log(collectionIndex);
                    if (collectionIndex !== -1) {
                        const initialLength = parsedCollections[collectionIndex].words.length;
                        parsedCollections[collectionIndex].words = parsedCollections[collectionIndex].words.filter(word => word.word !== wordTextToRemove);
                        if (parsedCollections[collectionIndex].words.length < initialLength) {
                            localStorage.setItem('collections', JSON.stringify(parsedCollections));
                            console.log(parsedCollections);
                            setUserCollections(userId, parsedCollections);
                            // Update the local 'collections' variable to reflect the change
                            collections = parsedCollections;
                            updateCollectionsDisplay(); // Update the main collection cards

                            // Check if the collection is now empty and delete it if so
                            if (parsedCollections[collectionIndex].words.length === 0) {
                                const updatedCollections = parsedCollections.filter(collection => collection.id !== collectionId);
                                localStorage.setItem('collections', JSON.stringify(updatedCollections));
                                setUserCollections(userId, updatedCollections);
                                collections = updatedCollections;
                                updateCollectionsDisplay();
                                playSound('success');
                            }
                        }
                    }
                }
            });
        }
        function deleteCollection(collectionIdToDelete) {
            getUserCollections(userId, (firebaseCollections) => {
                if (firebaseCollections) {
                    const parsedCollections = JSON.parse(firebaseCollections);
                    const updatedCollections = parsedCollections.filter(collection => collection.id !== collectionIdToDelete);
                    localStorage.setItem('collections', JSON.stringify(updatedCollections));
                    setUserCollections(userId, updatedCollections);
                    collections = updatedCollections;
                    updateCollectionsDisplay();
                    playSound('success');
                }
            });
        }

        // Favorite words management
        const favoriteWordsGrid = document.getElementById('favoriteWords');
        var favoriteWords = []
        getUserWordList(userId, (favorite_words)=> {
            if (favorite_words) {
                favoriteWords = JSON.parse(favorite_words)
                updateFavoritesDisplay()
            }
        })
        console.log(favoriteWords)

        // Add to Collection functionality
        let addToCollectionModal = document.getElementById('addToCollectionModal');
        if (!addToCollectionModal) {
            addToCollectionModal = document.createElement('div');
            addToCollectionModal.id = 'addToCollectionModal';
            addToCollectionModal.className = 'modal';
            addToCollectionModal.innerHTML = `
                <div class="modal-content glass-morphism">
                    <div class="modal-header">
                        <h3>Add to Collection</h3>
                        <button class="close-modal-btn icon-btn">
                            <span class="material-symbols-rounded">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Select a collection:</p>
                        <select id="collectionSelector"></select>
                        <button id="addToCollectionButton" class="button">Add</button>
                    </div>
                </div>
            `;
            document.body.appendChild(addToCollectionModal);

            addToCollectionModal.querySelector('.close-modal-btn').addEventListener('click', () => {
                addToCollectionModal.classList.remove('active');
                playSound('pop');
            });

            addToCollectionModal.addEventListener('click', (e) => {
                if (e.target === addToCollectionModal) {
                    addToCollectionModal.classList.remove('active');
                    playSound('pop');
                }
            });

            document.getElementById('addToCollectionButton').addEventListener('click', () => {
                const selectedCollectionId = document.getElementById('collectionSelector').value;
                const wordToAdd = JSON.parse(localStorage.getItem('currentWordToAdd'));
                if (selectedCollectionId && wordToAdd) {
                    addWordToCollection(selectedCollectionId, wordToAdd);
                    addToCollectionModal.classList.remove('active');
                    localStorage.removeItem('currentWordToAdd');
                    playSound('success');
                } else {
                    alert('Please select a collection.');
                }
            });
        }

        function populateCollectionSelector(word) {
            const selector = document.getElementById('collectionSelector');
            selector.innerHTML = ''; // Clear previous options
            collections.forEach(collection => {
                const option = document.createElement('option');
                option.value = collection.id;
                option.textContent = collection.name;
                selector.appendChild(option);
            });
            localStorage.setItem('currentWordToAdd', JSON.stringify(word));
        }

        function addWordToCollection(collectionId, wordToAdd) {
            getUserCollections(userId, (firebaseCollections) => {
                if (firebaseCollections) {
                    const parsedCollections = JSON.parse(firebaseCollections);
                    const collectionIndex = parsedCollections.findIndex(c => c.id === collectionId);
                    if (collectionIndex > -1) {
                        const isWordAlreadyAdded = parsedCollections[collectionIndex].words.some(word => word.word === wordToAdd.word);
                        if (!isWordAlreadyAdded) {
                            parsedCollections[collectionIndex].words.push(wordToAdd);
                            localStorage.setItem('collections', JSON.stringify(parsedCollections));
                            setUserCollections(userId, parsedCollections);
                            collections = parsedCollections;
                            updateCollectionsDisplay();
                        } else {
                            alert('Word already exists in this collection.');
                        }
                    }
                }
            });
        }

        function createWordCard(word) {
            const card = document.createElement('div');
            card.className = 'word-card';
            card.innerHTML = `
                <h3>${word.word}</h3>
                <p>${word.def}</p>
                <div class="word-actions">
                    <button class="icon-btn remove-favorite">
                        <span class="material-symbols-rounded">favorite</span>
                    </button>
                    <button class="icon-btn add-to-collection" data-word='${JSON.stringify(word).replace(/'/g, "&#39;")}' >
                        <span class="material-symbols-rounded">add_to_photos</span>
                    </button>
                </div>
            `;

            card.querySelector('.remove-favorite').addEventListener('click', () => {
                favoriteWords = favoriteWords.filter(w => w.word !== word.word);
                localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
                setUserWordList(userId, favoriteWords)
                updateFavoritesDisplay();
                playSound('pop');
            });

            const addToCollectionButton = card.querySelector('.add-to-collection');
            addToCollectionButton.addEventListener('click', (event) => {
                const wordData = JSON.parse(event.currentTarget.dataset.word);
                populateCollectionSelector(wordData);
                addToCollectionModal.classList.add('active');
                playSound('click');
            });

            return card;
        }

        function updateFavoritesDisplay() {
            favoriteWordsGrid.innerHTML = '';
            console.log(favoriteWords)
            favoriteWords.forEach(word => {
                favoriteWordsGrid.appendChild(createWordCard(word));
            });
            document.getElementById('favoritesCount').textContent = favoriteWords.length;
        }

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    playSound('pop');
                }
            });
        });

        // Back button functionality
        document.querySelector('.back-button').addEventListener('click', () => {
            playSound('click');
            window.history.back();
        });

        // Sound effects toggle
        document.getElementById('soundEffects').addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('soundEnabled', soundEnabled);
            playSound('click');
        });

        // Initialize
        loadSavedBackground();
        // Fetch collections from Firebase and then update display
        getUserCollections(userId, (firebaseCollections) => {
            if (firebaseCollections) {
                collections = JSON.parse(firebaseCollections);
                localStorage.setItem('collections', JSON.stringify(collections)); // Update local storage as well
            } else {
                // If no collections in Firebase, use local storage data
                collections = JSON.parse(localStorage.getItem('collections') || '[]');
            }
            updateCollectionsDisplay();
        });
        updateFavoritesDisplay();

        // Animation on load
        document.body.classList.add('loaded');