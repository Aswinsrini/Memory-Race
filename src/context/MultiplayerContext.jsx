import { createContext, useContext } from 'react'
import useMultiplayer from '../hooks/useMultiplayer'

const MultiplayerContext = createContext()

export function MultiplayerProvider({ children }) {
  const multiplayer = useMultiplayer()

  return (
    <MultiplayerContext.Provider value={multiplayer}>
      {children}
    </MultiplayerContext.Provider>
  )
}

export const useMP = () => useContext(MultiplayerContext)
