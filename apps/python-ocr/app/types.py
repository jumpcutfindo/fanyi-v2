from typing import List, Literal, TypedDict, Union

class AppFD:
  DATA_IN = 3
  DATA_OUT = 4
  LOGS = 5

class OcrResultItem(TypedDict):
    coordinates: List[List[float]] # number[][]
    text: str
    confidence: float

class OcrResult(TypedDict):
    results: List[OcrResultItem]
    segmented_text: List[str]

class OutgoingLogPayload(TypedDict):
    type: Literal['debug', 'info', 'error']
    message: str

class OutgoingModelReadyPayload(TypedDict):
    action: Literal['model_ready']

class OutgoingOcrResultPayload(TypedDict):
    action: Literal['ocr_result']
    data: OcrResult
  
class OutgoingErrorPayload(TypedDict):
    action: Literal['error']
    message: str

OutgoingDataPayload = Union[OutgoingOcrResultPayload, OutgoingModelReadyPayload, OutgoingErrorPayload]