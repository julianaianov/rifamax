"""
RifaMax - Sistema de Rifas Online
Backend API com FastAPI e Python
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid
import random
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from .database import Base, engine, get_db
from .models import Raffle, RaffleNumber, Purchase

app = FastAPI(
    title="RifaMax API",
    description="API para sistema de rifas online",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class RaffleStatus(str, Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class NumberStatus(str, Enum):
    available = "available"
    reserved = "reserved"
    sold = "sold"


class PurchaseStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"

# Pydantic Models
class RaffleCreate(BaseModel):
    title: str
    description: str
    prize: str
    price: float
    total_numbers: int
    image_url: Optional[str] = None
    draw_date: str


class RaffleResponse(BaseModel):
    id: str
    title: str
    description: str
    prize: str
    price: float
    total_numbers: int
    image_url: Optional[str] = None
    draw_date: str
    status: RaffleStatus
    winner_number: Optional[int] = None
    created_at: str


class RaffleNumberResponse(BaseModel):
    number: int
    raffle_id: str
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    buyer_email: Optional[str] = None
    status: NumberStatus
    reserved_at: Optional[str] = None
    sold_at: Optional[str] = None


class PurchaseCreate(BaseModel):
    raffle_id: str
    numbers: list[int]
    buyer_name: str
    buyer_phone: str
    buyer_email: EmailStr


class PurchaseResponse(BaseModel):
    id: str
    raffle_id: str
    numbers: list[int]
    buyer_name: str
    buyer_phone: str
    buyer_email: str
    total_amount: float
    status: PurchaseStatus
    created_at: str


class DrawResult(BaseModel):
    raffle_id: str
    winner_number: int
    winner_name: Optional[str] = None
    winner_phone: Optional[str] = None
    winner_email: Optional[str] = None
    drawn_at: str

@app.on_event("startup")
def on_startup():
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed only if empty
    with next(get_db()) as db:
        existing = db.execute(select(func.count()).select_from(Raffle)).scalar_one()
        if existing == 0:
            sample_raffles = [
                {
                    "id": "1",
                    "title": "iPhone 15 Pro Max 256GB",
                    "description": "Concorra a um iPhone 15 Pro Max novinho na caixa lacrada com garantia Apple.",
                    "prize": "iPhone 15 Pro Max",
                    "price": 5.0,
                    "total_numbers": 100,
                    "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=60",
                    "draw_date": "2025-02-15",
                    "status": "active",
                    "winner_number": None,
                },
                {
                    "id": "2",
                    "title": "PlayStation 5 + 3 Jogos",
                    "description": "Console PlayStation 5 edicao digital com 3 jogos a escolha do ganhador.",
                    "prize": "PS5 Digital",
                    "price": 3.0,
                    "total_numbers": 200,
                    "image_url": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60",
                    "draw_date": "2025-02-20",
                    "status": "active",
                    "winner_number": None,
                },
                {
                    "id": "3",
                    "title": "Notebook Gamer ASUS ROG",
                    "description": "Notebook gamer de alta performance com RTX 4070 e processador Intel i9.",
                    "prize": "Notebook Gamer",
                    "price": 10.0,
                    "total_numbers": 150,
                    "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60",
                    "draw_date": "2025-03-01",
                    "status": "active",
                    "winner_number": None,
                },
            ]
            for r in sample_raffles:
                db.add(Raffle(**r))
            db.commit()
            # Seed some sold numbers for raffle 1
            sold_numbers = random.sample(range(1, 100 + 1), 10)
            for num in sold_numbers:
                db.add(RaffleNumber(
                    raffle_id="1",
                    number=num,
                    buyer_name=f"Comprador {num}",
                    buyer_phone=f"(11) 9{num}999-9999",
                    buyer_email=f"comprador{num}@email.com",
                    status="sold",
                    sold_at=datetime.utcnow(),
                ))
            db.commit()


# Routes
@app.get("/")
async def root():
    return {"message": "Bem-vindo a API RifaMax!", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# Raffle Routes
@app.get("/api/raffles", response_model=list[RaffleResponse])
async def get_raffles(status: Optional[RaffleStatus] = None, db: Session = Depends(get_db)):
    """Listar todas as rifas"""
    query = select(Raffle)
    if status:
        query = query.where(Raffle.status == status.value)
    rows = db.execute(query).scalars().all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "prize": r.prize,
            "price": r.price,
            "total_numbers": r.total_numbers,
            "image_url": r.image_url,
            "draw_date": r.draw_date,
            "status": r.status,
            "winner_number": r.winner_number,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@app.get("/api/raffles/{raffle_id}", response_model=RaffleResponse)
async def get_raffle(raffle_id: str, db: Session = Depends(get_db)):
    """Obter detalhes de uma rifa"""
    r = db.get(Raffle, raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "prize": r.prize,
        "price": r.price,
        "total_numbers": r.total_numbers,
        "image_url": r.image_url,
        "draw_date": r.draw_date,
        "status": r.status,
        "winner_number": r.winner_number,
        "created_at": r.created_at.isoformat(),
    }


@app.post("/api/raffles", response_model=RaffleResponse)
async def create_raffle(raffle: RaffleCreate, db: Session = Depends(get_db)):
    """Criar uma nova rifa"""
    raffle_id = str(uuid.uuid4())
    r = Raffle(
        id=raffle_id,
        title=raffle.title,
        description=raffle.description,
        prize=raffle.prize,
        price=raffle.price,
        total_numbers=raffle.total_numbers,
        image_url=raffle.image_url,
        draw_date=raffle.draw_date,
        status="active",
        winner_number=None,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "prize": r.prize,
        "price": r.price,
        "total_numbers": r.total_numbers,
        "image_url": r.image_url,
        "draw_date": r.draw_date,
        "status": r.status,
        "winner_number": r.winner_number,
        "created_at": r.created_at.isoformat(),
    }


@app.put("/api/raffles/{raffle_id}", response_model=RaffleResponse)
async def update_raffle(raffle_id: str, raffle: RaffleCreate, db: Session = Depends(get_db)):
    """Atualizar uma rifa"""
    r = db.get(Raffle, raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    r.title = raffle.title
    r.description = raffle.description
    r.prize = raffle.prize
    r.price = raffle.price
    r.total_numbers = raffle.total_numbers
    r.image_url = raffle.image_url
    r.draw_date = raffle.draw_date
    db.commit()
    db.refresh(r)
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "prize": r.prize,
        "price": r.price,
        "total_numbers": r.total_numbers,
        "image_url": r.image_url,
        "draw_date": r.draw_date,
        "status": r.status,
        "winner_number": r.winner_number,
        "created_at": r.created_at.isoformat(),
    }


@app.delete("/api/raffles/{raffle_id}")
async def delete_raffle(raffle_id: str, db: Session = Depends(get_db)):
    """Excluir uma rifa"""
    r = db.get(Raffle, raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    db.delete(r)
    db.commit()
    return {"message": "Rifa excluida com sucesso"}


# Numbers Routes
@app.get("/api/raffles/{raffle_id}/numbers", response_model=list[RaffleNumberResponse])
async def get_raffle_numbers(raffle_id: str, db: Session = Depends(get_db)):
    """Obter numeros de uma rifa"""
    r = db.get(Raffle, raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    rows = db.execute(
        select(RaffleNumber).where(RaffleNumber.raffle_id == raffle_id)
    ).scalars().all()
    return [
        {
            "number": n.number,
            "raffle_id": n.raffle_id,
            "buyer_name": n.buyer_name,
            "buyer_phone": n.buyer_phone,
            "buyer_email": n.buyer_email,
            "status": n.status,
            "reserved_at": n.reserved_at.isoformat() if n.reserved_at else None,
            "sold_at": n.sold_at.isoformat() if n.sold_at else None,
        }
        for n in rows
    ]


@app.get("/api/raffles/{raffle_id}/stats")
async def get_raffle_stats(raffle_id: str, db: Session = Depends(get_db)):
    """Obter estatisticas de uma rifa"""
    r = db.get(Raffle, raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    sold = db.execute(
        select(func.count()).select_from(RaffleNumber).where(
            and_(RaffleNumber.raffle_id == raffle_id, RaffleNumber.status == "sold")
        )
    ).scalar_one()
    reserved = db.execute(
        select(func.count()).select_from(RaffleNumber).where(
            and_(RaffleNumber.raffle_id == raffle_id, RaffleNumber.status == "reserved")
        )
    ).scalar_one()
    available = r.total_numbers - sold - reserved
    total_revenue = sold * r.price
    return {
        "total_numbers": r.total_numbers,
        "sold": sold,
        "reserved": reserved,
        "available": available,
        "total_revenue": total_revenue,
        "progress_percentage": round((sold / r.total_numbers) * 100, 2) if r.total_numbers else 0
    }


# Purchase Routes
@app.post("/api/purchase", response_model=PurchaseResponse)
async def create_purchase(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    """Realizar uma compra de numeros"""
    r = db.get(Raffle, purchase.raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    if r.status != "active":
        raise HTTPException(status_code=400, detail="Esta rifa nao esta ativa")
    # Check duplicates in DB
    existing = db.execute(
        select(RaffleNumber.number).where(
            and_(RaffleNumber.raffle_id == purchase.raffle_id, RaffleNumber.number.in_(purchase.numbers))
        )
    ).scalars().all()
    if existing:
        raise HTTPException(status_code=400, detail=f"Numero(s) ja vendidos: {sorted(existing)}")

    purchase_id = str(uuid.uuid4())
    total_amount = len(purchase.numbers) * r.price
    p = Purchase(
        id=purchase_id,
        raffle_id=purchase.raffle_id,
        buyer_name=purchase.buyer_name,
        buyer_phone=purchase.buyer_phone,
        buyer_email=str(purchase.buyer_email),
        total_amount=total_amount,
        status="confirmed",
    )
    db.add(p)
    db.flush()
    # mark numbers
    now = datetime.utcnow()
    for num in purchase.numbers:
        db.add(RaffleNumber(
            raffle_id=purchase.raffle_id,
            number=num,
            buyer_name=purchase.buyer_name,
            buyer_phone=purchase.buyer_phone,
            buyer_email=str(purchase.buyer_email),
            status="sold",
            sold_at=now,
            purchase_id=purchase_id,
        ))
    db.commit()
    return {
        "id": p.id,
        "raffle_id": p.raffle_id,
        "numbers": purchase.numbers,
        "buyer_name": p.buyer_name,
        "buyer_phone": p.buyer_phone,
        "buyer_email": p.buyer_email,
        "total_amount": p.total_amount,
        "status": p.status,
        "created_at": p.created_at.isoformat(),
    }


@app.get("/api/purchases", response_model=list[PurchaseResponse])
async def get_purchases(raffle_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Listar todas as compras"""
    query = select(Purchase)
    if raffle_id:
        query = query.where(Purchase.raffle_id == raffle_id)
    rows = db.execute(query.order_by(Purchase.created_at.desc())).scalars().all()
    # For each purchase, get numbers
    result = []
    for p in rows:
        nums = db.execute(
            select(RaffleNumber.number).where(RaffleNumber.purchase_id == p.id)
        ).scalars().all()
        result.append({
            "id": p.id,
            "raffle_id": p.raffle_id,
            "numbers": nums,
            "buyer_name": p.buyer_name,
            "buyer_phone": p.buyer_phone,
            "buyer_email": p.buyer_email,
            "total_amount": p.total_amount,
            "status": p.status,
            "created_at": p.created_at.isoformat(),
        })
    return result


