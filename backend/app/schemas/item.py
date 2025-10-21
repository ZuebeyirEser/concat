import uuid

from pydantic import BaseModel, ConfigDict


# Shared properties
class ItemBase(BaseModel):
    title: str | None = None
    description: str | None = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str


# Properties to receive on item update
class ItemUpdate(ItemBase):
    pass


# Properties shared by models stored in DB
class ItemInDBBase(ItemBase):
    id: uuid.UUID
    title: str
    owner_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


# Properties to return to client
class Item(ItemInDBBase):
    pass


# Properties properties stored in DB
class ItemInDB(ItemInDBBase):
    pass


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(BaseModel):
    data: list[ItemPublic]
    count: int
