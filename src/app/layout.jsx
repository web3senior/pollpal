import Head from 'next/head'
import { Geist, Geist_Mono } from 'next/font/google'
import NextToast from '../components/NextToast'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from './Layout.module.scss'

import './Globals.scss'
import './GoogleFont.css'
import './../styles/Global.scss'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_NAME}`,
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  keywords: process.env.NEXT_PUBLIC_KEYWORDS,
  author: process.env.NEXT_PUBLIC_AUTHOR,
}

export const viewport = {
  themeColor: '#FF0169',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-US">
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={'crossOrigin'} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} ms-Fabric`}>
        <NextToast />
        <Header />
        <main className={`${styles.main}`}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
