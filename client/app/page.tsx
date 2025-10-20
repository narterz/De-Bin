"use client"

import Header from "./components/Header";
import DropBox from "./components/dropBox";
import Modal from './components/Modal';

import { useEffect } from "react";
import axios from "axios";

export default function Home() {
  
  useEffect(() => {
    const cleanupBackendDir = async () => {
      try {
        const request = await axios.get('http://localhost:5000/api/cleanup')
        const { status, error } = request.data;
        if (status === 'success') {
          console.debug("cleanupBackendDir: tmp clean")
        } else {
          throw new Error("cleanupBackendDir: Major server error. tmp directory is dirty. " + error)
        }
      } catch (err) {
        console.error(err)
      }
    }
    window.addEventListener('beforeunload', cleanupBackendDir);
    return () => window.removeEventListener('beforeunload', cleanupBackendDir)
  },[])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-between">
      <Modal />
      <header className="w-full h-[12%] position-fixed top-0 left-0 bg-background">
        <Header />
      </header>
      <div className="w-full h-1/4 bg-foreground flex items-center justify-center">
        <div className="flex h-5/6 w-3/6 flex-col items-center justify-around p-4">
          <h1 className="text-accent font-bold">Decompress your file</h1>
          <p className="text-black w-4/6 text-center">Tired of going to multiple shady file formatting websites, use our universal compressor to compress a wide variety of files.</p>
        </div>
      </div>
      <div className="w-full h-[60%] flex items-center justify-center bg-background">
        <DropBox />
      </div>
    </div>
  );
}
