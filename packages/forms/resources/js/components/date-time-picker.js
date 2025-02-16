import dayjs from 'dayjs/esm'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(customParseFormat)
dayjs.extend(localeData)
dayjs.extend(timezone)
dayjs.extend(utc)

window.dayjs = dayjs

export default (Alpine) => {
    Alpine.data('dateTimePickerFormComponent', ({
        displayFormat,
        firstDayOfWeek,
        format,
        isAutofocused,
        maxDate,
        minDate,
        state,
    }) => {
        const timezone = dayjs.tz.guess()

        dayjs.locale(window.dayjs_locale)

        return {
            daysInFocusedMonth: [],

            displayText: '',

            emptyDaysInFocusedMonth: [],

            focusedDate: null,

            focusedMonth: null,

            focusedYear: null,

            hour: null,

            maxDate,

            minDate,

            minute: null,

            open: false,

            second: null,

            state,

            init: function () {
                this.maxDate = dayjs(this.maxDate)
                if (! this.maxDate.isValid()) {
                    this.maxDate = null
                }

                this.minDate = dayjs(this.minDate)
                if (! this.minDate.isValid()) {
                    this.minDate = null
                }

                let date = this.getSelectedDate() ?? dayjs().tz(timezone)
                    .hour(0)
                    .minute(0)
                    .second(0)

                if (this.maxDate !== null && date.isAfter(this.maxDate)) {
                    date = null
                }

                if (this.minDate !== null && date.isBefore(this.minDate)) {
                    date = null
                }

                this.hour = date?.hour() ?? 0
                this.minute = date?.minute() ?? 0
                this.second = date?.second() ?? 0

                this.setDisplayText()

                if (isAutofocused) {
                    this.openPicker()
                }

                this.$watch('focusedMonth', () => {
                    this.focusedMonth = +this.focusedMonth

                    if (this.focusedDate.month() === this.focusedMonth) {
                        return
                    }

                    this.focusedDate = this.focusedDate.month(this.focusedMonth)
                })

                this.$watch('focusedYear', () => {
                    this.focusedYear = Number.isInteger(+this.focusedYear) ? +this.focusedYear : dayjs().year()

                    if (this.focusedDate.year() === this.focusedYear) {
                        return
                    }

                    this.focusedDate = this.focusedDate.year(this.focusedYear)
                })

                this.$watch('focusedDate', () => {
                    this.focusedMonth = this.focusedDate.month()
                    this.focusedYear = this.focusedDate.year()

                    this.setupDaysGrid()

                    this.$nextTick(() => {
                        this.evaluatePosition()
                    })
                })

                this.$watch('hour', () => {
                    let hour = +this.hour

                    if (! Number.isInteger(hour)) {
                        this.hour = 0
                    } else if (hour > 23) {
                        this.hour = 0
                    } else if (hour < 0) {
                        this.hour = 23
                    } else {
                        this.hour = hour
                    }

                    let date = this.getSelectedDate() ?? this.focusedDate

                    this.setState(date.hour(this.hour ?? 0))
                })

                this.$watch('minute', () => {
                    let minute = +this.minute

                    if (! Number.isInteger(minute)) {
                        this.minute = 0
                    } else if (minute > 59) {
                        this.minute = 0
                    } else if (minute < 0) {
                        this.minute = 59
                    } else {
                        this.minute = minute
                    }

                    let date = this.getSelectedDate() ?? this.focusedDate

                    this.setState(date.minute(this.minute ?? 0))
                })

                this.$watch('second', () => {
                    let second = +this.second

                    if (! Number.isInteger(second)) {
                        this.second = 0
                    } else if (second > 59) {
                        this.second = 0
                    } else if (second < 0) {
                        this.second = 59
                    } else {
                        this.second = second
                    }

                    let date = this.getSelectedDate() ?? this.focusedDate

                    this.setState(date.second(this.second ?? 0))
                })

                this.$watch('state', () => {
                    let date = this.getSelectedDate()

                    if (this.maxDate !== null && date.isAfter(this.maxDate)) {
                        date = null
                    }
                    if (this.minDate !== null && date.isBefore(this.minDate)) {
                        date = null
                    }

                    this.hour = date?.hour() ?? 0
                    this.minute = date?.minute() ?? 0
                    this.second = date?.second() ?? 0

                    this.setDisplayText()
                })
            },

            clearState: function () {
                this.setState(null)

                this.closePicker()
            },

            closePicker: function () {
                this.open = false
            },

            dateIsDisabled: function (date) {
                if (this.maxDate && date.isAfter(this.maxDate)) {
                    return true
                }
                if (this.minDate && date.isBefore(this.minDate)) {
                    return true
                }

                return false
            },

            dayIsDisabled: function (day) {
                return this.dateIsDisabled(this.focusedDate.date(day))
            },

            dayIsSelected: function (day) {
                let selectedDate = this.getSelectedDate()

                if (selectedDate === null) {
                    return false
                }

                return selectedDate.date() === day &&
                    selectedDate.month() === this.focusedDate.month() &&
                    selectedDate.year() === this.focusedDate.year()
            },

            dayIsToday: function (day) {
                let date = dayjs().tz(timezone)

                return date.date() === day &&
                    date.month() === this.focusedDate.month() &&
                    date.year() === this.focusedDate.year()
            },

            evaluatePosition: function () {
                let availableHeight = window.innerHeight - this.$refs.button.offsetHeight

                let element = this.$refs.button

                while (element) {
                    availableHeight -= element.offsetTop

                    element = element.offsetParent
                }

                if (this.$refs.picker.offsetHeight <= availableHeight) {
                    this.$refs.picker.style.bottom = 'auto'

                    return
                }

                this.$refs.picker.style.bottom = `${this.$refs.button.offsetHeight}px`
            },

            focusPreviousDay: function () {
                this.focusedDate = this.focusedDate.subtract(1, 'day')
            },

            focusPreviousWeek: function () {
                this.focusedDate = this.focusedDate.subtract(1, 'week')
            },

            focusNextDay: function () {
                this.focusedDate = this.focusedDate.add(1, 'day')
            },

            focusNextWeek: function () {
                this.focusedDate = this.focusedDate.add(1, 'week')
            },

            getDayLabels: function () {
                const labels = dayjs.weekdaysShort()

                if (firstDayOfWeek === 0) {
                    return labels
                }

                return [
                    ...labels.slice(firstDayOfWeek),
                    ...labels.slice(0, firstDayOfWeek),
                ]
            },

            getSelectedDate: function () {
                let date = dayjs(this.state, format)

                if (! date.isValid()) {
                    return null
                }

                return date
            },

            openPicker: function () {
                this.focusedDate = this.getSelectedDate() ?? dayjs().tz(timezone)

                this.setupDaysGrid()

                this.open = true

                this.$nextTick(() => {
                    this.evaluatePosition()
                })
            },

            selectDate: function (day = null) {
                if (day) {
                    this.setFocusedDay(day)
                }

                this.setState(this.focusedDate)
            },

            setDisplayText: function () {
                this.displayText = this.getSelectedDate() ? this.getSelectedDate().format(displayFormat) : ''
            },

            setupDaysGrid: function () {
                this.emptyDaysInFocusedMonth = Array.from({
                    length: this.focusedDate.date(8 - firstDayOfWeek).day(),
                }, (_, i) => i + 1)

                this.daysInFocusedMonth = Array.from({
                    length: this.focusedDate.daysInMonth(),
                }, (_, i) => i + 1)
            },

            setFocusedDay: function (day) {
                this.focusedDate = this.focusedDate.date(day)
            },

            setState: function (date) {
                if (date === null) {
                    this.state = null

                    this.setDisplayText()

                    return
                } else {
                    if (this.dateIsDisabled(date)) {
                        return
                    }
                }

                this.state = date
                    .hour(this.hour ?? 0)
                    .minute(this.minute ?? 0)
                    .second(this.second ?? 0)
                    .format(format)

                this.setDisplayText()
            },

            togglePickerVisibility: function () {
                if (this.open) {
                    this.closePicker()

                    return
                }

                this.openPicker()
            },
        }
    })
}
