"""Utility functions for the app."""

import glob
import os
from shutil import rmtree
import sys
from . import logger

def handle_pyinstaller_folders():
    """Cleans up leaked temporary folders from previous PyInstaller runs."""
    try:
        # pylint: disable=protected-access,no-member
        base_path = sys._MEIPASS

        # Create a file "fanyi" in this folder
        # This acts as an indicator that this folder belongs to fanyi
        open(os.path.join(base_path, "fanyi"), encoding="utf-8", mode="w").close()

        # Go to parent folder of MEIPASS
        temp_dir = os.path.abspath(os.path.join(base_path, ".."))

        temp_folders = glob.glob(os.path.join(temp_dir, "_MEI*"))

        logger.info(
            f"Found {len(temp_folders)} temp folders matching _MEI* pattern"
        )

        for folder in temp_folders:
            # Check if file "fanyi" exists in the folder
            if not os.path.exists(os.path.join(folder, "fanyi")):
                logger.info(
                    f"Folder {folder} does not contain file 'fanyi', skipping delete"
                )
                continue

            # Check that this isn't the current temp file being used
            if folder == base_path:
                logger.info(
                    f"Folder {folder} is the current temp file being used, skipping delete"
                )
                continue

            # Delete old folder
            logger.info(f"Deleting old folder: {folder}")
            rmtree(folder)
    except Exception:
        logger.info(
            "Exception occurred when trying to handle PyInstaller folders"
        )
        logger.info(Exception, )
