# Fanyi

Fanyi is a Chinese to English focused language reading application meant to provide a way for users to translate on-screen content from Chinese to English.

This application is built on top of **Electron**. It interacts with a Python-based OCR service that has OCR capabilities provided by `easyocr` and Chinese segmentation by `jieba`.

## Setting Up the Project

This application uses a monorepo system with pnpm's monorepo support. 
- For the Electron application, ensure you have Node 24 or above with pnpm installed.
- For the Python application, we make use of the uv package manager.

To set up the project,
1. Clone this repository
2. Run `pnpm install` in the main folder. This should set up the installations for the monorepo.
3. Build the Python OCR dependency with `pnpm --filter python-ocr run build`. This builds an executable that will be used by the Electron application during OCR.
4. Start the main process with `pnpm run dev`.