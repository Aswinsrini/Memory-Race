import { useState } from 'react'
import { X } from 'lucide-react'
import { useGame } from '../context/GameContext'
import ConfirmDialog from './ConfirmDialog'

export default function FooterAction() {
  const { resetGame, isMultiplayer } = useGame()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleAbortClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmAbort = () => {
    resetGame()
    setShowConfirm(false)
  }

  const handleCancelAbort = () => {
    setShowConfirm(false)
  }

  // Hide abort button for multiplayer games
  if (isMultiplayer) return null

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}>
        <button
          onClick={handleAbortClick}
          className="btn"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
          title="Abort Game"
        >
          <X size={16} />
          Abort
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Abort Game?"
        message="Are you sure you want to abort the current game? Your progress will be lost and cannot be recovered."
        confirmText="Abort Game"
        cancelText="Continue Playing"
        onConfirm={handleConfirmAbort}
        onCancel={handleCancelAbort}
        variant="danger"
      />
    </>
  )
}
       