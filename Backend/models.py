from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    password: str
    email: EmailStr   
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GPTRequest(BaseModel):
    prompt: str
    model: str

class CorrectorFRequest(BaseModel):
    text: str

class AgentCreate(BaseModel):
    name: str
    system_prompt: Optional[str] = None
    knowledge: Optional[str] = None


class JorneyRequest(BaseModel):
    prompt: str
