# Tristan Smith - Portfolio Website

A modern, responsive portfolio website built with Next.js 15 featuring an intelligent AI assistant named **Swishter**. This portfolio showcases professional experience, projects, and personal interests while providing an interactive AI chat experience for visitors.

## 🚀 Features

### Core Portfolio
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light/System Theme**: Three-mode theme switcher with system preference detection
- **Smooth Navigation**: Section-based navigation with smooth scrolling
- **Professional Sections**: Hero, Experience, Projects, and Personal sections
- **Interactive Project Cards**: Detailed project showcases with modal views

### AI Assistant (Swishter)
- **Context-Aware Chat**: AI assistant trained on personal and professional context
- **Smart Email Notifications**: Intelligent filtering of business inquiries vs. general questions
- **Rate Limiting**: Built-in protection against spam (3 emails per IP per 24 hours)
- **Real-time Responses**: Powered by OpenAI GPT-3.5-turbo
- **Professional Filtering**: Advanced validation system for legitimate business inquiries

### Technical Features
- **Performance Optimized**: Built with Next.js 15 and Turbopack
- **Type-Safe**: Full TypeScript implementation
- **Modern UI**: shadcn/ui components with Radix UI primitives
- **Animation**: Smooth animations and transitions
- **Monitoring**: OpenTelemetry integration for production monitoring
- **Testing**: Comprehensive Playwright test suite

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with CSS variables
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **next-themes** - Theme management
- **Geist Font** - Typography

### Backend & AI
- **Vercel AI SDK** - AI integration
- **OpenAI GPT-3.5-turbo** - Language model
- **Vercel KV** - Rate limiting storage
- **Nodemailer** - Email notifications
- **OpenTelemetry** - Performance monitoring

### Development & Testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Playwright** - E2E testing
- **Turbopack** - Fast development builds

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy and configure environment variables
cp .env.example .env.local
```

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API key for AI chat
- `EMAIL_USER` - Email account for notifications
- `EMAIL_PASS` - Email password/app password
- `EMAIL_TO` - Recipient email for notifications
- `KV_REST_API_URL` - Vercel KV database URL
- `KV_REST_API_TOKEN` - Vercel KV access token

### Development

Start the development server:
```bash
npm run dev --turbopack
```

Open [http://localhost:3000](http://localhost:3000) to see the portfolio.

### Build

Build for production:
```bash
npm run build
npm start
```

### Code Quality

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

### Testing

Run E2E tests:
```bash
npx playwright test
```

## 📁 Project Structure

```
portfolio/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # AI chat endpoint
│   │   ├── validate-message/ # Email validation logic
│   │   └── send-notification/ # Email notifications
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main portfolio page
├── components/           # React components
│   ├── ai-assistant/     # AI chat components
│   ├── ui/              # shadcn/ui base components
│   └── [sections].tsx   # Portfolio sections
├── data/                # Static data
│   ├── experience.json  # Professional experience
│   ├── projects.json    # Project showcase data
│   └── personal-context.json # AI context data
├── lib/                 # Utilities
│   ├── utils.ts         # Common utilities
│   └── monitoring.ts    # OpenTelemetry setup
└── tests/              # Playwright tests
```

## 🤖 AI Assistant (Swishter)

The AI assistant is designed to:

1. **Answer Questions**: Provide information about professional background, skills, and projects
2. **Filter Inquiries**: Intelligently determine which conversations warrant email notifications
3. **Professional Focus**: Prioritize genuine business inquiries over casual questions
4. **Context Awareness**: Understand personal and professional context for relevant responses

### Email Notification Criteria

The AI validates conversations and sends notifications for:
- ✅ Direct hiring requests
- ✅ Interview opportunities  
- ✅ Project proposals
- ✅ Meeting/call requests
- ✅ Consulting inquiries
- ✅ Speaking invitations
- ✅ Collaboration proposals

But **not** for:
- ❌ General information questions
- ❌ Portfolio browsing
- ❌ Casual greetings
- ❌ Educational questions

## 🎨 Customization

### Theme System
The portfolio supports three theme modes:
- **System**: Matches user's OS preference
- **Light**: Light theme
- **Dark**: Dark theme

### Content Updates
- Update personal information in component files
- Modify project data in `data/projects.json`
- Update experience in `data/experience.json`
- Customize AI responses in `data/personal-context.json`

## 📊 Monitoring

Production deployments include:
- OpenTelemetry performance monitoring
- API endpoint tracking
- Error reporting
- Rate limiting analytics

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway  
- DigitalOcean App Platform
- AWS Amplify

## 📄 License

This project is private and proprietary.

## 👨‍💻 About

Built by **Tristan Smith** - Full-Stack Engineer and Data Scientist

- Website: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn]
- Email: [Your Email]

---

*This portfolio demonstrates modern web development practices, AI integration, and professional presentation in a single cohesive application.*