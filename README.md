# Focus Flow - Study Gamification App

Gamify your study sessions and grow your own virtual garden. Focus Flow is a modern study application that uses gamification techniques to enhance your focus and productivity.

## 🚀 Running the Project Locally

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Supabase** account (free tier available)

### Installation Steps

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd studio-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create Environment Variables (.env.local)**
   
   Create a `.env.local` file in the project root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   You can get the URL and anon key from Supabase Dashboard → Settings → API.

4. **Create Database Schema**
   
   Go to Supabase Dashboard → SQL Editor and run the SQL script from the `database-schema.sql` file.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   After the server starts, open the following address in your browser:
   ```
   http://localhost:9002
   ```

## 📚 Technologies and Languages Used

### Frontend Framework & Library
- **Next.js 15.5.9** - React framework (App Router)
- **React 19.2.1** - UI library
- **TypeScript 5** - Type-safe JavaScript

### Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities
- **Radix UI** - Accessible component primitives
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Label, Popover, Progress, Radio Group, Select, Separator, Slider, Switch, Tabs, Toast, Tooltip

### Backend & Database
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions

### Data Visualization
- **Recharts 2.15.1** - Chart library (Bar Chart, Pie Chart)

### Form Management
- **React Hook Form 7.54.2** - Form state management
- **Zod 3.24.2** - Schema validation
- **@hookform/resolvers 4.1.3** - Form validation resolvers

### UI Components & Utilities
- **Lucide React 0.475.0** - Icon library
- **class-variance-authority 0.7.1** - Component variants
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 3.0.1** - Tailwind class merging
- **date-fns 3.6.0** - Date utility library
- **react-day-picker 9.11.3** - Date picker component

### AI & Machine Learning
- **Genkit 1.20.0** - AI workflow framework
- **@genkit-ai/google-genai 1.20.0** - Google Generative AI integration
- **@genkit-ai/next 1.20.0** - Next.js integration for Genkit

### Other Libraries
- **embla-carousel-react 8.6.0** - Carousel component
- **dotenv 16.5.0** - Environment variable management

## 📁 Project Structure

```
studio-main/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Dashboard (Home page)
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   ├── profile/      # Profile page
│   │   ├── garden/       # Garden page
│   │   ├── analysis/     # Analysis page
│   │   └── ...
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── garden/       # Garden components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI primitives
│   ├── supabase/         # Supabase configuration & hooks
│   ├── lib/              # Utility functions & types
│   └── hooks/            # Custom React hooks
├── database-schema.sql   # Supabase database schema
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Dependencies
```

## 🎯 Features

- ✅ User authentication (Login/Signup)
- ✅ Password reset functionality
- ✅ Study Timer (Pomodoro-like)
- ✅ Subject-based study tracking
- ✅ Virtual garden (flower growing)
- ✅ Achievement system
- ✅ Statistics and analytics (charts)
- ✅ Profile management and avatar selection
- ✅ Real-time data synchronization

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📝 Important Notes

- Development server port: **9002**
- Supabase database schema: Run the SQL script from `database-schema.sql` in Supabase SQL Editor
- Environment variables: Don't forget to create the `.env.local` file

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
