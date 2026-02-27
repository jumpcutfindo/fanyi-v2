"""
Encapsulates the OCR and segmentation operations for Fanyi
"""

import easyocr
import jieba
from . import logger
from .types import OcrResult


class OCRAnalyzer:
  """
  Encapsulates the OCR and segmentation operations for Fanyi
  """

  def __init__(self, jieba_dict_path: str, languages=["ch_sim"]):
    logger.info("Initializing OCR and segmentation models. This may take a moment...")
    self.reader = easyocr.Reader(languages)

    # Setup and warmup
    logger.debug(f"Loading jieba dictionary from {jieba_dict_path}")

    # Check if file exists
    if os.path.exists(jieba_dict_path):
      jieba.load_userdict(jieba_dict_path)
    else:
      logger.warn(f"Jieba dictionary file not found at {jieba_dict_path}, continuing without custom dictionary")



  def ocr_and_segment(self, image_path: str) -> OcrResult:
    logger.debug(f"Performing OCR and segmentation on image: {image_path} ")

    """
        Performs OCR and text segmentation on an image given its file path.
        """
    try:
      # Pass the file path directly to easyocr.readtext()
      results = self.reader.readtext(image_path)

      logger.debug(f"Extracted text from {image_path}")

      # Extract the segmented text from the results
      text = "".join([result[1] for result in results])
      seg_list = list(jieba.cut(text, cut_all=False))

      logger.debug(f"Segmented text from {image_path}: {seg_list}")

      return {
        "results": list(
          map(
            lambda result: {
              # Convert coordinates to integers
              "coordinates": list(
                map(
                  lambda point: [int(point[0]), int(point[1])],
                  result[0],
                )
              ),
              "text": result[1],
              "confidence": result[2],
            },
            results,
          )
        ),
        "segmented_text": seg_list,
      }

    except Exception as e:
      # Re-raise exceptions with a custom message for better debugging
      raise RuntimeError(f"OCR or segmentation failed: {e}") from e

  def reload_jieba_dict(self, jieba_dict_path: str):
    logger.debug(f"Reloading jieba dictionary from {jieba_dict_path}")
    jieba.load_userdict(jieba_dict_path)
