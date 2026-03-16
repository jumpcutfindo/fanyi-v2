import pytest
from unittest.mock import MagicMock
from app.processor import Processor
from app.types import OcrResult


@pytest.fixture
def mock_processor(mocker: MagicMock):
  """Fixture to create a Processor with mocked dependencies."""
  mocker.patch("app.processor.Dictionary")
  mocker.patch("app.processor.OCRAnalyzer")
  mocker.patch("app.processor.logger")

  processor = Processor(public_path="public", user_data_path="user_data")

  # Ensure dependencies are mocked on the instance
  processor.dictionary = MagicMock()
  processor.engine = MagicMock()
  return processor


def test_process_run_ocr_success(mock_processor, mocker: MagicMock):
  """Tests 'run_ocr' command with a valid image path and successful OCR."""
  mock_ipc = mocker.patch("app.processor.ipc")
  mocker.patch("os.path.exists", return_value=True)

  ocr_result: OcrResult = {"results": [], "segmented_text": ["test"]}
  mock_processor.engine.ocr_and_segment.return_value = ocr_result

  data = {"image_path": "valid_path.png"}
  mock_processor.process("run_ocr", data)

  mock_processor.engine.ocr_and_segment.assert_called_once_with("valid_path.png")
  mock_ipc.write_and_send.assert_called_once()
  sent_payload = mock_ipc.write_and_send.call_args[0][0]
  assert sent_payload["action"] == "ocr_result"
  assert sent_payload["data"] == ocr_result


def test_process_run_ocr_invalid_path(mock_processor, mocker: MagicMock):
  """Tests 'run_ocr' with a non-existent image path."""
  mock_ipc = mocker.patch("app.processor.ipc")
  mocker.patch("os.path.exists", return_value=False)

  data = {"image_path": "invalid_path.png"}
  mock_processor.process("run_ocr", data)

  mock_processor.engine.ocr_and_segment.assert_not_called()
  mock_ipc.write_and_send.assert_called_once()
  sent_payload = mock_ipc.write_and_send.call_args[0][0]
  assert sent_payload["action"] == "error"


def test_process_run_ocr_exception(mock_processor, mocker: MagicMock):
  """Tests 'run_ocr' when the OCR engine raises an exception."""
  mock_ipc = mocker.patch("app.processor.ipc")
  mocker.patch("os.path.exists", return_value=True)
  mock_processor.engine.ocr_and_segment.side_effect = Exception("OCR error")

  data = {"image_path": "valid_path.png"}
  mock_processor.process("run_ocr", data)

  mock_ipc.write_and_send.assert_called_once()
  sent_payload = mock_ipc.write_and_send.call_args[0][0]
  assert sent_payload["action"] == "error"


def test_process_entry_change_add_reload(mock_processor: MagicMock):
  """Tests 'entry_change' with 'add' type where reload is required."""
  mock_processor.dictionary.add_word.return_value = True
  mock_processor.dictionary.get_jieba_dict_path.return_value = "dict_path"

  data = {"type": "add", "entry": "new_word"}
  mock_processor.process("entry_change", data)

  mock_processor.dictionary.add_word.assert_called_once_with("new_word")
  mock_processor.engine.reload_jieba_dict.assert_called_once_with("dict_path")


def test_process_entry_change_remove_no_reload(mock_processor):
  """Tests 'entry_change' with 'remove' type where no reload is required."""
  mock_processor.dictionary.remove_word.return_value = False

  data = {"type": "remove", "entry": "old_word"}
  mock_processor.process("entry_change", data)

  mock_processor.dictionary.remove_word.assert_called_once_with("old_word")
  mock_processor.engine.reload_jieba_dict.assert_not_called()


def test_process_entry_change_unknown_type(mock_processor, mocker):
  """Tests 'entry_change' with an unknown change type."""
  mock_logger = mocker.patch("app.processor.logger")

  data = {"type": "unknown", "entry": "word"}
  mock_processor.process("entry_change", data)

  mock_logger.error.assert_called()
  mock_processor.engine.reload_jieba_dict.assert_not_called()


def test_process_exit(mock_processor, mocker):
  """Tests 'exit' command calls sys.exit(0)."""
  mock_exit = mocker.patch("sys.exit")

  mock_processor.process("exit", None)

  mock_exit.assert_called_once_with(0)


def test_process_unknown_command(mock_processor, mocker):
  """Tests receiving an unknown command."""
  mock_logger = mocker.patch("app.processor.logger")

  mock_processor.process("unknown_cmd", {})

  mock_logger.info.assert_called_with("Unknown command received: 'unknown_cmd'")
