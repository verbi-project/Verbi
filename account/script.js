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
        const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
        document.addEventListener('DOMContentLoaded', function() {
          const profileNameElement = document.querySelector('.profile-name');
          const userProfileString = localStorage.getItem("USER_PROFILE");

          if (userProfileString) {
            try {
              const userProfile = JSON.parse(userProfileString);
              if (userProfile && userProfile.username) {
                profileNameElement.textContent = userProfile.username;
              } else {
                console.warn("Username not found in USER_PROFILE.");
                profileNameElement.textContent = "User"; // Or some other default
              }
            } catch (error) {
              console.error("Error parsing USER_PROFILE from localStorage:", error);
              profileNameElement.textContent = "User"; // Or some other default
            }
          } else {
            console.warn("USER_PROFILE not found in localStorage.");
            profileNameElement.textContent = "User"; // Or some other default
          }
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
        const themeToggle = document.getElementById('themeToggle');
        let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        themeToggle.addEventListener('click', () => {
            darkMode = !darkMode;
            document.documentElement.classList.toggle('dark-mode', darkMode);
            playSound('click');
        });

        // Background image management
        const backgroundImage = document.getElementById('backgroundImage');
        const backgroundModal = document.getElementById('backgroundModal');
        const backgroundUpload = document.getElementById('backgroundUpload');
        const uploadButton = document.getElementById('uploadBackground');

        function loadSavedBackground() {
            const savedBackground = localStorage.getItem('customBackground');
            if (savedBackground) {
                backgroundImage.src = savedBackground;
            }
        }

uploadButton.addEventListener('click', async () => {
    const file = backgroundUpload.files[0];
    if (file) {
        const storageRef = firebase.storage().ref(`backgrounds/<span class="math-inline">\{userId\}/</span>{file.name}`);

        try {
            await storageRef.put(file);
            const downloadURL = await storageRef.getDownloadURL();

            console.log("Download URL:", downloadURL);

            backgroundImage.src = downloadURL;
            localStorage.setItem('customBackground', downloadURL);

            // Update user profile in Firebase Storage
            const userProfileString = localStorage.getItem("USER_PROFILE");
            if (userProfileString) {
                try {
                    const userProfileData = JSON.parse(userProfileString);
                    userProfileData.customBackgroundURL = downloadURL;
                    setUserProfile(userId, JSON.stringify(userProfileData));
                } catch (error) {
                    console.error("Error parsing or updating USER_PROFILE:", error);
                }
            } else {
                console.warn("USER_PROFILE not found in localStorage.");
                // Handle the case where USER_PROFILE is missing
            }


            backgroundModal.classList.remove('active');
            playSound('success');

        } catch (error) {
            console.error("Error uploading background:", error);
            alert("Failed to upload background. Please try again.");
        }
    }
});

        document.getElementById('customizeBackground').addEventListener('click', () => {
            backgroundModal.classList.add('active');
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