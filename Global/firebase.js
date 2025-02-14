const firebaseConfig = {
  apiKey: "AIzaSyCDQ7Oy1_2yFJlK1Ue4Jbvb1OygLzoJyy8",
  authDomain: "verbi-dabf2.firebaseapp.com",
  projectId: "verbi-dabf2",
  storageBucket: "verbi-dabf2.appspot.com",
  messagingSenderId: "279166192167",
  appId: "1:279166192167:web:bd4a953aaa64b7bb05dc02",
  measurementId: "G-0B0QL94MQN",
};
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

firebase.initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = firebase.storage();
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
  const storageRef = storage.ref(`/Users/${userCode}`);
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

// Wrappers
export function setUserWordList(userId, data) {
  setData("wordList.json", userId, JSON.stringify(data));
}
export async function getUserWordList(userId, func= () => {}) {
  return getData("wordList.json", userId, func);

}

export function setUserProfile(userId, data) {
  setData("profile.json", userId, JSON.stringify(data));
}
export async function getUserProfile(userId) {
  return await getData("profile.json", userId);
}
