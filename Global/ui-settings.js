// UI Settings Management
import { getUserProfile } from "./firebase.js";

// Apply a single UI setting
export function applyUISetting(property, value) {
    switch(property) {
        case 'cornerRadius':
            document.documentElement.style.setProperty('--user-corner-radius', `var(${value})`);
            break;
        case 'fontFamily':
            document.documentElement.style.setProperty('--user-font-family', `var(${value})`);
            break;
        case 'fontSize':
            document.documentElement.style.setProperty('--user-font-size', `var(${value})`);
            break;
        case 'textColor':
            document.documentElement.style.setProperty('--user-text-color', value);
            break;
        case 'backgroundColor':
            document.documentElement.style.setProperty('--user-background-color', value);
            break;
        case 'accentColor':
            document.documentElement.style.setProperty('--user-accent-color', value);
            document.documentElement.style.setProperty('--icon-color', value);
            break;
        case 'uiOpacity':
            document.documentElement.style.setProperty('--user-opacity', value);
            break;
    }
}

// Load and apply UI settings from Firebase profile
export async function loadAndApplyUISettings() {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (!userId) return;

    try {
        const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
        if (profileData) {
            const profile = JSON.parse(profileData);
            const settings = profile.uiSettings || {};

            // Apply each setting if it exists
            Object.entries(settings).forEach(([property, value]) => {
                if (value !== undefined) {
                    applyUISetting(property, value);
                }
            });
        }
    } catch (error) {
        console.error('Error loading UI settings:', error);
    }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadAndApplyUISettings);
