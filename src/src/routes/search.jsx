import { useState, useEffect } from 'react'
import { useLoaderData, defer, Form, Await, useRouteError, Link, useNavigate } from 'react-router-dom'
import { useAuth, contracts, getDefaultChain } from '../contexts/AuthContext'
import { getPoint } from '../util/api'
import { Title } from './helper/DocumentTitle'
import Icon from './helper/MaterialIcon'
import Logo from './../../src/assets/logo.svg'
import Web3 from 'web3'
import styles from './Search.module.scss'
import Loading from './components/Loading'

export default function Search({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState({ point: [] })
  const [taotlRecordType, setTotalRecordType] = useState(0)
  const [totalResolve, setTotalResolve] = useState(0)
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

  const getMintPrice = async () => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.fee(`mint_price`).call()
  }
  const getDataForTokenId = async (tokenId) => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.getDataForTokenId(`${tokenId}`, '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e').call()
  }
  const getTokenIds = async (addr) => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.tokenIdsOf(addr).call()
  }
  const getDataBatchForTokenIds = async (tokenIds, dataKeys) => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.getDataBatchForTokenIds(tokenIds, dataKeys).call()
  }
  const getTotalResolve = async () => await contract.methods._resolveCounter().call()
  const getResolveList = async (wallet) => await contract.methods.getDomainList(wallet).call()
  const getTotalSupply = async () => await contract.methods.totalSupply().call()
  const getCouncilMintExpiration = async () => await contract.methods.councilMintExpiration().call()
  const getMaxSupply = async () => await contract.methods.MAX_SUPPLY().call()

  useEffect(() => {
    setIsLoading(true)
    getPoint().then(async (res) => {
      setData({ point: res })
      setIsLoading(false)
    })
  }, [])

  // if (isLoading) return <Loading />

  return (
    <section className={`${styles.section}  ms-motion-slideUpIn p-relative d-f-c`}>
      <div className={`${styles['container']} __container d-flex flex-column align-items-center justify-content-center`} data-width={`small`}>
        
        <div className={`${styles['pageTitle']}`}>
          {title} <span>Poll</span>
        </div>

        <div className={`card w-100`}>
          <div className={`card__body`}>
            <form action="" className={`w-100 d-flex flex-column align-items-center justify-content-between`}>
            <input type={`text`} name={``} id={``} placeholder={`Enter the poll id`} />
            <button>Search</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
