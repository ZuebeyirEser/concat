import uuid

from pydantic import BaseModel, ConfigDict


class ItemBase(BaseModel):
    title: str | None = None
    description: str | None = None


class ItemCreate(ItemBase):
    title: str


class ItemUpdate(ItemBase):
    pass


class ItemInDBBase(ItemBase):
    id: uuid.UUID
    title: str
    owner_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class Item(ItemInDBBase):
    pass


class ItemInDB(ItemInDBBase):
    pass


class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(BaseModel):
    data: list[ItemPublic]
    count: int
