'use client'

import React, { useContext, useEffect, useState } from 'react'
import ABI from './../abi/pollpal.json'
import LSP0ERC725Account from '@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json'
// import { toast } from '../components/NextToast'
import { Loading } from './../components/Loading'
import toast, { Toaster } from 'react-hot-toast'
import Web3 from 'web3'

export const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export const isAuth = async () => localStorage.getItem('accessToken')
export const chainID = async () => await web3.eth.getChainId()
export const getIPFS = async (CID) => {
  console.log(`CID:`, CID)
  //  console.log(CID)
  let requestOptions = {
    method: 'GET',
    redirect: 'follow',
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${CID}`, requestOptions)
   if (!response.ok) return {result: false}//throw new Response('Failed to get data', { status: 500 })
  return response.json()
}

/**
 * Fetch Universal Profile
 * @param {address} addr
 * @returns
 */

export const fetchProfile = async (account) => {
  const web3 = new Web3(window.lukso)
  const LSP0ERC725Contract = new web3.eth.Contract(LSP0ERC725Account.abi, account)
  try {
    return LSP0ERC725Contract.methods
      .getData('0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5')
      .call()
      .then(async (data) => {
        data = data.substring(6, data.length)
        // console.log(data)
        //  data ="0x" + data.substring(6)
        //  console.log(data)
        // slice the bytes to get its pieces
        const hashFunction = '0x' + data.slice(0, 8)
        // console.log(hashFunction)
        const hash = '0x' + data.slice(76)
        const url = '0x' + data.slice(76)
        // console.log(hashFunction, ' | ', hash, ' | ', url)
        // check if it uses keccak256
        //  if (hashFunction === '0x6f357c6a') {
        // download the json file
        // console.log(`-------------`,web3.utils.hexToUtf8(url).replace('ipfs://', '').replace('://', ''))
        const json = await getIPFS(web3.utils.hexToUtf8(url).replace('ipfs://', '').replace('://', ''))
        return json
      })
  } catch (error) {
    console.log(error)
    return []
  }
}

export function AuthProvider({ children }) {
  const [provider, setProvider] = useState()
  const [wallet, setWallet] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState()
  const [balance, setBalance] = useState(0)
  const web3 = new Web3(process.env.NEXT_PUBLIC_RPC_URL)

  const isWalletConnected = async () => {
    const web3 = new Web3(window.lukso)
    try {
      let accounts = await web3.eth.getAccounts()
      return accounts[0]
    } catch (error) {
      toast.error(error.message)
    }
  }
  const getBalance = async (wallet) => {
    const balance = await web3.eth.getBalance(wallet)
    return parseFloat(web3.utils.fromWei(balance, `ether`)).toFixed(2)
  }

  const connect = async () => {
    const web3 = new Web3(window.lukso)
    let t = toast.loading('Loading...', `loading`)

    try {
      let accounts = await web3.eth.getAccounts()
      if (accounts.length === 0) await web3.eth.requestAccounts()
      accounts = await web3.eth.getAccounts()

      getBalance(accounts[0]).then((balance) => setBalance(balance))
      //console.log(accounts)
      setWallet(accounts[0])
      fetchProfile(accounts[0]).then((res) => {
        console.log(res)
        setProfile(res)
      })

      toast(`UP successfuly connected`, `success`)
      toast.dismiss(t)
      return accounts[0]
    } catch (error) {
      toast(`The provider could not be found.`, `error`)
    }
  }

  useEffect(() => {
    setStatus(`loading`)
    setProvider(process.env.NEXT_PUBLIC_RPC_URL || window.lukso || window.ethereum)

    isWalletConnected().then((account) => {
      if (account !== undefined) {
        setWallet(account)
        getBalance(account).then((balance) => setBalance(balance))
        localStorage.setItem(`wallet`, account)
        setLoading(false)
        fetchProfile(account).then((res) => {
          setProfile(res)
          setStatus(``)
        })
      }
      setLoading(false)
      setStatus(``)
    })
  }, [])

  const value = {
    status,
    loading,
    provider,
    wallet,
    balance,
    setWallet,
    profile,
    getIPFS,
    fetchProfile,
    setProfile,
    isWalletConnected,
    connect,
  }

  if (loading) return <Loading />
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
