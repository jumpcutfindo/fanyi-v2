# Fanyi OCR

This is the subprocess that handles the OCR operations for Fanyi. This is done as the libraries for OCR are much more mature in the Python ecosystem. We encapsulate it in a separate Python executable that is started by the main Electron process.

## CPU vs GPU version

JaidedAI's OCR package recommends the installation of the CUDA version of PyTorch in order to improve the processing speed of the OCR process. In this case, we are also using that version.

If you wish to install a CPU only version, follow these steps:

1. Uninstall `easyocr` package
2. Uninstall `torch` and `torchvision` packages from this project
3. Reinstall `easyocr` package -- this will revert the OCR process to use the CPU

If you wish to have a CUDA version, you can install `torch` and `torchvision` first with your corresponding CUDA version, then install `easyocr` and build the application after.