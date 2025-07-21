# SEO Analyzer Pro

A comprehensive, production-ready SEO analysis web application built with Next.js 15, Supabase, and Stripe. This professional-grade tool provides detailed website SEO analysis with user authentication, subscription management, and analytics.

## 🚀 Features

### Core SEO Analysis
- **Complete Website Analysis**: Meta tags, content quality, link structure, performance, crawlability, and external factors
- **Real-time Scanning**: Fast analysis using Cheerio and custom SEO algorithms
- **Interactive Results**: Collapsible cards with detailed insights and recommendations
- **Live Preview**: Iframe-based preview of analyzed websites
- **Overall Score**: Comprehensive SEO score with visual donut chart

### User Management
- **Authentication**: Secure sign-up/sign-in with Supabase Auth
- **User Profiles**: Personalized dashboard and profile management
- **Scan History**: Complete history of all user scans with search and filtering

### Subscription & Payments
- **Free Tier**: 3 scans per day for free users
- **Pro Tier**: Unlimited scans with advanced features
- **Stripe Integration**: Secure payment processing with webhooks
- **Usage Tracking**: Real-time usage monitoring and limits

### Analytics & Reporting
- **PDF Export**: Professional PDF reports using jsPDF
- **Analytics Dashboard**: Scan statistics and insights
- **Usage Analytics**: Track scan counts, score distributions, and trends

### Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animated Interface**: Smooth transitions with Framer Motion
- **Premium Feel**: Professional design with modern components
- **Dark/Light Themes**: Coming soon

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **PDF Generation**: jsPDF + html2canvas
- **SEO Analysis**: Cheerio, Axios

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd seo-app
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Pricing Configuration
STRIPE_PRICE_ID_PRO_MONTHLY=price_pro_monthly_id
STRIPE_PRICE_ID_PRO_YEARLY=price_pro_yearly_id
```

### 3. Database Setup

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  daily_scans_used INTEGER DEFAULT 0,
  last_scan_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scan_reports table
CREATE TABLE scan_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  overall_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_logs table
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own scan reports" ON scan_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan reports" ON scan_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan reports" ON scan_reports
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Stripe Setup

1. Create products and prices in your Stripe dashboard
2. Update the price IDs in your environment variables
3. Set up webhook endpoints:
   - `https://your-domain.com/api/stripe/webhook`
   - Events to listen for: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your SEO analyzer!

## 📁 Project Structure

```
seo-app/
├── src/
│   ├── app/                    # Next.js 15 app directory
│   │   ├── api/               # API routes
│   │   │   ├── scan/          # SEO analysis endpoint
│   │   │   ├── reports/       # Report management
│   │   │   ├── analytics/     # Analytics data
│   │   │   └── stripe/        # Stripe webhooks & checkout
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout with auth provider
│   │   └── page.tsx           # Main application page
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # User dashboard
│   │   ├── landing/           # Landing page components
│   │   ├── layout/            # Layout components
│   │   ├── pricing/           # Pricing page
│   │   ├── seo/               # SEO analysis components
│   │   └── ui/                # Base UI components
│   ├── contexts/              # React contexts
│   │   └── auth-context.tsx   # Authentication context
│   ├── lib/                   # Utility libraries
│   │   ├── pdf-export.ts      # PDF generation
│   │   ├── seo-analyzer.ts    # Core SEO analysis engine
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Common utilities
│   └── types/                 # TypeScript type definitions
│       └── seo.ts             # SEO analysis types
├── public/                    # Static assets
├── .env.example              # Environment variables template
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable Email authentication in Auth settings
3. Run the SQL queries provided above
4. Copy your project URL and anon key to environment variables

### Stripe Setup
1. Create a Stripe account
2. Create products for Pro Monthly and Pro Yearly plans
3. Copy the price IDs to environment variables
4. Set up webhook endpoints for subscription management

## 📊 Usage Analytics

The app tracks various analytics:
- Scan counts per user
- Average SEO scores
- Most scanned domains
- Score distributions
- Usage patterns

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security with Supabase
- **Authentication Guards**: Protected routes and API endpoints
- **Rate Limiting**: Built-in usage limits for free users
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Protection**: Secure API endpoints

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🎨 Customization

### Branding
- Update the logo and branding in `src/components/layout/navigation.tsx`
- Modify colors in `tailwind.config.js`
- Update metadata in `src/app/layout.tsx`

### SEO Analysis
- Modify analysis algorithms in `src/lib/seo-analyzer.ts`
- Add new analysis sections by creating components in `src/components/seo/`
- Update types in `src/types/seo.ts`

### Pricing
- Modify pricing tiers in `src/components/pricing/pricing-page.tsx`
- Update usage limits in `src/app/api/reports/route.ts`

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify your environment variables
   - Check if RLS policies are properly set up

2. **Stripe Webhook Failures**
   - Ensure webhook secret is correct
   - Check webhook URL is accessible
   - Verify event types are configured

3. **PDF Export Issues**
   - Check if html2canvas is properly loaded
   - Verify no CORS issues with analyzed websites

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js, Supabase, and Stripe
- UI components from Radix UI
- Icons from Lucide React
- Animations with Framer Motion

## 📧 Support

For support, email support@seoanalyzerpro.com or create an issue in the repository.

---

**Built with ❤️ by Cascade AI**
