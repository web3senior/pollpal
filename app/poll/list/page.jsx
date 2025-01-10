'use client'

import Link from 'next/link'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ABI from './../../abi/pollpal.json'
import { useAuth, provider } from '../../contexts/AuthContext'
import Heading from '../../components/Heading'
import { Loading as CustomLoading } from '../../components/Loading'
import Icon from '../../helper/MaterialIcon'
import Web3 from 'web3'
import moment from 'moment-timezone'
import styles from './page.module.scss'
import Shimmer from '@/app/helper/Shimmer'

export default function Page({ params, searchParams }) {
  const status = useFormStatus()
  const [polls, setPolls] = useState([])
  const [options, setOptions] = useState({ list: [`Choice 1`, `Choice 2`, `Choice 3`] })
  // const filter = await searchParams
  // const page = filter.page
  // const product = await getProductList(filter)
  const auth = useAuth()

  const fetchData = async (dataURL) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }
    const response = await fetch(`${dataURL}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  const getPollList = async () => {
    const web3 = new Web3(window.lukso)
    const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT_TESTNET)
    return await contract.getPastEvents('PollAdded', {
      filter: {}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: 'latest',
    })
    // return await contract.methods.pollList(auth.wallet).call()
  }

  const getPoll = async (pollId) => await contract.methods.poll(pollId).call()

  const handleCreatePoll = async (e) => {
    e.preventDefault()

    // upload metadata
    // const choices = document.querySelectorAll(`[name="choice"]`)
    // console.log(choices)
    // let choiceValues = []
    // choices.forEach((element) => {
    //   choiceValues.push(element.value)
    // })

    // const upload = await pinata.upload.json({
    //   q: document.querySelector(`[name="q"]`).value,
    //   choices: choiceValues,
    //   creator: auth.wallet,
    // })
    // console.log(`IPFS`, upload)
    const web3 = new Web3(window.lukso)
    const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT_TESTNET)
    const t = toast.loading(`Waiting for transaction's confirmation`)
    const formData = new FormData(e.target)
    const account = auth.wallet
    let image

    const now = await contract.methods.getNow().call()
    console.log(now, moment.unix(now).utc().format())

    // try {
    //   const t = toast.loading(`Uploading to IPFS`)
    //   const upload = await pinata.upload.file(formData.get(`file`))
    //   console.log(upload)
    //   toast.dismiss(t)
    //   image = upload.IpfsHash
    // } catch (error) {
    //   console.log(error)
    // }

    // const upload = await pinata.upload.json({
    //   image: image,
    //   creator: auth.wallet,
    // })

    try {
      contract.methods
        .newPoll(
          // upload.IpfsHash,
          '',
          formData.get(`q`),
          formData.getAll(`choice`),
          moment(formData.get(`start`)).utc().unix(),
          moment(formData.get(`end`)).utc().unix(),
          [], //  formData.get(`whitelist`),
          formData.get(`limitPerAccount`),
          formData.get(`isPayable`),
          formData.get(`token`),
          web3.utils.toWei(formData.get(`amount`), `ether`),
          false
        )
        .send({
          from: account,
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

  const fetchIPFS = async (poll) => {
    if (poll.metadata === '') return []
    try {
      const response = await fetch(`https://api.universalprofile.cloud/ipfs/${poll.metadata}`)
      if (!response.ok) throw new Response('Failed to get data', { status: 500 })
      const json = await response.json()
      // console.log(json)

      var tempProps = JSON.parse(JSON.stringify(poll))
      tempProps.fetched_data = json

      return Object.preventExtensions(tempProps)
    } catch (error) {
      console.error(error)
      return []
    }
  }

  useEffect(() => {
    // const dialog = document.querySelector('dialog')
    // const showButton = document.querySelector('dialog + button')
    // const closeButton = document.querySelector('dialog button')
    // // "Show the dialog" button opens the dialog modally
    // showButton.addEventListener('click', () => {
    //   dialog.showModal()
    // })

    // // "Close" button closes the dialog
    // closeButton.addEventListener('click', () => {
    //   dialog.close()
    // })

    getPollList().then(async (responses) => {
      let responses_with_profile = []

      await Promise.all(
        responses.map((response, i) => {
          return auth.fetchProfile(response.returnValues.sender).then((profile) => {
            console.log(profile)
            responses_with_profile.push(Object.assign(profile, response))
          })
        })
      )

      setPolls(responses_with_profile)
      console.log(responses_with_profile)
    })
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`large`}>
        <div className={`grid grid--fit ${styles['polls']}`} style={{ '--data-width': `400px` }}>
          {polls && polls.length < 1 && (
            <>
              <Shimmer style={{ width: `100%`, height: `190px` }} />
              <Shimmer style={{ width: `100%`, height: `190px` }} />
              <Shimmer style={{ width: `100%`, height: `190px` }} />
              <Shimmer style={{ width: `100%`, height: `190px` }} />
              <Shimmer style={{ width: `100%`, height: `190px` }} />
              <Shimmer style={{ width: `100%`, height: `190px` }} />
              <Shimmer style={{ width: `100%`, height: `190px` }} />
              <Shimmer style={{ width: `100%`, height: `190px` }} />
            </>
          )}

          {polls &&
            polls.length > 0 &&
            polls.map((item, i) => (
              <div key={i} className={`card`} data-margin={`none`}>
                <div className={`card__body`}>
                  <div className={`d-flex flex-row align-items-center justify-content-between`}>
                    <figure className={`d-flex flex-row align-items-center justify-content-start`} style={{ columnGap: `.5rem` }}>
                      <Image
                        className={`rounded ms-depth-8`}
                        alt={item.LSP3Profile.name}
                        title={auth.wallet && `${auth.wallet.slice(0, 4)}...${auth.wallet.slice(38)}`}
                        width={40}
                        height={40}
                        priority
                        src={`https://ipfs.io/ipfs/${item.LSP3Profile.profileImage.length > 0 && item.LSP3Profile.profileImage[0].url.replace('ipfs://', '').replace('://', '')}`}
                      />
                      <figcaption className={`d-flex flex-column`}>
                        {item.LSP3Profile.name} <br />
                        <i>{auth.wallet && `${auth.wallet.slice(0, 4)}...${auth.wallet.slice(38)}`}</i>
                      </figcaption>
                    </figure>

                    <small className={`rounded`}>{moment.unix(item.returnValues.start).utc().fromNow()}</small>
                  </div>

                  <h4>{item.returnValues.q.length > 100 ? item.returnValues.q.slice(0, 100) + `...` : item.returnValues.q}</h4>
                  <ul>
                    <li>
                      <small>Expire {moment.unix(item.returnValues.end).utc().fromNow()}</small>
                    </li>
                    <li>
                      <Link href={`/poll/submit/${item.returnValues.pollId}`} className={`text-primary`}>
                        View
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
