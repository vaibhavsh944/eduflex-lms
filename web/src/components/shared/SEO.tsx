import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  image?: string
}

const SITE_NAME = 'EduFlow LMS'
const DEFAULT_DESC = 'EduFlow is a modern learning management system offering interactive courses, live sessions, and comprehensive learning tools.'
const DEFAULT_IMAGE = '/og-image.png'

export function SEO({ title, description = DEFAULT_DESC, canonical, image = DEFAULT_IMAGE }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  )
}
