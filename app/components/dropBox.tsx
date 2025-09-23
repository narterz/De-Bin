"use client";

import { IoIosImages } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Files, X } from "lucide-react";
import {  useRef, ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { uploadFile, removeFile, setError } from "../lib/reducers/processFiles";
import { openDialog } from "../lib/reducers/appController";
import { validateSelectedFiles, serializeFile } from "../utils/fileValidation";
import { processFile } from "../lib/selectors";
import SelectedFiles from "./SelectedFiles";
import { v4 as uuidv4 } from 'uuid';

export default function DropBox() {
  const [areSelectedFiles, setAreSelectedFiles] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const inputFile = useRef<HTMLInputElement>(null);

  const files = useAppSelector(processFile).uploadedFiles;

  const handleFileUpload = ( e: ChangeEvent<HTMLInputElement> ) => {
    let files: FileList | null = e.target.files;
    if(!files) return;
    if(files.length > 3){
      console.debug(`File quantity of ${files.length} exceeded 3.`);
      dispatch(openDialog({
        header: 'Error: too many files',
        body: "De-bin only allows up to 3 files at a time. Please try again"
      }))
    }
    Promise.all(
      [...files].map(async file => {
        const serializedFile = await serializeFile(file)
        dispatch(uploadFile({
          file: serializedFile,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: "idle",
          id: uuidv4()
        }))
      }))
  }

  const handleDropBoxBtn = () => {
    if(files.length > 0){
      const allValidatedFiles = validateSelectedFiles(files);
      for(let i = 0; i < allValidatedFiles.length; i++){
        const failedFile = allValidatedFiles[i];
        dispatch(setError({
          id: failedFile.id,
          status: failedFile.status,
          error: failedFile.error
        }))
      }

    } else {
      inputFile.current?.click();
    }
  }

  useEffect(() => {
    console.log("selected files is: " + areSelectedFiles)
    if(files.length > 0) {
      setAreSelectedFiles(true)
    } else setAreSelectedFiles(false)
  },[files])

  const dropBoxColor = areSelectedFiles ? "bg-foreground" : "bg-accent";
  const dropBoxRowClassName = areSelectedFiles ? "dropbox-rows-no-files" : "dropbox-rows-files"

  return (
    <div className={`w-4/6 h-5/6 flex flex-col items-center justify-evenly border-dashed border-4 border-black ${areSelectedFiles ? "bg-foreground" : "bg-accent"}`} id="dropBox">

      <div className={areSelectedFiles ? "hidden" : "flex"} id="dropBox-header">
        <IoIosImages size={80} className="text-background" />
        <h3>Drag, drop, or select your files here</h3>
      </div>

      <div className="display-none-transition w-3/4 h-full text-center flex-center-evenly" id="dropBox-body">
        <input 
          type="file"
          ref={inputFile}
          multiple
          onChange={handleFileUpload}
          id="dropFileInput"
          className="hidden"
        />
        <div className="w-full h-4/5 flex items-center justify-evenly">
          { files.length > 0 
            ? files.map((file) => (
              <SelectedFiles file={file} key={`selcted-file-${file.fileName}`}/>
            ))
            : <div className="h-full flex flex-col justify-evenly items-centers">
                <div className="w-1/2 h-1/2 flex flex-row items-center justify-evenly me-auto ms-auto">
                  <IoIosImages size={40} className="text-background" />
                  <h3>Drop your files here</h3>
                </div>
                <div className="h-1/2 flex flex-col justify-center m-5">
                  <p>Drag and drop your files here or press the button below to select files</p>
                  <small>See help to view all acceptable files.</small>
                </div>
              </div>
          }
        </div>
      </div>

      <div className="dropbox-footer display-none-transition w-1/2 h-1/5 flex flex-row justify-evenly items-center mb-5" id="dropBox-footer">
        <Button onClick={() => inputFile.current?.click()} className="dropBox-btns">
          <Files className="dropbox-icons" /> {files.length > 0 ? "Convert" : "Choose Files"}
        </Button>
        <Button className={`dropBox-btns ${areSelectedFiles ? "block" : "hidden"}`}>
          <X className="dropbox-icons"/> Clear all
        </Button>
      </div>

    </div>
  );
}
