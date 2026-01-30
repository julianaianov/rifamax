from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .database import Base


class Raffle(Base):
    __tablename__ = "raffles"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    prize: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    total_numbers: Mapped[int] = mapped_column(Integer, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    draw_date: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="active")
    winner_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    numbers: Mapped[list["RaffleNumber"]] = relationship(back_populates="raffle", cascade="all, delete-orphan")
    purchases: Mapped[list["Purchase"]] = relationship(back_populates="raffle", cascade="all, delete-orphan")


class Purchase(Base):
    __tablename__ = "purchases"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    raffle_id: Mapped[str] = mapped_column(String, ForeignKey("raffles.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_name: Mapped[str] = mapped_column(String, nullable=False)
    buyer_phone: Mapped[str] = mapped_column(String, nullable=False)
    buyer_email: Mapped[str] = mapped_column(String, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="confirmed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    raffle: Mapped[Raffle] = relationship(back_populates="purchases")
    numbers: Mapped[list["RaffleNumber"]] = relationship(back_populates="purchase")


class RaffleNumber(Base):
    __tablename__ = "raffle_numbers"
    __table_args__ = (
        UniqueConstraint("raffle_id", "number", name="uix_raffle_number_unique"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    raffle_id: Mapped[str] = mapped_column(String, ForeignKey("raffles.id", ondelete="CASCADE"), nullable=False, index=True)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    buyer_name: Mapped[str | None] = mapped_column(String, nullable=True)
    buyer_phone: Mapped[str | None] = mapped_column(String, nullable=True)
    buyer_email: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="available")
    reserved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sold_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    purchase_id: Mapped[str | None] = mapped_column(String, ForeignKey("purchases.id", ondelete="SET NULL"), nullable=True, index=True)

    raffle: Mapped[Raffle] = relationship(back_populates="numbers")
    purchase: Mapped[Purchase | None] = relationship(back_populates="numbers")


