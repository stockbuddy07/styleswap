# StyleSwap: Project Manifest & Functional Guide

This document provides a descriptive breakdown of every folder and file in the StyleSwap ecosystem, detailing their specific purpose and "working" logic.

## 📁 Root Directory
| File / Folder | Purpose |
| :--- | :--- |
| `client/` | React frontend application. |
| `server/` | Node.js / Express backend service. |
| `scripts/` | Global project automation. |
| `railway.toml` | Deployment configuration for Railway.app. |
| `vercel.json` | Deployment configuration for Vercel (Frontend). |

---

## 🎨 Client Manifest (`client/src/`)

### 📦 Components
| File | Working Logic |
| :--- | :--- |
| `Shared/Header.jsx` | Dynamic navigation with universal search. |
| `Shared/Sidebar.jsx` | Role-based menu for Admin/Partners. |
| `Shared/Loader.jsx` | Premium "Laser Flow" loading experience. |
| `Shared/Modal.jsx` | Glassmorphic overlay base for all forms. |
| `User/ProductCard.jsx` | High-fidelity editorial asset preview. |
| `User/ProductCatalog.jsx` | Multi-category discovery grid with sorting. |
| `Admin/Dashboard.jsx` | Ecosystem governance and yield overviews. |
| `Auth/Login.jsx` | Secure identity entrance with JWT storage. |

### 🧠 Contexts
| File | Working Logic |
| :--- | :--- |
| `AuthContext.jsx` | Centralizes security tokens and user states. |
| `ProductContext.jsx` | Syncs the global catalog with real-time UI. |
| `CartContext.jsx` | Processes rental bags with date-range logic. |

---

## ⚙️ Server Manifest (`server/`)

### 🛣️ Routes
| File | Working Logic |
| :--- | :--- |
| `auth.js` | Login/Register logic and password hashing. |
| `products.js` | CRUD for catalog and inventory tracking. |
| `orders.js` | Rental state management and logistics. |
| `marketing.js` | Handles newsletter and partner inquiries. |

### 🔒 Middleware
| File | Working Logic |
| :--- | :--- |
| `auth.js` | Token validation and RBAC enforcement. |

### 🗄️ Database
| File | Working Logic |
| :--- | :--- |
| `prisma/schema.prisma`| The blueprint of the StilSwap database. |
| `seed.js` | Hard-codes the initial luxury catalog. |

---
*Generated: February 2026*
