import { useEffect, useState } from 'react'

/** Efeito máquina-de-escrever: revela `text` caractere a caractere. */
export function useTyper(text: string, speed = 26, startDelay = 0): { shown: string; done: boolean } {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const start = setTimeout(function tick() {
      i += 1
      setCount(i)
      if (i < text.length) timer = setTimeout(tick, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      clearTimeout(timer)
    }
  }, [text, speed, startDelay])

  return { shown: text.slice(0, count), done: count >= text.length }
}
