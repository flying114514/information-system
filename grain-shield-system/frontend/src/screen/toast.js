/* 大屏轻量提示条：不依赖 Element Plus，避免与深色大屏风格冲突 */
let host

function ensureHost() {
  if (host && document.body.contains(host)) return host
  host = document.createElement('div')
  host.className = 'sk-toast-host'
  document.body.appendChild(host)

  if (!document.getElementById('sk-toast-style')) {
    const style = document.createElement('style')
    style.id = 'sk-toast-style'
    style.textContent = `
.sk-toast-host{position:fixed;left:50%;top:82px;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
.sk-toast{display:flex;align-items:center;gap:9px;padding:9px 20px;border-radius:999px;font-size:13px;font-weight:600;color:#dceaff;
  background:linear-gradient(135deg,rgba(12,34,62,.97),rgba(6,20,38,.97));border:1px solid rgba(74,165,255,.5);
  box-shadow:0 8px 30px rgba(0,20,50,.55),0 0 22px rgba(74,165,255,.35);opacity:0;transform:translateY(-10px);transition:all .28s ease}
.sk-toast.is-in{opacity:1;transform:translateY(0)}
.sk-toast::before{content:"";width:7px;height:7px;border-radius:50%;background:#25d0e8;box-shadow:0 0 10px #25d0e8}
`
    document.head.appendChild(style)
  }
  return host
}

export function skToast(message) {
  if (typeof document === 'undefined') return
  const el = document.createElement('div')
  el.className = 'sk-toast'
  el.textContent = message
  ensureHost().appendChild(el)
  requestAnimationFrame(() => el.classList.add('is-in'))
  setTimeout(() => {
    el.classList.remove('is-in')
    setTimeout(() => el.remove(), 320)
  }, 1900)
}

if (typeof window !== 'undefined') window.__skToast = skToast
