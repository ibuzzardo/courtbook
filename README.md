# CourtBook - Tennis Court Hire Management System

A full-stack tennis court hire management system built with React + Vite frontend and Express.js backend.

## Features

- **Court Management**: View available tennis courts with details
- **Booking System**: Book courts with date/time selection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Validation**: Client and server-side validation with Zod
- **Real-time Updates**: Dynamic pricing calculation
- **Error Handling**: Comprehensive error handling throughout

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- React Router v6 for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls
- Zod for validation

### Backend
- Express.js with TypeScript
- In-memory storage (Maps)
- CORS enabled
- Morgan for logging
- Zod for request validation

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd courtbook
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

Or run them separately:
```bash
# Frontend only
npm run dev:client

# Backend only
npm run dev:server
```

### Building for Production

```bash
npm run build
```

This builds both the client and server.

### Running in Production

```bash
npm start
```

## API Endpoints

### Courts
- `GET /api/courts` - Get all courts
- `GET /api/courts/:id` - Get court by ID

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID

### Health Check
- `GET /health` - Server health status

## Project Structure

```
courtbook/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client functions
│   │   └── types.ts       # TypeScript types
│   └── index.html
├── server/                 # Express backend
│   └── src/
│       ├── routes/        # API routes
│       ├── middleware/    # Express middleware
│       └── types.ts       # TypeScript types
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
SERVER_PORT=3001
NODE_ENV=development
```

## Design System

- **Primary Color**: #2563EB (Blue)
- **Secondary Color**: #10B981 (Green)
- **Font**: Inter
- **Components**: Custom components following shadcn/ui patterns
- **Responsive**: Mobile-first design (320px, 768px, 1280px breakpoints)

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript strict mode - no `any` types
3. Add proper error handling with try/catch blocks
4. Validate all inputs with Zod schemas
5. Write responsive, mobile-first CSS with Tailwind
6. Test at all breakpoints before submitting

## License

MIT License