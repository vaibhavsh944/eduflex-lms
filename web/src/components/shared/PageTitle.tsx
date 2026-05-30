import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTitleProps {
  title: string
}

export function PageTitle({ title }: PageTitleProps) {
  const location = useLocation()
  useEffect(() => {
    document.title = `${title} | EduFlow`
  }, [title, location])
  return null
}
