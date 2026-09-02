import { useTimeseriesBlockContext, useTimeseriesContext } from './context'
import TimeseriesTable from './table'
import type { TimeseriesChartProps } from './types'

export default function TimeseriesChart({
  rows: rowsProp,
  hiddenRows: hiddenRowsProp,
  title: titleProp,
  titleExtra: titleExtraProp,
  subtitle: subtitleProp,
  locale: localeProp,
  timezone: timezoneProp,
  headerFormat: headerFormatProp,
  timestamp: timestampProp,
  timestamps: timestampsProp,
  onTimestampChange: onTimestampChangeProp,
  scrollToCurrentTime: scrollToCurrentTimeProp,
  hideEmptyRows,
  scrollbar,
  views: viewsProp,
  getIconSrc: getIconSrcProp,
  directionView: directionViewProp,
  onDirectionViewChange: onDirectionViewChangeProp,
  showPalette: showPaletteProp,
}: TimeseriesChartProps) {
  const block = useTimeseriesBlockContext()
  const ctx = useTimeseriesContext()

  const rows = rowsProp ?? block?.rows
  if (!rows) {
    return null
  }

  return (
    <TimeseriesTable
      rows={rows}
      hiddenRows={hiddenRowsProp ?? block?.hiddenRows}
      title={titleProp ?? block?.title}
      titleExtra={titleExtraProp ?? block?.titleExtra}
      subtitle={subtitleProp ?? block?.subtitle}
      locale={localeProp ?? ctx?.locale}
      timezone={timezoneProp ?? ctx?.timezone}
      headerFormat={headerFormatProp ?? ctx?.headerFormat}
      timestamp={timestampProp ?? ctx?.timestamp}
      timestamps={timestampsProp ?? ctx?.timestamps}
      onTimestampChange={onTimestampChangeProp ?? ctx?.onTimestampChange}
      scrollToCurrentTime={
        scrollToCurrentTimeProp ?? ctx?.scrollToCurrentTime
      }
      hideEmptyRows={hideEmptyRows}
      scrollbar={scrollbar}
      views={viewsProp ?? ctx?.views}
      getIconSrc={getIconSrcProp ?? ctx?.getIconSrc}
      directionView={directionViewProp ?? ctx?.directionView}
      onDirectionViewChange={
        onDirectionViewChangeProp ?? ctx?.onDirectionViewChange
      }
      showPalette={showPaletteProp ?? ctx?.showPalette}
    />
  )
}
