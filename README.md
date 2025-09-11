# CRM System

A full-stack Customer Relationship Management system with advanced audience segmentation and campaign management capabilities. Built with React.js frontend and Node.js backend, featuring real-time messaging through Redis pub/sub architecture.

## What it does

This CRM goes beyond basic customer management - it's designed for marketing teams who need to create targeted campaigns and track customer engagement. You can segment customers using complex queries, run personalized campaigns, and track delivery statistics in real-time.

Key capabilities:

- **Customer Management**: Create, view, update, and delete customers
- **Order Management**: Process orders with bulk upload capability
- **Dynamic Audience Segmentation**: Create customer segments using AND/OR logic with multiple conditions
- **Campaign Management**: Run targeted campaigns with personalized messages
- **Real-time Processing**: Redis pub/sub handles message queuing and batch processing
- **Statictic Dashboard**: Track campaign performance and delivery statistics
- **Google Authentication**: Secure login with OAuth 2.0
- **Bulk Operations**: CSV upload for customers and orders
- **Responsive UI**: Works on desktop and mobile devices

## Technologies

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB (with Mongoose)
- Redis
- Swagger (for API documentation)
- Multer (for file uploads)
- CSV-parse (for CSV processing)

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios (for API calls)
- Lucide React (for icons)

## Architecture

The system uses a pub/sub architecture for scalability:

1. **API Layer**: Validates data and publishes to Redis
2. **Message Broker**: Redis queues messages for batch processing
3. **Subscribers**: Process queued messages and update database
4. **Batch Processing**: Messages processed in batches of 5 for efficiency

## Getting Started

### Prerequisites

You'll need these installed:

- Node.js (v20 or higher)
- MongoDB
- Redis server

### Backend Setup

```bash
git clone https://github.com/itzankitks/crm_platform.git
cd crm_platform/backend
npm install
```

Create `.env` file in backend directory:

```env
PORT=[Your Port]
MONGO_URI=[Your Mongo URL]
GOOGLE_CLIENT_ID=[Create your Google Client Id]
GOOGLE_CLIENT_SECRET= [Google Client Secret Key]
REDIS_URL=[Your Redis Server URL]
FRONTEND_URI=[Frontend URL]
JWT_SECRET=[Your JWT Secret Key]
```

Start the services:

```bash
npm run dev
```

### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The React app will be available at http://localhost:5173

## Project Structure

```
CRM_ASSIGNMENT/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   ├── redis.ts
│   │   │   └── swagger.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── campaign.controller.ts
│   │   │   ├── customer.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── segment.controller.ts
│   │   │   └── delivery.controller.ts
│   │   ├── models/
│   │   │   ├── campaign.model.ts
│   │   │   ├── customer.model.ts
│   │   │   ├── message.model.ts
│   │   │   ├── order.model.ts
│   │   │   ├── segment.model.ts
│   │   │   └── user.model.ts
│   │   ├── queues/
│   │   │   └── message.queue.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── campaign.routes.ts
│   │   │   ├── customer.routes.ts
│   │   │   ├── index.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── receipt.routes.ts
│   │   │   └── segment.routes.ts
│   │   ├── services/
│   │   │   ├── campaign.service.ts
│   │   │   └── message.service.ts
│   │   ├── utils/
│   │   │   ├── auth.ts
│   │   │   ├── expressionParser.ts
│   │   │   └── signToken.ts
│   │   ├── workers/
│   │   │   ├── customer.worker.ts
│   │   │   ├── delivery.receipt.worker.ts
│   │   │   ├── order.worker.ts
│   │   │   └── message.sender.worker.ts
│   │   └── index.ts
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   ├── authContext.tsx
│   │   │   └── toastContext.tsx
│   │   ├── pages/
│   │   │   ├── CampaignDetails/
│   │   │   ├── Campaigns/
│   │   │   ├── Customers/
│   │   │   ├── Dashboard/
│   │   │   ├── HomePage/
│   │   │   ├── Login/
│   │   │   ├── NotFound/
│   │   │   ├── Orders/
│   │   │   ├── Segments/
│   │   │   ├── Signup/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── vite-env.d.ts
│   │   └── main.tsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── .gitignore
├── LICENSE
└── README.md
```

### Audience Segmentation

Create segments using complex queries:

- **Condition Builder**: Dropdown selectors for logical operators (AND/OR)
- **Natural Language Text to Rule Builder**: Integration of AI to efficiently generate the rule based on the text input.
- **Query Examples**:
  - First-time buyers: `totalPurchases == 1`
  - High-value customers: `totalSpending > 5000`

### Campaign Management

1. **Select Segment**: Choose from existing segments or create new ones
2. **Compose Message**: Write template with placeholders (e.g., `{name}`)
3. **Generative Message Template**: AI suggested message template with placeholders (e.g., `{name}`)
4. **Customer Selection**: Intuitive drag n drop customer selection based on the segmentation rule
5. **Launch Campaign**: System processes messages in batches
6. **Track Results**: Real-time delivery stats and success rates

### Message Processing Pipeline

```
Campaign Created → Redis Queue → Batch Processor → Personalized Messages → Database
```

Batch size of 50 ensures efficient processing without overwhelming the system.

## Scalability Features

**Pub/Sub Architecture**: Decouples API requests from database operations  
**Batch Processing**: Handles high-volume message generation efficiently  
**MongoDB Aggregation**: Complex queries for audience segmentation  
**Redis Queuing**: Manages concurrent campaign processing
