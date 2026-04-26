# 🎯 TrustBid - British Auction RFQ System

<div align="center">

![TrustBid Banner](https://img.shields.io/badge/TrustBid-Precision%20Bidding-black?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzIDJMMy41IDcuMjVWMTMuNzVMMTMgMTlMMjIuNSAxMy43NVY3LjI1TDEzIDJaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K)

[![Live Demo](https://img.shields.io/badge/🔗_Live_Demo-Visit_Site-blue?style=for-the-badge)](https://trust-bid-gamma.vercel.app)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

**A real-time British Auction system with intelligent bid-time extensions and transparent supplier competition**

[Features](#-key-features) • [Architecture](#-high-level-design-hld) • [Installation](#-installation--setup) • [API Docs](#-api-documentation) • [Demo](#-demo-credentials)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Live Demo](#live-demo)
- [High-Level Design (HLD)](#high-level-design-hld)
- [Database Schema](#database-schema-design)
- [Tech Stack](#tech-stack)
- [Design Tradeoffs](#design-tradeoffs)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Advanced Implementation Details](#advanced-implementation-details)
- [Business Logic](#business-logic--auction-mechanics)
- [Demo Credentials](#demo-credentials)
- [Project Structure](#project-structure)

---

## 🎯 Overview

**TrustBid** is a sophisticated RFQ (Request for Quotation) management system implementing **British Auction mechanics** to ensure fair and transparent supplier competition. The system prevents last-second bid sniping through intelligent automatic time extensions and provides real-time updates to all participants.

### What is a British Auction?

A British Auction in the RFQ context is a competitive bidding process where:
- ✅ Suppliers submit bids openly and can continuously lower prices
- ✅ Bidding activity near auction close time triggers automatic extensions
- ✅ A forced close time ensures auctions conclude within reasonable timeframes
- ✅ Multiple extension triggers ensure fair competition

---

## ✨ Key Features

### 🎪 Core Auction Features
- **Role-Based Access Control**: Separate buyer and supplier workflows
- **Real-Time Bidding**: Live bid updates using Socket.IO
- **Intelligent Time Extensions**: Automatic auction extensions based on configurable triggers
- **Force Close Mechanism**: Guaranteed auction conclusion time
- **Live Rankings**: Real-time L1, L2, L3 supplier rankings
- **Activity Logging**: Complete audit trail of all bids and extensions

### 🔧 Advanced Technical Features
- **Race Condition Prevention**: MongoDB transactions for concurrent bid handling
- **Optimistic Updates**: Real-time UI updates with server validation
- **Time Synchronization**: Client-server time offset handling
- **Responsive Design**: Mobile-first UI with dark/light themes
- **Form Validation**: Comprehensive client and server-side validation

### 🛡️ Security Features
- JWT-based authentication
- Role-based authorization middleware
- Password hashing with bcrypt
- Protected API endpoints
- Input sanitization and validation

---
## Live Demo

🔗 https://trust-bid-gamma.vercel.app

---

## 🏗️ High-Level Design (HLD)

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React SPA (Vite)                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐    │  │
│  │  │   Auth     │  │  Auction   │  │   Real-time Sync    │    │  │
│  │  │   Views    │  │   Views    │  │   (Socket.IO)       │    │  │
│  │  └────────────┘  └────────────┘  └─────────────────────┘    │  │
│  │         │               │                    │               │  │
│  │         └───────────────┴────────────────────┘               │  │
│  │                         │                                    │  │
│  │                    useAuction Hook                           │  │
│  │                         │                                    │  │
│  └─────────────────────────┼────────────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                    HTTPS/WSS │
                             │
┌────────────────────────────┼───────────────────────────────────────┐
│                       API GATEWAY                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Express.js Server                         │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │  │
│  │  │   Auth   │  │ Auction  │  │   Bid    │  │  Activity   │ │  │
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │   Routes    │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │  │
│  │       │             │             │                │         │  │
│  │       │             │             │                │         │  │
│  │  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌──────┴──────┐ │  │
│  │  │   Auth   │  │ Auction  │  │   Bid    │  │  Activity   │ │  │
│  │  │Controller│  │Controller│  │Controller│  │ Controller  │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │  │
│  │       │             │             │                │         │  │
│  └───────┼─────────────┼─────────────┼────────────────┼─────────┘  │
│          │             │             │                │             │
│  ┌───────┴─────────────┴─────────────┴────────────────┴─────────┐  │
│  │              Business Logic Layer                            │  │
│  │  • Extension Logic    • Validation Rules                     │  │
│  │  • Ranking System     • Time Calculations                    │  │
│  │  • Status Management  • Transaction Handling                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                             │                                       │
│  ┌──────────────────────────┴────────────────────────────────────┐ │
│  │                  Middleware Layer                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │ │
│  │  │     JWT      │  │     CORS     │  │   Rate Limiting  │   │ │
│  │  │     Auth     │  │   Handler    │  │    (Future)      │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────┼───────────────────────────────────────┐
│                      DATA TIER                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Atlas                             │  │
│  │                                                               │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────┐  ┌──────────────────┐ │  │
│  │  │  Users  │  │ Auctions │  │ Bids │  │  ActivityLogs    │ │  │
│  │  │ (Auth)  │  │  (RFQs)  │  │      │  │  (Audit Trail)   │ │  │
│  │  └─────────┘  └──────────┘  └──────┘  └──────────────────┘ │  │
│  │                                                               │  │
│  │  • Indexes for Performance                                   │  │
│  │  • Transaction Support (ACID)                                │  │
│  │  • Aggregation Pipelines                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  REAL-TIME COMMUNICATION                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Socket.IO Server                          │  │
│  │                                                               │  │
│  │  Events:                                                      │  │
│  │    • joinAuction      → Client joins auction room            │  │
│  │    • newBid           → Broadcast new bid to all clients     │  │
│  │    • auctionExtended  → Broadcast time extension             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌──────────┐                                                    ┌──────────┐
│  Buyer   │                                                    │ Supplier │
└────┬─────┘                                                    └────┬─────┘
     │                                                               │
     │ 1. Create RFQ                                                 │
     │ POST /api/auctions                                            │
     ├──────────────────────────────┐                                │
     │                              │                                │
     │                         ┌────▼────┐                           │
     │                         │ Express │                           │
     │                         │ Server  │                           │
     │                         └────┬────┘                           │
     │                              │                                │
     │                         2. Validate                           │
     │                         • Time constraints                    │
     │                         • Auth check                          │
     │                         • Field validation                    │
     │                              │                                │
     │                         ┌────▼────┐                           │
     │                         │ MongoDB │                           │
     │                         │ Auction │                           │
     │                         │ Created │                           │
     │                         └────┬────┘                           │
     │                              │                                │
     │ 3. RFQ Created               │                                │
     │◄─────────────────────────────┤                                │
     │                              │                                │
     │                              │                                │
     │                              │         4. View Auction        │
     │                              │         GET /api/auctions/:id  │
     │                              │◄───────────────────────────────┤
     │                              │                                │
     │                              │         5. Auction Details     │
     │                              ├───────────────────────────────►│
     │                              │                                │
     │                              │         6. Join Socket Room    │
     │                              │         socket.emit('joinAuction')
     │                              │◄───────────────────────────────┤
     │                              │                                │
     │                              │         7. Place Bid           │
     │                              │         POST /api/bids         │
     │                              │◄───────────────────────────────┤
     │                              │                                │
     │                         8. Start Transaction                  │
     │                         ┌────▼────┐                           │
     │                         │ MongoDB │                           │
     │                         │ Session │                           │
     │                         └────┬────┘                           │
     │                              │                                │
     │                         9. Validate Bid                       │
     │                         • Amount < current lowest             │
     │                         • Auction still active                │
     │                         • No duplicate amounts                │
     │                              │                                │
     │                         10. Check Extension                   │
     │                         • Within trigger window?              │
     │                         • Trigger type met?                   │
     │                              │                                │
     │                         11. Save Bid                          │
     │                         12. Update Rankings                   │
     │                         13. Create Activity Log               │
     │                              │                                │
     │                         14. Commit Transaction                │
     │                         ┌────▼────┐                           │
     │                         │ Socket  │                           │
     │                         │   IO    │                           │
     │                         └────┬────┘                           │
     │                              │                                │
     │ 15. Broadcast newBid         │         15. Receive newBid     │
     │◄─────────────────────────────┼───────────────────────────────►│
     │                              │                                │
     │ 16. Broadcast auctionExtended│   16. Receive auctionExtended  │
     │◄─────────────────────────────┼───────────────────────────────►│
     │                              │                                │
     │ 17. UI Auto-Updates          │         17. UI Auto-Updates    │
     │                              │                                │
```

---

## 💾 Database Schema Design

### Collections Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MongoDB Collections                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ USERS COLLECTION                                                     │
├──────────────────────────────────────────────────────────────────────┤
│ _id          : ObjectId (PK)                                         │
│ name         : String (required)                                     │
│ email        : String (required, unique, indexed)                    │
│ password     : String (hashed with bcrypt)                           │
│ role         : String (enum: 'buyer', 'supplier')                    │
│ createdAt    : Date (auto)                                           │
│ updatedAt    : Date (auto)                                           │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ AUCTIONS COLLECTION                                                  │
├──────────────────────────────────────────────────────────────────────┤
│ _id                : ObjectId (PK)                                   │
│ name               : String (required)                               │
│ createdBy          : ObjectId (FK → Users)                           │
│ bidStartTime       : Date (required)                                 │
│ bidCloseTime       : Date (required, mutable - extends)              │
│ forcedCloseTime    : Date (required, immutable)                      │
│ triggerWindow      : Number (minutes, required)                      │
│ extensionDuration  : Number (minutes, required)                      │
│ triggerType        : String (enum: 'ANY_BID', 'RANK_CHANGE',        │
│                              'L1_CHANGE')                            │
│ status             : String (computed: 'UPCOMING', 'ACTIVE',         │
│                              'CLOSED', 'FORCE_CLOSED')               │
│ currentLowestBid   : Number (updated on each valid bid)              │
│ pickupDate         : Date (optional)                                 │
│ createdAt          : Date (auto)                                     │
│ updatedAt          : Date (auto)                                     │
│                                                                       │
│ Indexes:                                                             │
│   • bidStartTime, bidCloseTime (range queries)                       │
│   • status (filtering)                                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ BIDS COLLECTION                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ _id                   : ObjectId (PK)                                │
│ auctionId             : ObjectId (FK → Auctions, indexed)            │
│ supplierId            : ObjectId (FK → Users, indexed)               │
│ freightCharges        : Number (required)                            │
│ originCharges         : Number (required)                            │
│ destinationCharges    : Number (required)                            │
│ amount                : Number (required, sum of above)              │
│ transitTime           : String (e.g., "14 days")                     │
│ quoteValidity         : String (e.g., "30 days")                     │
│ rank                  : Number (1=L1, 2=L2, 3=L3...)                 │
│ createdAt             : Date (auto)                                  │
│ updatedAt             : Date (auto)                                  │
│                                                                       │
│ Indexes:                                                             │
│   • Compound: { auctionId: 1, amount: 1 } (sorting & queries)        │
│   • { supplierId: 1, auctionId: 1 } (supplier bid history)          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ ACTIVITY_LOGS COLLECTION                                             │
├──────────────────────────────────────────────────────────────────────┤
│ _id          : ObjectId (PK)                                         │
│ auctionId    : ObjectId (FK → Auctions, indexed)                     │
│ type         : String (enum: 'BID', 'EXTENSION')                     │
│ message      : String (human-readable log)                           │
│ metadata     : Object (additional context)                           │
│              {                                                        │
│                supplierId: ObjectId (for BID type)                   │
│                amount: Number (for BID type)                         │
│                reason: String (for EXTENSION type)                   │
│                newCloseTime: Date (for EXTENSION type)               │
│              }                                                        │
│ createdAt    : Date (auto, indexed for sorting)                      │
│                                                                       │
│ Indexes:                                                             │
│   • { auctionId: 1, createdAt: -1 } (activity timeline)             │
└──────────────────────────────────────────────────────────────────────┘
```

### Relationships & Constraints

```
┌──────────┐           ┌───────────┐           ┌──────┐
│  Users   │           │ Auctions  │           │ Bids │
│  (Auth)  │           │   (RFQs)  │           │      │
└────┬─────┘           └─────┬─────┘           └───┬──┘
     │                       │                     │
     │ createdBy             │ auctionId           │
     │ 1:N                   │ 1:N                 │
     └───────────────────────┘                     │
                                                   │
     ┌─────────────────────────────────────────────┘
     │ supplierId
     │ N:1
     │
┌────▼─────┐
│  Users   │
│(Supplier)│
└──────────┘

Constraints:
1. Forced Close Time > Bid Close Time > Bid Start Time
2. Bid amount must be < current lowest bid (enforced via transaction)
3. Only buyers can create auctions
4. Only suppliers can place bids
5. No duplicate bid amounts allowed per auction
6. Auction extensions cannot exceed forced close time
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.2+)
- **Database**: MongoDB (Atlas Cloud)
- **ODM**: Mongoose (v9.5+)
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO (v4.8+)
- **Environment**: dotenv

### Frontend
- **Framework**: React (v18.3+)
- **Build Tool**: Vite
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Routing**: Client-side navigation
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React
- **Styling**: Custom CSS with CSS Variables (Dark/Light theme)

### DevOps
- **Hosting**: 
  - Backend: Render
  - Frontend: Vercel
  - Database: MongoDB Atlas
- **Version Control**: Git

---

## ⚖️ Design Tradeoffs

- Used MongoDB instead of SQL for flexible schema and faster iteration
- Used Socket.IO instead of polling for real-time efficiency
- Used computed auction status instead of storing to avoid stale data
- Chose transactions to handle race conditions instead of locking mechanisms
- Prioritized real-time UX over backend simplicity

---

## 📦 Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in the backend root:
   ```env
   # MongoDB
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/trustbid?retryWrites=true&w=majority

   # JWT Secret (use a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

   # Server Port
   PORT=5000

   # Node Environment
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in the frontend root:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   For production:
   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

### Production Build

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "buyer"  // or "supplier"
}

Response 201:
{
  "message": "User registered",
  "userId": "6512abc..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6512abc...",
    "name": "John Doe",
    "role": "buyer"
  }
}
```

### Auction Endpoints

#### Create Auction (Buyer Only)
```http
POST /api/auctions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q4 Freight Tender",
  "bidStartTime": "2024-12-01T10:00:00Z",
  "bidCloseTime": "2024-12-01T18:00:00Z",
  "forcedCloseTime": "2024-12-01T20:00:00Z",
  "triggerWindow": 10,
  "extensionDuration": 5,
  "triggerType": "ANY_BID",  // or "RANK_CHANGE", "L1_CHANGE"
  "pickupDate": "2024-12-15T00:00:00Z"
}

Response 201:
{
  "_id": "6512abc...",
  "name": "Q4 Freight Tender",
  "status": "UPCOMING",
  "currentLowestBid": null,
  ...
}
```

#### Get All Auctions
```http
GET /api/auctions
Authorization: Bearer <token>

Response 200:
[
  {
    "_id": "6512abc...",
    "name": "Q4 Freight Tender",
    "status": "ACTIVE",
    "currentLowestBid": 12500.50,
    "bidStartTime": "2024-12-01T10:00:00Z",
    "bidCloseTime": "2024-12-01T18:15:00Z",  // Extended
    "forcedCloseTime": "2024-12-01T20:00:00Z",
    ...
  }
]
```

#### Get Auction Details
```http
GET /api/auctions/:id
Authorization: Bearer <token>

Response 200:
{
  "auction": {
    "_id": "6512abc...",
    "name": "Q4 Freight Tender",
    "status": "ACTIVE",
    ...
  },
  "bids": [
    {
      "_id": "bid123",
      "supplierId": {
        "name": "Maersk",
        "email": "maersk@example.com"
      },
      "amount": 12500.50,
      "rank": 1,
      "freightCharges": 10000,
      "originCharges": 1500,
      "destinationCharges": 1000.50,
      "transitTime": "14 days",
      "quoteValidity": "30 days",
      "createdAt": "2024-12-01T15:30:00Z"
    }
  ],
  "logs": [...]
}
```

#### Delete Auction (Buyer Only)
```http
DELETE /api/auctions/:id
Authorization: Bearer <token>

Response 200:
{
  "message": "Auction deleted"
}
```

### Bid Endpoints

#### Place Bid (Supplier Only)
```http
POST /api/bids
Authorization: Bearer <token>
Content-Type: application/json

{
  "auctionId": "6512abc...",
  "freight": 10000,
  "origin": 1500,
  "dest": 1000,
  "transitTime": "14 days",
  "quoteValidity": "30 days"
}

Response 201:
{
  "message": "Bid placed successfully",
  "bid": {
    "_id": "bid123",
    "amount": 12500,
    "rank": 1,
    ...
  }
}

// If auction extended:
{
  "message": "Bid placed & Auction extended!",
  "bid": {...}
}
```

### Activity Log Endpoints

#### Get Auction Logs
```http
GET /api/activity/:auctionId
Authorization: Bearer <token>

Response 200:
[
  {
    "_id": "log123",
    "auctionId": "6512abc...",
    "type": "BID",
    "message": "Supplier Maersk placed bid ₹12500",
    "metadata": {
      "supplierId": "supplier123",
      "amount": 12500
    },
    "createdAt": "2024-12-01T15:30:00Z"
  },
  {
    "type": "EXTENSION",
    "message": "Auction extended due to ANY_BID",
    "metadata": {
      "reason": "ANY_BID",
      "newCloseTime": "2024-12-01T18:15:00Z"
    },
    ...
  }
]
```

### WebSocket Events

#### Client → Server
```javascript
// Join auction room for real-time updates
socket.emit('joinAuction', auctionId);
```

#### Server → Client
```javascript
// New bid placed
socket.on('newBid', (data) => {
  // data: { auctionId, amount, supplierId }
});

// Auction time extended
socket.on('auctionExtended', (data) => {
  // data: { auctionId, newCloseTime, message }
});
```

---

## 🔐 Advanced Implementation Details

### 1. Race Condition Prevention with MongoDB Transactions

**Problem**: Multiple suppliers might submit bids simultaneously, potentially creating invalid states (e.g., two suppliers getting L1 rank).

**Solution**: MongoDB ACID transactions ensure atomic bid validation and submission.

```javascript
// bidController.js - Transaction Implementation
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 🔥 Re-validate inside transaction with session lock
  const lowestBid = await Bid.findOne({ auctionId })
    .sort({ amount: 1 })
    .session(session);  // Locks the document

  // Validate bid is still valid
  if (lowestBid && amount >= lowestBid.amount) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      message: "Bid must be lower than current lowest bid"
    });
  }

  // Create bid within transaction
  const created = await Bid.create([{
    auctionId,
    supplierId: req.user.id,
    amount,
    ...otherFields
  }], { session });

  // Update auction's current lowest bid
  if (auction.currentLowestBid === null || amount < auction.currentLowestBid) {
    auction.currentLowestBid = amount;
    await auction.save({ session });
  }

  // Commit all changes atomically
  await session.commitTransaction();
  session.endSession();
  
} catch (err) {
  await session.abortTransaction();
  session.endSession();
  throw err;
}
```

**Key Benefits**:
- ✅ **Atomicity**: All operations succeed or all fail
- ✅ **Consistency**: No invalid intermediate states
- ✅ **Isolation**: Concurrent transactions don't interfere
- ✅ **Durability**: Committed changes are permanent

### 2. Intelligent Extension Logic

**Extension Trigger Types**:

#### a) ANY_BID
Extends whenever any bid is received during trigger window.

```javascript
if (auction.triggerType === "ANY_BID") {
  shouldExtend = true;
}
```

#### b) L1_CHANGE
Extends only when the lowest bidder (L1) changes.

```javascript
if (auction.triggerType === "L1_CHANGE") {
  const oldLowest = auction.currentLowestBid;
  if (oldLowest === null || amount < oldLowest) {
    shouldExtend = true;
  }
}
```

#### c) RANK_CHANGE
Extends when any supplier's rank changes (most complex).

```javascript
if (auction.triggerType === "RANK_CHANGE") {
  // Get best bid from each supplier (excluding current supplier)
  const otherSuppliersBest = await Bid.aggregate([
    {
      $match: {
        auctionId: auction._id,
        supplierId: { $ne: req.user.id }
      }
    },
    {
      $group: {
        _id: "$supplierId",
        minAmount: { $min: "$amount" }
      }
    }
  ]);

  // Check if new bid beats any existing supplier's best
  let didRankChange = false;
  for (let supplier of otherSuppliersBest) {
    if (amount < supplier.minAmount) {
      didRankChange = true;
      break;
    }
  }

  if (didRankChange) {
    shouldExtend = true;
  }
}
```

**Extension Application**:
```javascript
if (shouldExtend) {
  let newCloseTime = new Date(
    bidCloseTime.getTime() + auction.extensionDuration * 60 * 1000
  );

  // Never exceed forced close time
  if (newCloseTime > new Date(auction.forcedCloseTime)) {
    newCloseTime = new Date(auction.forcedCloseTime);
  }

  auction.bidCloseTime = newCloseTime;

  // Log extension event
  await ActivityLog.create({
    auctionId,
    type: "EXTENSION",
    message: `Auction extended due to ${auction.triggerType}`,
    metadata: { reason: auction.triggerType, newCloseTime }
  });
}
```

### 3. Real-Time Synchronization

**Socket.IO Implementation**:

```javascript
// Server-side broadcast
const io = req.app.get("io");

// Broadcast to all clients in auction room
io.to(auctionId).emit("newBid", {
  auctionId,
  amount,
  supplierId: req.user.id
});

if (shouldExtend) {
  io.to(auctionId).emit("auctionExtended", {
    auctionId,
    newCloseTime: auction.bidCloseTime,
    message: "Auction time extended due to activity!"
  });
}
```

```javascript
// Client-side listeners
useEffect(() => {
  const handleNewBid = ({ auctionId }) => {
    fetchDetails(auctionId);  // Refresh bid list
    fetchAuctions();          // Update auction status
  };
  
  const handleExtension = ({ auctionId }) => {
    fetchDetails(auctionId);
    fetchAuctions();
    showToast("Auction extended!");
  };
  
  socket.on("newBid", handleNewBid);
  socket.on("auctionExtended", handleExtension);
  
  return () => {
    socket.off("newBid", handleNewBid);
    socket.off("auctionExtended", handleExtension);
  };
}, []);
```

### 4. Automatic Ranking System

**Bulk Update for Performance**:

```javascript
// After successful bid placement
const allBids = await Bid.find({ auctionId }).sort({ amount: 1 });

// Prepare bulk operations
const bulkOps = allBids.map((b, i) => ({
  updateOne: {
    filter: { _id: b._id },
    update: { $set: { rank: i + 1 } }
  }
}));

// Execute all rank updates in single operation
if (bulkOps.length > 0) {
  await Bid.bulkWrite(bulkOps);
}
```

### 5. Comprehensive Validation

**Time Validation** (Server-side):
```javascript
const now = new Date();
const start = new Date(bidStartTime);
const close = new Date(bidCloseTime);
const forced = new Date(forcedCloseTime);

// Start must be future
if (start < now) {
  return res.status(400).json({
    message: "Bid start cannot be in the past"
  });
}

// Close must be after start
if (close <= start) {
  return res.status(400).json({
    message: "Bid close must be after bid start"
  });
}

// Forced must be after close
if (forced <= close) {
  return res.status(400).json({
    message: "Forced close must be after bid close"
  });
}
```

**Bid Amount Validation**:
```javascript
// Must be lower than supplier's previous bid
const lastBid = await Bid.findOne({
  auctionId,
  supplierId: req.user.id
}).sort({ createdAt: -1 });

if (lastBid && amount >= lastBid.amount) {
  return res.status(400).json({
    message: "New bid must be lower than your previous bid"
  });
}

// No duplicate amounts allowed
const tieBid = await Bid.findOne({ auctionId, amount });

if (tieBid) {
  return res.status(400).json({
    message: "A bid with this amount already exists. Please bid lower."
  });
}
```

### 6. Dynamic Status Calculation

**Computed Status** (never stored, always calculated):

```javascript
function getAuctionStatus(auction) {
  const now = new Date();
  const start = new Date(auction.bidStartTime);
  const close = new Date(auction.bidCloseTime);
  const forced = new Date(auction.forcedCloseTime);

  if (now < start) return "UPCOMING";
  if (now >= forced) return "FORCE_CLOSED";
  if (now >= close) return "CLOSED";
  return "ACTIVE";
}
```

**Benefits**:
- ✅ Always accurate (no stale data)
- ✅ No background jobs needed
- ✅ Works across time zones
- ✅ Handles server/client time drift

---

## 💼 Business Logic & Auction Mechanics

### Auction Lifecycle

```
┌─────────────┐
│  UPCOMING   │  ← Auction created, waiting for bidStartTime
└──────┬──────┘
       │ bidStartTime reached
       ▼
┌─────────────┐
│   ACTIVE    │  ← Suppliers can place bids
└──────┬──────┘    Extensions possible within trigger window
       │
       │ ┌──────────────────────────────────────────┐
       │ │ Extension Triggers (if applicable):      │
       │ │ • ANY_BID: Any bid in last X minutes     │
       │ │ • RANK_CHANGE: Any rank shift in last X  │
       │ │ • L1_CHANGE: L1 position change in last X│
       │ │                                          │
       │ │ Extension: bidCloseTime += Y minutes     │
       │ │ (max: forcedCloseTime)                  │
       │ └──────────────────────────────────────────┘
       │
       │ bidCloseTime reached (no more extensions)
       ▼
┌─────────────┐
│   CLOSED    │  ← No more bids accepted
└──────┬──────┘    Winner determined (L1 supplier)
       │
       │ forcedCloseTime reached
       ▼
┌─────────────┐
│FORCE_CLOSED │  ← Auction definitively ended
└─────────────┘
```

### Extension Example Scenario

**Configuration**:
- Bid Close: 6:00 PM
- Forced Close: 8:00 PM
- Trigger Window (X): 10 minutes
- Extension Duration (Y): 5 minutes
- Trigger Type: L1_CHANGE

**Timeline**:
```
5:50 PM  │ [Trigger Window Begins]
         │
5:52 PM  │ Supplier A bids $12,000 → Becomes L1
         │ ✓ Extension triggered (L1 changed)
         │ New close: 6:05 PM
         │
5:58 PM  │ Supplier B bids $11,800 → Becomes L1
         │ ✓ Extension triggered (L1 changed)
         │ New close: 6:10 PM
         │
6:02 PM  │ [New Trigger Window: 6:00 PM - 6:10 PM]
         │
6:08 PM  │ Supplier C bids $11,500 → Becomes L1
         │ ✓ Extension triggered (L1 changed)
         │ New close: 6:15 PM
         │
6:11 PM  │ Supplier A bids $11,200 → Becomes L1
         │ ✓ Extension triggered (L1 changed)
         │ New close: 6:20 PM
         │
6:15 PM  │ [Trigger Window: 6:10 PM - 6:20 PM]
         │ No more bids in trigger window
         │
6:20 PM  │ ⏹ Auction CLOSED
         │ Winner: Supplier A at $11,200
         │
8:00 PM  │ ⏹ Forced Close Time (not reached because auction
         │    naturally closed at 6:20 PM)
```

### Ranking System

**L1, L2, L3 Badge Logic**:

```javascript
// Rankings are calculated after each bid
// Sorted by amount (lowest = L1)

Supplier A: $12,000 → Rank 2 (L2)
Supplier B: $11,500 → Rank 1 (L1) ⭐
Supplier C: $13,200 → Rank 3 (L3)
Supplier D: $15,000 → Rank 4 (L4+)
```

**Visual Representation**:
- **L1** (Gold): Lowest bid, winning position
- **L2** (Silver): Second-lowest bid
- **L3** (Bronze): Third-lowest bid
- **L4+** (Gray): Other positions

---

## 🔑 Demo Credentials

### Buyer Account
```
Email: buyer@test.com
Password: buyer123
```

**Capabilities**:
- ✅ Create new RFQ auctions
- ✅ View all auctions and bids
- ✅ Delete own auctions
- ✅ Monitor real-time bidding activity
- ❌ Cannot place bids

### Supplier Account 1
```
Email: supplier1@test.com
Password: supplier123
```

### Supplier Account 2
```
Email: supplier2@test.com
Password: supplier123
```

**Capabilities**:
- ✅ View active auctions
- ✅ Place competitive bids
- ✅ See live rankings (L1, L2, L3)
- ✅ Receive real-time extension notifications
- ❌ Cannot create or delete auctions

---

## 📁 Project Structure

```
trustbid/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # MongoDB connection
│   │   │
│   │   ├── models/
│   │   │   ├── User.js                  # User schema (buyer/supplier)
│   │   │   ├── Auction.js               # Auction/RFQ schema
│   │   │   ├── Bid.js                   # Bid schema with ranking
│   │   │   └── ActivityLog.js           # Activity log schema
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, login
│   │   │   ├── auctionController.js     # CRUD auctions, get details
│   │   │   ├── bidController.js         # Place bid (with extensions)
│   │   │   └── activityController.js    # Get activity logs
│   │   │
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js        # JWT auth & role authorization
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # /api/auth/*
│   │   │   ├── auctionRoutes.js         # /api/auctions/*
│   │   │   ├── bidRoutes.js             # /api/bids/*
│   │   │   └── activityRoutes.js        # /api/activity/*
│   │   │
│   │   └── utils/
│   │       └── getAuctionStatus.js      # Status calculation helper
│   │
│   ├── server.js                        # Express + Socket.IO setup
│   ├── package.json
│   └── .env                             # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx           # Navigation bar
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── Badge.jsx            # Status badges
│   │   │   │   └── Toast.jsx            # Toast notifications
│   │   │   │
│   │   │   ├── modals/
│   │   │   │   ├── BidModal.jsx         # Bid submission form
│   │   │   │   └── DeleteModal.jsx      # Delete confirmation
│   │   │   │
│   │   │   └── views/
│   │   │       ├── AuthView.jsx         # Login/Register
│   │   │       ├── HeroView.jsx         # Landing page
│   │   │       ├── CreateView.jsx       # Create RFQ form
│   │   │       ├── ListingView.jsx      # Auction list
│   │   │       └── DetailView.jsx       # Auction details + live bids
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuction.js            # Main data hook (API + Socket)
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.js               # Format functions, status calc
│   │   │   └── socket.js                # Socket.IO client setup
│   │   │
│   │   ├── App.jsx                      # Main app component
│   │   ├── main.jsx                     # React entry point
│   │   └── index.css                    # Global styles + CSS variables
│   │
│   ├── package.json
│   └── .env                             # VITE_API_URL
│
└── README.md                            # This file
```

---

## 🎓 Key Learning Outcomes

### Technical Skills Demonstrated

1. **Full-Stack Development**
   - RESTful API design with Express.js
   - React hooks and modern state management
   - Real-time bidirectional communication

2. **Database Design**
   - Schema modeling for complex relationships
   - Transaction handling for data integrity
   - Index optimization for query performance

3. **Real-Time Systems**
   - WebSocket integration with Socket.IO
   - Event-driven architecture
   - Optimistic UI updates

4. **Security Best Practices**
   - JWT authentication flow
   - Role-based access control (RBAC)
   - Password hashing with bcrypt
   - Input validation and sanitization

5. **Business Logic Implementation**
   - Complex time-based calculations
   - Dynamic auction extensions
   - Concurrent request handling
   - Ranking algorithms

6. **UI/UX Design**
   - Responsive design principles
   - Component-based architecture
   - Theme system with CSS variables
   - Accessibility considerations

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Anurag Dubey**

- 🔗 LinkedIn: [https://www.linkedin.com/in/anuragdubey7/]
- 🐙 GitHub: [https://github.com/AnuragDubey007]
- 📧 Email: anuragdubey0245@gmail.com

---

## 🙏 Acknowledgments

- **Go Comet** for the assignment opportunity
- **MongoDB** for the excellent database documentation
- **Socket.IO** for real-time communication capabilities
- **React Team** for the amazing frontend framework
- **Lucide Icons** for the beautiful icon set

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Built with ❤️ for transparent and fair procurement processes**

</div>
