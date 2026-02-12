import pytest
from unittest.mock import MagicMock
from app.engine import OCRAnalyzer

def test_ocr_analyzer_init(mocker):
    """Verifies that easyocr and jieba are initialized correctly."""
    mock_reader_class = mocker.patch("easyocr.Reader")
    mock_jieba_cut = mocker.patch("jieba.cut")
    mocker.patch("app.engine.logger")

    languages = ["ch_sim", "en"]
    analyzer = OCRAnalyzer(languages=languages)

    mock_reader_class.assert_called_once_with(languages)
    # Check warm-up call
    mock_jieba_cut.assert_called_with("初始化", cut_all=False)

def test_ocr_and_segment_success(mocker):
    """Tests the full OCR and segmentation pipeline with mocked results."""
    # Setup mocks
    mock_reader_instance = MagicMock()
    mocker.patch("easyocr.Reader", return_value=mock_reader_instance)
    # Mock jieba.cut for both init and the actual call
    mock_jieba_cut = mocker.patch("jieba.cut")
    mock_jieba_cut.side_effect = [iter(["init"]), iter(["你好", "世界"])]
    mocker.patch("app.engine.logger")

    # Mock easyocr result: [([[x,y], ...], text, confidence)]
    mock_reader_instance.readtext.return_value = [
        ([[10.1, 20.9], [100.5, 20.9], [100.5, 50.2], [10.1, 50.2]], "你好世界", 0.98)
    ]

    analyzer = OCRAnalyzer()
    result = analyzer.ocr_and_segment("test_image.png")

    # Verify data transformation
    assert result["segmented_text"] == ["你好", "世界"]
    assert len(result["results"]) == 1
    
    # Check coordinate rounding/casting to int
    expected_coords = [[10, 20], [100, 20], [100, 50], [10, 50]]
    assert result["results"][0]["coordinates"] == expected_coords
    assert result["results"][0]["text"] == "你好世界"
    assert result["results"][0]["confidence"] == 0.98

    mock_reader_instance.readtext.assert_called_once_with("test_image.png")

def test_ocr_and_segment_empty(mocker):
    """Tests handling of images where no text is detected."""
    mock_reader_instance = MagicMock()
    mocker.patch("easyocr.Reader", return_value=mock_reader_instance)
    mock_jieba_cut = mocker.patch("jieba.cut")
    mock_jieba_cut.side_effect = [iter(["init"]), iter([])]
    mocker.patch("app.engine.logger")

    mock_reader_instance.readtext.return_value = []

    analyzer = OCRAnalyzer()
    result = analyzer.ocr_and_segment("empty.png")

    assert result["results"] == []
    assert result["segmented_text"] == []

def test_ocr_and_segment_error_handling(mocker):
    """Verifies that exceptions are wrapped in RuntimeError."""
    mock_reader_instance = MagicMock()
    mocker.patch("easyocr.Reader", return_value=mock_reader_instance)
    mocker.patch("jieba.cut")
    mocker.patch("app.engine.logger")

    mock_reader_instance.readtext.side_effect = Exception("Low level OCR failure")

    analyzer = OCRAnalyzer()
    with pytest.raises(RuntimeError) as exc_info:
        analyzer.ocr_and_segment("broken.png")
    
    assert "OCR or segmentation failed" in str(exc_info.value)
    assert "Low level OCR failure" in str(exc_info.value)
