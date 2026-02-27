"""
Encapsulates the OCR and segmentation operations for Fanyi
"""

import os
from typing import List

from paddleocr import PaddleOCR
import jieba
from . import logger
from .types import OcrResult, OcrResultItem


class OCRAnalyzer:
  """
  Encapsulates the OCR and segmentation operations for Fanyi
  """

  def __init__(self, jieba_dict_path: str):
    logger.info("Initializing OCR and segmentation models. This may take a moment...")
    self.ocr = PaddleOCR(
      use_doc_orientation_classify=False,
      use_doc_unwarping=False,
      use_textline_orientation=False,
    )

    # Setup and warmup
    logger.debug(f"Loading jieba dictionary from {jieba_dict_path}")

    # Check if file exists
    if os.path.exists(jieba_dict_path):
      jieba.load_userdict(jieba_dict_path)
    else:
      logger.warn(
        f"Jieba dictionary file not found at {jieba_dict_path}, continuing without custom dictionary"
      )

  def ocr_and_segment(self, image_path: str) -> OcrResult:
    logger.debug(f"Performing OCR and segmentation on image: {image_path} ")

    """
        Performs OCR and text segmentation on an image given its file path.
        """
    try:
      # Pass the file path directly to easyocr.readtext()
      raw_data = self.ocr.predict(input=image_path)[0]

      logger.debug(f"Extracted text from {image_path}")

      boxes = (
        raw_data.get("dt_polys", []) if isinstance(raw_data, dict) else raw_data[0]
      )
      texts = raw_data.get("rec_texts", [])
      scores = raw_data.get("rec_scores", [])

      # Extract the segmented text from the results
      combined_text = "".join(texts)
      seg_list = list(jieba.cut(combined_text, cut_all=False))

      logger.debug(f"Segmented text from {image_path}: {seg_list}")

      formatted_results: List[OcrResultItem] = []

      for box, text, score in zip(boxes, texts, scores):
        formatted_results.append(
          {
            "coordinates": [[int(pt[0]), int(pt[1])] for pt in box],
            "text": str(text),
            "confidence": float(score),
          }
        )

      return OcrResult(results=formatted_results, segmented_text=seg_list)

    except Exception as e:
      # Re-raise exceptions with a custom message for better debugging
      raise RuntimeError(f"OCR or segmentation failed: {e}") from e

  def reload_jieba_dict(self, jieba_dict_path: str):
    logger.debug(f"Reloading jieba dictionary from {jieba_dict_path}")
    jieba.load_userdict(jieba_dict_path)
