# Vertexia - Ticket Management System

A full-stack web application for managing support tickets with user authentication and ticket tracking capabilities.

## Features

- 🔐 **Secure User Authentication** with JWT tokens
- 💪 **Strong Password Requirements** (numbers & special characters required)
- 🎫 **Ticket Management** - Create, view, and track support tickets
- 📊 **User Dashboard** - Monitor ticket status and activity
- 🔒 **Protected Routes** - Middleware-based authentication
- 📱 **Responsive UI** - Clean, user-friendly interface

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- REST API Integration

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)
- Vercel deployment ready

## Project Structure

```
vertexia/
├── client/                 # Frontend files
│   ├── index.html         # Main dashboard
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── tickets.html       # Tickets page
│   ├── status.html        # Status page
│   ├── report.html        # Reports page
│   ├── script.js          # Main application logic
│   ├── tickets.js         # Ticket management logic
│   ├── api.js             # API service layer
│   ├── auth.js            # Authentication utilities
│   └── style.css          # Styling
│
└── server/                # Backend files
    ├── server.js          # Express server setup
    ├── package.json       # Dependencies
    ├── vercel.json        # Vercel configuration
    ├── middleware/
    │   └── auth.js        # JWT authentication middleware
    ├── models/
    │   ├── User.js        # User data model
    │   └── Ticket.js      # Ticket data model
    └── routes/
        ├── auth.js        # Authentication endpoints
        └── tickets.js     # Ticket endpoints
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vertexia
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the client**
   Open `client/index.html` in your browser or serve it using a local web server.

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register a new user
  - Required fields: `fullname`, `email`, `password`
  - Password requirements: Min 8 characters, 1 number, 1 special character

- **POST** `/api/auth/login` - Login user
  - Required fields: `email`, `password`

### Tickets
- **GET** `/api/tickets` - Get all tickets (requires authentication)
- **POST** `/api/tickets` - Create new ticket (requires authentication)
- **GET** `/api/tickets/:id` - Get ticket by ID (requires authentication)
- **PUT** `/api/tickets/:id` - Update ticket (requires authentication)
- **DELETE** `/api/tickets/:id` - Delete ticket (requires authentication)

## Password Security

Passwords are required to contain:
- ✅ Minimum 8 characters
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*-_.+=)

Example valid passwords:
- `MyTicket@2026`
- `Secure#Pass123`
- `Admin_2026!`

## Authentication

The application uses JWT (JSON Web Tokens) for secure authentication:
- Tokens are issued upon successful login/registration
- Include token in the `Authorization` header: `Bearer <token>`
- Tokens expire after 7 days (configurable in `.env`)

## Security Features

- 🔐 Password hashing with bcryptjs (10 salt rounds)
- 🛡️ JWT token-based authentication
- ✔️ Email validation
- 🔒 Protected API routes with middleware
- 💪 Strong password requirements to prevent brute force attacks

## Deployment

The application is configured for Vercel deployment. The `vercel.json` file handles serverless function configuration.

To deploy:
```bash
npm install -g vercel
vercel
```

## Development

To start the server in development mode:
```bash
cd server
npm start
```

## Error Handling

API responses follow a consistent format:
- **Success**: `{ success: true, data: {...} }`
- **Error**: `{ success: false, message: "Error description" }`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue in the repository.
