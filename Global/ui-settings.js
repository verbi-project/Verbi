// UI Settings Management
import { getUserProfile } from "./firebase.js";

// Load and apply UI settings from Firebase profile
export async function loadAndApplyUISettings() {
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
            }
            if (settings.fontFamily) {
                document.documentElement.style.setProperty('--user-font-family', `var(${settings.fontFamily})`);
            }
            if (settings.fontSize) {
                document.documentElement.style.setProperty('--user-font-size', `var(${settings.fontSize})`);
            }
            if (settings.textColor) {
                document.documentElement.style.setProperty('--user-text-color', settings.textColor);
            }
            if (settings.backgroundColor) {
                document.documentElement.style.setProperty('--user-background-color', settings.backgroundColor);
            }
            if (settings.uiOpacity !== undefined) {
                document.documentElement.style.setProperty('--user-opacity', settings.uiOpacity);
            }
        }
    } catch (error) {
        console.error('Error loading UI settings:', error);
    }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadAndApplyUISettings);
