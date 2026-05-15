Green-Chain - E-Waste Marketplace
Overview
Green-Chain is a circular economy platform that connects households with repair shops through an e-waste recycling ecosystem. Households submit dead devices, admins dismantle them into certified components, and repair shops purchase these components at 40-60% below market price.

Tech Stack
Frontend: Next.js 14, TypeScript, Tailwind CSS, ShadCN UI

Backend: FastAPI (Python), SQLAlchemy

Database: Microsoft SQL Server

Icons: Lucide React

Features
For Households
Submit e-waste devices with image upload

Track device status (Pending → Collected → Evaluated → Dismantled)

Free pickup and certified data destruction

For Repair Shops
Browse certified original components

Search and filter by category

Components at 40-60% below market price

Condition grading (S/A/B Grade)

For Admins
Dashboard analytics (revenue, devices recycled, e-waste diverted)

Manage received devices

Dismantle devices and add components

Inventory management with CRUD operations

Process pending orders and generate invoices

Installation
Prerequisites
Node.js 18+

Python 3.11+

SQL Server with ODBC Driver 17

Setup
bash
# Clone repository
git clone <repo-url>
cd green-chain

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev