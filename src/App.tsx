import React from 'react'
import TopToolbar from './components/layout/TopToolbar'
import LeftSidebar from './components/layout/LeftSidebar'
import RightPanel from './components/layout/RightPanel'
import BottomBar from './components/layout/BottomBar'
import GameDayCanvas from './components/canvas/GameDayCanvas'
import ImportModal from './components/modals/ImportModal'
import ToastSystem from './components/shared/ToastSystem'

export default function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      {/* Top toolbar */}
      <TopToolbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <LeftSidebar />

        {/* Canvas */}
        <main className="flex-1 overflow-hidden">
          <GameDayCanvas />
        </main>

        {/* Right panel */}
        <RightPanel />
      </div>

      {/* Bottom bar */}
      <BottomBar />

      {/* Modals */}
      <ImportModal />

      {/* Toast notifications */}
      <ToastSystem />
    </div>
  )
}
