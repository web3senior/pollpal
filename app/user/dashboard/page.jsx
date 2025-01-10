'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ABI from './../../abi/pollpal.json'
import { useAuth, provider } from '../../contexts/AuthContext'
import Heading from '../../components/Heading'
import Icon from '../../helper/MaterialIcon'
import toast, { Toaster } from 'react-hot-toast'
import moment from 'moment-timezone'
import Web3 from 'web3'
import styles from './page.module.scss'

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
        <h2 className={`text-center`}>Your PollPal Dashboard</h2>

        <div className={`grid grid--fit grid--gap-1 mt-50`} style={{ '--data-width': `300px` }}>
          <a href="polls/create" className={`${styles['dashboard-link']}`}>
            <h3>Create New Poll</h3>
            <p>Start a new poll and share your voice with the community.</p>
          </a>
          <a href="polls/list" className={`${styles['dashboard-link']}`}>
            <h3>My Polls</h3>
            <p>View and manage your existing polls.</p>
          </a>
        </div>
      </div>
    </div>
  )
}
