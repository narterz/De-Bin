"use client"

import Header from "./components/Header";
import DropBox from "./components/dropBox";
import Modal from './components/Modal';

export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-between">
      <Modal />
      <header className="w-full h-[12%] position-fixed top-0 left-0 bg-background">
        <Header />
      </header>
      <div className="w-full h-1/4 bg-foreground flex-center">
        <div className="subheader flex-center-around h-5/6">
          <h1 className="text-accent flex-center font-bold w-full">Decompress your file</h1>
          <p className="subheader-text-sm text-black text-center">Tired of going to multiple shady file formatting websites, use our universal compressor to compress a wide variety of files.</p>
        </div>
      </div>
      <div className="w-full h-[60%] flex items-center justify-center bg-background">
        <DropBox />
      </div>
    </div>
  );
}
