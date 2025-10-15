# TruComm Backend API

Complete authentication and purchase system for TruComm with automatic user credential generation.

## Features

- ✅ Complete user authentication system
- ✅ Purchase flow with coupon system and GST calculation (18%)
- ✅ Automatic username and MMID generation
- ✅ Secure credential generation and email delivery
- ✅ JSON credential download functionality
- ✅ JWT-based authentication
- ✅ Prisma database integration
- ✅ Email service integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd TruComm-Software/Server/TruComm-Backend
npm install
```

### 2. Environment Configuration

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="your-database-url"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateway
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run seed
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with software credentials
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Purchase Flow
- `POST /api/purchase/process` - Process purchase and create user
- `GET /api/purchase/:purchaseId` - Get purchase details
- `GET /api/purchase/user/:userId` - Get user's purchase history

### Plans
- `GET /api/plans` - Get all active plans
- `GET /api/plans/:planId` - Get plan by ID
- `POST /api/plans` - Create new plan (Admin)
- `PUT /api/plans/:planId` - Update plan (Admin)
- `DELETE /api/plans/:planId` - Delete plan (Admin)

### Coupons
- `POST /api/coupons/validate` - Validate coupon code
- `GET /api/coupons` - Get all active coupons
- `POST /api/coupons` - Create new coupon (Admin)
- `PUT /api/coupons/:couponId` - Update coupon (Admin)
- `DELETE /api/coupons/:couponId` - Delete coupon (Admin)

## Purchase Flow

1. **User selects a plan** from the frontend
2. **User fills purchase form** with personal details
3. **Coupon validation** (optional) with real-time discount calculation
4. **GST calculation** (18% on discounted amount)
5. **Payment processing** (integrated with payment gateway)
6. **User account creation** with auto-generated credentials:
   - Username: `firstname_lastname_mmid`
   - Software Login Email: `username_mmid@trucomm.com`
   - MMID: 10-digit cryptographic identifier
   - Secure password: Auto-generated
7. **Credential delivery**:
   - JSON file download
   - Email with credentials and instructions
8. **Database storage** of all user and purchase data

## Database Schema

### User Model
- `id`, `username`, `email`, `workEmail`
- `designation` (ADMIN, CEO, HR, EMPLOYEE)
- `currentIP`, `mmid`, `softwareLoginEmail`
- `password` (hashed), `isActive`
- Relations: `purchases`, `loginSessions`

### Purchase Model
- `id`, `userId`, `planId`, `couponId`
- Payment details: `amount`, `discountAmount`, `gstAmount`, `totalAmount`
- `paymentStatus`, `paymentId`, `paymentMethod`
- User details: `userIP`, `userAgent`
- Relations: `user`, `plan`, `coupon`

### Plan Model
- `id`, `name`, `type`, `description`
- `price`, `features[]`, `duration`
- `isActive`
- Relations: `purchases`

### Coupon Model
- `id`, `code`, `description`
- Discount: `discountType`, `discountValue`, `minAmount`, `maxDiscount`
- Usage: `usageLimit`, `usedCount`
- Validity: `validFrom`, `validUntil`, `isActive`
- Relations: `purchases`

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access and refresh tokens
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Email format, work email validation
- **Secure Credentials**: Auto-generated secure passwords
- **Session Management**: Login session tracking

## Email Integration

The system automatically sends:
1. **Login credentials email** with JSON attachment
2. **Welcome email** with getting started guide
3. **Security instructions** and best practices

## Development Tools

```bash
# Database management
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes

# Database seeding
npm run seed         # Seed with initial data
```

## Frontend Integration

The frontend (Next.js) integrates with this API through:
- Purchase modal with real-time coupon validation
- GST calculation display
- Credential download functionality
- Payment processing integration

## Production Deployment

1. Update environment variables for production
2. Set up proper SMTP configuration
3. Configure payment gateway (Stripe/Razorpay)
4. Set up database with proper security
5. Enable HTTPS and security headers
6. Set up monitoring and logging

## Support

For issues or questions, please check the API documentation or contact the development team.
