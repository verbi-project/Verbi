const firebaseConfig = {
  apiKey: "AIzaSyCDQ7Oy1_2yFJlK1Ue4Jbvb1OygLzoJyy8",
  authDomain: "verbi-dabf2.firebaseapp.com",
  projectId: "verbi-dabf2",
  storageBucket: "verbi-dabf2.appspot.com",
  messagingSenderId: "279166192167",
  appId: "1:279166192167:web:bd4a953aaa64b7bb05dc02",
  measurementId: "G-0B0QL94MQN",
};
// Initialize Firebase using compat version
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

// Log initialization
console.log('Firebase initialized successfully');
/*
Get's data from firebase
filename - the name of the file to get
userCode - the user's Id
func - a function that is ran inside of this function
*/
export function getGlobalData(fileName, func = () => {}) {
  const storageRef = storage.ref(`/Global Sets`);
  storageRef
    .child(fileName)
    .getDownloadURL()
    .then((url) => {
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          func(data);
          return data;
        });
    })
    .catch((error) => {
      // A full list of error codes is available at https://firebase.google.com/docs/storage/web/handle-errors
      func(undefined);
      return undefined;
    });
}
export function setGlobalData(fileName, data) {
  const storageRef = storage.ref(`/Global Sets`);
  storageRef
    .child(fileName)
    .putString(data)
    .then((snapshot) => {
      console.log("Uploaded a raw string!");
    });
}
export function getData(fileName, userCode, func = () => {}) {
  if (!userCode) {
    console.error('No user code provided');
    func('[]');
    return;
  }

  const storageRef = storage.ref(`/Users/${userCode}`);
  storageRef
    .child(fileName)
    .getDownloadURL()
    .then((url) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then((data) => {
          try {
            // Validate that the data is valid JSON
            JSON.parse(data);
            func(data);
          } catch (e) {
            console.error('Invalid JSON data:', e);
            func('[]');
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          func('[]');
        });
    })
    .catch((error) => {
      // Handle common Firebase Storage errors
      if (error.code === 'storage/object-not-found') {
        console.log('First time user, initializing empty data');
      } else {
        console.error('Firebase Storage error:', error);
      }
      func('[]');
    });
}
export function setData(fileName, userCode, data) {
  const storageRef = storage.ref(`/Users/${userCode}`);
  storageRef
    .child(fileName)
    .putString(data)
    .then((snapshot) => {
      console.log("Uploaded a raw string!");
    });
}

export var userProfile = undefined;

// Wrappers for user data
export function setUserWordList(userId, data) {
  // Ensure data is stringified
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  setData("wordList.json", userId, stringData);
}

export async function getUserWordList(userId, func = () => {}) {
  return getData("wordList.json", userId, (data) => {
    try {
      // Handle both string and already parsed data
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      func(JSON.stringify(parsedData)); // Ensure consistent string output
    } catch (error) {
      console.error('Error parsing word list:', error);
      func('[]'); // Return empty array string if parsing fails
    }
  });
}

export function setUserProfile(userId, data) {
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  setData("profile.json", userId, stringData);
}

export async function getUserProfile(userId) {
  return await getData("profile.json", userId);
}

// Collection management
export function setUserCollections(userId, collections) {
  const stringData = typeof collections === 'string' ? collections : JSON.stringify(collections);
  setData("collections.json", userId, stringData);
}

export async function getUserCollections(userId, func = () => {}) {
  return getData("collections.json", userId, (data) => {
    try {
      // Handle both string and already parsed data
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      func(JSON.stringify(parsedData)); // Ensure consistent string output
    } catch (error) {
      console.error('Error parsing collections:', error);
      func('[]'); // Return empty array string if parsing fails
    }
  });
}

// Initialize collections if they don't exist
export async function initializeUserData(userId) {
  getUserWordList(userId, (data) => {
    if (!data) {
      setUserWordList(userId, JSON.stringify([]));
    }
  });
  
  getUserCollections(userId, (data) => {
    if (!data) {
      setUserCollections(userId, JSON.stringify([]));
    }
  });
}
