'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

export function ClarityScript() {
  useEffect(() => {
    Clarity.init('w5fez5mo16')
  }, [])

  return null
}
