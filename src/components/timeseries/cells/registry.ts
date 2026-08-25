import TimeseriesDirectionCell from './direction'
import TimeseriesIconCell from './icon'
import TimeseriesPrecipitationTypeCell from './precipitation-type'
import TimeseriesValueCell from './value'
import TimeseriesValueRoundCell from './value-round'
import type { TimeseriesCellViewMap } from '../types'

export const TIMESERIES_CELL_VIEWS: TimeseriesCellViewMap = {
  VALUE: TimeseriesValueCell,
  VALUE_ROUND: TimeseriesValueRoundCell,
  DIRECTION: TimeseriesDirectionCell,
  PRECIPITATION_TYPE: TimeseriesPrecipitationTypeCell,
  ICON: TimeseriesIconCell,
}
