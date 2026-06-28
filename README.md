# The Fitness Gym - Dashboard

A modern, full-stack fitness gym management system with a clean and organized UI.

## Features

- **Dashboard**: Real-time statistics, revenue charts, and member overview
- **Members Management**: View, add, and manage gym members
- **Classes Management**: Schedule and manage fitness classes
- **Bookings System**: Track and manage class bookings
- **Settings**: Configure gym information and preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for beautiful icons
- **State Management**: Zustand
- **API Calls**: Axios & React Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── dashboard/        # Dashboard components
│   └── layout/           # Layout components
└── styles/               # Global styles
```

## Pages

- `/dashboard` - Main dashboard with statistics and charts
- `/dashboard/members` - Members management
- `/dashboard/classes` - Classes management
- `/dashboard/bookings` - Bookings management
- `/dashboard/settings` - Settings and preferences

## API Endpoints

- `GET/POST /api/members` - Manage members
- `GET/POST /api/classes` - Manage classes
- `GET/POST /api/bookings` - Manage bookings
- `GET /api/dashboard` - Dashboard data

## Design Features

- **Dark Theme**: Modern dark interface with primary blue accent
- **Clean Layout**: Organized navigation and intuitive interface
- **Responsive**: Mobile-first design that works on all devices
- **Animations**: Smooth transitions and loading states
- **Data Visualization**: Charts and graphs for better insights
- **Real-time Updates**: Dynamic statistics and member data

## License

MIT
