function SocialIcon({ icon }) {
  if (icon === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.2 9.4V20M7.2 5.2V5.3M11.2 20V9.4M11.2 13.8C11.2 11.1 12.9 9.2 15.5 9.2C18.1 9.2 19.4 11 19.4 13.8V20" />
      </svg>
    )
  }

  if (icon === 'github') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 19.4C4.8 20.6 4.8 17.3 3.2 16.8M14.8 21V17.7C14.8 16.8 14.9 16.4 14.3 15.8C17.1 15.5 20 14.4 20 9.8C20 8.6 19.6 7.5 18.8 6.6C18.9 6.3 19.3 5 18.7 3.7C18.7 3.7 17.7 3.4 15.4 5C14.4 4.7 13.2 4.6 12.1 4.6C11 4.6 9.8 4.7 8.8 5C6.5 3.4 5.5 3.7 5.5 3.7C4.9 5 5.3 6.3 5.4 6.6C4.6 7.5 4.2 8.6 4.2 9.8C4.2 14.4 7.1 15.5 9.9 15.8C9.3 16.3 9.1 16.9 9.1 17.8V21" />
      </svg>
    )
  }

  if (icon === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <path d="M9 12A3 3 0 1 0 15 12A3 3 0 1 0 9 12M16.8 7.2H16.9" />
      </svg>
    )
  }

  if (icon === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20L6.2 16.5C5.5 15.3 5.1 13.9 5.1 12.5C5.1 8.2 8.5 4.8 12.7 4.8C16.9 4.8 20.3 8.2 20.3 12.5C20.3 16.7 16.9 20.1 12.7 20.1C11.3 20.1 10 19.7 8.9 19.1L5 20Z" />
        <path d="M9.4 9.1C9.6 12.6 12.4 15.2 15.6 15.8L16.5 14.1L14.8 13.2L13.8 14.1C12.5 13.5 11.5 12.5 10.9 11.3L11.8 10.3L10.9 8.6L9.4 9.1Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5L19 19M19 5L5 19" />
    </svg>
  )
}

export default SocialIcon
