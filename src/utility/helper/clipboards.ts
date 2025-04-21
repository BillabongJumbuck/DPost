/**
 * Copies text to clipboard and returns success status
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content)
      return true
    }

    // Fallback for older browsers
    const dummy = document.createElement('textarea')
    dummy.style.position = 'fixed'
    dummy.style.opacity = '0'
    dummy.value = content
    document.body.appendChild(dummy)
    dummy.select()
    const success = document.execCommand('copy')
    document.body.removeChild(dummy)
    return success
  } catch (err) {
    console.error('Copy failed:', err)
    return false
  }
}
