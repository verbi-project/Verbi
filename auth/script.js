 import {
        getData,
        setData,
        getGlobalData,
        setGlobalData,
   userProfile
      } from "/Global/firebase.js";





export async function syncData(userId, userName) {
  // The User is logging in!
  var userData = null;
  // Gets the data for the aformentioned usercode
  await getData("profile.json", userId, async (data) => {
    let userInfo = { 
      id: userId, 
      username: userName,
      uiSettings: {
        cornerRadius: '--corner-radius-modern',
        fontFamily: '--font-serif',
        fontSize: '--text-base',
        textColor: '#1e293b',
        backgroundColor: '#ffffff',
        accentColor: 'var(--accent-light)',
        uiOpacity: 0.75
      }
    };
    if (data == null || undefined) {
      // The user is new
      await setData("profile.json", userId, JSON.stringify(userInfo));
      await setData("wordList.json", userId, JSON.stringify([]));
      await setData("collections.json", userId, JSON.stringify([]));
    } else {
      // the user is an existing user
    }
    localStorage.setItem("USER_PROFILE", JSON.stringify(userInfo));
    await getData("profile.json", userId, (data) => {
      userData = data;
    });
    window.location.assign("/index.html");
  });

