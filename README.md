# Property Investment Management Application

A modern, responsive web application for tracking and analyzing property investments with local-first deployment capabilities.

## 🚀 Quick Start

### Local Development (Recommended for single users)

**Linux/macOS:**
```bash
chmod +x start-app.sh
./start-app.sh
```

**Windows:**
```batch
start-app.bat
```

The application will automatically:
- Check Node.js version (18+ required)
- Install dependencies
- Setup database
- Seed demo data (first run only)
- Start on http://localhost:3000

**macOS users:** The startup script will offer to create a terminal alias for easy access from anywhere!

### Manual Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Initialize Database**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. **Start Development Server**
```bash
npm run dev
```

## 🍎 macOS Installation

### Quick Setup (Recommended)
```bash
# Run the startup script - it will guide you through setup
chmod +x start-app.sh
./start-app.sh
```

The script will:
1. Check your Node.js version
2. Detect that you're on macOS
3. Offer to create a terminal alias for quick access
4. Set up the database and demo data
5. Start the application

### Manual macOS Setup

**Option A: Run from current location**
```bash
cd /path/to/property-manager
./start-app.sh
```

**Option B: Install to Applications and create alias**
```bash
# Move to Applications folder
sudo mv property-manager /Applications/

# Add alias to your shell profile
echo 'alias property-manager="cd /Applications/property-manager && ./start-app.sh"' >> ~/.zshrc

# Reload shell configuration
source ~/.zshrc

# Now start from anywhere
property-manager
```

**Option C: Using Homebrew for Node.js**
```bash
# Install Node.js if not already installed
brew install node

# Navigate to project and run
cd /path/to/property-manager
./start-app.sh
```

### Accessing from Other Devices
The startup script will display your Mac's local IP address. Access the app from other devices on your network:
```
http://YOUR_MAC_IP:3000
```

### Tips for macOS Users
- 📌 Bookmark `http://localhost:3000` in Safari/Chrome
- 🗄️ Backup your database: `prisma/dev.db`
- 🔒 Database location: `/Applications/property-manager/prisma/dev.db` (if installed there)
- ⏹️ Stop the server: Press `Ctrl+C` in Terminal

## 🐳 Docker Deployment

For cloud or multi-user deployments:

```bash
docker-compose up -d
```

Access at http://localhost:3000

## 📊 Features

### Dashboard
- Portfolio value trends
- Asset allocation charts
- Cash flow analysis
- Mortgage balance tracking

### Property Management
- Complete property details
- Mortgage tracking
- Rental information
- Document storage
- Image galleries

### Transaction Tracking
- Income and expense logging
- Recurring transactions
- Receipt uploads
- Category-based filtering

### Reports & Analytics
- ROI calculations
- Rental yield analysis
- Expense breakdowns
- Financial statements
- Export to PDF/CSV

### Automatic Expense Sync
- Recurring expenses automatically generate pending transactions
- Syncs on app startup
- Manual sync available on Expenses page
- Prevents duplicate transactions
- Respects start and end dates
- Creates transactions for entire current year (including future months)

## ⚙️ Configuration

### Environment Variables

The application can be customized via the `.env` file:

```env
# Localization Settings
NEXT_PUBLIC_DATE_FORMAT="dd/MM/yyyy"  # Options: dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd
NEXT_PUBLIC_LOCALE="en-NZ"             # Options: en-NZ, en-US, en-GB, etc.
NEXT_PUBLIC_CURRENCY="NZD"             # Options: NZD, USD, GBP, AUD, etc.
```

**Supported Date Formats:**
- `dd/MM/yyyy` - New Zealand format (default): 25/12/2024
- `MM/dd/yyyy` - US format: 12/25/2024
- `yyyy-MM-dd` - ISO format: 2024-12-25

**Supported Locales:**
- `en-NZ` - New Zealand English (default)
- `en-US` - US English
- `en-GB` - British English
- `en-AU` - Australian English

**Supported Currencies:**
- `NZD` - New Zealand Dollar (default)
- `USD` - US Dollar
- `GBP` - British Pound
- `AUD` - Australian Dollar
- `EUR` - Euro

After changing these values, restart the development server:
```bash
npm run dev
```

## 🗄️ Database

### SQLite (Default - Local)
- File-based: `prisma/dev.db`
- No external service required
- Perfect for single users

### PostgreSQL (Optional - Cloud)
Update `.env`:

## 🔧 Troubleshooting

### Deprecated Package Warnings

If you see warnings about deprecated packages (inflight, rimraf, glob, eslint):

```bash
# Clean install everything
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Update to latest versions
npm update
```

These warnings are often from nested dependencies and don't affect functionality. The `.npmrc` file helps suppress some of these warnings.

### Prisma Module Errors

If you get `Cannot find module '@prisma/engines'` or similar errors:

```bash
# Remove Prisma completely
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
rm -rf node_modules/prisma

# Reinstall dependencies
npm install

# Regenerate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 404 Errors on Navigation

If you get 404 errors when navigating to pages:

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npm run db:generate

# Restart dev server
npm run dev
```

### Database Connection Issues

```bash
# Reset database
npm run db:push

# Reseed data
npm run db:seed
```

### Port Already in Use

```bash
# Kill process on port 3000 (Linux/macOS)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Dependencies Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```
