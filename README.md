# Expo Event Management Platform

A comprehensive event management platform for organizing exhibitions, managing exhibitors, capturing visitor leads, and facilitating business connections.

## Features

- 🎫 **Multi-tenant Architecture**: Support for multiple organizations and events
- 👥 **User Management**: Master admin, organization, exhibitor, and visitor roles
- 📱 **QR Code Scanning**: Fast visitor check-in and lead capture
- 📸 **OCR Business Card Scanning**: Automatic data extraction from business cards
- 📊 **Analytics Dashboard**: Real-time event metrics and insights
- 💼 **Lead Management**: Capture, track, and export leads
- 📧 **Notifications**: Email and SMS integration (SMTP & Twilio)
- 🔐 **GST Verification**: Automatic GSTIN validation
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🌐 **HTTPS Support**: Secure camera access for QR scanning

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- QR Code libraries (html5-qrcode, qrcode)
- Tesseract.js (OCR)

### Backend
- Node.js 18+
- Express 5
- PostgreSQL
- Nodemailer (Email)
- Twilio (SMS)

### AWS Deployment
- AWS RDS (PostgreSQL)
- AWS Elastic Beanstalk (Backend)
- AWS S3 + CloudFront (Frontend)

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Expo_project
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   ```

3. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb expo_db

   # Run schema
   psql expo_db < server/schema.sql

   # Run migrations
   cd server/migrations
   for file in *.sql; do psql expo_db < "$file"; done
   ```

4. **Configure environment variables**
   ```bash
   # Copy example env file
   cd server
   cp .env.example .env

   # Edit .env and add your credentials
   nano .env
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: https://localhost:5173
   - Backend API: http://localhost:5000

## AWS Deployment

### Quick Start

```bash
# 1. Set up AWS infrastructure
cd infrastructure
./aws-setup.sh

# 2. Configure environment variables
nano .env.production

# 3. Deploy backend
./backend-deploy.sh

# 4. Deploy frontend
./frontend-deploy.sh
```

### Detailed Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide (automated & manual)
- **[AWS_SETUP.md](AWS_SETUP.md)** - Infrastructure details and configuration
- **[MAINTENANCE.md](MAINTENANCE.md)** - Operations, troubleshooting, and maintenance

### Deployment Workflow

Use the built-in workflow for guided deployment:
```bash
# See .agent/workflows/deploy-aws.md
```

## Project Structure

```
Expo_project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx       # Main app component
│   │   └── Index.jsx     # Entry point
│   ├── dist/             # Production build
│   └── package.json
│
├── server/                # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── services/         # Business logic
│   ├── migrations/       # Database migrations
│   ├── server.js         # Express server
│   ├── db.js            # Database connection
│   └── package.json
│
├── infrastructure/       # AWS deployment scripts
│   ├── aws-setup.sh     # Infrastructure provisioning
│   ├── backend-deploy.sh # Backend deployment
│   ├── frontend-deploy.sh # Frontend deployment
│   └── terraform/       # IaC (optional)
│
└── .agent/workflows/    # Deployment workflows
```

## Environment Variables

### Backend (.env)

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=expo_db

# Email (optional for development)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM="Expo Platform <noreply@example.com>"

# SMS (optional for development)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM=+1234567890

# GST Verification (optional)
GST_API_KEY=your_api_key
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://your-backend-url.com
VITE_ENV=production
```

## User Roles

| Role | Access |
|------|--------|
| **Master Admin** | Full system access, tenant management, analytics |
| **Organization** | Event management, exhibitor management, reporting |
| **Exhibitor** | Lead capture, QR scanning, lead management |
| **Visitor** | Registration, QR code generation |

## Key Features

### QR Code System
- **Visitor QR Codes**: Generated on registration for quick check-in
- **Exhibitor Scanning**: Camera-based scanning with real-time lead capture
- **HTTPS Required**: Automatic HTTPS in production for camera access

### Lead Capture Methods
1. **QR Scanning**: Scan visitor QR codes
2. **OCR Scanning**: Scan business cards with automatic data extraction
3. **Manual Entry**: Direct form input

### Analytics Dashboard
- Active tenants and events
- Visitor and exhibitor metrics
- Lead capture statistics
- Revenue tracking
- Real-time event monitoring

## API Endpoints

### Authentication
- `POST /api/login` - Unified login (all user types)
- `POST /api/organization-login` - Organization login
- `POST /api/exhibitor-login` - Exhibitor login
- `POST /api/visitor-login` - Visitor login

### Organizations
- `GET /api/organizations` - List all organizations
- `POST /api/create-organization` - Create organization
- `POST /api/send-invite` - Send invitation

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event

### Exhibitors
- `GET /api/exhibitors` - List exhibitors
- `POST /api/exhibitors` - Create exhibitor

### Visitors
- `GET /api/visitors` - List visitors
- `POST /api/visitors` - Register visitor
- `GET /api/visitors/code/:uniqueCode` - Get visitor by code

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Utilities
- `POST /api/verify-gstin` - Verify GST number

## Development

### Database Migrations

```bash
# Create new migration
cd server/migrations
touch 00X_migration_name.sql

# Apply all migrations
for file in *.sql; do psql expo_db < "$file"; done
```

### Building for Production

```bash
# Frontend
cd client
npm run build

# Backend
cd server
npm install --production
```

## Troubleshooting

### Camera Access Not Working
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions
- Development uses `@vitejs/plugin-basic-ssl` for local HTTPS

### Database Connection Issues
- Verify PostgreSQL is running
- Check .env credentials
- Ensure database exists

### CORS Errors
- Check backend CORS configuration in `server.js`
- Verify frontend API URL configuration

For more troubleshooting, see [MAINTENANCE.md](MAINTENANCE.md).

## Cost Estimates

### AWS Deployment
- **Development**: ~$20-30/month (minimal resources)
- **Production**: ~$50-100/month (with redundancy)
- See [AWS_SETUP.md](AWS_SETUP.md) for detailed cost breakdown

## Security

- ✅ HTTPS enforced in production
- ✅ Environment variables for secrets
- ✅ Password hashing (bcrypt)
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration
- ✅ Input validation
- 🔒 AWS Security Groups (production)
- 🔒 Database encryption at rest (production)

## Performance

- ⚡ Connection pooling for database
- ⚡ CloudFront CDN for static assets
- ⚡ Auto-scaling (production)
- ⚡ Optimized bundle splitting (vendor chunks)
- ⚡ Compression enabled

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues and questions:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
- Check [MAINTENANCE.md](MAINTENANCE.md) for operations
- Review [AWS_SETUP.md](AWS_SETUP.md) for infrastructure details

## Roadmap

- [ ] Custom domain setup guide
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Enhanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Integration with payment gateways
- [ ] Advanced lead scoring
- [ ] WhatsApp integration
- [ ] Multi-language support

## Acknowledgments

- Built with React, Node.js, and PostgreSQL
- Deployed on AWS infrastructure
- QR code scanning powered by html5-qrcode
- OCR powered by Tesseract.js
