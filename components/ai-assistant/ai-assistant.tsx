'use client'

import { useState, useEffect } from 'react'
import { ChatBubble } from './chat-bubble'
import { ChatWindow } from './chat-window'

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setHasUnread(true)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const closeChat = () => {
    setIsOpen(false)
  }

  return (
    <>
      <ChatBubble
        isOpen={isOpen}
        onClick={toggleChat}
        hasUnread={hasUnread && !isOpen}
      />
      <ChatWindow isOpen={isOpen} onClose={closeChat} />
    </>
  )
}
