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
  await getData("profile.json", userId, (data) => {
    let userInfo = { id: userId, username: userName }; // infomation for the user
   if (data == null || undefined) {
      // The user is new
      setData("profile.json", userId, JSON.stringify(userInfo));
           setData("wordList.json", userId, JSON.stringify([]));
    } else {
      // the user is an existing user
    }
          localStorage.setItem("USER_PROFILE", JSON.stringify(userInfo));
    getData("profile.json", userId, (data) => {
      userData = data;
    });
    window.location.assign("/index.html");
  });
}
