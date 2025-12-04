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
        log.debug(f"create_file: Successfully uploaded file {file_name} to directory")
        return {'status': 'success', 'error': ''}
    except Exception as e:
        log.error(f"create_file: Failed to upload file: {file_name} to directory {str(e)}")
        return {'status': 'failure', 'error': "Failed to upload file"}

@log_func       
def remove_file_dir(base_dir, file_name):
    full_path = os.path.join(base_dir, file_name)
    try:
        os.remove(full_path)
        log.debug(f"remove_file_dir: Successfully removed file {file_name}")
        return { 'status': 'success', 'error': '' }
    except Exception as e:
        log.error(f"remove_file_dir: Failed to remove file {file_name}")
        return { 'status': 'failure', 'error': str(e) }
    
    
def update_file_size(base_dir, file_path: str) -> int:
    full_path = os.path.join(base_dir, file_path)
    try:
        if not os.path.isfile(full_path):
            log.error(f"Could not find file in path {file_path}")
            return { 'status': 'failure', 'error': 'File not found' }
        
        file_stat = os.stat(full_path)
        return file_stat.st_size
    except Exception as e:
        log.error(f"Failed to updated file size ", str(e))
        return { 'status': 'failure', 'error': 'Failed to updated file size' }

