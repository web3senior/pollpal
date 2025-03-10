'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useParams, useRouter } from 'next/navigation'
import moment from 'moment'
import Web3 from 'web3'
import { useAuth, provider } from '../../../contexts/AuthContext'
import Shimmer from '@/app/helper/Shimmer'
import ABI from './../../../abi/pollpal.json'
import LSP7ABI from './../../../abi/lsp7.json'
import Image from 'next/image'
import Link from 'next/link'
// import { toast } from '../../../components/NextToast'
import toast, { Toaster } from 'react-hot-toast'
import Heading from '../../../components/Heading'
import Icon from '../../../helper/MaterialIcon'
import styles from './page.module.scss'

const web3 = new Web3(window.lukso)
const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)

export default function Page() {
  const [status, setStatus] = useState()
  const [poll, setPoll] = useState()
  const [pollToken, setPollToken] = useState()
  const [profile, setProfile] = useState()
  const [response, setResponse] = useState()
  const [authorizedAmount, setAuthorizedAmount] = useState(0)
  const [isExpired, setIsExpired] = useState()
  const [score, setScore] = useState()
  const [maxScoreIndex, setMaxScoreIndex] = useState([])
  const [whitelistedProfile, setWhitelistedProfile] = useState({ list: [] })
  // const status = useFormStatus()
  const router = useRouter()
  const auth = useAuth()
  const params = useParams()

  const handleForm = async (e) => {
    e.preventDefault()
    setStatus(`loading`)

    const choices = document.querySelectorAll('[name="choices"]')
    const errors = {}

    let selectedOption = null
    choices.forEach((item, i) => {
      if (item.checked) selectedOption = i
    })

    // validate the fields
    if (selectedOption === null) {
      errors.selectedOption = `No option selected. Please make a choice.`
    }

    // // return data if we have errors
    if (Object.keys(errors).length) {
      toast(Object.values(errors)[0], 'error')
      return
    }
    console.log(`selectedOption`, selectedOption)
    try {
      contract.methods
        .newRespond(params.id, ``, selectedOption, true, '0x')
        .send({
          from: auth.wallet,
          value: !pollToken && poll.isPayable ? poll.amount : 0,
        })
        .then((res) => {
          console.log(res) //res.events.tokenId

          // Run partyjs
          // party.confetti(document.querySelector(`.__container`), {
          //   count: party.variation.range(20, 40),
          //   shapes: ['coin'],
          // })

          toast.success(`Your vote has been successfully cast!`)

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

  const getIsExpired = async (pollId) => await contract.methods.isExpired(pollId).call()

  const getPoll = async () => {
    return contract.methods
      .getPoll(params.id)
      .call()
      .then(async (poll) => {
        console.log(`polls:`, poll)
        setPoll(poll)

        // Fetch sender profile
        auth.fetchProfile(poll.manager).then((profile) => setProfile(profile))

        // Read whitelisted accounts' profile
        let whitelisted_profile = []
        await Promise.all(
          poll.whitelist.map((whitelistedAccount, i) => {
            return auth.fetchProfile(whitelistedAccount).then((profile) => {
              console.log(i, profile)
              whitelisted_profile.push(Object.assign(profile, { id: whitelistedAccount }))
            })
          })
        )
        console.log(whitelisted_profile)
        setWhitelistedProfile({ list: whitelisted_profile })

        return poll
      })
  }

  const getResponseList = async () => {
    return contract.methods
      .responseList(params.id)
      .call()
      .then(async (responses) => {
        console.log(responses)
        let responses_with_profile = []

        await Promise.all(
          responses.map((response, i) => {
            return auth.fetchProfile(response.sender).then((profile) => {
              console.log(`==============`, profile)
              responses_with_profile.push(Object.assign(profile, response))
            })
          })
        )

        setResponse(responses_with_profile)

        return responses_with_profile
      })
  }
  const getAuthorizedAmountFor = async (token) => {
    let myContract = new web3.eth.Contract(LSP7ABI, token)
    myContract.methods
      .authorizedAmountFor(process.env.NEXT_PUBLIC_CONTRACT_TESTNET, auth.wallet)
      .call()
      .then((res) => {
        console.log(res)
        setAuthorizedAmount(web3.utils.fromWei(res, 'ether'))
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const handleAllowance = async (e, poll) => {
    e.target.innerText = `Waiting...`
    const t = toast.loading(`Waiting for transaction's confirmation`)
    const myContract = new web3.eth.Contract(LSP7ABI, poll.token)
    const account = auth.wallet

    let operation = `increase`
    switch (operation) {
      case `increase`:
        myContract.methods
          .authorizeOperator(process.env.NEXT_PUBLIC_CONTRACT_TESTNET, poll.amount, '0x')
          .send({
            from: account,
            value: 0,
          })
          .then((res) => {
            console.log(res)
            e.target.innerText = `Approved`
            toast.success(`Refresh the page`)
            toast.dismiss(t)
          })
          .catch((error) => {
            console.log(error)
            e.target.innerText = `Approve`
            toast.dismiss(t)
          })
        break
      case `decrease`:
        myContract.methods
          .decreaseAllowance(process.env.NEXT_PUBLIC_CONTRACT_TESTNET, account, poll.amount, '0x')
          .send({
            from: auth.wallet,
            value: 0,
          })
          .then((res) => {
            console.log(res)
            e.target.innerText = `decrease`
            toast.dismiss(t)
          })
          .catch((error) => {
            console.log(error)
            e.target.innerText = `decrease`
            toast.dismiss(t)
          })
        break
      default:
        break
    }
  }

  async function getLSP7TokenName(token) {
    var myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {\n  Asset(where: {id: {_eq: \"${token}\"}}) {\n    id\n    lsp4TokenName\n  }\n}`,
      }),
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      throw new Response('Failed to ', { status: 500 })
    }
    return response.json()
  }

  useEffect(() => {
    getIsExpired(params.id).then((status) => {
      console.log(`getIsExpired`, status)
      setIsExpired(status)
    })

    getPoll().then((poll) => {
      if (poll.token.toString().trim().toLowerCase() !== web3.utils.padLeft(`0x`, 40)) {
        getLSP7TokenName(poll.token.toString().trim().toLowerCase()).then((result) => {
          console.log(result)
          setPollToken(result)
        })

        getAuthorizedAmountFor(poll.token)
      }

      getResponseList().then((responses) => {
        console.log(responses)

        let choices_score = new Array(poll.choices.length).fill(0)

        responses.map((response) => {
          choices_score[response.choice] += 1
        })
        setScore(choices_score)

        console.log(choices_score)
        // Is there any responses?
        if (responses.length > 0) {
          let max = choices_score[0]
          let maxIndex = []

          for (let m = 0; m < choices_score.length; m++) {
            if (choices_score[m] >= max) {
              maxIndex.push(m)
              max = choices_score[m]
            }
          }
          console.log(maxIndex)

          setMaxScoreIndex(maxIndex)
        }
      })
    })
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`large`}>
        {isExpired && <div className={`alert alert--dark text-dark border border--warning`}>This poll has been ended.</div>}

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
                  src={`https://ipfs.io/ipfs/${profile.LSP3Profile.profileImage.length > 0 ? profile.LSP3Profile.profileImage[0].url.replace('ipfs://', '').replace('://', '') : 'bafkreif5hdukwj7hnuxc5o53bjfkd3im4d7ygeah4a77i5ut5ke3zyj4lu'}`}
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

        {profile && poll ? (
          <>
            <form action="" onSubmit={(e) => handleForm(e)}>
              <div className={`card ${styles['poll']}`}>
                <div className={`card__header`}>
                  <div className={`d-flex align-items-start justify-content-between`} style={{ gap: `1rem` }}>
                    <div>
                      <h3>{web3.utils.toUtf8(`${poll.q}`)}</h3>
                      <div className={`${styles['payable']} d-flex align-items-center`}>
                        {poll.isPayable && (
                          <>
                            <span className={`${styles['badge']}`}>PAYABLE</span>
                            {poll.token === web3.utils.padLeft(`0x`, 40) ? (
                              <span className={`${styles['badge']}`}>{new Web3().utils.fromWei(poll.amount, `ether`)} $LYX</span>
                            ) : (
                              <span className={`${styles['badge']}`}>
                                {new Web3().utils.fromWei(poll.amount, `ether`)} ${pollToken && pollToken?.data.Asset[0].lsp4TokenName.toUpperCase()}
                              </span>
                            )}
                          </>
                        )}
                        <span className={`${styles['badge']}`}>Each account can cast a maximum of {poll.votingLimit} votes in this poll.</span>
                      </div>
                    </div>

                    <small className={`rounded`}>{poll && <>{moment.unix(poll.start).utc().fromNow()}</>}</small>
                  </div>
                </div>

                <div className={`card__body`}>
                  {!isExpired ? (
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
                  ) : (
                    <ul className={`${styles['responses']}`}>
                      {poll &&
                        maxScoreIndex &&
                        score &&
                        score.length > 0 &&
                        score.map((scoreItem, i) => {
                          const scorePercentage = response.length > 0 ? ((scoreItem / response.length) * 100).toFixed(2) : 0

                          return (
                            <li key={i} className={`d-flex align-items-center justify-content-between rounded ${maxScoreIndex.length > 0 && maxScoreIndex[i] === i ? styles['selected'] : styles['other']}`}>
                              <span>{poll.choices[i]}</span>
                              <b>{scorePercentage}%</b>
                            </li>
                          )
                        })}
                    </ul>
                  )}
                </div>

                <div className={`card__footer d-f-c flex-column`}>
                  <div className={`d-flex flex-row align-items-center justify-content-between w-100`}>
                    <div className={`d-flex flex-row align-items-center justify-content-start`} style={{ columnGap: `.4rem` }}>
                      {response && response.length > 0 && (
                        <>
                          <div className={`${styles['respond_profiles']} d-f-c flex-row`}>
                            {response
                              .map((item, i) => {
                                return (
                                  <Image
                                    key={i}
                                    className={`rounded ms-depth-4`}
                                    alt={item?.LSP3Profile?.name}
                                    title={`@${item?.LSP3Profile?.name}`}
                                    width={40}
                                    height={40}
                                    src={`https://ipfs.io/ipfs/${item?.LSP3Profile.profileImage.length > 0 && item.LSP3Profile.profileImage[0].url.replace('ipfs://', '').replace('://', '')}`}
                                  />
                                )
                              })}
                          </div>
                        </>
                      )}

                      <ul className={`d-flex align-items-center`} style={{ columnGap: `.4rem` }}>
                        <li>Total Votes: {poll.respondCounter}</li>
                        <li>•</li>
                        <li>Expiration: {moment.unix(poll.end).utc().fromNow()}</li>
                      </ul>
                    </div>

                    <div className={`d-flex flex-column grid--gap-025`}>
                      {web3.utils.fromWei(poll.amount) === authorizedAmount && (
                        <span>
                          Approved amount of ${pollToken && pollToken?.data.Asset[0].lsp4TokenName.toUpperCase()}: {authorizedAmount}
                        </span>
                      )}

                      {poll.token.toString().trim().toLowerCase() !== web3.utils.padLeft(`0x`, 40) && web3.utils.fromWei(poll.amount) !== authorizedAmount ? (
                        <button type={`button`} className={`btn ms-depth-4`} disabled={isExpired} onClick={(e) => handleAllowance(e, poll)}>
                          Approve {new Web3().utils.fromWei(poll.amount, `ether`)} ${pollToken && pollToken?.data.Asset[0].lsp4TokenName.toUpperCase()}
                        </button>
                      ) : (
                        <button type={`submit`} className={`btn ms-depth-4`} disabled={isExpired}>
                          Vote Now
                        </button>
                      )}
                    </div>
                  </div>

                  <figure className={`${styles['logo']} ms-depth-4 mt-20`}>
                    <Image className={`rounded`} alt={`${process.env.NEXT_PUBLIC_NAME}`} width={40} height={40} priority src={`/logo-white.svg`} />
                  </figure>
                </div>
              </div>
            </form>
          </>
        ) : (
          <Shimmer style={{ width: `100%`, height: `500px`, marginTop: `1rem` }} />
        )}

        {/* Whitelisted profiles */}
        {poll && poll.whitelist.length > 0 && (
          <div className={`card`}>
            <div className={`card__header`}>
              <div className={`d-flex align-items-start justify-content-between`} style={{ gap: `1rem` }}>
                <p>This poll is whitelisted</p>
                <small className={`text-secondary`}>{poll.whitelist.length} profiles</small>
              </div>
            </div>
            <div className={`card__body grid grid--fit grid--gap-1`} style={{ '--data-width': `200px` }}>
              {whitelistedProfile &&
                whitelistedProfile.list.length > 0 &&
                whitelistedProfile.list.map((item, i) => {
                  if (!item.LSP3Profile) return
                  return (
                    <div key={i} className={`${styles['whitelisted-profile']}`}>
                      <figure className={`d-flex align-items-center`} style={{ gap: `.7rem` }}>
                        <img
                          className={`rounded ms-depth-8`}
                          alt={item.LSP3Profile?.name}
                          title={`@${item.LSP3Profile?.name}`}
                          width={40}
                          height={40}
                          src={`https://ipfs.io/ipfs/${item.LSP3Profile?.profileImage.length > 0 ? item.LSP3Profile.profileImage[0].url.replace('ipfs://', '').replace('://', '') : `bafkreic63gdzkdiye7vlcvbchillkszl6wbf2t3ysxcmr3ovpah3rf4h7i`}`}
                        />
                        <figcaption className={`d-flex flex-column`}>
                          <p>{item.LSP3Profile.name}</p>
                          <i style={{ fontSize: `10px` }}>{auth.wallet && `${item.id.slice(0, 4)}...${item.id.slice(38)}`}</i>
                        </figcaption>
                      </figure>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Response rate for whitelisted polls */}
        {isExpired && poll && response && poll.whitelist.length > 0 && (
          <>
            <div className={`card`}>
              <div className={`card__header`}>
                <p>Response Rate</p>
                <small className={`text-secondary`}>Only for whitelisted polls</small>
              </div>
              <div className={`card__body`} title={`(Number of Responses / Total Number of whitelist) x 100`}>
                {response.length > 0 ? ((response.length / poll.whitelist.length) * 100 || 100).toFixed(2) : 0}%
              </div>
            </div>
          </>
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
