from pydantic import BaseModel
from typing import List

class Landmark(BaseModel):
    x: float
    y: float
    z: float

class SegmentedPose(BaseModel):
    head: List[Landmark]
    upper: List[Landmark]
    lower: List[Landmark]