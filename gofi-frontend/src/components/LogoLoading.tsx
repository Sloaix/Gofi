import React from 'react'
import logo from '../assets/logo.svg'

const LogoLoading: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src={logo}
    className={`w-16 md:w-20 drop-shadow-sm pixelate animate-bounce-pixel ${className || ''}`}
    alt="Loading"
    style={{ imageRendering: 'pixelated' }}
  />
)

export default LogoLoading 