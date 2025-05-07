# MERN Stack Authentication with Quotes

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![JWT Authentication](https://img.shields.io/badge/Security-JWT-orange)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)

A complete MERN stack application featuring user registration, JWT authentication, and inspirational quote management.

## ✨ Features

- **User Authentication**
  - Secure registration with password hashing
  - JWT-based login system
  - Protected routes with token verification
- **Quotes System**
  - Create and share inspirational quotes
  - Like other users' quotes
  - View community quotes feed
- **Responsive UI**
  - Clean dashboard interface
  - Form validation
  - Real-time feedback

## 🛠 Tech Stack

| Layer        | Technology               |
|--------------|--------------------------|
| **Frontend** | React, React Router      |
| **Backend**  | Node.js, Express         |
| **Database** | MongoDB (Mongoose ODM)   |
| **Auth**     | JWT, bcrypt              |
| **Styling**  | CSS                      |

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eugenius-watchman/full-mern-stack.git
   cd full-mern-stack


Setup Backend
cd server
npm install
cp .env.example .env  # Update with your MongoDB URI and JWT secret

Setup Frontend
cd ../client
npm install

Run Development Servers
In one terminal (backend):
cd server
npm run dev

Run Development Servers
In another terminal (frontend):
cd client
npm start

🌐 API Endpoints
Method	Endpoint	Description
POST	/api/register	User registration
POST	/api/login	User login
GET	/api/verify-token	Validate JWT token
GET	/api/quotes	Get all quotes
POST	/api/quotes	Create new quote
POST	/api/quotes/:id/like	Like a quote

📸 Screenshots

🤝 Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📜 License
Distributed under the MIT License.

📧 Contact
Eugene Darrah-Gblorkpor - @eugenius-watchman


