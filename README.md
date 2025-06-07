# PickleCourt Pro - Pickleball Court Management Platform

A comprehensive indoor pickleball court management platform with user authentication, court booking, payment processing, and administrative features.

## Features

### User Features
- **Court Booking System**: Real-time availability, flexible scheduling
- **Secure Payments**: Stripe integration for bookings and subscriptions
- **Session Management**: Start/end court time tracking with grace periods
- **Flexible Cancellation**: Full refund 1+ hours before, 50% within grace period
- **Notifications**: Booking confirmations and session reminders
- **Premium Subscriptions**: Unlimited bookings and priority access

### Admin Features
- **Dashboard Analytics**: User metrics, revenue tracking, booking statistics
- **Court Management**: Add/edit courts, set pricing, manage availability
- **Booking Oversight**: Monitor all platform bookings
- **Configurable Settings**: Business hours, cancellation policies, fees

### Technical Features
- **Responsive Design**: Desktop, tablet, and mobile optimized
- **Role-based Access**: User and Admin dashboards
- **RESTful API**: Clean, documented API architecture
- **Database Integration**: PostgreSQL with Drizzle ORM

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect
- **Payments**: Stripe
- **Testing**: Vitest, Testing Library
- **Deployment**: Docker, Replit Deployments

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Stripe account (for payments)

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pickleball
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
SESSION_SECRET=your_session_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=your_domain.com
```

### Installation & Setup
```bash
# Clone repository
git clone <your-repo-url>
cd pickleball-platform

# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Testing
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Deployment Options

### 1. Replit Deployment (Recommended)
- Click "Deploy" in Replit interface
- Automatic SSL, scaling, and domain management
- Zero-config deployment

### 2. Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t pickleball-app .
docker run -p 5000:5000 --env-file .env pickleball-app
```

### 3. Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development Environments

### Managing from Replit
**Pros:**
- Zero setup required
- Integrated database and secrets management
- Built-in deployment
- Collaborative editing
- Automatic environment synchronization

**Best for:**
- Quick prototyping
- Team collaboration
- Simple deployments
- Learning and experimentation

### Managing from VS Code
**Pros:**
- Full IDE features and extensions
- Advanced debugging capabilities
- Git integration
- Custom tooling and workflows
- Offline development

**Setup for VS Code:**
```bash
# Clone from Replit
git clone <replit-repo-url>

# Install dependencies
npm install

# Setup local environment file
cp .env.example .env
# Edit .env with your credentials

# Setup local database
createdb pickleball_local
npm run db:push

# Start development
npm run dev
```

**Recommended Workflow:**
1. **Rapid Prototyping**: Use Replit for initial development
2. **Feature Development**: Switch to VS Code for complex features
3. **Deployment**: Use Replit deployments for staging/production

## API Documentation

### Authentication
All protected routes require authentication via Replit OpenID.

### Core Endpoints

#### Courts
- `GET /api/courts` - List all active courts
- `GET /api/courts/:id` - Get court details
- `POST /api/courts` - Create court (admin only)
- `PUT /api/courts/:id` - Update court (admin only)

#### Bookings
- `GET /api/bookings` - User's bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/start` - Start session
- `POST /api/bookings/:id/end` - End session
- `POST /api/bookings/:id/cancel` - Cancel booking

#### Payments
- `POST /api/create-payment-intent` - Create payment for booking
- `POST /api/get-or-create-subscription` - Subscription management

## Business Rules

### Cancellation Policy
- **Full Refund**: Cancel 1+ hours before start time
- **50% Refund**: Cancel within 5-minute grace period
- **No Refund**: Late cancellations or no-shows

### Configurable Settings
- Business hours (6:00 AM - 11:00 PM default)
- Platform fee ($2.50 default)
- Maximum booking duration (4 hours default)
- Advance booking window (30 days default)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Run tests: `npm run test`
4. Commit changes: `git commit -m 'Add new feature'`
5. Push to branch: `git push origin feature/new-feature`
6. Submit pull request

## License

MIT License - see LICENSE file for details