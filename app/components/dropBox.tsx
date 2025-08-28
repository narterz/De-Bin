"use client";

import { FaFileArrowUp } from "react-icons/fa6";
import { IoIosImages } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Files } from "lucide-react";
import {  useRef, ChangeEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { uploadFile, removeFile } from "../lib/reducers/processFiles";
import { openDialog } from "../lib/reducers/appController";
import { validateSelectedFiles, serializeFile, shortenFileName } from "../utils/fileValidation";
import { UploadedFile } from "../utils/types";
import { processFile, appController } from "../lib/selectors";
import SelectedFiles from "./SelectedFiles";

export default function DropBox() {
  const dispatch = useAppDispatch();
  const inputFile = useRef<HTMLInputElement>(null);

  const files = useAppSelector(processFile).uploadedFiles;
  const dialogController = useAppSelector(appController).dialogState;

  const handleFileUpload = ( e: ChangeEvent<HTMLInputElement> ) => {
    let files: FileList | null = e.target.files;
    if(!files) return;
    Promise.all(
      [...files].map(async file => {
        const serializedFile = await serializeFile(file)
        dispatch(uploadFile({
          file: serializedFile,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: "idle"
        }))
      }))
  }

  const handleDropBoxBtn = () => {
    if(files.length > 0){
      /* 
        Iterate over each file in files:
          change status to loading
          validate each file
          if error on file:
            display errored file in toast and remove from files
          call convertFile()
      */
    } else {
      inputFile.current?.click();
    }
  }

  useEffect(() => {
    const pendingFiles = files.every(file => file.status !== 'loading');
    const failedFiles = files.filter(file => file.status === "failure");
    const allSuccess = files.every(file => file.status === 'success');
    if(pendingFiles){
      dispatch(openDialog({
        header: "Processing files",
        body: "Please wait while your files are being converted"
      }));
    } else if (failedFiles){
      dispatch(openDialog({
        header: "Failed to convert files",
        body: `Failed to process file(s): ${failedFiles} please try again`
      }))
    }
    // Close the loadingModal if the status of all files != 'loading
    // Deploy toast of error if the status of any file is 'error'
  },[])

  return (
    <div className="w-4/6 h-3/4 flex flex-col items-center justify-evenly border-dashed border-4 border-black bg-accent">
      <div className="dropbox-rows">
        <IoIosImages size={80} className="text-background" />
        <h3>Drag, drop, or select your files here</h3>
      </div>
      <div className="dropbox-rows">
        <input 
          type="file"
          ref={inputFile}
          multiple
          onChange={handleFileUpload}
          id="dropFileInput"
          className="hidden"
        />
        <Button className="cursor-pointer" onClick={() => inputFile.current?.click()}>
          <Files className="text-accent cursor-pointer" /> {files.length > 0 ? "Convert" : "Choose Files"}
        </Button>
        <div className="w-full h-1/4 flex items-center justify-evenly">
          { files.length > 0 
            ? files.map((file) => (
              <SelectedFiles file={file}/>
            ))
            : <small>See help to view all acceptable files.</small>
          }
        </div>
      </div>
    </div>
  );
}
