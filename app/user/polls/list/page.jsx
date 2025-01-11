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

  useEffect(() => {
    getPollList().then(async (res) => {
      console.log(res)
      setPolls(res)
    })
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`large`}>
        <div className={`grid grid--fit grid--gap-1`} style={{ '--data-width': `400px` }}>
          {polls &&
            polls[1] &&
            polls[0].map((item, i) => (
              <div key={i} className={`card ${styles['card']}`} data-margin={`none`}>
                <div className={`card__body`}>
                  <p>{`${item.q.length > 100 ? web3.utils.toUtf8(item.q).slice(0, 100) + `...` : web3.utils.toUtf8(item.q)}`}</p>
                  <ul className={`d-flex align-items-center grid--gap-1 mt-10`}>
                    <li>
                      <small className={`badge badge-pill badge-success`}>Start Date: {moment.unix(item[4]).utc().fromNow()}</small>
                    </li>
                    <li>
                      <small className={`badge badge-pill badge-danger`}>End Date: {moment.unix(item[5]).utc().fromNow()}</small>
                    </li>
                  </ul>
                  <Link href={`/poll/submit/${item.id}`} className={`text-primary mt-10 d-block`}>
                        View
                      </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
