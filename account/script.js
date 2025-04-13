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

        
        if (!userId) {
            console.error("No user ID provided");
            window.location.href = '/auth'; // Redirect to auth if no userId
        }

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
// UI Customization management
const customizeUIButton = document.getElementById('customizeUI');
const uiCustomizationModal = document.getElementById('uiCustomizationModal');
const cornerRadiusSelect = document.getElementById('cornerRadius');
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeSelect = document.getElementById('fontSize');
const textColorInput = document.getElementById('textColor');
const saveUISettingsButton = document.getElementById('saveUISettings');

// Load saved UI settings from localStorage


// active UI customization modal
customizeUIButton.addEventListener('click', () => {
    uiCustomizationModal.classList.add('active');
    playSound('pop');
});

// Close modal when clicking outside
uiCustomizationModal.addEventListener('click', (e) => {
    if (e.target === uiCustomizationModal) {
        uiCustomizationModal.classList.remove('active');

        playSound('pop');
    }
});

// Live preview font changes
fontFamilySelect.addEventListener('change', () => {
    const fontPreview = document.getElementById('fontPreview');
    fontPreview.style.fontFamily = `var(${fontFamilySelect.value})`;
});

// Corner radius example clicks
document.querySelectorAll('.corner-example').forEach(example => {
    example.addEventListener('click', () => {
        const style = example.style.borderRadius;
        const value = style === 'var(--corner-radius-sharp)' ? '--corner-radius-sharp' :
                     style === 'var(--corner-radius-subtle)' ? '--corner-radius-subtle' :
                     style === 'var(--corner-radius-modern)' ? '--corner-radius-modern' :
                     style === 'var(--corner-radius-smooth)' ? '--corner-radius-smooth' :
                     '--corner-radius-bubble';
        
        cornerRadiusSelect.value = value;
        document.documentElement.style.setProperty('--user-corner-radius', `var(${value})`);
        playSound('click');
    });
});

// Color preset handling
const colorPresets = document.querySelectorAll('.setting-group:not(:has(#accentColor)) .color-preset');
const accentPresets = document.querySelectorAll('.setting-group:has(#accentColor) .color-preset');
const backgroundColorInput = document.getElementById('backgroundColor');
const accentColorInput = document.getElementById('accentColor');

// Handle accent color presets
accentPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        document.documentElement.style.setProperty('--user-accent-color', color);
        document.documentElement.style.setProperty('--icon-color', color);
        
        // Update active state
        accentPresets.forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        
        // If it's a CSS variable, get its computed value for the color picker
        if (color.startsWith('var(')) {
            const computedColor = getComputedStyle(document.documentElement)
                .getPropertyValue(color.replace('var(', '').replace(')', ''))
                .trim();
            accentColorInput.value = convertRGBToHex(computedColor);
        } else {
            accentColorInput.value = color;
        }
        
        playSound('click');
    });
});

// Custom accent color input handling
accentColorInput.addEventListener('input', () => {
    document.documentElement.style.setProperty('--user-accent-color', accentColorInput.value);
    document.documentElement.style.setProperty('--icon-color', accentColorInput.value);
    accentPresets.forEach(p => p.classList.remove('active'));
});

colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        document.documentElement.style.setProperty('--user-background-color', color);
        
        // Update active state
        colorPresets.forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        
        // If it's a CSS variable, get its computed value for the color picker
        const computedColor = getComputedStyle(document.documentElement)
            .getPropertyValue(color.replace('var(', '').replace(')', ''))
            .trim();
        backgroundColorInput.value = convertRGBToHex(computedColor);
        
        playSound('click');
    });
});

// Helper function to convert RGB to Hex
function convertRGBToHex(rgb) {
    // Handle both rgb(r,g,b) and #hex formats
    if (rgb.startsWith('#')) return rgb;
    const rgbArr = rgb.match(/\d+/g);
    if (!rgbArr) return '#ffffff';
    const [r, g, b] = rgbArr;
    return '#' + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1);
}

// Live preview opacity changes
const opacityInput = document.getElementById('uiOpacity');
const opacityValue = document.getElementById('opacityValue');
opacityInput.addEventListener('input', () => {
    opacityValue.textContent = opacityInput.value + '%';
    document.documentElement.style.setProperty('--user-opacity', opacityInput.value / 100);
});

