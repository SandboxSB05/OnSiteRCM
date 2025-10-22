# 🚀 Quick Start - Test on Your Phone NOW

## 1. Install Expo Go on Your Phone

**iPhone:**
- Open App Store
- Search "Expo Go"
- Install it

**Android:**
- Open Play Store  
- Search "Expo Go"
- Install it

## 2. Start the App

```bash
cd /Users/joshclancy/OnSite/roof-tracker-pro-fe525d7c/RelayMobile
npm start
```

## 3. Connect Your Phone

A QR code will appear in your terminal.

**iPhone:**
- Open Camera app
- Point at QR code
- Tap the notification that appears
- Expo Go will open with your app!

**Android:**
- Open Expo Go app
- Tap "Scan QR code"
- Point at QR code
- Your app will load!

## 4. Make Changes & See Live Updates

1. Open `App.tsx` in VS Code
2. Change the text "Relay" to something else
3. Save the file
4. Watch your phone - it updates automatically! ✨

## That's It! 🎉

You're now developing a mobile app that runs on your real device with live reloading!

---

## Next Steps

Once you've confirmed it works:

1. **Add a folder structure:**
   ```bash
   mkdir -p src/{screens,components,services,types,utils}
   ```

2. **Install navigation:**
   ```bash
   npx expo install @react-navigation/native @react-navigation/native-stack
   npx expo install react-native-screens react-native-safe-area-context
   ```

3. **Install UI library:**
   ```bash
   npm install react-native-paper
   npx expo install react-native-vector-icons
   ```

4. **Start building!**

## Troubleshooting

**Can't scan QR code?**
- Make sure phone and computer are on same WiFi
- Try: `npm start --tunnel` (slower but works on different networks)

**App crashes?**
- Check terminal for errors
- Try: `npm start --clear`

**Changes not showing?**
- Shake your phone to open dev menu
- Tap "Reload"
