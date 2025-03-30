import os
import platform

def setup_python_env():
    operating_system = platform.system()
    # Get the current working directory
    current_directory = os.path.dirname(os.path.abspath(__file__))

    # Creating venv
    os.system(f'python -m venv {current_directory}/.venv')

    # Installing required packages
    os.system(f'{current_directory}/.venv/bin/python -m pip install -r {current_directory}/requirements.txt')

    # Open vscode 
    os.system(f'code .')
    if operating_system == "Windows":
        # Windows command to activate venv and open VS Code
        os.system(f'{current_directory}\\.venv\\Scripts\\activate && code .')
    else:  # Linux
        # Linux command to activate venv and open VS Code
        os.system(f'source {current_directory}/.venv/bin/activate && code . ')

def setup_node_env():
    # Get the current working directory
    current_directory = os.path.dirname(os.path.abspath(__file__))

    # Creating node_modules
    os.system(f'npm install')

    # Open vscode 
    os.system(f'code .')

print("Do you want to setup the python or the node environmnent ? (py/node)")

# Get the user input
user_input = input().strip().lower()
if user_input == "py":
    setup_python_env()
elif user_input == "node":
    setup_node_env()
