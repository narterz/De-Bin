from genericpath import isdir
import os
import shutil

async def create_file(filename, file):
    dir_path = '/tmp'
    try:
        if not os.path.isdir(dir_path):
            os.mkdir(dir_path)
        tmp_file_path = os.path.join('/tmp', filename)
        file.save(tmp_file_path) 
        return { 'status': 'success', 'error': '' }
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }

def clean_dir(file_path):
    for file_name in os.listdir(file_path):
        tmp_path = os.path.join(file_path, file_name)
        try:
            if os.path.isfile(tmp_path) or os.path.isdir(tmp_path):
                shutil.rmtree(tmp_path)
        except Exception as e:
            return { 'status': 'failure', 'error': str(e) }
    return { 'status': 'success', 'error': '' }
        
def remove_file(file_path):
    try:
        os.remove(file_path)
        return { 'status': 'success', 'error': '' }
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }
    
    
def update_file_name(old_file_name: str, new_ext: str) -> str:
    old_ext_index = old_file_name.find('.')
    return old_file_name[:old_ext_index] + f'.{new_ext}'

async def update_file_size(path: str) -> str:
    if not os.path.isdir(path):
        raise FileNotFoundError(f"File not found in tmp")
    
    file_stat = os.stat(path)
    return file_stat.st_size

