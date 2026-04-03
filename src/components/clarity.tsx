'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

export function ClarityScript() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    Clarity.init('w5fez5mo16')
  }, [])

  return null
}
