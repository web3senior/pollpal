'use client'

import Link from 'next/link'
import Image from 'next/image'
import { toast } from '../components/NextToast'
import Icon from './../helper/MaterialIcon'
import styles from './Page.module.scss'

export default function Home() {
  const notify = () => toast(`Hello coders it was easy!`, `success`)

  return (
    <div className={`${styles.page} d-flex flex-column align-items-center`}>
      <div className={`d-f-c flex-column pt-50 pb-50`}>
        <h1 className={`text-center`}>Your <span>Voice</span>, Your <span>Vote</span>, Your <span>Chain</span>.</h1>
        <small className={`text-center`}>Create and participate in secure, transparent, and community-driven polls.</small>

        <ul className={`${styles.action} d-f-c flex-row`} style={{ gap: `1.5rem` }}>
          <li>
            <Link href={`/poll/submit`}>
              <Icon name={`how_to_vote`} />
              Submit Vote
            </Link>
          </li>
          <li>
            <Link href={`/poll/create`}>
              <Icon name={`add_circle`} />
              Create Poll
            </Link>
          </li>
        </ul>
      </div>

      <Image src="/hero.svg" alt={`Hero`} width={200} height={200} priority className={`${styles.hero}`} />
    </div>
  )
}
