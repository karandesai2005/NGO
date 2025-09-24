# NGO Volunteer & Operations Management App

A comprehensive React Native application built with Expo for managing NGO operations, volunteers, and parent communications. This MVP includes authentication, scheduling, chat functionality, and admin features with offline data persistence.

## Features

### 🔐 Authentication
- Email/password login and signup system
- Role-based access control (Admin, Volunteer, Parent)
- Local JSON-based user storage with AsyncStorage
- Demo accounts included for testing

### 💬 Communication
- Real-time chat interface using react-native-gifted-chat
- Pastel-themed message bubbles (pink for sent, purple for received)
- Local message storage and persistence
- Group chat functionality for volunteers

### 📅 Scheduling
- Interactive calendar using react-native-calendars
- Event management with date selection
- Admin-only event creation
- Teacher assignments and class scheduling
- Upcoming events display

### 👨‍💼 Admin Features
- Comprehensive dashboard with volunteer hours tracking
- Pie chart visualization using react-native-chart-kit
- User management and role statistics
- Bulk parent notification system
- Event management capabilities

### 📱 Parent Portal
- Schedule viewing for parent users
- Notification consent management
- Child information tracking

## Demo Credentials

The app includes pre-configured demo accounts:

- **Admin**: admin@akshar.org / admin123
- **Volunteer**: volunteer@akshar.org / volunteer123  
- **Parent**: parent@akshar.org / parent123

## Tech Stack

- **Framework**: React Native with Expo 53
- **Navigation**: Expo Router with tabs
- **Chat**: react-native-gifted-chat
- **Calendar**: react-native-calendars
- **Charts**: react-native-chart-kit
- **Storage**: AsyncStorage for local persistence
- **Icons**: Lucide React Native
- **Styling**: Custom styled components with gradient themes

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Run on device**:
   - Install Expo Go app on your phone
   - Scan the QR code displayed in the terminal
   - Or run on iOS/Android simulator

## Project Structure

```
app/
├── (auth)/           # Authentication screens
│   ├── login.tsx     # Login screen
│   └── signup.tsx    # Signup screen
├── (tabs)/           # Main app tabs
│   ├── index.tsx     # Home/Dashboard
│   ├── chat.tsx      # Chat interface
│   ├── schedule.tsx  # Calendar & Events
│   ├── admin.tsx     # Admin dashboard
│   └── notifications.tsx # Parent notifications
components/           # Reusable UI components
├── GradientBackground.tsx
├── Card.tsx
├── Button.tsx
└── Logo.tsx
contexts/            # React Context providers
└── AuthContext.tsx  # Authentication context
utils/               # Utility functions
└── storage.ts       # AsyncStorage helpers
types/               # TypeScript definitions
└── index.ts         # Type definitions
```

## Data Storage

All data is stored locally using AsyncStorage:

- **Users**: Authentication credentials and profiles
- **Messages**: Chat messages and history
- **Events**: Calendar events and schedules
- **Parents**: Parent contact information and consent
- **Volunteer Hours**: Progress tracking data

## Features by Role

### Admin Users
- Full dashboard with analytics
- User management capabilities
- Event creation and scheduling
- Bulk parent notifications
- Volunteer hours tracking
- Complete app access

### Volunteer Users
- Personal dashboard
- Chat functionality
- Schedule viewing
- Event participation
- Limited admin features

### Parent Users
- Schedule viewing only
- No chat access
- Notification preferences
- Child information management

## Design Theme

The app features a consistent pastel gradient design:
- **Primary Colors**: Light purple (#E8D5FF) to peach (#FFD1DC)
- **Accent**: Soft yellow (#FFEAA7)
- **Cards**: Rounded corners with subtle shadows
- **Typography**: Clean, readable fonts with proper hierarchy
- **Interactions**: Smooth animations and hover states

## Local Development Notes

- All data persists locally using AsyncStorage
- No external APIs required for basic functionality
- Mock data is automatically loaded on first run
- Console logging for notification system (demo mode)
- Responsive design works on all screen sizes

## Future Enhancements

- Integration with external APIs
- Real-time sync capabilities
- Push notification implementation
- Advanced reporting features
- Photo/file sharing in chat
- Advanced calendar integrations

## Support

For technical support or questions about the app, please refer to the inline code documentation and component structure. The app is designed to be self-contained and fully functional offline.# NGO
