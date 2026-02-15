# PlateSpotter AI 🚗

PlateSpotter is a Progressive Web App (PWA) designed for mechanics and auto repair shops to quickly log vehicle license plates and service details. Powered by Google Gemini AI, it offers intelligent image recognition and fast manual entry formatting.

## ✨ Features

- **AI Camera Scan**: Instantly detects license plates, confidence levels, and regions using **Gemini 3.0 Pro Vision**.
- **Smart Manual Entry**: Auto-formats typed license plates using **Gemini 2.5 Flash Lite** for low latency.
- **Service Logging**: Record repair details (e.g., "Oil Change", "Brake Pad Replacement") alongside the plate.
- **Cloud Sync**: Automatically sends scan data to **Google Sheets** or any custom webhook.
- **Mobile First**: Installable on iOS and Android as a native-like app (PWA).
- **Offline History**: Keeps a local log of recent scans directly on the device.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google GenAI SDK (`gemini-3-pro-preview`, `gemini-flash-lite-latest`)
- **Storage**: LocalStorage (Device), Webhooks (Cloud)
- **Deployment**: Static Web App / PWA

## 🛠️ Setup & Development

1. **Clone the repository**
2. **Install dependencies** (if using a local bundler like Vite/CRA)
   ```bash
   npm install
   ```
3. **Environment Variables**
   You must have a valid Google Gemini API Key.
   Create a `.env` file (or configure your deployment environment):
   ```
   API_KEY=your_google_gemini_api_key
   ```
4. **Run the app**
   ```bash
   npm start
   ```

## 📊 Google Sheets Integration

To save your scans to a Google Sheet automatically:

1. Create a new **Google Sheet**.
2. Go to **Extensions > Apps Script**.
3. Paste the following code into the editor:

```javascript
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rawData = e.postData.contents;
  var data = JSON.parse(rawData);
  
  // Determine which sheet to use
  var sheetName = "Sheet1"; // Default for repairs
  if (data.entryType === "wash") sheetName = "Carwashes";
  if (data.entryType === "return") sheetName = "Returns";
  
  var sheet = ss.getSheetByName(sheetName);
  
  // Create sheet if it doesn't exist (optional safety/convenience)
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    if (sheetName === "Sheet1") { // Repairs
        sheet.appendRow(["Timestamp", "Entry Type", "Plate Number", "Service Details", "Region", "Method", "Confidence", "Notes"]);
    } else if (sheetName === "Carwashes") {
        sheet.appendRow(["Timestamp", "Entry Type", "Plate Number", "Company Name", "Region", "Method", "Confidence", "Notes"]);
    } else if (sheetName === "Returns") {
        sheet.appendRow(["Timestamp", "Entry Type", "Plate Number", "Company Name", "Region", "Method", "Confidence", "Notes"]);
    }
  }
  
  // Prepare row data based on sheet type/columns
  var row = [];
  if (sheetName === "Sheet1") {
      row = [
        data.timestamp,
        data.entryType,
        data.plateNumber,
        data.serviceDetails || "N/A",
        data.region || "Unknown",
        data.method,
        data.confidence || "N/A",
        data.notes || ""
      ];
  } else {
      // Wash or Return
      row = [
        data.timestamp,
        data.entryType,
        data.plateNumber,
        data.companyName || "N/A",
        data.region || "Unknown",
        data.method,
        data.confidence || "N/A",
        data.notes || ""
      ];
  }
  
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({status: "success"}));
}
```

4. Click **Deploy > New Deployment**.
5. Select **Type: Web App**.
6. Set **Who has access** to **Anyone**.
7. Click **Deploy** and copy the **Web App URL**.
8. Open **PlateSpotter**, go to **Settings**, and paste the URL.

## 📱 Mobile Installation

This app is a PWA and can be installed without an App Store.

**iOS (iPhone/iPad):**
1. Open the app in **Safari**.
2. Tap the **Share** button.
3. Scroll down and tap **Add to Home Screen**.

**Android:**
1. Open the app in **Chrome**.
2. Tap the **Menu** (three dots).
3. Tap **Install App** or **Add to Home Screen**.

## 🧠 AI Models Used

- **Image Analysis**: `gemini-3-pro-preview` (High accuracy for reading text from images).
- **Text Formatting**: `gemini-flash-lite-latest` (Fastest response time for standardizing text inputs).
