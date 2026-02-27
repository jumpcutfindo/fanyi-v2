"""Utility functions for the app."""

import glob
import os
from shutil import rmtree
import sys
from typing import List
from . import logger


def handle_pyinstaller_folders():
  """Cleans up leaked temporary folders from previous PyInstaller runs."""
  try:
    logger.info("Handling PyInstaller temporary folders...")

    if not sys._MEIPASS:
      logger.warn(
        "MEIPASS is not set, skipping temp folder cleanup (probably not in pyinstaller context?)"
      )
      return

    # pylint: disable=protected-access,no-member
    base_path = sys._MEIPASS

    # Create a file "fanyi" in this folder
    # This acts as an indicator that this folder belongs to fanyi
    logger.debug(f"Creating indicator file in current temp folder: {base_path}")
    open(os.path.join(base_path, "fanyi"), encoding="utf-8", mode="w").close()

    # Go to parent folder of MEIPASS
    temp_dir = os.path.abspath(os.path.join(base_path, ".."))

    temp_folders = glob.glob(os.path.join(temp_dir, "_MEI*"))

    logger.debug(f"Found {len(temp_folders)} temp folders matching _MEI* pattern")

    removed_files: List[str] = []

    for folder in temp_folders:
      # Check if file "fanyi" exists in the folder
      if not os.path.exists(os.path.join(folder, "fanyi")):
        logger.debug(f"Folder {folder} does not contain file 'fanyi', skipping delete")
        continue

      # Check that this isn't the current temp file being used
      if folder == base_path:
        logger.debug(
          f"Folder {folder} is the current temp file being used, skipping delete"
        )
        continue

      # Delete old folder
      logger.debug(f"Deleting old folder: {folder}")
      removed_files.append(folder)
      rmtree(folder)

    if removed_files:
      logger.info(
        f"Removed {len(removed_files)} old PyInstaller temp folders: {removed_files}"
      )
  except Exception as e:
    logger.info(
      f"Exception occurred when trying to handle PyInstaller folders: {e}",
    )
