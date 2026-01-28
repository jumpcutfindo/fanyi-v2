"""Utility functions for the app."""

import glob
import os
from shutil import rmtree
import sys


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

        print(
            f"Found {len(temp_folders)} temp folders matching _MEI* pattern",
            file=sys.stderr,
        )

        for folder in temp_folders:
            # Check if file "fanyi" exists in the folder
            if not os.path.exists(os.path.join(folder, "fanyi")):
                print(
                    f"Folder {folder} does not contain file 'fanyi', skipping delete",
                    file=sys.stderr,
                )
                continue

            # Check that this isn't the current temp file being used
            if folder == base_path:
                print(
                    f"Folder {folder} is the current temp file being used, skipping delete",
                    file=sys.stderr,
                )
                continue

            # Delete old folder
            print(f"Deleting old folder: {folder}", file=sys.stderr)
            rmtree(folder)
    except Exception:
        print(
            "Exception occurred when trying to handle PyInstaller folders",
            file=sys.stderr,
        )
        print(Exception, file=sys.stderr)
