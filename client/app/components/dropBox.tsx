"use client";

import { IoIosImages } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Files, X, Plus } from "lucide-react";
import {  useRef, ChangeEvent, useEffect, useState, DragEvent } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { uploadFile, removeFile, uploadFileToBackend, removeFileFromBackend, convertFile } from "../lib/reducers/processFiles";
import { openDialog } from "../lib/reducers/appController";
import { serializeFile, shortenFileName, getFileExtension, validateMetadata, validateDuplicateFile, getFileConversions } from "../utils/fileValidation";
import { processFile } from "../lib/selectors";
import SelectedFiles from "./SelectedFiles";
import { FileMetadata, FileState, FileStatus, FileConversion, AcceptedFilTypes } from "../utils/types";
import { tooManyFilesDialog, majorFailureDialog, failureDialog, failedToUploadFile } from "../utils/dialogContent";
import { v4 as uuidv4 } from 'uuid';

export default function DropBox() {
  const [areSelectedFiles, setAreSelectedFiles] = useState<boolean>(false);
  const [allSuccessFiles, setAllSuccessFiles] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [fileListID, setFileListID] = useState<{ fileID: FileMetadata['id'], fileObj: File } [] > ([])

  const dispatch = useAppDispatch();
  const inputFile = useRef<HTMLInputElement>(null);

  const files = useAppSelector(processFile).files;

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    console.debug(`Inserting ${fileList?.length} files`)

    if (files.length > 3 || fileList.length + fileList.length > 3) {
      console.error(`File quantity exceeded 3.`);
      dispatch(openDialog(tooManyFilesDialog()))
      return
    }

    for (const file of Array.from(fileList)) {
      try {
        const serializedFile = await serializeFile(file);
        const extension: string = file.name.slice(file.name.lastIndexOf("."));

        // Create FileMetadata
        const metadata = {
          id: uuidv4(),
          file: serializedFile,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileNameShortened: shortenFileName(file.name),
          fileExtension: !extension ? getFileExtension(file.type) : extension
        }

        // Create our FileStatus via validation
        let fileConversions: FileConversion = { conversion: '.zip', conversionList: [] };
        let fileStatus: FileStatus = { status: "idle", error: '' }
        const validateMetadataRes: FileStatus = validateMetadata(metadata);
        const validateDuplicateRes: FileStatus = validateDuplicateFile(metadata, files);
        
        // If validations fail, don't bother the backend just update state
        if (validateMetadataRes.status === 'failure' || validateDuplicateRes.status === 'failure') {
          fileStatus = validateDuplicateRes.status === 'failure'
            ? validateDuplicateRes
            : validateMetadataRes
          dispatch(uploadFile({ metadata, fileConversions, fileStatus }))
          return
        }
        console.debug(metadata.fileName, " has passed all validations")

        // Create FileConversions
        if (metadata.fileExtension) {
          const conversionResult = getFileConversions(metadata.fileExtension as AcceptedFilTypes);
          if (conversionResult) {
            fileConversions = conversionResult;
          }
        }

        // If the backend call fails open majorFailureDialog otherwise set our state
        const fileState: FileState = {
          metadata: metadata,
          fileStatus: fileStatus,
          fileConversions: fileConversions
        }
        const fileObj: File = file
        const backendResponse = await dispatch(uploadFileToBackend({ fileState, fileObj })).unwrap();

        if (backendResponse.fileStatus.status === 'failure') {
          console.error(backendResponse.fileStatus.error)
          dispatch(openDialog(failedToUploadFile(fileState.metadata.fileNameShortened)))
          return
        }

      } catch (err) {
        dispatch(openDialog(majorFailureDialog()))
        console.error("handleFileUpload: Failed to upload file with error: " + err)
      }
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  const handleRemoveFile = async (selectedFile: FileState, reason?: 'clearAll' | 'removeOne') => {
    let targetedFile: FileState | undefined = reason === 'removeOne'
      ? files.find(f => f.metadata.id === selectedFile.metadata.id)
      : selectedFile;
    
    try {
      if (targetedFile) {
        
        // If the targeted file already has a status of failure, it failed validations so remove it.
        if (targetedFile.fileStatus.status === 'failure') {
          dispatch(removeFile(targetedFile))
          return
        }

        const backendResponse:any = await dispatch(removeFileFromBackend(targetedFile));
        const { status, error } = backendResponse.payload.status;

        if (status === 'failure') {
          throw new Error(error)
        }
        
        if (inputFile.current) {
          inputFile.current.value = "";
        }
      }

      } catch (err) {
      dispatch(openDialog(majorFailureDialog()))
        console.error("handleRemoveFile: Server error occurred while removing file: " + err)
        throw new Error(String(err))
      }
  }

const handleClearAll = () => {
  (async () => {
    for (const file of [...files]) {
      await handleRemoveFile(file, 'clearAll');
    }
  })();
}

  const handleConvertFiles = async () => {
    if (!allSuccessFiles) {
      console.error("Not all files are ready to be converted")
      // Open failure dialog with this message
      return
    }
    try {
      for (const file of files) {
        const response = await dispatch(convertFile(file)).unwrap();
        const { fileName, fileExtension } = file.metadata;
        const conversion  = file.fileConversions?.conversion
        const { status, error } = response.fileState.fileStatus;

        if (status === 'failure') {
          throw new Error(`Failed to convert ${fileName} from ${fileExtension} to ${conversion}. ${error}`)
        }
      }

    } catch (err) {
      const failedFiles = files.filter(file => file.fileStatus.status === 'failure')
      dispatch(openDialog(failureDialog(failedFiles)));
      console.error(err)
    }

  }

  // Toggle areSelected whenever fileState changes
  useEffect(() => {
    if(files.length > 0) {
      setAreSelectedFiles(true)
    } else setAreSelectedFiles(false)
  },[files]);

  // Toggle allSuccessFiles whenever fileState changes
  useEffect(() => {
    const allFilesSuccessful = files.every((file) => !file.fileStatus.error);
    setAllSuccessFiles(allFilesSuccessful)
  }, [files])
    
  useEffect( () => {
    const idleFiles = files.filter(file => file.fileStatus.status === 'idle');
    if (idleFiles.length > 0) {
        fileListID.map(async statePayload => {
          try {
            const fileByID = files.find(file => file.metadata.id === statePayload.fileID)
            if (fileByID) {
              const backendResponse:any = await dispatch(uploadFileToBackend({ fileState: fileByID, fileObj: statePayload.fileObj }))
              const { status, error } = backendResponse.payload;
              if (status === 'failure') {
                throw new Error(error)
              }
            }
          } catch (err) {
            throw new Error(String(err))
          }
        })
    }
    if(allSuccessFiles) setFileListID([])
  }, [files])

  return (
    <div
      className={`flex flex-col items-center border-dashed border-4 border-black bg-accent ${areSelectedFiles ? "selected" : ""} ${isDragOver ? "drag-over" : ""}`}      id="dropBox"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      <div className={`flex-row justify-evenly items-center ${areSelectedFiles ? "hidden" : "flex"}` } id="dropBox-header">
        <IoIosImages size={80} className="text-background" />
        <h2 className="text-black">Drag, drop, or select your files here</h2>
      </div>

      <div className={`display-none-transition text-center flex-center-evenly  ${areSelectedFiles ? "selected" : ""}`} id="dropBox-body">
        <form action="">
          <input
            type="file"
            ref={inputFile}
            multiple
            onChange={handleInputChange}
            id="dropFileInput"
            className="hidden"
          />
        </form>
        { files.length > 0 
          ? files.map((file) => (
            <SelectedFiles file={file} onRemoveFile={() => handleRemoveFile(file, 'removeOne')} key={`selected-file-${file.metadata.fileName}`}/>
          ))
          : <div className="h-full w-full flex flex-col items-center justify-around m-5">
                <p>Drag and drop your files here or press the button below to select files</p>
                <small>See help to view all acceptable files.</small>
            </div>
        }
      </div>

      <div className="display-none-transition w-1/2 h-1/5 flex flex-row justify-evenly items-center mb-5" id="dropBox-footer">
        <Button disabled={files.length === 3}  className="dropbox-btns" onClick={() => inputFile.current?.click()} >
          <Plus className="dropbox-icons" /> Choose Files
        </Button>
        <Button disabled={!allSuccessFiles} className={`dropBox-btns ${areSelectedFiles ? "flex" : "hidden"}`}  onClick={() => handleConvertFiles()} >
          <Files className="dropbox-icons" /> Convert Files
        </Button>
        <Button className={`dropBox-btns ${areSelectedFiles ? "flex" : "hidden"}`} onClick={() => handleClearAll()}>
          <X className="dropbox-icons"/> Clear all
        </Button>
      </div>

    </div>
  );
}
