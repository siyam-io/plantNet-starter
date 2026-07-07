# plantNet - Plant E-Commerce Portal

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge)](https://siyam-io.github.io/plantNet-starter/)
[![Server Backend](https://img.shields.io/badge/Backend%20API-Vercel-blue?style=for-the-badge)](https://server-two-kappa-29.vercel.app)

plantNet is a comprehensive plant e-commerce application allowing customers to purchase plants, sellers to list their inventory and manage orders, and admins to oversee users and roles.

## Core Features
- **Role-based Dashboards**: Separate and distinct layouts and functionalities for Customer, Seller, and Admin.
- **Secure Authentication**: Integration with Firebase authentication and custom JWT verification middlewares.
- **Inventory Management**: Sellers can add, update, and delete plants, which are automatically tracked in inventory.
- **Order Flow**: Real-time stock decrement on purchase, and automatic stock restoration upon cancellation.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, DaisyUI, TanStack Query, React Router DOM
- **Backend**: Node.js, Express, MongoDB (Atlas)
- **Deployment**:
  - Frontend: GitHub Pages
  - Backend: Vercel

## Deployment Configurations
### Backend (Vercel)
The backend is deployed to Vercel with configuration specified in `server/vercel.json`. It utilizes environment variables for database connections.

### Frontend (GitHub Pages)
The client is compiled with the base path `/plantNet-starter/` and published directly using the `gh-pages` deployment tool.
