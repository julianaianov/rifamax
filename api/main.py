"""
Rifa Aí - Sistema de Rifas Online
Backend API com FastAPI e Python
"""

import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid
import random
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, delete
from .database import Base, engine, get_db
from .models import Raffle, RaffleNumber, Purchase, User
from .security import hash_password, verify_password, create_access_token, get_current_user
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Rifa Aí API",
    description="API para sistema de rifas online",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    # Em desenvolvimento, especifique as origens do front para evitar bloqueios
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

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

class UserRegister(BaseModel):
    username: str
    password: str
    name: str
    cpf: str
    address: str
    phone: str
    email: EmailStr

class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    cpf: str
    address: str
    phone: str
    email: EmailStr
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@app.on_event("startup")
def on_startup():
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Sem seeds: base limpa para receber novos dados


# Routes
@app.get("/")
async def root():
    return {"message": "Bem-vindo à API Rifa Aí!", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Auth Routes
@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    # Verificar unicidade de username, email e cpf
    exists = db.execute(
        select(User).where(
            (User.username == payload.username) | (User.email == str(payload.email)) | (User.cpf == payload.cpf)
        )
    ).scalars().first()
    if exists:
        raise HTTPException(status_code=400, detail="Usuario, email ou CPF já cadastrado")
    user = User(
        id=str(uuid.uuid4()),
        username=payload.username,
        password_hash=hash_password(payload.password),
        name=payload.name,
        cpf=payload.cpf,
        address=payload.address,
        phone=payload.phone,
        email=str(payload.email),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "cpf": user.cpf,
        "address": user.address,
        "phone": user.phone,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
    }

class LoginPayload(BaseModel):
    username: str
    password: str

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.username == payload.username)).scalars().first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def me(current: User = Depends(get_current_user)):
    return {
        "id": current.id,
        "username": current.username,
        "name": current.name,
        "cpf": current.cpf,
        "address": current.address,
        "phone": current.phone,
        "email": current.email,
        "created_at": current.created_at.isoformat(),
    }

@app.post("/api/upload-image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    # Validate content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
    # Derive extension
    ext = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
    }.get(file.content_type, None)
    if ext is None:
        raise HTTPException(status_code=400, detail="Formato de imagem não suportado")
    filename = f"{uuid.uuid4()}.{ext}"
    path = UPLOAD_DIR / filename
    # Save to disk
    data = await file.read()
    try:
        with path.open("wb") as f:
            f.write(data)
    except Exception:
        raise HTTPException(status_code=500, detail="Falha ao salvar a imagem")
    base = str(request.base_url)  # ends with '/'
    url = f"{base}uploads/{filename}"
    return {"url": url}


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


# Admin maintenance
@app.post("/api/raffles/{raffle_id}/reset-numbers")
async def reset_raffle_numbers(raffle_id: str, db: Session = Depends(get_db)):
    """Zera todos os números (reservados/vendidos) de uma rifa."""
    r = db.get(Raffle, raffle_id)
    if not r:
        raise HTTPException(status_code=404, detail="Rifa nao encontrada")
    count = db.execute(
        select(func.count()).select_from(RaffleNumber).where(RaffleNumber.raffle_id == raffle_id)
    ).scalar_one()
    db.execute(delete(RaffleNumber).where(RaffleNumber.raffle_id == raffle_id))
    r.status = "active"
    r.winner_number = None
    db.commit()
    return {"raffle_id": raffle_id, "cleared_numbers": int(count), "status": r.status}


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
