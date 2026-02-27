import subprocess
import os

# Get current environment so we don't lose system PATH
current_env = os.environ.copy()

# Add your specific variables
current_env.update(
  {
    "ENV": "development",
    "PUBLIC_PATH": "../fanyi/public",
    "USER_DATA_PATH": "../fanyi/data",
  }
)

cmd = "uv run main.py"
print(f"Running command: {cmd}")

# Pass the env dictionary here
subprocess.run(cmd, shell=True, env=current_env)
