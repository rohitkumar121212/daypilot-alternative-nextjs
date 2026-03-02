'use client'

import { useEffect } from 'react'

const DEV_SESSION = '.eJxtj8tqwzAQRX8leN0mGj2trJpS6DbQDwijlyOQbGPJhVD675Vb0kXpRtLMvXfm6KO7hMWXa3esy-ofukt03bEDhgS06xkhKrDecBDSSCfBgCN9cECcBSMlR8E4AUuVC0aIwIlqHcKkooDKEyJUu8EY5w2C4pR5dJKDNoR7yaA3QUpNeQ8cjPbWauGIFqJrILNfMo5-rL9oa_HLDx_Oxfk8UULZ05Axpr2dMlJJWxBdjuO3jute90xrkJw1zP6ujZh9G3I6v-1e2pTdydppbXuaPk7jbVvT5FbahKW0Z0g47LbjcTBbe102w-vzuRUp5lj_5PKaakzTEMc7-7z49_it5bIuqXmutc7leDhg-2TwtpaKtz3GQ8sWn8K_9J9fgJyBUA.aaVOhQ.lglCYxHhTlvG3Id80Urn0UNslBM'

export default function DevSessionSetter() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Set session cookie for aperfectstay.ai domain
      document.cookie = `session=${DEV_SESSION}; domain=.aperfectstay.ai; path=/; max-age=86400`
      console.log('Dev session cookie set for .aperfectstay.ai')
    }
  }, [])

  return null
}
