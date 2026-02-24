# StyleSwap Server: The Secure Backend

The StyleSwap server is a Node.js/Express application that serves as the engine for authentication, data persistence, and high-performance product management.

## 📁 Directory Structure

- `routes/`: Express routers for different ecosystem entities.
  - `auth.js`: Handles secure identity verification and token issuance.
  - `products.js`: Manages the global luxury catalog and inventory levels.
  - `orders.js`: Processes secure rental logistics and escrow events.
  - `users.js`: Administrative portal for user and partner management.
- `middleware/`: Security and verification layers.
  - `auth.js`: RBAC (Role-Based Access Control) enforcement.
- `prisma/`: Database schema and migration tracking.
- `scripts/`: Maintenance and ecosystem seeding utilities.

## ⚙️ Key Services

- **Authentication**: JWT-based stateless authentication with role-level guarding.
- **ORM**: Prisma for type-safe database interactions and direct PostgreSQL queries.
- **Image Optimization**: Fast-upload utility layer for high-resolution brand assets.

---
*StyleSwap Server © 2026*
