import Link from 'next/link'
import Image from 'next/image'

import { toast } from './components/NextToast'
import Icon from './helper/MaterialIcon'
import styles from './Page.module.scss'
import Heading from './components/Heading'


export default async function Page() {
  
  const useCases = [
    {
      icon: `Hub`,
      title: `Community Decision-Making`,
      description: `Empower communities to make informed decisions through transparent and secure voting.`,
    },
    {
      icon: `Business`,
      title: `Business and Governance`,
      description: `Facilitate efficient and democratic decision-making within organizations and DAOs.`,
    },
    {
      icon: `Person`,
      title: `Personal Use`,
      description: `Simplify decision-making processes for personal and social events.`,
    },
    {
      icon: `Groups`,
      title: `Empowering Communities`,
      description: `Drive community decisions through secure, transparent voting.`,
    },
  ]

  return (
    <div className={`${styles.page}`}>
      <div className={`${styles.hero} d-f-c flex-column`}>
        <h1 className={`text-center`}>Vote, Share, Trust.</h1>
        <small className={`text-center`}>Create and participate in secure, transparent, and community-driven polls.</small>

        <ul className={`${styles.action} d-f-c flex-row`} style={{ gap: `1.5rem` }}>
          <li>
            <Link href={`/poll/list`}>
              <Icon name={`how_to_vote`} />
              Join a Poll
            </Link>
          </li>
          <li>
            <Link href={`/user/polls/create`}>
              <Icon name={`add_circle`} />
              Create a Poll
            </Link>
          </li>
        </ul>
      </div>

      <Heading title={`Unlocking the Power of Decentralized Polling`} subTitle={`PollPal empowers individuals and communities across various sectors. Here are a few key use cases`} />
      <div className={`__container`} data-width={`large`}>
        <div className={`grid grid--fit grid--gap-1 ${styles['usecase']}`} style={{ '--data-width': `400px` }}>
          {useCases.map((item, i) => {
            return (
              <div key={i} className={`card`}>
                <div className={`card__body d-flex flex-row align-items-start`} style={{ columnGap: `1rem` }}>
                  <Icon name={item.icon} className={`ms-fontSize-42`} />
                  <div className={`d-flex flex-column`} style={{ rowGap: `.5rem` }}>
                    <b>{item.title}</b>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={`${styles.callToAction} mt-50`}>
        <div className={`__container`} data-width={`large`}>
          <div className={`d-f-c flex-column`} style={{ rowGap: `1rem` }}>
            <h2>Polling Made Easy</h2>
            <p>Create polls in seconds. Share your voice with the world.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
