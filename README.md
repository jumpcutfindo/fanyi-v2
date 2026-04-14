<img width="192" height="192" alt="logo@3x" src="https://github.com/user-attachments/assets/ce65c8f7-d5e7-456b-98ec-2db930049440" />

# Fanyi

Fanyi is a Chinese to English focused language reading application meant to provide a way for users to translate on-screen content from Chinese to English. This is version 2 of the application, which builds on the original functionalities of v1.

This application is built on top of **Electron**. It interacts with a Python-based OCR service that has OCR capabilities provided by `easyocr` and Chinese segmentation by `jieba`.

<img width="1624" height="1056" alt="Image" src="https://github.com/user-attachments/assets/06e24de1-1fd6-495a-865a-0496ac4dd584" />

## Features

- Create and manage presets with hotkeys to easily select relevant regions of the screen to translate
- Translate Chinese to English with in-built OCR and dictionary
- Tab-based system to easily navigate through multiple translations
- Link to external dictionaries for further learning
- Provide custom dictionaries to cater to different learning contexts

## Usage

Refer to the [Releases](https://github.com/jumpcutfindo/fanyi-v2/releases) page for downloadable versions of the application for both Windows and MacOS.

- The application runs an OCR software on your computer, and as a result CPU and memory usage will be high.
- The first run of the application will attempt to download the OCR software, so it will take longer. Subsequent usage will require less start-up time.
- For a better experience, create presets to reduce the size of the area you're attempting to translate. Larger areas will cause a lot of inefficient processing on the OCR system.

### Dictionaries

For more information on dictionaries and available custom dictionaries, see the [Dictionaries](https://github.com/jumpcutfindo/fanyi-v2/wiki/Dictionaries) page in the wiki.

- See [Dictionaries > Custom dictionaries](https://github.com/jumpcutfindo/fanyi-v2/wiki/Dictionaries#custom-dictionaries) for some dictionaries that I have created that are compatible with Fanyi

## Setting Up the Project

This application uses a monorepo system with pnpm's monorepo support.

- For the Electron application, ensure you have Node 24 or above with pnpm installed.
- For the Python application, we make use of the uv package manager.

To set up the project,

1. Clone this repository
2. Run `pnpm install` in the main folder. This should set up the installations for the monorepo.
3. Build the Python OCR dependency with `pnpm --filter python-ocr run build`. This builds an executable that will be used by the Electron application during OCR.
4. Start the main process with `pnpm run dev`.

## Developer Notes

### Profiling React

The typical way of installing the React DevTools extension doesn't work for this application for some reason. Instead, use [react-devtools](https://www.npmjs.com/package/react-devtools) as a standalone application.

To profile the application,

1. Install this development tool with npm
2. Start the application with `npx react-devtools`
3. Refresh Fanyi, and the profiler should hook onto it for profiling

### Building on MacOS

On MacOS, if you wish to provide the icon to the application, the icon needs to be present in the `build` folder. Specifically, `apps/fanyi/build`.
