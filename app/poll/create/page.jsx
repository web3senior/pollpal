'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from '../../components/NextToast'
import Heading from '../../components/Heading'
import Icon from '../../helper/MaterialIcon'
import styles from './page.module.scss'

export default function Page() {
  const status = useFormStatus()
  const router = useRouter()

  const handleForm = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target)
    const phone = formData.get('phone')
    const password = formData.get('password')
    const errors = {}

    // validate the fields
    if (phone.length < 11) {
      errors.email = 'لطفا شماره موبایل را به صورت صحیح وارد نمادئید'
      toast(errors.email, 'error')
    }

    if (typeof password !== 'string' || password.length < 4) {
      errors.password = 'کلمه عبور نمی تواند کمتر از 4 باشد'
      toast(errors.email, 'error')
    }
    // // return data if we have errors
    // if (Object.keys(errors).length) {
    //   return errors
    // }

    const post = {
      phone: phone,
      password: password,
    }

    try {
      const res = await signIn(post)
      console.log(res)
      if (res.result) {
        localStorage.setItem('token', JSON.stringify(res.token))
        toast(`ورود شما با موفقیت انجام شد`, `success`)
        router.push('/user/dashboard')
      } else {
        toast(`${res.message}`, `error`)
        setIsLoading(false)
      }
    } catch (error) {
      console.log(error)
    }
    return null
  }

  useEffect(() => {}, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`small`}>
        <Heading title={`Let's Create a Poll`} subTitle={`Fill out the form to start your poll`} />
        <div className={`${styles.card}`}>
          <div className={`${styles.card__body}`}>
            <form onSubmit={(e) => handleForm(e)} className={`form d-flex flex-column`} style={{ rowGap: '1rem' }}>
              <div>
                <textarea name={`title`} placeholder={`Title`} required />
              </div>

              <div>
                <input type={`text`} name={`option1`} placeholder={`Option 1`} required />
              </div>

              <div>
                <input type={`text`} name={`option2`} placeholder={`Option 2`} required />
              </div>

              <div>
                <input type={`text`} name={`option3`} placeholder={`Option 3`} required />
              </div>

              <div>
                <input type={`text`} name={`option4`} placeholder={`Option 4`} required />
              </div>

              <div>
                <input type={`datetime-local`} name={`start`} required />
                <small>Start time in UTC format</small>
              </div>

              <div>
                <input type={`datetime-local`} name={`start`} required />
                <small>End time in UTC format</small>
              </div>

              <button className="btn mt-20" type="submit">
                {status.pending ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
