'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Web3 from 'web3'
import { useAuth, provider } from '../../contexts/AuthContext'
import ABI from './../../abi/pollpal.json'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from '../../components/NextToast'
import Heading from '../../components/Heading'
import Icon from '../../helper/MaterialIcon'
import styles from './page.module.scss'

export default function Page() {
  const [status, setStatus] = useState()
  const [poll, setPoll] = useState()
  // const status = useFormStatus()
  const router = useRouter()
  const auth = useAuth()

  const handleForm = async (e) => {
    e.preventDefault()
    setStatus(`loading`)

    const formData = new FormData(e.target)
    const id = formData.get('id')
    const errors = {}

    // validate the fields
    if (id.length < 66) {
      errors.id = `Please enter correct poll id`
    }

    // // return data if we have errors
    if (Object.keys(errors).length) {
      toast(Object.values(errors)[0], 'error')
    }

    const web3 = new Web3(window.lukso)
    const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT_TESTNET)
    const result = await contract.methods.getPoll(id).call()
    console.log(Object.assign({result: result}, { id: id }))
    setPoll(Object.assign({result: result}, { id: id }))
    setStatus()
  }

  useEffect(() => {
  
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`small`}>
        <Heading title={`Find Your Poll`} subTitle={`Enter the poll ID (bytes32) to quickly access and cast your vote.`} />

        <div className={`card`}>
          <div className={`card__body`}>
            {poll && <p className={`mb-10`}><Link href={`/poll/submit/${poll.id}`} className={`text-primary`}>{poll.result.q}</Link></p>}
            <form onSubmit={(e) => handleForm(e)} className={`form d-flex flex-column`} style={{ rowGap: '.1rem' }}>
              <div>
                <input type={`text`} name={`id`} placeholder={`Pool Id`} required />
              </div>

              <button className="btn mt-20" type="submit">
                {status && status === `loading` ? 'Searching...' : 'Find Poll'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
