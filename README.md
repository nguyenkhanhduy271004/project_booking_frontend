# Booking Dashboard - Frontend

A modern, responsive dashboard for managing hotel booking system built with React, TypeScript, Ant Design, and Tailwind CSS.

## Features

- 🏨 **Hotel Management** - Complete CRUD operations for hotels
- 🏠 **Room Management** - Manage rooms with images and amenities
- 📅 **Booking Management** - Handle reservations and check-ins/check-outs
- 👥 **User Management** - Admin panel for user accounts and roles
- 🎫 **Voucher Management** - Create and manage discount vouchers
- ⭐ **Evaluation Management** - Guest reviews and ratings
- 💳 **Payment Management** - Track payment transactions
- 📊 **Dashboard Analytics** - Charts and statistics
- 🔐 **Role-based Access Control** - Different permissions for different user types
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Ant Design** - UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Recharts** - Data visualization
- **Day.js** - Date manipulation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── layout/         # Layout components
├── pages/              # Page components
├── services/           # API services
├── store/              # State management
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles with Tailwind
```

## User Roles

- **SYSTEM_ADMIN** - Full system access
- **ADMIN** - Hotel and user management
- **MANAGER** - Hotel-specific management
- **STAFF** - Booking and guest services
- **GUEST** - Basic booking access

## Demo Accounts

- SYSTEM_ADMIN: `admin` / `admin123`
- MANAGER: `manager` / `manager123`
- STAFF: `staff` / `staff123`

## API Integration

The frontend integrates with a Spring Boot backend API. Make sure the backend is running on `http://localhost:8080` before starting the frontend.

### Key API Endpoints

- Authentication: `/api/auth/*`
- Dashboard: `/api/dashboard/*`
- Users: `/api/v1/users`
- Hotels: `/api/v1/hotels`
- Rooms: `/api/v1/rooms`
- Bookings: `/api/v1/bookings`
- Vouchers: `/api/v1/vouchers`
- Evaluations: `/api/v1/evaluates`
- Payments: `/api/payment/*`

## Styling

This project uses Tailwind CSS for styling with custom components and utilities. The design is:

- **Modern** - Clean, professional interface
- **Responsive** - Works on all device sizes
- **Accessible** - Follows accessibility best practices
- **Consistent** - Unified design system

## Development

### Code Style

- Use TypeScript for all components
- Follow React best practices
- Use Tailwind CSS classes for styling
- Implement proper error handling
- Add loading states for async operations

### State Management

- Global state: Zustand store
- Local state: React hooks
- API state: Axios interceptors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.