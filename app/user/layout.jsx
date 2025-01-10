import NextToast from './../components/NextToast'
import { AuthProvider } from './../contexts/AuthContext'

import styles from './Layout.module.scss'

export default function UserLayout({ children }) {
  return (
    <>
      <NextToast />
      <AuthProvider>
        <main className={`${styles.main}`}>{children}</main>
      </AuthProvider>
    </>
  )
}
