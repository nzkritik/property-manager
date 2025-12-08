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

## 🗄️ Database

### SQLite (Default - Local)
- File-based: `prisma/dev.db`
- No external service required
- Perfect for single users

### PostgreSQL (Optional - Cloud)
Update `.env`:

## 📂 Git Setup

### Initialize Git Repository
```bash
git init
```

### Create .gitignore
```bash
# Node modules
node_modules/
# Build output
dist/
# Environment variables
.env
```

### First Commit
```bash
git add .
git commit -m "Initial commit"
```

### Connect to GitHub
1. Create a new repository on GitHub.
2. Follow the instructions to push an existing repository from the command line.
```bash
git remote add origin <REPO_URL>
git branch -M main
git push -u origin main
```
