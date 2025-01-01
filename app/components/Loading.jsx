import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import styles from './Loading.module.scss'

export const Loading = () => (
  <div className={styles['loading']}>
    <div className={`${styles['loading__container']} d-f-c flex-column`}>
      <figure>
        <Image alt={`Loading`} src={`/logo.svg`} width={48} height={48}/>
      </figure>
      <div />
    </div>
  </div>
)
