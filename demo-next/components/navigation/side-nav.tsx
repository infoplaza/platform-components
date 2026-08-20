const NAV_ITEMS = [
  {
    href: '/',
    label: 'Map viewer',
    hint: 'BaseMap, weather layers and HUD',
  },
]

export function SideNav() {
  return (
    <nav className="side-nav" aria-label="Demo views">
      <p className="side-nav__section">Views</p>
      <ul className="side-nav__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <a className="side-nav__item side-nav__item--active" href={item.href}>
              <span className="side-nav__item-label">{item.label}</span>
              <span className="side-nav__item-hint">{item.hint}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="side-nav__footer">
        <p>
          Layers load through <code>/api/platform</code> from the built{' '}
          <code>dist</code> package.
        </p>
      </div>
    </nav>
  )
}
