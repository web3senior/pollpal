'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useFormStatus } from 'react-dom'
import ABI from './../../../abi/pollpal.json'
import { useAuth, provider } from '../../../contexts/AuthContext'
import Heading from '../../../components/Heading'
import { Loading as CustomLoading } from '../../../components/Loading'
import Icon from '../../../helper/MaterialIcon'
import moment from 'moment-timezone'
import Web3 from 'web3'
import styles from './page.module.scss'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { PinataSDK } from 'pinata-web3'
const pinata = new PinataSDK({
  pinataJwt:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3YmI1ZGY5MC1kMjc2LTQ4ODQtODFiOS0yMTU0YjBmNGFmMTMiLCJlbWFpbCI6ImluZm9AYXJhdHRhLmRldiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkODIwZGU1MDljYmI3MjgyODBkYyIsInNjb3BlZEtleVNlY3JldCI6ImQ5ZjU5ZmExMGRkNzY3MjE1MGFiN2NjZGVjOTFiNDFmODM3MmRiMmUzYmE1YjU3NTI2OTgyOTNlMWY5MGEyYTAiLCJleHAiOjE3NjY2MTcyNjN9.lcNMwKGguao_AQyxovCMhWXXnL8PByzghcmfit7wJuk',
  pinataGateway: 'example-gateway.mypinata.cloud',
})
const web3 = new Web3(window.lukso)
const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT_TESTNET)

export default function Page({ params, searchParams }) {
  const status = useFormStatus()
  const [polls, setPolls] = useState([])
  const [options, setOptions] = useState({ list: [`Choice 1`, `Choice 2`, `Choice 3`] })
  // const filter = await searchParams
  // const page = filter.page
  // const product = await getProductList(filter)
  const auth = useAuth()
  const createFormRef = useRef()

  const slugify = (str) => {
    str = str.replace(/^\s+|\s+$/g, '') // trim leading/trailing white space
    str = str.toLowerCase() // convert string to lowercase
    str = str
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-') // remove consecutive hyphens
    return str
  }

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
    return await contract.methods.pollList(auth.wallet).call()
  }

  const getPoll = async (pollId) => await contract.methods.poll(pollId).call()

  function toTimestamp(strDate) {
    var datum = Date.parse(strDate)
    return datum / 1000
  }

  function toDate(unix_timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    var date = new Date(unix_timestamp * 1000)

    var year = date.getUTCFullYear()
    var month = date.getUTCMonth()
    var day = date.getUTCDay()

    var hours = date.getUTCHours()
    var minutes = '0' + date.getUTCMinutes()
    var seconds = '0' + date.getUTCSeconds()

    // Will display time in 10:30:23 format
    var formattedTime = `${year}-${month}-${day} ${hours + ':' + minutes.slice(-2) + ':' + seconds.slice(-2)}`

    return date.toUTCString()
  }

  const addOption = () => {
    let newOptions = options.list
    newOptions.push(`Choice ${newOptions.length + 1}`)
    setOptions({ list: newOptions })
  }

  
  const delOption = (e, index) => {
    let newOptions = []
    options.list.map((item,i) =>{
      if (i !== index) newOptions.push(`Choice ${newOptions.length + 1}`)
    })
    setOptions({ list: newOptions })
  }

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
          formData.get(`whitelist`).length > 0 ? formData.get(`whitelist`).split(`,`) : [],
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
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>

      <div className={`__container`} data-width={`large`}>
        <div className={`card`}>
          <div className={`card__header d-flex`} style={{ columnGap: `.5rem` }}>
          Create New Poll
          </div>
          <div className={`card__body`}>
            <form ref={createFormRef} className={`form`} onSubmit={(e) => handleCreatePoll(e)}>
              {/* <div>
                <input type="file" name="file" id="" />
              </div> */}
              <div>
                <label htmlFor={`q`}>Ask a question</label>
                <textarea name={`q`} required></textarea>
              </div>
              <div>
                Options:
                {options &&
                  options.list.map((item, i) => {
                    return (
                      <div key={i} className={`d-flex mt-10 grid--gap-1`}>
                        <input type="text" name={`choice`} id="" defaultValue={item} placeholder={`${item}`} />
                        <button type={`button`} className='btn' onClick={(e) => delOption(e, i)}>Delete</button>
                      </div>
                    )
                  })}
                <div className={`mt-40 mb-10 d-f-c`}>
                  <button className='btn' type="button" onClick={(e) => addOption(e)}>
                    Add option
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor={`start`}>Start</label>
                <input type={`datetime-local`} name={`start`} required />
              </div>
              <div>
                <label htmlFor={`end`}>End</label>
                <input type={`datetime-local`} name={`end`} required />
              </div>
              <div>
                <label htmlFor={`whitelist`}>Whitelist</label>
                <input type={`text`} name={`whitelist`} defaultValue={``} placeholder='0x0, 0x1, 0x2, ..., 0xn' />
                <small>Split addresses with comma ,</small>
              </div>

              <div>
                <label htmlFor={`limitPerAccount`}>Limit Per Account</label>
                <input type={`text`} name={`limitPerAccount`} list={`sign-limit`} defaultValue={1} />
                <datalist id={`sign-limit`}>
                  <option value={1}>1</option>
                </datalist>
              </div>
              <div>
                <label htmlFor={`isPayable`}>Is payable</label>
                <select name={`isPayable`} id="">
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>
              <div>
                <label htmlFor={`token`}>Token</label>
              <select name="token" id="">
                <option value={`0x0000000000000000000000000000000000000000`}>$LYX</option>
              </select>
              </div>
              <div>
                <label htmlFor={`amount`}>Amount</label>
                <input type={`text`} name={`amount`} defaultValue={1} />
              </div>
              <div>
                <button className={`btn mt-30`} type="submit">
                  {status.pending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
