# HomeMore - Long-Term Rental Platform for Poland

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)

> **More than renting. More confidence. More comfort. More home.**

HomeMore is a comprehensive digital ecosystem for long-term rentals in Poland, bringing together tenants and property owners in a safe, transparent, and convenient space.

## 🎯 Vision

To become the dominant platform for long-term rentals in Central and Eastern Europe, where every transaction is protected, transparent, and convenient for both parties.

## ✨ Key Features

### For Tenants
- 🔍 Advanced property search with map integration
- 📅 Online viewing scheduling
- 👥 Competition transparency (see number of applicants)
- ✅ Verified landlords
- 💬 Secure in-app messaging
- 📝 Digital contracts with QES
- 💳 Integrated rent payments
- 🛡️ Deposit protection
- ⭐ Landlord ratings and reviews
- 🛠️ Maintenance request system

### For Landlords
- 📋 Easy property listing management
- ✅ Tenant verification and screening
- 📅 Viewing calendar management
- 💬 Direct tenant communication
- 📝 Automated contract generation
- 💰 Secure payment collection
- 🏦 Deposit escrow management
- ⭐ Tenant ratings and reviews
- 📊 Analytics and insights

## 🏗️ Architecture

This is a monorepo managed with [Turbo](https://turbo.build/) containing:

```
homemore/
├── apps/
│   ├── web/          # Next.js frontend (TypeScript, Tailwind, shadcn/ui)
│   └── api/          # NestJS backend (TypeScript, Prisma, PostgreSQL)
├── packages/
│   ├── database/     # Prisma schema and migrations
│   ├── shared/       # Shared types and utilities
│   └── ui/           # Shared UI components
├── docs/             # Documentation
└── config/           # Shared configuration files
```

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Language:** TypeScript 5.3
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Maps:** Google Maps JavaScript API
- **i18n:** next-intl (Polish/English)
- **Real-time:** Socket.io client

### Backend
- **Framework:** [NestJS 10](https://nestjs.com/)
- **Language:** TypeScript 5.3
- **Database:** PostgreSQL 16 with PostGIS
- **ORM:** [Prisma](https://www.prisma.io/)
- **Cache:** Redis
- **Storage:** AWS S3
- **Real-time:** Socket.io
- **Authentication:** JWT (access + refresh tokens)
- **Validation:** class-validator + class-transformer

### Infrastructure
- **Hosting:** AWS (ECS Fargate) / Vercel
- **Database:** AWS RDS (PostgreSQL)
- **Cache:** AWS ElastiCache (Redis)
- **Storage:** AWS S3
- **CDN:** CloudFront / Cloudflare
- **Monitoring:** Datadog / New Relic
- **Error Tracking:** Sentry
- **CI/CD:** GitHub Actions

### Third-Party Services
- **Payments:** Stripe
- **QES:** Certum / Szafir
- **Verification:** Onfido / Jumio
- **Email:** SendGrid / AWS SES
- **SMS:** Twilio
- **Analytics:** Google Analytics 4 + Mixpanel
- **Support:** Intercom / Zendesk

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 16+ with PostGIS extension
- Redis 7+
- Docker and Docker Compose (for local development)

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vsemashko/long-rent.git
cd long-rent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` with your local configuration.

### 4. Start databases with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis containers.

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed the database (optional)

```bash
npm run db:seed
```

### 7. Start development servers

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

## 📚 Documentation

- [Market Analysis](./docs/MarketAnalysis_Poland_2025.md)
- [Competitor Analysis](./docs/CompetitorAnalysis.md)
- [Legal Requirements](./docs/LegalRequirements.md)
- [Development Plan](./Plan.md)
- [Implementation Roadmap](./ROADMAP.md)
- [API Documentation](http://localhost:3001/api) (when running)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

```bash
# Build all packages and apps
npm run build

# Build specific app
npm run build --filter=web
npm run build --filter=api
```

## 🚢 Deployment

### Frontend (Vercel)

```bash
vercel --prod
```

### Backend (AWS ECS)

```bash
npm run deploy:api
```

See [Deployment Guide](./docs/deployment.md) for detailed instructions.

## 🔒 Security

- All data encrypted at rest and in transit (TLS 1.3)
- JWT authentication with refresh token rotation
- Rate limiting on all API endpoints
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens
- Regular security audits

## 📊 Monitoring

- **Application:** Datadog / New Relic
- **Errors:** Sentry
- **Logs:** CloudWatch / ELK Stack
- **Analytics:** Google Analytics 4 + Mixpanel
- **Uptime:** StatusPage / UptimeRobot

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

- **Founder & CEO:** [Your Name]
- **CTO:** [To be hired]
- **Lead Developer:** [To be hired]

## 📞 Contact

- **Website:** https://homemore.pl
- **Email:** contact@homemore.pl
- **Twitter:** [@homemore_pl](https://twitter.com/homemore_pl)
- **LinkedIn:** [HomeMore](https://www.linkedin.com/company/homemore-pl)

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for our detailed implementation plan.

### Current Phase: Phase 0 - Foundation & Setup
- [x] Project structure
- [x] Package configuration
- [x] TypeScript setup
- [x] ESLint & Prettier
- [ ] Development environment
- [ ] CI/CD pipeline
- [ ] Legal compliance foundation

### Upcoming Milestones
- **Q1 2026:** MVP Launch (Warsaw)
- **Q2 2026:** Public Launch
- **Q3 2026:** Mobile Apps (iOS, Android)
- **Q4 2026:** Expansion to Kraków, Wrocław

## 📈 Status

![Development Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Phase](https://img.shields.io/badge/Phase-0%20Foundation-blue)
![Progress](https://img.shields.io/badge/Progress-5%25-orange)

---

**Made with ❤️ in Poland**
