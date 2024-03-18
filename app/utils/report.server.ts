import { format } from 'date-fns'

interface Owner {
  id: string
  firstName: string
  lastName: string
  personalId: string
}

interface Workstation {
  id: string
  name: string
  displayName: string
}

interface Report {
  id: string
  startDate: Date
  endDate: Date
  reasonForDowntime: string
  storageLocation: string | null
  details: string | null
  duration: number
  statusName: string
  workstation?: Workstation
  owner?: Owner
}

interface GroupedReports {
  [date: string]: Report[]
}

interface SortedReport extends Report {
  startTime: string
  endTime: string
}

interface SortedReportsByDay {
  dateOfDay: string
  reports: SortedReport[]
}

/**
 * Groups an array of reports by day.
 * @param reports - The array of reports to be grouped.
 * @returns An object where the keys are the dates in 'yyyy-MM-dd' format and the values are arrays of reports for each date.
 */
export const groupReportsByDay = (reports: Report[]): GroupedReports => {
  const reportsByDay: GroupedReports = {}
  reports.forEach(report => {
    const dateOfDay = format(report.startDate, 'yyyy-MM-dd')
    if (!reportsByDay[dateOfDay]) {
      reportsByDay[dateOfDay] = []
    }
    reportsByDay[dateOfDay].push(report)
  })
  return reportsByDay
}

/**
 * Sorts the reports by day and formats the start and end times.
 *
 * @param reportsByDay - The grouped reports by day.
 * @returns An array of sorted reports by day with formatted start and end times.
 */
export const sortReportsByDay = (reportsByDay: GroupedReports): SortedReportsByDay[] => {
  const sortedDays = Object.keys(reportsByDay).sort()
  const sortedReportsByDay = sortedDays.map(dateOfDay => ({
    dateOfDay,
    reports: reportsByDay[dateOfDay]
      .map(report => ({
        ...report,
        startTime: format(new Date(report.startDate), 'HH:mm'),
        endTime: format(new Date(report.endDate), 'HH:mm')
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }))
  return sortedReportsByDay
}
