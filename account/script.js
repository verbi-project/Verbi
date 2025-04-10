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

uploadButton.addEventListener('click', () => {
  const file = backgroundUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      backgroundImage.src = imageUrl;
      localStorage.setItem('customBackground', imageUrl);
      backgroundModal.classList.remove('active');
      playSound('success');
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('customizeBackground').addEventListener('click', () => {
  backgroundModal.classList.add('active');
  playSound('click');
});

// Collection management
const collectionModal = document.getElementById('collectionModal');
const collectionsGrid = document.getElementById('collections');
let collections = JSON.parse(localStorage.getItem('collections') || '[]');

function createCollectionCard(collection) {
  const card = document.createElement('div');
  card.className = 'collection-card';
  card.innerHTML = `
    <span class="material-symbols-rounded">collections_bookmark</span>
    <h3>${collection.name}</h3>
    <p>${collection.words.length} words</p>
  `;
  card.addEventListener('click', () => {
    // TODO: Navigate to collection detail view
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
    collections.push({ name, words: [] });
    localStorage.setItem('collections', JSON.stringify(collections));
    updateCollectionsDisplay();
    collectionModal.classList.remove('active');
    input.value = '';
    playSound('success');
  }
});

// Favorite words management
const favoriteWordsGrid = document.getElementById('favoriteWords');
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords') || '[]');

function createWordCard(word) {
  const card = document.createElement('div');
  card.className = 'word-card';
  card.innerHTML = `
    <h3>${word.text}</h3>
    <p>${word.definition}</p>
    <div class="word-actions">
      <button class="icon-btn remove-favorite">
        <span class="material-symbols-rounded">favorite</span>
      </button>
      <button class="icon-btn add-to-collection">
        <span class="material-symbols-rounded">add_to_photos</span>
      </button>
    </div>
  `;
  
  card.querySelector('.remove-favorite').addEventListener('click', () => {
    favoriteWords = favoriteWords.filter(w => w.text !== word.text);
    localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
    updateFavoritesDisplay();
    playSound('pop');
  });

  return card;
}

function updateFavoritesDisplay() {
  favoriteWordsGrid.innerHTML = '';
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
updateCollectionsDisplay();
updateFavoritesDisplay();

// Animation on load
document.body.classList.add('loaded');
