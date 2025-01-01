'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useParams, useRouter } from 'next/navigation'
import moment from 'moment'
import Web3 from 'web3'
import { useAuth, provider } from '../../../contexts/AuthContext'
import Shimmer from '@/app/helper/Shimmer'
import ABI from './../../../abi/pollpal.json'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from '../../../components/NextToast'
import Heading from '../../../components/Heading'
import Icon from '../../../helper/MaterialIcon'
import styles from './page.module.scss'

export default function Page() {
  const [status, setStatus] = useState()
  const [poll, setPoll] = useState()
  const [profile, setProfile] = useState()
  const [response, setResponse] = useState()
  // const status = useFormStatus()
  const router = useRouter()
  const auth = useAuth()
  const params = useParams()

  const handleVote = async (e) => {
    e.preventDefault()
    setStatus(`loading`)

    // const formData = new FormData(e.target)
    // const id = formData.get('id')
    // const errors = {}

    // // validate the fields
    // if (id.length < 66) {
    //   errors.id = `Please enter correct poll id`
    // }

    // // // return data if we have errors
    // if (Object.keys(errors).length) {
    //   toast(Object.values(errors)[0], 'error')
    // }

    console.log()

    const web3 = new Web3(window.lukso)
    const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT_TESTNET)
    console.log(auth.wallet)
    try {
      contract.methods
        .newRespond(params.id, '', 1, true, '0x')
        .send({
          from: auth.wallet,
          value: web3.utils.toWei('0', `ether`),
        })
        .then((res) => {
          console.log(res) //res.events.tokenId

          // Run partyjs
          // party.confetti(document.querySelector(`.__container`), {
          //   count: party.variation.range(20, 40),
          //   shapes: ['coin'],
          // })

          toast.success(`Done`)

          //   e.target.innerText = `Connect & Claim`
          toast.dismiss(t)
        })
        .catch((error) => {
          // e.target.innerText = `Connect & Claim`
          toast.dismiss(t)
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  useEffect(() => {
    const web3 = new Web3(window.lukso)
    const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT_TESTNET)
    contract.methods
      .getPoll(params.id)
      .call()
      .then((result) => {
        console.log(result)
        setPoll(result)
        auth.fetchProfile(result.manager).then((result) => {
          console.log(result)
          setProfile(result)
        })
      })

    contract.methods
      .respondList(params.id)
      .call()
      .then(async (responses) => {
        console.log(responses)
        let responses_with_profile = []

        await Promise.all(
          responses.map((response, i) => {
            return auth.fetchProfile(response.sender).then((profile) => {
              console.log(profile)
              responses_with_profile.push(Object.assign(profile, response))
            })
          })
        )

        setResponse(responses_with_profile)
      })
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`large`}>
        {profile ? (
          <div className={`card ${styles['profile']}`}>
            <div className={`card__body`}>
              <figure className={`d-flex flex-row align-items-center justify-content-start`} style={{ columnGap: `.5rem` }}>
                <Image
                  className={`rounded ms-depth-8`}
                  alt={profile.LSP3Profile.name}
                  title={auth.wallet && `${auth.wallet.slice(0, 4)}...${auth.wallet.slice(38)}`}
                  width={40}
                  height={40}
                  priority
                  src={`https://ipfs.io/ipfs/${profile.LSP3Profile.profileImage.length > 0 && profile.LSP3Profile.profileImage[0].url.replace('ipfs://', '').replace('://', '')}`}
                />
                <figcaption className={`d-flex flex-column`}>
                  {profile.LSP3Profile.name} <br />
                  <i>{auth.wallet && `${auth.wallet.slice(0, 4)}...${auth.wallet.slice(38)}`}</i>
                </figcaption>
              </figure>

              <p className={`mt-10`}>{profile.LSP3Profile.description}</p>

              <ul className={`${styles.tags} d-flex flex-row align-items-center justify-content-start`} style={{ columnGap: `.4rem` }}>
                {profile.LSP3Profile.tags.map((item, i) => (
                  <li key={i}>
                    <span className={`badge badge-blue badge-pill`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <Shimmer style={{ width: `100%`, height: `150px` }} />
        )}

        {poll ? (
          <div className={`card ${styles['poll']}`}>
            <div className={`card__header`}>
              <div className={`d-flex align-items-center justify-content-between`}>
                <div>
                  <h2>{poll.q}</h2>
                  {poll.isPayable && (
                    <div className={`${styles['payable']} d-flex align-items-center`}>
                      <span className={`${styles['badge']}`}>PAYABLE</span>
                      {poll.token === `0x0000000000000000000000000000000000000000` && <span className={`${styles['badge']}`}>{new Web3().utils.fromWei(poll.amount, `ether`)} $LYX</span>}
                    </div>
                  )}
                </div>

                <small className={`rounded`}>{poll && <>{moment.unix(poll.start).utc().fromNow()}</>}</small>
              </div>
            </div>
            <div className={`card__body`}>
              <ul className={`${styles['choices']}`}>
                {poll.choices.map((item, i) => {
                  return (
                    <li key={i} className={`d-flex align-items-center justify-content-between`}>
                      <label className={`${styles['radio']}`}>
                        <input type="radio" name={`choices`} id={`choice${i + 1}`} />
                        <span>{item}</span>
                      </label>
                      <Icon name={`info`} className={`${styles['info']}`} />
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className={`card__footer d-f-c flex-column`}>
              <div className={`d-flex flex-row align-items-center justify-content-between w-100`}>
                <div className={`d-flex flex-row align-items-center justify-content-start`} style={{ columnGap: `.4rem` }}>
                  {response && response.length > 0 && (
                    <>
                      <div className={`${styles['respond_profiles']} d-f-c flex-row`}>
                        {response
                          .filter((item, i) => i < 3)
                          .map((item, i) => {
                            return (
                              <Image
                                key={i}
                                className={`rounded ms-depth-4`}
                                alt={item.LSP3Profile.name}
                                title={`@${item.LSP3Profile.name}`}
                                width={40}
                                height={40}
                                src={`https://ipfs.io/ipfs/${item.LSP3Profile.profileImage.length > 0 && item.LSP3Profile.profileImage[0].url.replace('ipfs://', '').replace('://', '')}`}
                              />
                            )
                          })}
                      </div>
                    </>
                  )}

                  <ul className={`d-flex align-items-center`} style={{ columnGap: `.4rem` }}>
                    <li>Total Votes: {poll.respondCounter}</li>
                    <li>•</li>
                    <li>Expire {moment.unix(poll.end).utc().fromNow()}</li>
                  </ul>
                </div>

                <button className={`btn ms-depth-4`} onClick={handleVote}>
                  Vote Now
                </button>
              </div>

              <figure className={`${styles['logo']} ms-depth-4 mt-20`}>
                <Image className={`rounded`} alt={`${process.env.NEXT_PUBLIC_NAME}`} width={40} height={40} priority src={`/logo-white.svg`} />
              </figure>
            </div>
          </div>
        ) : (
          <Shimmer style={{ width: `100%`, height: `500px`, marginTop: `1rem` }} />
        )}

        <div className={`${styles['alert']} d-flex align-items-center`} style={{ columnGap: `.25rem` }}>
          <Icon name={'ballot'} style={{ color: `#536471` }}></Icon>
          Creating a poll is easy! Start now and share your opinion with the world.&nbsp;
          <Link href={`/user/polls`} className={`text-primary`}>
            Create
          </Link>
        </div>
      </div>
    </div>
  )
}
