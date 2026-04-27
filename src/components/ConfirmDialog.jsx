import { motion } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger' // 'danger' | 'warning' | 'info'
}) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
          iconGlow: 'rgba(239, 68, 68, 0.4)',
          confirmBtn: 'btn btn-primary',
          confirmStyle: { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff' }
        }
      case 'warning':
        return {
          iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          iconGlow: 'rgba(245, 158, 11, 0.4)',
          confirmBtn: 'btn btn-primary',
          confirmStyle: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' }
        }
      default:
        return {
          iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          iconGlow: 'rgba(99, 102, 241, 0.4)',
          confirmBtn: 'btn btn-primary',
          confirmStyle: {}
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="overlay-backdrop">
      <motion.div
        className="glass"
        style={{
          position: 'relative',
          zIndex: 10,
          borderRadius: '1.5rem',
          padding: '2rem 1.75rem',
          maxWidth: '380px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
        initial={{ scale: 0.5, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.5, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Icon */}
        <motion.div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: styles.iconBg,
            boxShadow: `0 0 30px ${styles.iconGlow}`,
          }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AlertTriangle size={28} color="#fff" />
        </motion.div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
          lineHeight: 1.2,
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          lineHeight: 1.5,
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
        }}>
          <motion.button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {cancelText}
          </motion.button>

          <motion.button
            onClick={onConfirm}
            className={styles.confirmBtn}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              ...styles.confirmStyle,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {confirmText}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}