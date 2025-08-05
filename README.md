# CyberSaathi Mobile App

Your AI-powered cybersecurity companion. Stay safe, stay secure.

## Overview

CyberSaathi is a comprehensive mobile application designed to help users stay protected in the digital world. Built with React Native and Expo, it provides real-time cybersecurity assistance, threat detection, and educational resources.

## Features

### 🏠 Home Screen
- **Hero Section**: Welcome message with app branding
- **Quick Actions**: Fast access to common cybersecurity tasks
- **Feature Cards**: Overview of all available cybersecurity features
- **Emergency Contact**: Direct access to National Cyber Crime Helpline (1930)

### 💬 Chat Screen
- **AI-Powered Chatbot**: Intelligent cybersecurity assistant
- **Quick Action Buttons**: Pre-defined responses for common queries
- **URL Safety Check**: Scan websites for potential threats
- **Real-time Responses**: Instant guidance for cyber threats
- **Emergency Call**: One-tap access to helpline

### 📰 News Screen
- **Latest Cyber News**: Stay updated with cybersecurity trends
- **Categorized Articles**: News organized by security categories
- **External Links**: Direct access to full articles
- **Refresh Functionality**: Get the latest news updates

### ⚙️ More Screen
- **Emergency Helpline**: Prominent display of emergency contact
- **Downloadable Booklets**: Official cybersecurity guides
- **Contact Information**: Direct access to authorities
- **App Actions**: Share, rate, and visit official portal
- **App Information**: Version and developer details

## Key Features

### 🔒 Cybersecurity Assistance
- Report cyber crimes
- Website safety verification
- Security tips and best practices
- Emergency help guidance
- Phone blocking assistance
- TAFCOP mobile connection checks

### 🚨 Emergency Features
- **1930 Helpline**: National Cyber Crime Helpline
- **Chandigarh Cyber Cell**: Local cyber crime support
- **Email Support**: Direct communication channel
- **Official Portal**: Link to cybercrime.gov.in

### 📚 Educational Resources
- **CERT-IN Cyber Awareness Booklet**
- **Mahila Suraksha Handbook**: Women's cybersecurity guide
- **Internet Safety Guidelines**: Essential protection measures

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **UI Components**: React Native + Ionicons
- **Styling**: StyleSheet with custom design system
- **Gradients**: Expo Linear Gradient
- **Platform**: iOS, Android, Web

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CyberSaathi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation layout
│   ├── index.tsx            # Home screen
│   ├── chat.tsx             # Chat screen
│   ├── news.tsx             # News screen
│   └── more.tsx             # More screen
├── _layout.tsx              # Root layout
└── +not-found.tsx           # 404 page

components/                  # Reusable components
constants/
│   └── Colors.ts           # App color scheme
assets/                     # Images, fonts, etc.
```

## Design System

### Colors
- **Primary**: `#06b6d4` (Cyan)
- **Background**: `#0f172a` (Dark slate)
- **Surface**: `#1e293b` (Slate)
- **Text**: `#ffffff` (White)
- **Secondary Text**: `#94a3b8` (Slate gray)
- **Emergency**: `#dc2626` (Red)

### Typography
- **Headers**: Bold, 20-32px
- **Body**: Regular, 14-16px
- **Captions**: Regular, 12px

## API Integration

The app is designed to integrate with:
- **Groq AI API**: For intelligent chatbot responses
- **VirusTotal API**: For URL safety scanning
- **News APIs**: For cybersecurity news updates

## Security Features

- **URL Scanning**: Real-time website safety checks
- **Threat Detection**: AI-powered threat identification
- **Secure Communication**: Encrypted chat interactions
- **Privacy Protection**: No personal data storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed by CenCops for cybersecurity awareness and protection.

## Support

For support and queries:
- **Helpline**: 1930
- **Email**: cybercrime-chd@nic.in
- **Website**: https://cybercrime.gov.in/

## Version History

- **v1.0.0**: Initial release with core features
  - Home screen with quick actions
  - AI-powered chat interface
  - News feed with cybersecurity updates
  - Emergency contact integration
  - Downloadable security booklets

---

**Stay Safe, Stay Secure** 🔒
