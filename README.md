# Cartza E-Commerce 🛒

**Live Demo:** [cartza-by-hitarth.vercel.app](https://cartza-by-hitarth.vercel.app)

Cartza is a modern, high-performance MERN (MongoDB, Express, React, Node.js) stack e-commerce web application. Featuring a fully integrated checkout system, product catalogs, brand management, reviews, and a robust admin dashboard.

---

## ✨ Features

- **Responsive Frontend**: Premium layout using React, Redux, and modern styling built for dynamic shopping.
- **State Management**: Scalable global store powered by Redux and Thunk middleware.
- **RESTful API**: Fast and modular backend API built using Node.js, Express, and Mongoose.
- **Real-Time Connections**: Live updates and communications powered by Socket.io.
- **Cloud Media Management**: Cloudinary integration for smooth product image uploads.
- **Fail-Safe Database Driver**: Built-in DNS helper configuration to bypass ISP/local DNS blocks on MongoDB Atlas SRV (`querySrv ECONNREFUSED`) lookups.
- **Database Seeding**: Easily populate your store with 100+ random products, brands, categories, and an admin user.
- **Vercel Monorepo Ready**: Fully configured for zero-setup deployments to Vercel.

---

## 🛠️ Tech Stack

* **Frontend**: React (v18.3.1), Redux, Webpack, SASS/SCSS, Reactstrap
* **Backend**: Node.js, Express, Socket.io, Mongoose (v8.24.1)
* **Database**: MongoDB (Atlas)
* **Cloud Storage**: Cloudinary (Image uploads)
* **Hosting**: Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- A MongoDB Atlas cluster (or local MongoDB database instance)
- Cloudinary credentials (for image uploads)
- Google OAuth credentials (optional, for Google Sign-in)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Thesia-Hitarth/Cartza-by-hitarth.git
   cd Cartza-by-hitarth
   ```

2. Install all root, client, and server dependencies automatically:
   ```bash
   npm install
   ```

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `server/` directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/<database_name>?appName=Cartza-E-Commerce
JWT_SECRET=your_jwt_secret_key

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Client URL
CLIENT_URL=http://localhost:8080
BASE_API_URL=api

# SMTP Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_EMAIL_SENDER=your_email@gmail.com

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=Cartza-E-Commerce
```

---

## 🗄️ Database Seeding

You can easily generate mock products, categories, brands, and seed an admin user into your MongoDB database by running the seed script from the server directory:

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Run the seed script with your desired admin email and password:
   ```bash
   npm run seed:db admin@example.com admin123
   ```
This will seed:
* **Admin User**: Email `admin@example.com` (password `admin123`)
* **Categories**: 10 department categories
* **Brands**: 10 company brands
* **Products**: 100 random mock products linked to brands and categories

---

## 💻 Running the App Locally

To start both the client dev server and the backend express server in parallel from the root directory:

```bash
npm run dev
```

* **Client**: Runs on [http://localhost:8080](http://localhost:8080)
* **Server/API**: Runs on [http://localhost:3000](http://localhost:3000)

---

## 📦 Building for Production

To compile the React client files into high-performance static bundles:

```bash
npm run build
```
The built files will be located in the `client/dist` directory.

---

## 📄 License

This project is licensed under the MIT License.
