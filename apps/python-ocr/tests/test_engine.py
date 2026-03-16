import pytest
from unittest.mock import MagicMock
from app.engine import OCRAnalyzer


def test_ocr_analyzer_init(mocker: MagicMock):
  """Verifies that PaddleOCR and jieba are initialized correctly."""
  mock_ocr_class = mocker.patch("app.engine.PaddleOCR")
  mock_jieba_load = mocker.patch("jieba.load_userdict")
  mocker.patch("os.path.exists", return_value=True)
  mocker.patch("app.engine.logger")

  dict_path = "path/to/dict.txt"

  # Test instantiation
  OCRAnalyzer(jieba_dict_path=dict_path)

  mock_ocr_class.assert_called_once_with(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
  )
  mock_jieba_load.assert_called_once_with(dict_path)


def test_ocr_and_segment_success(mocker: MagicMock):
  """Tests the full OCR and segmentation pipeline with mocked results."""
  # Setup mocks
  mock_ocr_instance = MagicMock()
  mocker.patch("app.engine.PaddleOCR", return_value=mock_ocr_instance)
  mocker.patch("jieba.load_userdict")
  mock_jieba_cut = mocker.patch("jieba.cut")
  mock_jieba_cut.return_value = iter(["你好", "世界"])
  mocker.patch("os.path.exists", return_value=True)
  mocker.patch("app.engine.logger")

  # Mock PaddleOCR result: [result_dict]
  mock_ocr_instance.predict.return_value = [
    {
      "dt_polys": [[[10.1, 20.9], [100.5, 20.9], [100.5, 50.2], [10.1, 50.2]]],
      "rec_texts": ["你好世界"],
      "rec_scores": [0.98],
    }
  ]

  analyzer = OCRAnalyzer(jieba_dict_path="fake.txt")
  result = analyzer.ocr_and_segment("test_image.png")

  # Verify data transformation
  assert result["segmented_text"] == ["你好", "世界"]
  assert len(result["results"]) == 1

  # Check coordinate rounding/casting to int
  expected_coords = [[10, 20], [100, 20], [100, 50], [10, 50]]
  assert result["results"][0]["coordinates"] == expected_coords
  assert result["results"][0]["text"] == "你好世界"
  assert result["results"][0]["confidence"] == 0.98

  mock_ocr_instance.predict.assert_called_once_with(input="test_image.png")


def test_ocr_and_segment_empty(mocker: MagicMock):
  """Tests handling of images where no text is detected."""
  mock_ocr_instance = MagicMock()
  mocker.patch("app.engine.PaddleOCR", return_value=mock_ocr_instance)
  mocker.patch("jieba.load_userdict")
  mock_jieba_cut = mocker.patch("jieba.cut")
  mock_jieba_cut.return_value = iter([])
  mocker.patch("os.path.exists", return_value=True)
  mocker.patch("app.engine.logger")

  mock_ocr_instance.predict.return_value = [
    {"dt_polys": [], "rec_texts": [], "rec_scores": []}
  ]

  analyzer = OCRAnalyzer(jieba_dict_path="empty.txt")
  result = analyzer.ocr_and_segment("empty.png")

  assert result["results"] == []
  assert result["segmented_text"] == []


def test_ocr_and_segment_error_handling(mocker: MagicMock):
  """Verifies that exceptions are wrapped in RuntimeError."""
  mock_ocr_instance = MagicMock()
  mocker.patch("app.engine.PaddleOCR", return_value=mock_ocr_instance)
  mocker.patch("jieba.load_userdict")
  mocker.patch("os.path.exists", return_value=True)
  mocker.patch("app.engine.logger")

  mock_ocr_instance.predict.side_effect = Exception("Low level OCR failure")

  analyzer = OCRAnalyzer(jieba_dict_path="broken.txt")
  with pytest.raises(RuntimeError) as exc_info:
    analyzer.ocr_and_segment("broken.png")

  assert "OCR or segmentation failed" in str(exc_info.value)
  assert "Low level OCR failure" in str(exc_info.value)


def test_reload_jieba_dict(mocker: MagicMock):
  """Verifies that jieba dictionary can be reloaded."""
  mocker.patch("app.engine.PaddleOCR")
  mock_jieba_load = mocker.patch("jieba.load_userdict")
  mocker.patch("os.path.exists", return_value=True)
  mocker.patch("app.engine.logger")

  analyzer = OCRAnalyzer(jieba_dict_path="initial.txt")
  new_path = "new/path.txt"
  analyzer.reload_jieba_dict(new_path)

  mock_jieba_load.assert_called_with(new_path)
