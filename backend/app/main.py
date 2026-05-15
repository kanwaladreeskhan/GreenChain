from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import devices, components, admin
from app.database import test_connection

# Pehle app create karo
app = FastAPI(
    title="Green-Chain E-Waste Marketplace API",
    description="Backend API for circular economy e-waste management platform",
    version="1.0.0"
)

# Ab app add middleware karo (app create hone ke BAAD)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes (app create hone ke BAAD)
app.include_router(devices.router)
app.include_router(components.router)
app.include_router(admin.router)

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Green-Chain API...")
    test_connection()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Green-Chain API",
        "status": "running",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}