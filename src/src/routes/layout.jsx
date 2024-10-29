import { useEffect, useState } from 'react'
import { Outlet, useLocation, Link, NavLink, useNavigate, useNavigation, ScrollRestoration } from 'react-router-dom'
import ConnectPopup from './components/ConnectPopup'
import { Toaster } from 'react-hot-toast'
import { useAuth, chain, getDefaultChain } from './../contexts/AuthContext'
import MaterialIcon from './helper/MaterialIcon'
import Icon from './helper/MaterialIcon'
import Logo from './../../src/assets/logo.svg'
import LogoIcon from './../../src/assets/logo.svg'
import Loading from './components/Loading'
import XIcon from './../../src/assets/icon-x.svg'
import CGIcon from './../../src/assets/icon-cg.svg'
import GitHubIcon from './../../src/assets/icon-github.svg'
import MenuIcon from './../../src/assets/menu-icon.svg'
import party from 'party-js'
import styles from './Layout.module.scss'

party.resolvableShapes['LogoIcon'] = `<img src="${LogoIcon}" style="width:24px"/>`

const links = [
  {
    name: 'Home',
    icon: null,
    target: ``,
    path: ``,
  },
  {
    name: 'Submit Vote',
    icon: null,
    target: ``,
    path: `submit`,
  },
  {
    name: 'Create Poll',
    icon: null,
    target: ``,
    path: `create`,
  },
  {
    name: 'About',
    icon: null,
    target: ``,
    path: `about`,
  },
]

