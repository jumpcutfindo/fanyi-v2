import json
import os
import sys
from . import logger

# If sys._MEIPASS exists, use it. Otherwise, use the local tmp directory.
JIEBA_DICT_DIR = getattr(sys, '_MEIPASS', os.path.abspath('./tmp'))
JIEBA_DICT_FILENAME = "jieba_dict.txt"
JIEBA_DICT_PATH = os.path.join(JIEBA_DICT_DIR, JIEBA_DICT_FILENAME)


class Dictionary:
  def __init__(self, public_path: str, user_data_path: str):
    """
    Initializes the Dictionary class
    """
    logger.debug(
      f"Initializing dictionary with public_path: '{public_path}' and user_data_path: '{user_data_path}'"
    )

    self.public_dict: dict[str, int] = {}

    self._load_system_dictionary(public_path)
    self._load_user_dictionaries(user_data_path)

    logger.debug(f"Dictionary initialized. Total entries: {len(self.public_dict)}")

    self._create_jieba_file(JIEBA_DICT_PATH)

  def _load_system_dictionary(self, path: str):
    try:
      with open(f"{path}/cedict_ts.u8", encoding="utf-8") as f:
        for line in f:
          line = line.strip()
          if not line or line.startswith("#"):
            continue

          # Split at the first space to get the headword
          parts = line.split(" ", 1)
          if parts:
            if parts[0] not in self.public_dict:
              self.public_dict[parts[0]] = 1
            else:
              self.public_dict[parts[0]] += 1
      logger.debug(f"Loaded public dictionary. Total entries: {len(self.public_dict)}")
    except Exception as e:
      logger.error(f"Failed to load public dictionary: {e}")

  def _load_user_dictionaries(self, user_data_path: str):
    # Construct path to the 'dictionaries' subfolder
    dicts_folder = os.path.join(user_data_path, "dictionaries")

    if not os.path.exists(dicts_folder):
      logger.error(f"User dictionaries folder not found at: {dicts_folder}")
      return

    # Iterate through JSON files in the folder
    for filename in os.listdir(dicts_folder):
      if filename.endswith(".json"):
        file_path = os.path.join(dicts_folder, filename)
        try:
          with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            logger.debug(
              f"Loading dictionary '{data.get('name', 'unknown')}' from {filename}"
            )
            entries = data.get("rawEntries", [])

            for entry in entries:
              if entry["simplified"] not in self.public_dict:
                self.public_dict[entry["simplified"]] = 1
              else:
                self.public_dict[entry["simplified"]] += 1

          logger.debug(f"Loaded {len(entries)} entries from {filename}")
        except Exception as e:
          logger.error(f"Could not read user dictionary {filename}: {e}")

  def _create_jieba_file(self, output_path: str):
    try:
      with open(output_path, "w", encoding="utf-8") as f:
        for word in self.public_dict.keys():
          f.write(f"{word}\n")
      logger.debug(f"Created jieba dictionary file at {output_path}")
    except Exception as e:
      logger.error(f"Failed to create jieba dictionary file: {e}")

  def get_jieba_dict_path(self) -> str:
    return JIEBA_DICT_PATH

  def add_word(self, word: str) -> bool:
    """
    Adds a word to the dictionary. Returns true if a new entry was created.
    """
    if word not in self.public_dict:
      self.public_dict[word] = 1

      # Update jieba file
      self._create_jieba_file(JIEBA_DICT_PATH)

      return True
    else:
      self.public_dict[word] += 1
      return False

  def remove_word(self, word: str) -> bool:
    """
    Removes a word from the dictionary. Returns true if a word was removed.
    """
    if word not in self.public_dict:
      return False

    if self.public_dict[word] > 1:
      self.public_dict[word] -= 1
      return False
    else:
      del self.public_dict[word]

      # Update jieba file
      self._create_jieba_file(JIEBA_DICT_PATH)

      return True