# Draw Route
@app.post("/api/raffles/{raffle_id}/draw", response_model=DrawResult)
async def draw_raffle(raffle_id: str, db: Session = Depends(get_db)):
    """Realizar o sorteio de uma rifa"""
    r = db.get(Raffle, raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    if r.status != "active":
        raise HTTPException(status_code=400, detail="Esta rifa nao esta ativa")
    sold_numbers = db.execute(
        select(RaffleNumber).where(and_(RaffleNumber.raffle_id == raffle_id, RaffleNumber.status == "sold"))
    ).scalars().all()
    if not sold_numbers:
        raise HTTPException(status_code=400, detail="Nenhum numero foi vendido ainda")
    winner = random.choice(sold_numbers)
    r.status = "completed"
    r.winner_number = winner.number
    db.commit()
    return {
        "raffle_id": raffle_id,
        "winner_number": winner.number,
        "winner_name": winner.buyer_name,
        "winner_phone": winner.buyer_phone,
        "winner_email": winner.buyer_email,
        "drawn_at": datetime.utcnow().isoformat()
    }


# Admin Stats
@app.get("/api/admin/stats")
async def get_admin_stats():
    """Obter estatisticas gerais do sistema"""
    with next(get_db()) as db:
        total_raffles = db.execute(select(func.count()).select_from(Raffle)).scalar_one()
        active_raffles = db.execute(
            select(func.count()).select_from(Raffle).where(Raffle.status == "active")
        ).scalar_one()
        completed_raffles = db.execute(
            select(func.count()).select_from(Raffle).where(Raffle.status == "completed")
        ).scalar_one()
        total_purchases = db.execute(select(func.count()).select_from(Purchase)).scalar_one()
        total_revenue = db.execute(select(func.coalesce(func.sum(Purchase.total_amount), 0.0))).scalar_one()
        total_numbers_sold = db.execute(
            select(func.count()).select_from(RaffleNumber).where(RaffleNumber.status == "sold")
        ).scalar_one()
    return {
        "total_raffles": total_raffles,
        "active_raffles": active_raffles,
        "completed_raffles": completed_raffles,
        "total_purchases": total_purchases,
        "total_revenue": total_revenue,
        "total_numbers_sold": total_numbers_sold
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
