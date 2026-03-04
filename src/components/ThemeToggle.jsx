import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full cursor-pointer flex items-center px-1"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1e293b, #334155)'
          : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        border: '1px solid var(--border)',
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{
          background: isDark ? '#0f172a' : '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Moon size={12} className="text-indigo-300" />
          ) : (
            <Sun size={12} className="text-amber-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  )
}