// Custom color input handling
backgroundColorInput.addEventListener('input', () => {
    document.documentElement.style.setProperty('--user-background-color', backgroundColorInput.value);
    colorPresets.forEach(p => p.classList.remove('active'));
});

// Save UI settings
saveUISettingsButton.addEventListener('click', async () => {
    const settings = {
        cornerRadius: cornerRadiusSelect.value,
        fontFamily: fontFamilySelect.value,
        fontSize: fontSizeSelect.value,
        textColor: textColorInput.value,
        backgroundColor: backgroundColorInput.value,
        accentColor: accentColorInput.value,
        uiOpacity: opacityInput.value / 100
    };
    
    // Apply settings
    document.documentElement.style.setProperty('--user-corner-radius', `var(${settings.cornerRadius})`);
    document.documentElement.style.setProperty('--user-font-family', `var(${settings.fontFamily})`);
    document.documentElement.style.setProperty('--user-font-size', `var(${settings.fontSize})`);
    document.documentElement.style.setProperty('--user-text-color', settings.textColor);
    document.documentElement.style.setProperty('--user-background-color', settings.backgroundColor);
    document.documentElement.style.setProperty('--user-opacity', settings.uiOpacity);
    
    // Save to Firebase profile
    try {
        const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
        const profile = profileData ? JSON.parse(profileData) : {};
        profile.uiSettings = settings;
        await setUserProfile(userId, JSON.stringify(profile));
        
        // Close modal and active success message
        uiCustomizationModal.classList.remove('active');
        playSound('success');
        
        const successToast = document.getElementById('successToast');
        successToast.classList.add('active');
        setTimeout(() => successToast.classList.remove('active'), 3000);
    } catch (error) {
        console.error('Error saving UI settings:', error);
        
        // active error message
        const errorToast = document.getElementById('errorToast');
        errorToast.classList.add('active');
        setTimeout(() => errorToast.classList.remove('active'), 3000);

        playSound('error');
    }
});

// Load settings from Firebase profile
async function loadUISettings() {
    const settings = JSON.parse(localStorage.getItem('uiSettings') || '{}');
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
                document.getElementById('fontPreview').style.fontFamily = `var(${settings.fontFamily})`;
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
                    // It's a preset color
                    const activePreset = document.querySelector(`[data-color="${settings.backgroundColor}"]`);
                    if (activePreset) {
                        colorPresets.forEach(p => p.classList.remove('active'));
                        activePreset.classList.add('active');
                        
                        // Update color picker with computed value
                        const computedColor = getComputedStyle(document.documentElement)
                            .getPropertyValue(settings.backgroundColor.replace('var(', '').replace(')', ''))
                            .trim();
                        backgroundColorInput.value = convertRGBToHex(computedColor);
                    }
                } else {
                    // It's a custom color
                    backgroundColorInput.value = settings.backgroundColor;
                    colorPresets.forEach(p => p.classList.remove('active'));
                }
            }

            // Handle accent color
            if (settings.accentColor) {
                document.documentElement.style.setProperty('--user-accent-color', settings.accentColor);
                document.documentElement.style.setProperty('--icon-color', settings.accentColor);
                
                // Handle both preset and custom colors for accent
                if (settings.accentColor.startsWith('var(')) {
                    // It's a preset color
                    const activePreset = document.querySelector(`[data-color="${settings.accentColor}"]`);
                    if (activePreset) {
                        accentPresets.forEach(p => p.classList.remove('active'));
                        activePreset.classList.add('active');
                        
                        // Update color picker with computed value
                        const computedColor = getComputedStyle(document.documentElement)
                            .getPropertyValue(settings.accentColor.replace('var(', '').replace(')', ''))
                            .trim();
                        accentColorInput.value = convertRGBToHex(computedColor);
                    }
                } else {
                    // It's a custom color
                    accentColorInput.value = settings.accentColor;
                    accentPresets.forEach(p => p.classList.remove('active'));
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
loadUISettings();

        const themeToggle = document.getElementById('themeToggle');
        let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        themeToggle.addEventListener('click', () => {
            darkMode = !darkMode;
            document.documentElement.classList.toggle('dark-mode', darkMode);
            playSound('click');
        });

        // Theme toggle listener
        themeToggle.addEventListener('click', () => {
            darkMode = !darkMode;
            document.documentElement.classList.toggle('dark-mode', darkMode);
            playSound('click');
        });

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