from pydantic import BaseModel
from datetime import datetime
from fastapi import UploadFile

class AddCoinsRequest(BaseModel):
    phoneNumber: str
    coinsToAdd: int

class RegisterRequest(BaseModel):
    username: str
    password: str
    nickName: str = None
    email: str = None
    phoneNumber: str = None
    sex: str = None
    birthday: datetime = None
    avatar: UploadFile = None

class LoginRequest(BaseModel):
    phoneNumber: str
    password: str

class ChangePasswordRequest(BaseModel):
    phoneNumber: str
    oldPassword: str
    newPassword: str

class AnalysisResponse(BaseModel):
    analysis: str