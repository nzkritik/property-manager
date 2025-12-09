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

## 🔧 Troubleshooting

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
