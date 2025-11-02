# 💰 Savings Dashboard — Bootstrap Edition

A comprehensive, client-side savings tracking and planning application built with Bootstrap 5. Track multiple contributors, set financial goals, analyze rate scenarios, and manage transactions—all in a beautiful, responsive web interface.

![Savings Dashboard](https://img.shields.io/badge/version-v16-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3-purple)

## ✨ Features

### 📊 Dashboard Overview
- **Key Performance Indicators (KPIs)**
  - Monthly Income Tracking
  - Current Total Savings
  - Savings Rate Calculation
  - APY vs Inflation Comparison
  - Emergency Fund Ratio Analysis
  - Goals Completion Status

- **Interactive Charts**
  - Contribution Breakdown (by person)
  - Goal Timeline Visualization
  - Savings Consistency Tracking
  - Recent Transactions (6 months)
  - Monthly Contribution Trends

- **Smart Insights**
  - Automated financial recommendations
  - Goal progress tracking
  - Contribution streak monitoring

### 👥 People & Income Management
- Add multiple contributors/people
- Track individual savings balances
- Manage income sources with different frequencies (monthly, yearly, etc.)
- Set fixed or percentage-based contributions
- View per-person contribution breakdowns

### 🎯 Goals Management
- Create multiple savings goals with:
  - Target amounts
  - Deadline dates
  - Priority levels
  - Owner assignment (per person)
- Track goal progress and ETA
- Calculate monthly requirements vs. plan
- Visualize goal timelines

### 📈 Rate Scenarios Calculator
- Compare multiple savings rate scenarios (e.g., 5%, 10%, 15%, 20%)
- Select specific contributors and goals for analysis
- Project 2-year and 5-year future values
- Calculate goal achievement status for each scenario
- Identify key impacts and recommendations
- Export scenarios to Excel

### 💳 Transaction Tracking
- Record savings transactions with:
  - Date, amount, and person
  - Goal allocation (optional)
  - Notes and descriptions
- View transaction history and statistics
- Analyze trends with interactive charts
- Track top contributors
- Filter and sort transactions

### 📤 Export & Import
- **Export Options:**
  - Full data as JSON
  - People data as CSV
  - Goals data as CSV
  - Transactions data as CSV

- **Import Options:**
  - Import JSON files
  - QR Code generation for data sharing
  - QR Code scanning (camera or image upload)
  - Text paste for quick data import
  - Smart merge to combine data from multiple devices

### ⚙️ Settings & Customization
- **Localization:**
  - Multiple currency support (PHP, USD, EUR, JPY, AUD, GBP, SGD)
  - Locale selection for number formatting
  
- **Financial Parameters:**
  - Configure default savings rate
  - Set APY (Annual Percentage Yield)
  - Adjust inflation rate

- **Appearance:**
  - Dark/Light theme toggle
  - Print-friendly layout
  - Responsive design for mobile devices

### 🔄 Data Persistence
- Automatic saving to browser localStorage
- No server required—fully client-side
- Sync notification when data from other devices is available

## 🚀 Getting Started

### Quick Start

1. **Download or Clone**
   ```bash
   git clone https://github.com/yourusername/savings-app.git
   cd savings-app
   ```

2. **Open in Browser**
   - Simply open `savings_app_v16.html` in any modern web browser
   - No build process, no dependencies to install!

3. **Start Tracking**
   - Add people and their incomes
   - Create savings goals
   - Record transactions
   - Explore rate scenarios

### Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Usage Guide

### Adding People

1. Navigate to **👥 People** tab
2. Enter person's name
3. Set current savings balance
4. Add income sources (amount and frequency)
5. Set fixed contribution amount (optional)
6. Click **+ Add Person**

### Creating Goals

1. Go to **🎯 Goals** tab
2. Enter goal name (e.g., "Emergency Fund")
3. Set target amount
4. Choose deadline date
5. Assign to a person (optional)
6. Set priority (1 = highest)
7. Click **+ Add**

### Recording Transactions

1. Open **💳 Transactions** tab
2. Select date, amount, and person
3. Optionally allocate to a specific goal
4. Add a note for context
5. Click **+ Add Transaction**

### Analyzing Rate Scenarios

1. Visit **📈 Rates** tab
2. Select contributors to include
3. Choose goals to analyze
4. Enter savings rates (comma-separated, e.g., `5,10,15,20`)
5. Click **🔄 Calculate Scenarios**
6. Review projections and recommendations
7. Export to Excel if needed

### Syncing Between Devices

1. Go to **⚙️ Settings** tab
2. **To Export:**
   - Click **📷 Generate QR Code**
   - Scan with another device's camera
3. **To Import:**
   - Click **📷 Scan QR with Camera** or
   - Click **🖼️ Upload QR Image** or
   - Click **📝 Paste Text Data**
4. Confirm import to merge data

## 🛠️ Technology Stack

- **Framework:** Bootstrap 5.3
- **Charts:** Chart.js
- **QR Code:** 
  - qrcode-generator (1.4.4)
  - jsQR (1.4.0)
- **Storage:** Browser localStorage
- **Language:** Vanilla JavaScript (ES6+)
- **No Build Tools Required:** Pure HTML/CSS/JS

## 📦 Project Structure

```
savings-app/
├── savings_app_v16.html    # Main application file
├── mike data.png           # Sample data image
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 💾 Data Storage

All data is stored locally in your browser using `localStorage`. This means:
- ✅ No account required
- ✅ Works offline
- ✅ Data stays on your device
- ⚠️ Clearing browser data will delete your information
- 💡 Use Export feature to create backups

## 🔐 Privacy & Security

- **100% Client-Side:** No data is sent to any server
- **Local Storage Only:** Your financial data remains on your device
- **No Tracking:** No analytics or tracking scripts
- **Offline Capable:** Works without internet connection

## 📊 Key Calculations

- **Future Value:** Calculates compound interest with monthly contributions
- **Inflation Adjustment:** Adjusts future values for inflation
- **Savings Rate:** Monthly contributions / Monthly income
- **Emergency Fund Ratio:** Current savings / Recommended emergency fund (3-6 months expenses)
- **Goal ETA:** Estimates months needed to reach goal based on current savings rate and APY

## 🎨 Customization

The application uses CSS custom properties (variables) for theming. You can customize:

- Color schemes (light/dark themes)
- Brand colors
- Typography
- Spacing and layout

Modify the `:root` CSS variables in the `<style>` section of the HTML file.

## 📝 Features in Detail

### Smart Insights
The dashboard provides automated insights such as:
- Recommendations to increase savings rate
- Warnings about goals at risk
- Emergency fund status
- Contribution consistency analysis

### Goal Suggestions
When adding transactions, the app suggests:
- Which goals might benefit from the transaction
- Progress updates for active goals
- Priority-based recommendations

### Print Mode
- Optimized layout for printing
- Hides navigation and controls
- Clean, professional output

## 🐛 Troubleshooting

**Data not saving?**
- Check if localStorage is enabled in your browser
- Ensure you're not in private/incognito mode (data clears on exit)

**QR code not scanning?**
- Ensure good lighting
- Hold camera steady
- Try uploading the image instead

**Charts not displaying?**
- Check browser console for errors
- Ensure Chart.js CDN is accessible
- Try refreshing the page

**Theme not switching?**
- Check browser localStorage permissions
- Clear browser cache and reload

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Bootstrap team for the excellent framework
- Chart.js for beautiful, responsive charts
- QR code library maintainers

## 📧 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Happy Saving! 💰✨**

