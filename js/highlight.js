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

      // Create wrapper with copy button
      const container = document.createElement('div')
      container.className = 'code-block'
      container.innerHTML = html + `
        <button class="copy-btn" aria-label="Copy code">
          <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="copy-text">Copy</span>
        </button>
      `

      // Add click handler
      const btn = container.querySelector('.copy-btn')
      btn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(code)
        btn.querySelector('.copy-text').textContent = 'Copied!'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.querySelector('.copy-text').textContent = 'Copy'
          btn.classList.remove('copied')
        }, 2000)
      })

      block.parentElement.replaceWith(container)
    } catch (e) {
      // If language not supported, keep original
      console.warn(`Shiki: language "${lang}" not supported`)
    }
  }
}

highlightCode()
