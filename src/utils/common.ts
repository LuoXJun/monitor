export const copyText = (text = '') => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.width = '0'
  textArea.style.position = 'fixed'
  textArea.style.left = '-999px'
  textArea.style.top = '10px'
  textArea.setAttribute('readonly', 'readonly')
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}
