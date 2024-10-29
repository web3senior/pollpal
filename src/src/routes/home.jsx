import { Suspense, useState, useEffect, useRef, createElement } from 'react'
import { useLoaderData, defer, Form, Await, useRouteError, Link, useNavigate } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import Icon from './helper/MaterialIcon'
import Shimmer from './helper/Shimmer'
import { getTournamentList } from './../util/api'
import toast, { Toaster } from 'react-hot-toast'
import Heading from './helper/Heading'
import { useAuth, contracts, getDefaultChain } from './../contexts/AuthContext'
import Logo from './../../src/assets/logo.svg'
import UniversalProfileIcon from './../../src/assets/universal-profile-icon.svg'
import party from 'party-js'
import styles from './Home.module.scss'
import Web3 from 'web3'
import Loading from './components/Loading'

party.resolvableShapes['logo'] = `<img src="${Logo}" style='width:24px'/>`

let isMouseDown = false
export const loader = async () => {
  return defer({ key: 'val' })
}

function Home({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [isLoading, setIsLoading] = useState(true)
  const [showArtboard, setShowArtboard] = useState(false)
  const [color, setColor] = useState(``)
  const [tapCounter, setTapCounter] = useState(0)
  const [description, setDescription] = useState(``)
  const [count, setCount] = useState(1)
  const [selectedFile, setSelectedFile] = useState()
  const [stage1Token, setStage1Token] = useState([])
  const [layer, setLayer] = useState({ layers: [] })
  const auth = useAuth()
  const SVG = useRef()
  const navigate = useNavigate()
  const txtSearchRef = useRef()
  const SVGpreview = useRef()
  let selectedElement, offset
  const [isPageLoading, setIsPageLoading] = useState(true)
  const handleSearch = async () => {
    if (txtSearchRef.current.value.length < 3) {
      toast.error(`A name must be a minimum of 3 characters long.`)
      return
    }

    const t = toast.loading(`Searching`)

    contract.methods
      .toNodehash(txtSearchRef.current.value, selectedRecordType)
      .call()
      .then(async (res) => {
        console.log(res)
        await contract.methods
          ._freeToRegister(res)
          .call()
          .then((res) => {
            console.log(res)
            setFreeToRegister(!res)
            toast.dismiss(t)
          })
      })
  }

  const fetchIPFS = async (CID) => {
    try {
      const response = await fetch(`https://api.universalprofile.cloud/ipfs/${CID}`)
      if (!response.ok) throw new Response('Failed to get data', { status: 500 })
      const json = await response.json()
      // console.log(json)
      return json
    } catch (error) {
      console.error(error)
    }

    return false
  }

  const getMintPrice = async () => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.fee(`mint_price`).call()
  }

  const rAsset = async (imageURL) => {
    const assetBuffer = await fetch(imageURL).then(async (response) => {
      return response.arrayBuffer().then((buffer) => new Uint8Array(buffer))
    })

    return assetBuffer
  }

  const copy = async () => {
    document.querySelectorAll(`#artboardSVG rect`).forEach((item) => {
      let modified = item.getAttribute(`modified`)
      if (modified === false) {
        item.style.fill = `transparent`
      }
    })
    try {
      const type = 'text/plain'
      const blob = new Blob([document.querySelector(`#artboardSVG`).outerHTML], { type })
      const data = [new ClipboardItem({ [type]: blob })]
      await navigator.clipboard.write(data)
      toast(`Copied`)
    } catch (error) {
      console.error(error.message)
    }
  }

  const download = () => {
    document.querySelectorAll(`.${styles['board']} rect`).forEach((item) => {
      let modified = item.getAttribute(`modified`)
      if (!modified) {
        // item.remove()
        item.style.fill = `transparent`
      }
    })
    const htmlStr = document.querySelector(`#artboardSVG`).outerHTML
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('download', 'Masterpix.svg')
    a.setAttribute('href', url)
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const updatePreview = () => {
    // Update
    SVGpreview.current.innerHTML = SVG.current.innerHTML
    // ToDo: reading in page load doesnt work, need to add events to each rect.
    localStorage.setItem(`svg`, SVG.current.innerHTML)
  }

  const add = () => {
    if (layer.layers.filter((item) => item === `artboardLayer`).length > 0) {
      toast.error(`The artboard has already been created.`)
      return
    }
    setShowArtboard(true)
    rect()
    toast.success(`Artboard has been created`, { icon: `🖌️` })
    localStorage.removeItem(`draw`)
    updatePreview()
  }

  const draw = (e) => {
    let color = document.querySelector(`input[type='color']`).value
    if (e.button === 2) {
      color = `transparent` //e.target.getAttribute(`default-color`)
      isMouseDown = false
      e.target.setAttribute(`modified`, false)
    }
    if (e.button === 0 && isMouseDown && e.type === `mouseenter`) {
      e.target.style.fill = color || `red`
      e.target.setAttribute(`modified`, e.button === 2 ? false : true)
    } else if ((e.button === 0 && e.type === `click`) || e.type === `mousedown`) {
      e.target.style.fill = color || `red`
      e.target.setAttribute(`modified`, e.button === 2 ? false : true)
    }

    // Save draw
    const innerSVG = SVG.innerHTML
    localStorage.setItem(`draw`, innerSVG)

    // Update preview
    updatePreview()
  }

  const clear = () => {
    document.querySelectorAll(`.${styles['board']} rect`).forEach((item) => {
      item.style.fill = item.getAttribute(`default-color`)
      item.setAttribute(`modified`, false)
    })
    toast.success(`Artboard has been cleared`, { icon: `🧹` })

    // Update preview
    updatePreview()
  }

  const rect = () => {
    //document.querySelector(`#artboardSVG`).innerHTML = ''
    const countX = document.querySelector(`#x`).value
    const countY = document.querySelector(`#y`).value
    let width = 400 / countX
    let height = 400 / countY
    let colors = [`#F1F1F1`, `#D9D9D9`]
    let colorIndex = false
    console.log(`Width: ${width} | Height: ${height}`)

    const svgns = 'http://www.w3.org/2000/svg'
    const group = document.createElementNS(svgns, 'g')
    group.setAttribute('name', `artboardLayer`)
    setLayer({ layers: [...layer.layers, `artboardLayer`] })

    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        let rect = document.createElementNS(svgns, 'rect')
        rect.setAttribute('x', x * width)
        rect.setAttribute('y', y * height)
        rect.setAttribute('height', height)
        rect.setAttribute('width', width)
        rect.setAttribute('fill', colorIndex ? colors[0] : colors[1])
        rect.setAttribute('default-color', colorIndex ? colors[0] : colors[1])
        rect.onmouseenter = (e) => draw(e)
        rect.onmousedown = (e) => draw(e)

        group.appendChild(rect)
        // stroke={`red`} strokeOpacity={0.1} strokeWidth={1} key={`x${x}y${y}`}
        colorIndex = !colorIndex
      }
      colorIndex = !colorIndex
    }
    // Add rect group to SVG
    SVG.current.appendChild(group)
  }

  const changeHandler = (e) => {
    setSelectedFile(event.target.files[0])
  }

  const tokenURI = async () => {
    if (selectedFile) {
      try {
        const t = toast.loading(`Uploading to IPFS`)
        const upload = await pinata.upload.file(selectedFile)
        console.log(upload)
        toast.dismiss(t)
        return upload.IpfsHash
      } catch (error) {
        console.log(error)
      }
    } else {
      document.querySelectorAll(`.${styles['board']} rect`).forEach((item) => {
        let modified = item.getAttribute(`modified`)
        if (!modified) {
          // item.remove()
          item.style.fill = `transparent`
        }
      })

      const htmlStr = document.querySelector(`.${styles['board']} svg`).outerHTML
      const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)

      try {
        const t = toast.loading(`Uploading to IPFS`)
        const file = new File([blob], 'test.svg', { type: blob.type })
        const upload = await pinata.upload.file(file)
        console.log(upload)
        toast.dismiss(t)
        return upload.IpfsHash
      } catch (error) {
        console.log(error)
      }
    }
    //  })
    // const svg = `${document.querySelector(`#artboardSVG`).outerHTML}`;
    // console.log(svg)
    // return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  }

  const mint = async () => {
    if (document.querySelector(`#artboardSVG`).innerHTML === '' && selectedFile === undefined) {
      toast.error(`Please draw or choose a file`)
      return false
    }

    if (!auth.wallet) {
      auth.connectWallet()
      return
    }

    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const t = toast.loading(`Waiting for transaction's confirmation`)
    try {
      const imageUrl = await tokenURI()
      let rawMetadata

      if (auth.defaultChain === 'LUKSO') {
        const tConvert = toast.loading(`Generating metadata, takes two minutes...please wait`)
        rAsset(`https://ipfs.io/ipfs/${imageUrl}`).then((result) => {
          toast.dismiss(tConvert)
          console.log(result)
          console.log(`Verifiable URL`, web3.utils.keccak256(result))
          rawMetadata = web3.utils.toHex({
            LSP4Metadata: {
              name: assetname,
              description: `${description}`,
              links: [
                { title: 'Website', url: 'https://masterpix.art/' },
                { title: 'Mint', url: 'https://masterpix.art/' },
                { title: '𝕏', url: 'https://x.com/ArattaLabsDev' },
                { title: 'Telegram', url: 'https://t.me/arattalabs' },
              ],
              attributes: [{ key: 'Version', value: 1 }],
              icon: [{ width: 500, height: 500, url: 'ipfs://QmWpSVntG9Mmk9CHczf9ZACKDTuQMVUedEDcCdwwbqBs9b', verification: { method: 'keccak256(bytes)', data: '0xe303725c7fa6e0c8741376085a3859d858eb4d188afa6402bb39d34f40e5ed3f' } }],
              backgroundImage: [
                {
                  width: 1601,
                  height: 401,
                  url: 'ipfs://QmcTYAQmt7ZPbzR6w3XXzGwgfEu4zU2T4LLukqLBvJg2Eg',
                  verification: {
                    method: 'keccak256(bytes)',
                    data: '0x0fd8498ada7a39b1eb9f6ed54adc8950a84d5d79ad8418eb46fbcaf6a5c9638b',
                  },
                },
              ],
              assets: [],
              images: [[{ width: 500, height: 500, url: `ipfs://${imageUrl}`, verification: { method: 'keccak256(bytes)', data: web3.utils.keccak256(result) } }]],
            },
          })

          // mint
          const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
          contract.methods
            .mint(rawMetadata, count)
            .send({
              from: auth.wallet,
              value: web3.utils.toWei(1, `ether`),
            })
            .then((res) => {
              console.log(res) //res.events.tokenId

              // Run partyjs
              party.confetti(document.querySelector(`header`), {
                count: party.variation.range(20, 40),
                shapes: ['logo'],
              })

              toast.success(`Transaction has been confirmed! Check out your NFTs`)
              toast.dismiss(t)
            })
            .catch((error) => {
              console.log(error)
              toast.dismiss(t)
            })
        })
      } else if (auth.defaultChain === 'Arbitrum') {
        const json = { name: assetname, description: description, image: `https://ipfs.io/ipfs/${imageUrl}`, version: '1' }
        rawMetadata = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(json))))

        // mint
        const contract = new web3.eth.Contract(contracts[1].abi, contracts[1].contract_address)
        contract.methods
          .mint(rawMetadata, count)
          .send({
            from: auth.wallet,
            value: web3.utils.toWei(1, `ether`),
          })
          .then((res) => {
            console.log(res) //res.events.tokenId

            // Run partyjs
            party.confetti(document.querySelector(`header`), {
              count: party.variation.range(20, 40),
              shapes: ['logo'],
            })

            toast.success(`Transaction has been confirmed! Check out your NFTs`)
            toast.dismiss(t)
          })
          .catch((error) => {
            console.log(error)
            toast.dismiss(t)
          })
      }
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  function getMousePosition(evt) {
    var CTM = SVG.current.getScreenCTM()
    if (evt.touches) {
      evt = evt.touches[0]
    }
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d,
    }
  }

  const deleteLayer = (groupName) => {
    SVG.current.querySelector(`SVG [name="${groupName}"]`).remove()
    setLayer({ layers: [...layer.layers.filter((item) => item !== groupName)] })

    // Update preview
    updatePreview()
  }

  const changeScale = (e, groupName) => {
    SVG.current.querySelector(`SVG [name="${groupName}"]`).setAttribute('transform', `scale(${e.target.value})`)
    // Update preview
    updatePreview()
  }

  const changeDimension = (e, type, groupName) => {
    let elem,
      value = e.target.value

    if (groupName === `artboardLayer`) elem = SVG.current.querySelector(`SVG [name="${groupName}"]`)
    else elem = SVG.current.querySelector(`SVG [name="${groupName}"] image`)

    if (type === `width`) elem.setAttribute(`width`, value)
    else if (type === `height`) elem.setAttribute(`height`, value)

    // Update preview
    updatePreview()
  }

  const addLayer = (url, name) => {
    // Conver image URL/ IPFS CID to blob
    fetch(`${url}`)
      .then((response) => response.blob())
      .then((blob) => {
        // const url = URL.createObjectURL(blob)

        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = function () {
          const base64data = reader.result

          const svgns = 'http://www.w3.org/2000/svg'
          const group = document.createElementNS(svgns, 'g')
          group.setAttribute('name', `${name}Layer${layer.layers.length + 1}`)
          setLayer({ layers: [...layer.layers, `${name}Layer${layer.layers.length + 1}`] })

          const image = document.createElementNS(svgns, 'image')
          let draggable = false
          image.setAttribute('href', base64data)
          image.setAttribute('width', 400)
          image.setAttribute('height', 400)
          image.setAttribute('x', 0)
          image.setAttribute('y', 0)
          image.style.cursor = `move`
          image.addEventListener(`mousedown`, (evt) => startDrag(evt, image))
          image.addEventListener(`mousemove`, (evt) => drag(evt, image))
          image.addEventListener(`mouseup`, (evt) => endDrag(evt, image))
          image.addEventListener(`mouseleave`, (evt) => endDrag(evt, image))

          // Add image to SVG
          group.appendChild(image)
          SVG.current.appendChild(group)

          // SVGJS(group)

          // Update preview
          updatePreview({ layers: [...layer.layers, `${name}Layer${layer.layers.length + 1}`] })
        }
      })
  }

  const startDrag = (evt, image) => {
    selectedElement = evt
    offset = getMousePosition(evt)
    offset.x -= parseFloat(image.getAttributeNS(null, 'x'))
    offset.y -= parseFloat(image.getAttributeNS(null, 'y'))
  }

  const drag = (evt, image) => {
    if (selectedElement) {
      var coord = getMousePosition(evt)
      image.setAttributeNS(null, 'x', coord.x - offset.x)
      image.setAttributeNS(null, 'y', coord.y - offset.y)
    }

    // Update preview
    updatePreview()
  }

  const endDrag = (evt, image) => {
    selectedElement = ''
    console.log(`endDrag`)

    // Update preview
    updatePreview()
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

  const handleTap = (e) => {
    setTapCounter((oldVal) => oldVal + 1)
    const parent = document.querySelector(`#tap`)
    const drop = document.createElement('span')
    console.log(parent.getBoundingClientRect())
    drop.classList.add(`${styles.drop}`)
    console.log(e.clientX, e.clientY)
    drop.style.left = `${e.clientX - parent.getBoundingClientRect()['left']}px`
    drop.style.top = `${e.clientY - parent.getBoundingClientRect()['top']}px`
    parent.appendChild(drop)
    if ('vibrate' in navigator) navigator.vibrate(200)

    setTimeout(() => {
      drop.remove()
    }, 2500)
  }

  useEffect(() => {
    // getMintPrice().then((res) => console.log(res))
    // Restore prev draw
    // const innerSVG = document.querySelector(`.${styles['board']} svg`).innerHTML
    // if (localStorage.getItem(`draw`)) {
    //   setArtboard({x:})
    // }
    // Generate unique ID for the current device
    localStorage.setItem(`UUID`, crypto.randomUUID())
    setTimeout(() => {
      setIsPageLoading(false)
    }, 1000)
  }, [])
  // if (isPageLoading) return <Loading />
  return (
    <section className={`${styles.section} ms-motion-slideDownIn`}>
      <div className={`${styles.section__container} __container`} data-width={`large`}>
        <div className={`d-f-c flex-column mt-50`}>
          <h1>{import.meta.env.VITE_SLOGAN}</h1>
          <h1>
            Built on <span style={{ color: `#FE005B` }}>LUKSO</span>
          </h1>

          <ul className={`d-f-c`}>
            <li className="d-flex">
              <Icon name={`how_to_vote`} />
              <Link to={`submit`}>Submit poll</Link>
            </li>
            <li className="d-flex">
              <Icon name={`add_circle`} />
              <Link to={`submit`}>Create poll</Link>
            </li>
          </ul>
        </div>

        <p className={`ms-fontWeight-semibold`}>New polls</p>
        <div className={`card`}>
          <div className={`card__body`}>asdf</div>
        </div>

        <p className={`ms-fontWeight-semibold`}>Recently voted</p>
        <div className={`card`}>
          <div className={`card__body`}>asdf</div>
        </div>

        <div className={`text-center mt-100`}>
          <h1>Decentralized Voting</h1>
          <p>Create polls that matter. Share your voice with the world. Trust in the power of decentralized voting</p>
          <div class="ms-Grid mt-100" dir="ltr">
          <div class="ms-Grid-row">
              <div className={`ms-Grid-col ms-sm12 ms-md4 ms-lg8`}>
                <div className={`card ${styles['universal-profile']}`}>
                  <div className={`card__body`}>

                    <div className={`${styles['universal-profile-slider']}`}>
<div />
<div />
<div/>

<div />
<div />
                    </div>
                    <b>Your Digital Identity, Your Vote</b>
                    <p>Elevate your polling experience with Universal Profiles.</p>
                  </div>
                </div>
              </div>

              <div class="ms-Grid-col ms-sm6 ms-md8 ms-lg4">
                <div className={`card ${styles['universal-profile']}`}>
                  <div className={`card__body`}>
                    <b>Your Exclusive Voting Circle</b>
                    <p>Create private polls and invite specific individuals to participate.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="ms-Grid-row">
            <div class="ms-Grid-col ms-sm6 ms-md8 ms-lg4">
                <div className={`card ${styles['universal-profile']}`}>
                  <div className={`card__body`}>
                    <b>Your Exclusive Voting Circle</b>
                    <p>Create private polls and invite specific individuals to participate.</p>
                  </div>
                </div>
              </div>

              <div class="ms-Grid-col ms-sm6 ms-md8 ms-lg4">
                <div className={`card ${styles['universal-profile']}`}>
                  <div className={`card__body`}>
                    <b>Your Exclusive Voting Circle</b>
                    <p>Create private polls and invite specific individuals to participate.</p>
                  </div>
                </div>
              </div>

              <div class="ms-Grid-col ms-sm6 ms-md8 ms-lg4">
                <div className={`card ${styles['universal-profile']}`}>
                  <div className={`card__body`}>
                    <b>Your Exclusive Voting Circle</b>
                    <p>Create private polls and invite specific individuals to participate.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
