import os
import logging
from utils.decorators import log_func

log = logging.getLogger(__name__)
log.info("Logging configured on handle_dir.py")

@log_func
def create_file(base_dir, file_name, uploaded_file):
    full_path = os.path.join(base_dir, file_name)
    try:
        uploaded_file.save(full_path)
        return {'status': 'success', 'error': ''}
    except Exception as e:
        log.error(f"Failed to upload file: {file_name} to temp directory {str(e)}")
        return {'status': 'failure', 'error': "Failed to upload file"}

@log_func       
def remove_file_dir(base_dir, file_name):
    full_path = os.path.join(base_dir, file_name)
    try:
        os.remove(full_path)
        return { 'status': 'success', 'error': '' }
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }
    
    
def update_file_name(old_file_name: str, new_ext: str) -> str:
    old_ext_index = old_file_name.find('.')
    return old_file_name[:old_ext_index] + f'.{new_ext}'

def update_file_size(base_dir, file_path: str) -> int:
    full_path = os.path.join(base_dir, file_path)
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"File not found: {full_path}")
    
    file_stat = os.stat(full_path)
    return file_stat.st_size

