<img width="192" height="192" alt="logo@3x" src="https://github.com/user-attachments/assets/ce65c8f7-d5e7-456b-98ec-2db930049440" />

# Fanyi
Fanyi is a Chinese to English focused language reading application meant to provide a way for users to translate on-screen content from Chinese to English. This is version 2 of the application, which builds on the original functionalities of v1.

This application is built on top of **Electron**. It interacts with a Python-based OCR service that has OCR capabilities provided by `easyocr` and Chinese segmentation by `jieba`.

<img width="1709" height="1162" alt="image" src="https://github.com/user-attachments/assets/a958a992-ccdb-4a1e-9a2b-3d63d8928ca0" />

## Features
- Create and manage presets to easily select relevant regions of the screen to translate
- Translate Chinese to English with in-built OCR and dictionary
- Tab-based system to easily navigate through multiple translations
- Attach hotkeys to different presets for easier access to translations
- Condensed presentation of Chinese text for easy navigation
- Link to Youdao dictionary for further learning

## Setting Up the Project

This application uses a monorepo system with pnpm's monorepo support. 
- For the Electron application, ensure you have Node 24 or above with pnpm installed.
- For the Python application, we make use of the uv package manager.

To set up the project,
1. Clone this repository
2. Run `pnpm install` in the main folder. This should set up the installations for the monorepo.
3. Build the Python OCR dependency with `pnpm --filter python-ocr run build`. This builds an executable that will be used by the Electron application during OCR.
4. Start the main process with `pnpm run dev`.
