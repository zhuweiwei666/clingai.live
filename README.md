# ClingAI - AI Video & Image Generator

A powerful AI-powered platform for generating videos from images, face swapping, dress-up transformations, and more.

## 🚀 Features

- **Photo to Video** - Transform static images into dynamic videos
- **AI Image Generation** - Create stunning AI-generated images
- **Face Swap** - Swap faces in images and videos
- **Dress Up** - Change outfits on any photo
- **HD Upscale** - Enhance image resolution
- **Remove** - Remove backgrounds and watermarks

## 🛠 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS (iOS Glassmorphism design)
- Framer Motion (animations)
- Zustand (state management)
- React Router DOM
- Google OAuth

### Backend
- Node.js + Express
- JWT Authentication
- RESTful API

## 📁 Project Structure

```
ClingAI.live/
├── src/                    # Frontend source
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── store/              # Zustand stores
│   └── utils/              # Utility functions
├── server/                 # Backend source
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration
│   └── index.js            # Server entry
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Development

```bash
# Run frontend (port 3000)
npm run dev

# Run backend (port 3001)
npm run server

# Run both concurrently
npm run dev:all
```

### Build

```bash
npm run build
```

## 🔧 Environment Variables

Create a `.env` file in the root and `/server` directory:

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (server/.env)
```
PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Home - Video template gallery |
| `/ai-image` | AI Image generation |
| `/face-swap` | Face swap feature |
| `/dress-up` | Dress up feature |
| `/hd` | HD upscaling |
| `/remove` | Background/watermark removal |
| `/create` | Creation workflow |
| `/profile` | User profile |
| `/pricing` | Coins & subscriptions |
| `/login` | Login page |
| `/register` | Registration page |

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Video
- `POST /api/video/generate` - Generate video from image
- `POST /api/video/face-swap` - Face swap video
- `GET /api/video/status/:taskId` - Get generation status

### Image
- `POST /api/image/generate` - Generate AI image
- `POST /api/image/face-swap` - Face swap image
- `POST /api/image/dress-up` - Dress up
- `POST /api/image/hd-upscale` - HD upscale
- `POST /api/image/remove` - Remove background/watermark

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/trending` - Trending templates
- `GET /api/templates/:id` - Get single template

## 📄 License

MIT License

## 📞 Support

Email: support@clingai.live
