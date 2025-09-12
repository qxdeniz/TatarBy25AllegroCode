from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    password: str
    email: EmailStr   
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GPTRequest(BaseModel):
    prompt: str

class CorrectorFRequest(BaseModel):
    text: str