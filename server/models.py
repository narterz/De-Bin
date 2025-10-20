import base64
from pydantic.dataclasses import dataclass
from typing import Optional, Union

@dataclass
class FileMetadata:
    id: Optional[str]
    file: str
    file_name: str
    file_size: Union[int, str]
    file_type: str
    file_name_shortened: Optional[str] = None
    file_extension: Union[str, bool, None] = None


@dataclass
class FileStatus:
    status: Union[str]
    error: str


@dataclass
class FileConversion:
    conversionList: list[str]
    conversion: str


@dataclass
class FileState:
    metadata: FileMetadata
    status: FileStatus
    conversion: FileConversion
