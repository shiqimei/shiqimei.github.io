// Shiki syntax highlighting
import { codeToHtml } from 'https://esm.sh/shiki@3.0.0'

async function highlightCode() {
  const codeBlocks = document.querySelectorAll('pre code')

  for (const block of codeBlocks) {
    const lang = block.className.replace('language-', '') || 'text'
    const code = block.textContent

    try {
      const html = await codeToHtml(code, {
        lang: lang,
        theme: 'github-dark'
      })

      // Replace the pre element with the highlighted version
      const wrapper = document.createElement('div')
      wrapper.innerHTML = html
      const newPre = wrapper.firstChild
      block.parentElement.replaceWith(newPre)
    } catch (e) {
      // If language not supported, keep original
      console.warn(`Shiki: language "${lang}" not supported`)
    }
  }
}

highlightCode()
