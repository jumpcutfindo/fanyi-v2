"""Tests for the utility functions."""

import os
import sys
from unittest.mock import MagicMock, call

# Replace here since in-line replacement isn't working for shutil.rmtree
# sys.modules['shutil'] = MagicMock()

from app.utils import handle_pyinstaller_folders


def test_handle_pyinstaller_folders_cleanup(mocker: MagicMock):
  """
  Tests that the handle_pyinstaller_folders function correctly cleans up old
  PyInstaller temporary folders.
  """
  # 1. Setup Mock Environment
  # Define a fake directory structure
  current_mei_folder = os.path.abspath("/tmp/_MEI_current")
  old_fanyi_folder = os.path.abspath("/tmp/_MEI_old_fanyi")
  old_other_folder = os.path.abspath("/tmp/_MEI_old_other")
  all_mei_folders = [current_mei_folder, old_fanyi_folder, old_other_folder]

  # Mock PyInstaller's sys._MEIPASS to simulate running in a temp folder
  mocker.patch.object(sys, "_MEIPASS", current_mei_folder, create=True)

  # Mock filesystem functions
  mock_rmtree = mocker.patch("app.utils.rmtree")  # Replace the already imported rmtree
  mock_glob = mocker.patch("glob.glob", return_value=all_mei_folders)
  mocker.patch("builtins.open", mocker.mock_open())
  # Mock logger to prevent side effects
  mocker.patch("app.utils.logger")

  # This side effect function simulates which folders have the 'fanyi' indicator file
  def mock_path_exists(path: str) -> bool:
    # The 'fanyi' file should exist in the old fanyi-related folder
    if path == os.path.join(old_fanyi_folder, "fanyi"):
      return True

    # It should NOT exist in the other old folder
    if path == os.path.join(old_other_folder, "fanyi"):
      return False

    return True  # Assume other paths exist for simplicity

  mocker.patch("os.path.exists", side_effect=mock_path_exists)

  # 2. Call the function to be tested
  handle_pyinstaller_folders()

  # 3. Assertions
  # Check that glob was called to find all _MEI* folders
  expected_search_dir = os.path.abspath(os.path.join(current_mei_folder, ".."))
  mock_glob.assert_called_once_with(os.path.join(expected_search_dir, "_MEI*"))

  # Assert that rmtree was called ONLY on the old fanyi folder
  mock_rmtree.assert_called_once_with(old_fanyi_folder)
  mock_rmtree.assert_has_calls([call(old_fanyi_folder)])
