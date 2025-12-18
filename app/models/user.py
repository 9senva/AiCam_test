from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, CHAR, TEXT
from sqlalchemy.sql import func
from app.database.connection import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(100), nullable=False, default="123456")
    nickName = Column(String(30))
    email = Column(String(50), unique=True)
    phoneNumber = Column(String(11), unique=True)
    sex = Column(CHAR(1), default='0')
    birthday = Column(TIMESTAMP, nullable=True)
    avatarFileUrl = Column(String(100), nullable=False, default='')
    role = Column(String(20), default='user')
    accountStatus = Column(Boolean, default=True)
    coin = Column(Integer, default=0)
    count = Column(Integer, default=0)
    delFlag = Column(Boolean, default=False)
    createTime = Column(TIMESTAMP, server_default=func.current_timestamp())
    remark = Column(TEXT)