export default function Root() {
  const [network, setNetwork] = useState()
  const [isLoading, setIsLoading] = useState()
  const auth = useAuth()

  const showNetworkList = () => document.querySelector(`.${styles['network-list']}`).classList.toggle(`d-none`)

  /**
   * Selected chain
   * @returns
   */
  const SelectedChain = () => {
    const filteredChain = chain.filter((item, i) => item.name === getDefaultChain())
    return <img alt={`${filteredChain[0].name}`} src={`${filteredChain[0].logo}`} title={`${filteredChain[0].name}`} />
  }

  const handleOpenNav = () => {
    document.querySelector('#modal').classList.toggle('open')
    document.querySelector('#modal').classList.toggle('blur')
    document.querySelector('.cover').classList.toggle('showCover')
  }

  useEffect(() => {}, [])

  return (
    <>
      <Toaster />
      <ScrollRestoration />

      <header className={`${styles.header} ms-depth-4`}>
        <div className={`${styles.header__container} __container d-flex flex-row align-items-center justify-content-between h-100`} data-width={`xxxlarge`}>
          {/* Logo */}
          <Link to={`/`}>
            <div className={`${styles['logo']} d-flex align-items-center`}>
              <img alt={import.meta.env.VITE_TITLE} src={Logo} className={`rounded`} />
              <figcaption>{import.meta.env.VITE_NAME}</figcaption>
              <figure>
                <img src={MenuIcon} className={`${styles['logo__nav']} ms-hiddenLgUp`} onClick={() => handleOpenNav()} />
              </figure>
            </div>
          </Link>

          {/* Menu */}
          <ul className={`${styles['menu']} d-flex flex-row align-items-center justify-content-start`}>
            {links.map((item, i) => {
              return (
                <li key={i}>
                  <NavLink to={item.path} target={item.target}>
                    {item.name}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          {/* Connect */}
          <div className={`d-flex flex-row align-items-center justify-content-end`} style={{ columnGap: `.3rem` }}>
            <div className={`${styles['network']} d-flex align-items-center justify-content-end`} onClick={() => showNetworkList()}>
              {auth.defaultChain && <SelectedChain />}
            </div>

            {!auth.wallet ? (
              <>
                <button
                  className={styles['connect-button']}
                  onClick={(e) => {
                    party.confetti(document.querySelector(`header`), {
                      count: party.variation.range(20, 40),
                      shapes: ['LogoIcon'],
                    })
                    auth.connectWallet()
                  }}
                >
                  Connect
                </button>
              </>
            ) : (
              <Link to={`user/dashboard`} className={`${styles['profile']} d-f-c user-select-none`}>
                <div className={`${styles['profile__wallet']} d-f-c`}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <circle cx="12" cy="12" fill="#FF89341F" r="12"></circle>
                      <g transform="translate(4, 4) scale(0.3333333333333333)">
                        <path
                          clipRule="evenodd"
                          d="M24 0C26.2091 0 28 1.79086 28 4V10.7222C28 12.0586 29.6157 12.7278 30.5607 11.7829L35.314 7.02948C36.8761 5.46739 39.4088 5.46739 40.9709 7.02948C42.533 8.59158 42.533 11.1242 40.9709 12.6863L36.2179 17.4393C35.2729 18.3843 35.9422 20 37.2785 20H44C46.2091 20 48 21.7909 48 24C48 26.2091 46.2091 28 44 28H37.2783C35.9419 28 35.2727 29.6157 36.2176 30.5607L40.9705 35.3136C42.5326 36.8756 42.5326 39.4083 40.9705 40.9704C39.4084 42.5325 36.8758 42.5325 35.3137 40.9704L30.5607 36.2174C29.6157 35.2724 28 35.9417 28 37.2781V44C28 46.2091 26.2091 48 24 48C21.7909 48 20 46.2091 20 44V37.2785C20 35.9422 18.3843 35.2729 17.4393 36.2179L12.6866 40.9706C11.1245 42.5327 8.59186 42.5327 7.02977 40.9706C5.46767 39.4085 5.46767 36.8759 7.02977 35.3138L11.7829 30.5607C12.7278 29.6157 12.0586 28 10.7222 28H4C1.79086 28 0 26.2091 0 24C0 21.7909 1.79086 20 4 20L10.7219 20C12.0583 20 12.7275 18.3843 11.7826 17.4393L7.02939 12.6861C5.46729 11.124 5.4673 8.59137 7.02939 7.02928C8.59149 5.46718 11.1241 5.46718 12.6862 7.02928L17.4393 11.7824C18.3843 12.7273 20 12.0581 20 10.7217V4C20 1.79086 21.7909 0 24 0ZM24 33C28.9706 33 33 28.9706 33 24C33 19.0294 28.9706 15 24 15C19.0294 15 15 19.0294 15 24C15 28.9706 19.0294 33 24 33Z"
                          fill="#FF8934"
                          fillRule="evenodd"
                        ></path>
                      </g>
                    </g>
                  </svg>
                  <b>{auth.wallet && `${auth.wallet.slice(0, 4)}...${auth.wallet.slice(38)}`}</b>
                </div>
              </Link>
            )}

            <div className={`${styles['network-list']} ms-depth-4 d-none`}>
              <ul>
                {auth.defaultChain &&
                  chain.length > 0 &&
                  chain.map((item, i) => {
                    return (
                      <li
                        key={i}
                        onClick={() => {
                          localStorage.setItem(`defaultChain`, item.name)
                          auth.setDefaultChain(item.name)
                          showNetworkList()
                          auth.isWalletConnected().then((addr) => {
                            auth.setWallet(addr)
                          })
                        }}
                      >
                        <figure className={`d-flex flex-row align-items-center justify-content-start`} style={{ columnGap: `.5rem` }}>
                          <img alt={`${item.name}`} src={item.logo} />
                          <figcaption>{item.name}</figcaption>
                          {item.name === auth.defaultChain && <Icon name={`check`} style={{ marginLeft: `auto`, color: `var(--color-primary)` }} />}
                        </figure>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>
        </div>
      </header>

      <main className={`${styles.main}`}>
        <Outlet />
      </main>

      <footer className={`${styles.footer}`}>
        <ul className={`d-flex align-items-center justify-content-around`}>
          <li>
            <NavLink to={`/`} className={({ isActive, isPending }) => (isPending ? 'pending' : isActive ? `${styles.active}` : '')}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M180-140v-450l300-225.77L780-590v450H556.15v-267.69h-152.3V-140H180Z"/></svg>
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={`submit`} className={({ isActive, isPending }) => (isPending ? 'pending' : isActive ? `${styles.active}` : '')}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M207.69-95.39q-30.3 0-51.3-21-21-21-21-51.3v-155.08l105.38-118.46 42.77 42.77-83.85 93.85h560.62l-82.62-92.62L720.46-440l104.15 117.23v155.08q0 30.3-21 51.3-21 21-51.3 21H207.69Zm222.08-298.23-129-131q-21.08-21.07-20.88-51.42.19-30.34 21.27-51.42l185.61-185.62q21.08-21.07 51.23-21.07t51.23 21.07l130.61 129.39q21.08 21.08 21.39 50.92.31 29.85-20.77 50.92L531.61-393q-21.07 21.08-50.92 20.77-29.84-.31-50.92-21.39Zm247.54-230.61q3.07-3.08 3.07-8.85t-3.07-8.84L546.85-771.15q-3.08-3.08-8.85-3.08t-8.85 3.08L342.31-584.31q-3.08 3.08-3.08 8.85t3.08 8.85l130.46 129.23q3.08 3.07 8.85 3.07t8.84-3.07l186.85-186.85Z"/></svg>
              <span>Submit</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={`create`} className={({ isActive, isPending }) => (isPending ? 'pending' : isActive ? `${styles.active}` : '')}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M450-290h60v-160h160v-60H510v-160h-60v160H290v60h160v160Zm30.07 190q-78.84 0-148.21-29.92t-120.68-81.21q-51.31-51.29-81.25-120.63Q100-401.1 100-479.93q0-78.84 29.92-148.21t81.21-120.68q51.29-51.31 120.63-81.25Q401.1-860 479.93-860q78.84 0 148.21 29.92t120.68 81.21q51.31 51.29 81.25 120.63Q860-558.9 860-480.07q0 78.84-29.92 148.21t-81.21 120.68q-51.29 51.31-120.63 81.25Q558.9-100 480.07-100Z"/></svg>
              <span>Create</span>
            </NavLink>
          </li>
        </ul>
      </footer>
    </>
  )
}
