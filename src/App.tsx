import { useEffect, useState } from 'react'
import { AddCar } from './components/AddCar'
import { Agenda } from './components/Agenda'
import { CarPage } from './components/CarPage'
import { Garage } from './components/Garage'
import { IconCalendar, IconGarage, IconPlus } from './components/Icons'

function useHash() {
  const [hash, setHash] = useState(() => location.hash.slice(1))
  useEffect(() => {
    const on = () => setHash(location.hash.slice(1))
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const [path, query = ''] = hash.split('?')
  const [route, param] = path.replace(/^\//, '').split('/')
  const openTask = new URLSearchParams(query).get('task') ?? undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route, param])

  let page
  if (route === 'car' && param) page = <CarPage id={param} openTask={openTask} />
  else if (route === 'add') page = <AddCar />
  else if (route === 'agenda') page = <Agenda />
  else page = <Garage />

  const tab = route === 'agenda' ? 'agenda' : route === 'add' ? 'add' : 'garage'

  return (
    <div className="app">
      <main className="page" key={route + (param ?? '')}>{page}</main>
      {route !== 'add' && (
        <nav className="tabbar" aria-label="Main">
          <a href="#/" className={tab === 'garage' ? 'active' : ''}>
            <IconGarage />
            <span>Garage</span>
          </a>
          <a href="#/add" className="tab-add" aria-label="Add a car">
            <IconPlus />
          </a>
          <a href="#/agenda" className={tab === 'agenda' ? 'active' : ''}>
            <IconCalendar />
            <span>Agenda</span>
          </a>
        </nav>
      )}
    </div>
  )
}
