import os
import platform

operating_system = platform.system()
# Get the current working directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Creating venv
os.system(f'python -m venv {current_directory}/.venv')

# Installing required packages
os.system(f'{current_directory}/.venv/bin/python -m pip install -r {current_directory}/requirements.txt')

# Activating venv


# Open vscode 
os.system(f'code .')
if operating_system == "Windows":
    # Windows command to activate venv and open VS Code
    os.system(f'{current_directory}\\.venv\\Scripts\\activate && code .')
else:  # Linux
    # Linux command to activate venv and open VS Code
    os.system(f'source {current_directory}/.venv/bin/activate && code . ')