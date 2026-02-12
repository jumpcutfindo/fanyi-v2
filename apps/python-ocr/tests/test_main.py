import json
import pytest
from unittest.mock import MagicMock, patch

# We mock os.fdopen before importing main to avoid "Bad file descriptor" errors
with patch("os.fdopen", return_value=MagicMock()):
    from main import main
    import main as main_module

def test_main_run_ocr_success(mocker):
    """Tests successful OCR command processing."""
    # Mock dependencies
    mock_analyzer = mocker.patch("main.OCRAnalyzer")
    mock_analyzer_instance = mock_analyzer.return_value
    mock_analyzer_instance.ocr_and_segment.return_value = {"results": [], "segmented_text": []}
    
    mock_write_send = mocker.patch("main.write_and_send")
    mock_exists = mocker.patch("os.path.exists", return_value=True)
    mocker.patch("main.handle_pyinstaller_folders")
    mocker.patch("main.logger")

    # Mock in_stream to provide one command and then stop
    mock_command = {"action": "run_ocr", "image_path": "test.png"}
    main_module.in_stream = [json.dumps(mock_command)]

    main()

    # Assertions
    mock_analyzer_instance.ocr_and_segment.assert_called_once_with("test.png")
    mock_write_send.assert_any_call({"action": "model_ready"})
    mock_write_send.assert_any_call({
        "action": "ocr_result",
        "data": {"results": [], "segmented_text": []}
    })

def test_main_run_ocr_invalid_path(mocker):
    """Tests handling of non-existent image path."""
    mocker.patch("main.OCRAnalyzer")
    mock_write_send = mocker.patch("main.write_and_send")
    mock_exists = mocker.patch("os.path.exists", return_value=False)
    mocker.patch("main.handle_pyinstaller_folders")
    mocker.patch("main.logger")

    mock_command = {"action": "run_ocr", "image_path": "missing.png"}
    main_module.in_stream = [json.dumps(mock_command)]

    main()

    mock_write_send.assert_any_call({
        "action": "error",
        "message": "Invalid image path"
    })

def test_main_exit_command(mocker):
    """Tests the exit command."""
    mocker.patch("main.OCRAnalyzer")
    mock_exit = mocker.patch("sys.exit")
    mocker.patch("main.handle_pyinstaller_folders")
    mocker.patch("main.logger")
    mocker.patch("main.write_and_send")

    mock_command = {"action": "exit"}
    main_module.in_stream = [json.dumps(mock_command)]

    main()

    mock_exit.assert_called_once_with(0)

def test_main_unknown_command(mocker):
    """Tests handling of unknown commands."""
    mocker.patch("main.OCRAnalyzer")
    mock_write_send = mocker.patch("main.write_and_send")
    mocker.patch("main.handle_pyinstaller_folders")
    mock_logger = mocker.patch("main.logger")

    mock_command = {"action": "unknown"}
    # We need to end the loop after the unknown command
    # Since there's no break for unknown, it will continue to the next line.
    main_module.in_stream = [json.dumps(mock_command)]

    main()

    mock_logger.info.assert_any_call("Unknown command received: 'unknown'")
