import Link from 'next/link'
import Image from 'next/image'
import Icon from '../helper/MaterialIcon'
import ConnectWallet from './ConnectWallet'
import styles from './Header.module.scss'

export default function Header() {
  return (
    <header className={`${styles.header} ms-depth-8`}>
      <div className={`__container d-flex align-items-center justify-content-between`} data-width={`xlarge`}>
        <Link href={`/`} className={`${styles.logo} d-flex align-items-center justify-content-center`}>
          <figure className={`d-flex align-items-center justify-content-center`}>
            <Image src="/logo.svg" alt={`Logo`} width={28} height={28} priority />
            <figcaption>{process.env.NEXT_PUBLIC_NAME}</figcaption>
          </figure>

          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.56234 7.6613L0.300671 2.82629C-0.247428 2.01364 0.217216 0.776611 1.07064 0.776611H7.99335C8.84674 0.776611 9.31142 2.01457 8.76327 2.82629L5.50161 7.6613C4.99591 8.41066 4.06805 8.41066 3.56234 7.6613Z" fill="#888888" />
          </svg>
        </Link>

        <div className={`${styles['wallet-container']} d-flex align-items-center`}>
        <a href={`/poll/search`} className={`${styles['btn-search']}`}>
        <Icon name={`search`}/>
        </a>
        <ConnectWallet />
        </div>
      </div>
    </header>
  )
}
