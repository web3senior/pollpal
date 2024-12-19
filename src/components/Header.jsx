'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Icon from '../helper/MaterialIcon'
import styles from './Header.module.scss'

export default function Header() {
  const [cart, setCart] = useState(0)
  const [visibleSearch, setVisibleSearch] = useState(false)
  const [userSignedIn, setUserSignedIn] = useState('/sign-in')
  /**
   * Get cart from Localstorage
   * @returns
   */
  const getCart = async () => await JSON.parse(localStorage.getItem(`cart`))

  useEffect(() => {}, [])
  return (
    <>
      {visibleSearch && <Search setVisibleSearch={setVisibleSearch} />}
      <header className={`${styles.header} ms-depth-4`}>
        <div className={`__container d-flex align-items-center justify-content-between`} data-width={`xlarge`}>
          <Link href={`/`} className={`${styles.logo} d-flex align-items-center justify-content-center`}>
            <Image src="/logo.svg" alt={`Logo`} width={48} height={48} priority />
            <h1>{process.env.NEXT_PUBLIC_NAME}</h1>
          </Link>

          <div className={`${styles.action} d-flex align-items-center justify-content-center`}>
            <Link href={`/poll/search`} className={styles.logo}>
              Search
            </Link>
            <button className={`${styles['btn-search']} d-f-c`} onClick={() => setVisibleSearch(!visibleSearch)}>
              Connect
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
