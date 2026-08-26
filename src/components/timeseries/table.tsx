import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
} from 'react'
import { IpInfoCircle } from '@/src/components/icons'
import { twMerge } from '@/src/utilities/external/twMerge'
import { TIMESERIES_CELL_VIEWS } from './cells/registry'
import { ScrollSyncPane } from './scroll-sync'
import type { TimeseriesDirectionView, TimeseriesTableProps } from './types'
import {
  DEFAULT_DIRECTION_VIEW,
  formatHeaderDate,
  isWithinCurrentHour,
} from './utils'

const DEFAULT_HEADER_FORMAT = ['EEEEEE d MMM', 'HH']
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

type HeaderCell = {
  timestamp: number
  text: string
  cols: number
}

export default function TimeseriesTable({
  rows,
  hiddenRows = [],
  locale = 'en',
  timezone = null,
  timestamp = null,
  timestamps = [],
  onTimestampChange,
  title,
  titleExtra,
  subtitle,
  headerFormat = DEFAULT_HEADER_FORMAT,
  scrollToCurrentTime = false,
  hideEmptyRows = false,
  scrollbar = true,
  views,
  getIconSrc,
  directionView,
  onDirectionViewChange,
}: TimeseriesTableProps) {
  const [scrolled, setScrolled] = useState(false)
  const [dragScrolling, setDragScrolling] = useState(false)
  const [showHidden, setShowHidden] = useState(
    rows.length === 0 && hiddenRows.length > 0,
  )
  const [uncontrolledDirectionView, setUncontrolledDirectionView] =
    useState<TimeseriesDirectionView>(
      directionView ?? DEFAULT_DIRECTION_VIEW,
    )
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const dragState = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
    pointerId: null as number | null,
  })

  const resolvedDirectionView = directionView ?? uncontrolledDirectionView
  const changeDirectionView =
    onDirectionViewChange ?? setUncontrolledDirectionView

  const cellViews = useMemo(
    () => ({ ...TIMESERIES_CELL_VIEWS, ...views }),
    [views],
  )

  const populatedRows = useMemo(
    () => rows.filter((row) => (row.data ?? []).length > 0),
    [rows],
  )

  const headerRows = useMemo(() => {
    const sample = populatedRows.find((row) => row.data.length > 0)?.data
    if (!sample) {
      return [] as HeaderCell[][]
    }

    return headerFormat.map((format) => {
      const headers: HeaderCell[] = []
      sample.forEach((cell) => {
        const text = formatHeaderDate(cell.timestamp, format, locale, timezone)
        const previous = headers[headers.length - 1]
        if (previous && previous.text === text) {
          previous.cols += 1
          return
        }
        headers.push({ timestamp: cell.timestamp, text, cols: 1 })
      })
      return headers
    })
  }, [populatedRows, headerFormat, locale, timezone])

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrolled(event.currentTarget.scrollLeft > 0)
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) {
        return
      }
      const el = event.currentTarget
      dragState.current = {
        active: true,
        moved: false,
        startX: event.clientX,
        startScrollLeft: el.scrollLeft,
        pointerId: event.pointerId,
      }
      el.setPointerCapture(event.pointerId)
      setDragScrolling(true)
    },
    [],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = dragState.current
      if (!state.active || state.pointerId !== event.pointerId) {
        return
      }
      const dx = event.clientX - state.startX
      if (!state.moved && Math.abs(dx) < 4) {
        return
      }
      state.moved = true
      event.currentTarget.scrollLeft = state.startScrollLeft - dx
    },
    [],
  )

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = dragState.current
      if (!state.active || state.pointerId !== event.pointerId) {
        return
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      state.active = false
      state.pointerId = null
      setDragScrolling(false)
    },
    [],
  )

  const handleClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!dragState.current.moved) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      dragState.current.moved = false
    },
    [],
  )

  useIsomorphicLayoutEffect(() => {
    if (!scrollToCurrentTime || rows.length === 0) {
      return
    }
    const scroller = scrollRef.current
    const currentHeader = scroller?.querySelector('[data-row-current="true"]')
    if (scroller && currentHeader instanceof HTMLElement) {
      scroller.scrollLeft = currentHeader.offsetLeft
    }
  }, [scrollToCurrentTime, rows.length, headerRows, timestamp])

  if (hideEmptyRows && populatedRows.length === 0) {
    return null
  }

  const borderClass = 'ip:border-dark/20 ip:dark:border-white/20'

  return (
    <div className="ip-platform ip:flex">
      <div className="ip:group">
        <div
          className={twMerge(
            'ip:min-w-0 ip:overflow-hidden ip:lg:max-w-max ip:md:min-w-80',
            scrolled
              ? 'ip:max-w-14 ip:group-hover:max-w-max ip:md:max-w-max'
              : 'ip:max-w-max',
          )}
        >
          <div
            style={{ height: `${Math.max(headerRows.length, 1) * 1.5}rem` }}
            className="ip:flex ip:flex-col ip:place-content-start ip:items-start ip:p-1 ip:text-xs ip:font-bold ip:uppercase ip:dark:text-gray-300"
          >
            <div className="ip:min-w-56 ip:overflow-hidden ip:truncate">
              {title ?? ''}
              {titleExtra ? (
                <span className="ip:ml-2 ip:truncate ip:text-3xs ip:font-light">
                  {titleExtra}
                </span>
              ) : null}
            </div>
            {subtitle ? (
              <div className="ip:text-3xs ip:font-normal ip:opacity-75">
                {subtitle}
              </div>
            ) : null}
            {headerRows.length > 0 && timezone === 'UTC' ? (
              <div className="ip:mt-auto ip:self-end ip:text-3xs ip:font-medium ip:opacity-75">
                UTC
              </div>
            ) : null}
          </div>
          <table
            className={twMerge(
              'ip:w-full ip:table-auto ip:overflow-hidden ip:rounded-l-md ip:border-b ip:bg-white/75 ip:dark:bg-white/10',
              borderClass,
            )}
          >
            <thead>
              {populatedRows.map((row, rowIndex) => (
                <tr
                  key={`label-${rowIndex}`}
                  className={twMerge(
                    'ip:dark:text-gray-300',
                    row.beta && 'ip:bg-yellow-500/10',
                    row.highlighted && 'ip:bg-primary-10 ip:dark:bg-dark/40',
                  )}
                  title={row.beta ? 'Beta model' : undefined}
                >
                  <td
                    className={twMerge(
                      'ip:table-cell ip:h-6 ip:overflow-hidden ip:whitespace-nowrap ip:border-b ip:text-xs ip:font-medium ip:transition-all',
                      borderClass,
                      scrolled
                        ? 'ip:max-w-0 ip:px-0 ip:group-hover:max-w-max ip:group-hover:px-2 ip:md:max-w-max ip:md:px-2'
                        : 'ip:max-w-max ip:px-2',
                    )}
                  >
                    {row.title}
                    {row.titleExtra ? (
                      <span className="ip:ml-2 ip:text-3xs ip:font-light">
                        {row.titleExtra}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={twMerge(
                      'ip:table-cell ip:h-6 ip:overflow-hidden ip:border-b ip:transition-all',
                      borderClass,
                      scrolled
                        ? 'ip:max-w-0 ip:group-hover:max-w-max ip:md:max-w-max'
                        : 'ip:max-w-max',
                    )}
                  >
                    {row.info ? (
                      <span title={row.info} aria-label={row.info}>
                        <IpInfoCircle className="ip:size-4" />
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={twMerge(
                      'ip:h-6 ip:whitespace-nowrap ip:border-b ip:px-2 ip:text-2xs ip:opacity-75',
                      borderClass,
                    )}
                  >
                    {row.subtitle}
                  </td>
                </tr>
              ))}
              {hiddenRows.length > 0 ? (
                showHidden ? (
                  hiddenRows.map((hiddenRow, hiddenIndex) => (
                    <tr key={`hidden-label-${hiddenIndex}`}>
                      <td
                        colSpan={1000}
                        className={twMerge(
                          'ip:h-6 ip:cursor-pointer ip:border-t ip:px-2 ip:text-xs ip:text-dark/50 ip:hover:bg-dark/5 ip:dark:text-white/40 ip:dark:hover:bg-white/5',
                          hiddenRow.beta && 'ip:bg-yellow-500/10',
                          borderClass,
                        )}
                        onClick={() => setShowHidden(false)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') setShowHidden(false)
                        }}
                        role="button"
                        tabIndex={0}
                        title={hiddenRow.beta ? 'Beta model' : undefined}
                      >
                        {hiddenRow.title}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={1000}
                      className={twMerge(
                        'ip:h-6 ip:cursor-pointer ip:border-t ip:px-2 ip:text-xs ip:text-dark/50 ip:hover:bg-dark/5 ip:dark:text-white/40 ip:dark:hover:bg-white/5',
                        borderClass,
                      )}
                      onClick={() => setShowHidden(true)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') setShowHidden(true)
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {hiddenRows.length} hidden
                    </td>
                  </tr>
                )
              ) : null}
            </thead>
          </table>
        </div>
      </div>

      <ScrollSyncPane
        ref={scrollRef}
        className={twMerge(
          'ip:relative ip:grow ip:overflow-x-auto ip:overflow-y-hidden ip:rounded-t-md ip:rounded-br-md ip:px-px',
          !scrollbar && 'ip:scrollbar-hide',
          dragScrolling
            ? 'ip:cursor-grabbing ip:select-none'
            : 'ip:cursor-grab',
        )}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        <table className="ip:mb-px ip:min-w-full ip:table-fixed ip:border-collapse">
          <thead>
            {headerRows.map((headers, headerIndex) => (
              <tr key={`header-${headerIndex}`}>
                {headers.map((header, cellIndex) => {
                  const isCurrent =
                    header.cols === 1 &&
                    (timestamp != null
                      ? header.timestamp === timestamp
                      : isWithinCurrentHour(header.timestamp))
                  return (
                    <th
                      key={`h-${headerIndex}-${cellIndex}`}
                      colSpan={header.cols}
                      {...(scrollToCurrentTime && isCurrent
                        ? { 'data-row-current': 'true' }
                        : {})}
                      className={twMerge(
                        'ip:relative ip:h-6 ip:whitespace-nowrap ip:border-b ip:bg-white/75 ip:px-2 ip:text-center ip:text-xs ip:font-medium ip:dark:bg-white/10',
                        cellIndex > 0 && 'ip:border-l',
                        borderClass,
                      )}
                    >
                      <span>{header.text}</span>
                      {header.timestamp === timestamp && header.cols === 1 ? (
                        <div className="ip:absolute ip:inset-0 ip:-m-px ip:rounded-t ip:border-2 ip:border-b-0 ip:border-dark ip:bg-dark/10 ip:dark:border-white ip:dark:bg-white/10" />
                      ) : null}
                      {header.timestamp !== timestamp &&
                      header.cols === 1 &&
                      onTimestampChange != null &&
                      timestamps.includes(header.timestamp) ? (
                        <div
                          className="ip:absolute ip:inset-0 ip:z-30 ip:cursor-pointer ip:hover:bg-primary/20"
                          onClick={() => onTimestampChange(header.timestamp)}
                        />
                      ) : null}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const CellView =
                cellViews[row.view ?? 'VALUE_ROUND'] ?? cellViews.VALUE_ROUND
              return (
                <tr key={`data-${rowIndex}`}>
                  {row.data && row.data.length > 0 ? (
                    row.data.map((cell, cellIndex) => (
                      <td
                        key={`c-${rowIndex}-${cellIndex}`}
                        style={{ width: `${100 / row.data.length}%` }}
                        className={twMerge(
                          'ip:relative ip:h-6 ip:border-t ip:p-0',
                          cellIndex > 0 && 'ip:border-l',
                          borderClass,
                          cell.timestamp * 1000 < Date.now()
                            ? 'ip:bg-gray-200 ip:dark:bg-white/5'
                            : 'ip:bg-gray-50 ip:dark:bg-white/10',
                        )}
                      >
                        {CellView ? (
                          <CellView
                            data={cell}
                            config={row.config}
                            unit={row.unit}
                            getIconSrc={getIconSrc}
                            directionView={resolvedDirectionView}
                            onDirectionViewChange={changeDirectionView}
                          />
                        ) : null}
                        {cell.timestamp === timestamp && timestamp != null ? (
                          <div
                            className={twMerge(
                              'ip:absolute ip:inset-0 ip:z-20 ip:-m-px ip:border-x-2 ip:border-dark ip:bg-dark/10 ip:dark:border-white ip:dark:bg-white/10',
                              rowIndex === rows.length - 1 &&
                                'ip:rounded-b ip:border-b-2',
                            )}
                          />
                        ) : null}
                      </td>
                    ))
                  ) : (
                    <td
                      colSpan={1000}
                      className={twMerge(
                        'ip:hidden ip:h-6 ip:border-t ip:px-2 ip:text-center ip:text-xs ip:text-dark/50 ip:dark:text-white/50',
                        borderClass,
                      )}
                    >
                      No data.
                    </td>
                  )}
                </tr>
              )
            })}
            {hiddenRows.length > 0 ? (
              showHidden ? (
                hiddenRows.map((hiddenRow, hiddenIndex) => (
                  <tr key={`hidden-body-${hiddenIndex}`}>
                    <td
                      colSpan={100}
                      className={twMerge(
                        'ip:left-0 ip:z-10 ip:h-6 ip:bg-white ip:pl-3 ip:pr-2 ip:text-left ip:text-2xs ip:text-dark/50 ip:dark:bg-[#1e293b] ip:dark:text-white/40',
                        borderClass,
                      )}
                    >
                      {hiddenRow.reason ?? hiddenRow.title}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={100}
                    className={twMerge(
                      'ip:h-6 ip:border-t ip:px-2 ip:text-xs ip:text-dark/50 ip:dark:text-white/50',
                      borderClass,
                    )}
                  />
                </tr>
              )
            ) : null}
          </tbody>
        </table>
      </ScrollSyncPane>
    </div>
  )
}
