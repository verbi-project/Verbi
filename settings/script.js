// UI Settings Management
import { getUserProfile, setData } from "/Global/firebase.js";
import { playSound } from "/Global/utils.js";

// Get DOM elements
const cornerRadiusSelect = document.getElementById('cornerRadius');
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeSelect = document.getElementById('fontSize');
const textColorInput = document.getElementById('textColor');
const backgroundColorInput = document.getElementById('backgroundColor');
const accentColorInput = document.getElementById('accentColor');
const opacityInput = document.getElementById('uiOpacity');
const opacityValue = document.getElementById('opacityValue');
const saveUISettingsButton = document.getElementById('saveUISettings');

// Color preset handling
const colorPresets = document.querySelectorAll('.setting-group:not(:has(#accentColor)) .color-preset');
const accentPresets = document.querySelectorAll('.setting-group:has(#accentColor) .color-preset');

// Helper function to convert RGB to Hex
function convertRGBToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const rgbArr = rgb.match(/\d+/g);
    if (!rgbArr) return '#ffffff';
    const [r, g, b] = rgbArr;
    return '#' + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1);
}

// Handle background color presets
colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        document.documentElement.style.setProperty('--user-background-color', color);
        
        // Update active state
        colorPresets.forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        
        // Update color picker with computed value
        if (color.startsWith('var(')) {
            const computedColor = getComputedStyle(document.documentElement)
                .getPropertyValue(color.replace('var(', '').replace(')', ''))
                .trim();
            backgroundColorInput.value = convertRGBToHex(computedColor);
        } else {
            backgroundColorInput.value = color;
        }
        
        playSound('click');
    });
});

// Handle accent color presets
accentPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        document.documentElement.style.setProperty('--user-accent-color', color);
        document.documentElement.style.setProperty('--icon-color', color);
        
        // Update active state
        accentPresets.forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        
        // Update color picker with computed value
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

// Live preview changes
cornerRadiusSelect.addEventListener('change', () => {
    document.documentElement.style.setProperty('--user-corner-radius', `var(${cornerRadiusSelect.value})`);
    playSound('click');
});

fontFamilySelect.addEventListener('change', () => {
    document.documentElement.style.setProperty('--user-font-family', `var(${fontFamilySelect.value})`);
    playSound('click');
});

fontSizeSelect.addEventListener('change', () => {
    document.documentElement.style.setProperty('--user-font-size', `var(${fontSizeSelect.value})`);
    playSound('click');
});

textColorInput.addEventListener('input', () => {
    document.documentElement.style.setProperty('--user-text-color', textColorInput.value);
});

backgroundColorInput.addEventListener('input', () => {
    document.documentElement.style.setProperty('--user-background-color', backgroundColorInput.value);
    colorPresets.forEach(p => p.classList.remove('active'));
});

accentColorInput.addEventListener('input', () => {
    document.documentElement.style.setProperty('--user-accent-color', accentColorInput.value);
    document.documentElement.style.setProperty('--icon-color', accentColorInput.value);
    accentPresets.forEach(p => p.classList.remove('active'));
});

opacityInput.addEventListener('input', () => {
    opacityValue.textContent = opacityInput.value + '%';
    document.documentElement.style.setProperty('--user-opacity', opacityInput.value / 100);
});

// Load settings from Firebase
async function loadUISettings() {
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
                        colorPresets.forEach(p => p.classList.remove('active'));
                        activePreset.classList.add('active');
                        
                        const computedColor = getComputedStyle(document.documentElement)
                            .getPropertyValue(settings.backgroundColor.replace('var(', '').replace(')', ''))
                            .trim();
                        backgroundColorInput.value = convertRGBToHex(computedColor);
                    }
                } else {
                    backgroundColorInput.value = settings.backgroundColor;
                    colorPresets.forEach(p => p.classList.remove('active'));
                }
            }
            if (settings.accentColor) {
                document.documentElement.style.setProperty('--user-accent-color', settings.accentColor);
                document.documentElement.style.setProperty('--icon-color', settings.accentColor);
                
                if (settings.accentColor.startsWith('var(')) {
                    const activePreset = document.querySelector(`[data-color="${settings.accentColor}"]`);
                    if (activePreset) {
                        accentPresets.forEach(p => p.classList.remove('active'));
                        activePreset.classList.add('active');
                        
                        const computedColor = getComputedStyle(document.documentElement)
                            .getPropertyValue(settings.accentColor.replace('var(', '').replace(')', ''))
                            .trim();
                        accentColorInput.value = convertRGBToHex(computedColor);
                    }
                } else {
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

// Save settings
saveUISettingsButton.addEventListener('click', async () => {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (!userId) {
        console.error('No user ID found');
        return;
    }

    const settings = {
        cornerRadius: cornerRadiusSelect.value,
        fontFamily: fontFamilySelect.value,
        fontSize: fontSizeSelect.value,
        textColor: textColorInput.value,
        backgroundColor: backgroundColorInput.value,
        accentColor: accentColorInput.value,
        uiOpacity: opacityInput.value / 100
    };

    try {
        const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
        const profile = profileData ? JSON.parse(profileData) : {};
        profile.uiSettings = settings;

        await setData("profile.json", userId, JSON.stringify(profile));
        playSound('success');
    } catch (error) {
        console.error('Error saving UI settings:', error);
    }
});

// Initialize settings on page load
loadUISettings();

// Background Image Management
const backgroundPreview = document.getElementById('backgroundPreview');
const backgroundUpload = document.getElementById('backgroundUpload');
const currentBackground = document.getElementById('currentBackground');
const removeBackground = document.getElementById('removeBackground');

// Load existing background
async function loadBackground() {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (!userId) return;

    try {
        const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
        if (profileData) {
            const profile = JSON.parse(profileData);
            if (profile.backgroundImage) {
                currentBackground.src = profile.backgroundImage;
                document.body.style.backgroundImage = `url(${profile.backgroundImage})`;
            }
        }
    } catch (error) {
        console.error('Error loading background:', error);
    }
}

// Handle background upload
backgroundPreview.addEventListener('click', () => {
    backgroundUpload.click();
});

backgroundUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (!userId) return;

    try {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = e.target.result;
            
            // Update preview and background
            currentBackground.src = base64Image;
            document.body.style.backgroundImage = `url(${base64Image})`;

            // Save to profile
            const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
            const profile = profileData ? JSON.parse(profileData) : {};
            profile.backgroundImage = base64Image;
            await setData("profile.json", userId, JSON.stringify(profile));
            
            playSound('success');
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error uploading background:', error);
    }
});

// Handle background removal
removeBackground.addEventListener('click', async () => {
    const userId = JSON.parse(localStorage.getItem("USER_PROFILE"))?.id;
    if (!userId) return;

    try {
        // Remove background
        currentBackground.src = '.';
        document.body.style.backgroundImage = 'none';

        // Update profile
        const profileData = await new Promise((resolve) => getUserProfile(userId, resolve));
        const profile = profileData ? JSON.parse(profileData) : {};
        delete profile.backgroundImage;
        await setData("profile.json", userId, JSON.stringify(profile));
        
        playSound('success');
    } catch (error) {
        console.error('Error removing background:', error);
    }
});

// Initialize everything when DOM loads
loadUISettings();
loadBackground();
