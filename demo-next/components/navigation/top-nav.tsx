export function TopNav() {
  return (
    <div className="top-nav">
      <a className="top-nav__brand" href="/">
        <span className="top-nav__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M4 16.5 12 6l8 10.5H4Z"
              fill="currentColor"
              opacity="0.35"
            />
            <path d="M6.5 19 12 11.5 17.5 19H6.5Z" fill="currentColor" />
          </svg>
        </span>
        <span className="top-nav__titles">
          <span className="top-nav__name">Infoplaza</span>
          <span className="top-nav__product">Platform Components</span>
        </span>
      </a>
      <span className="top-nav__badge">Next.js demo</span>
    </div>
  )
}
