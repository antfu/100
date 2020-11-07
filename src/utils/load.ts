export function load(url: string) {
  return new Promise<void>((resolve) => {
    if (document.head.querySelector(`script[src="${url}"]`))
      return resolve()

    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}
