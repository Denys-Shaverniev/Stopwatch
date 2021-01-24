import {Observable} from 'rxjs'
import Rx from 'rxjs/Rx'
import { map, buffer, debounceTime, filter } from 'rxjs/operators';
import './Stopwatch.css'
import { mapTo } from 'rxjs-compat/operator/mapTo';
import { takeUntil } from 'rxjs-compat/operator/takeUntil';


const startButton = document.querySelector('#start')
const stopButton = document.querySelector('#wait')
const resetButton = document.querySelector('#reset')

const start$ = Observable.fromEvent(startButton, 'click')
const wait$ = Observable.fromEvent(stopButton, 'click')
const reset$ = Observable.fromEvent(resetButton, 'click')

const seconds = document.querySelector('#seconds')
const minutes = document.querySelector('#minutes')
const hours = document.querySelector('#hours')


const toTime = (time) => ({
  seconds: Math.floor((time / 1) % 60),
  minutes: Math.floor((time / 60) % 60),
  hours: Math.floor(time / 3600)
}) 

const zero = (number) => number <= 9 ? ('0' + number) : number.toString()

const render = (time) => {
  seconds.innerHTML = zero(time.seconds)
  minutes.innerHTML = zero(time.minutes)
  hours.innerHTML = zero(time.hours)
}

const interval$ = Observable.interval(1000)


const buff$ = wait$.pipe(
  debounceTime(250),
)

const click$ = wait$.pipe(
  buffer(buff$),
  map(list => {
    return list.length;
  }),
  filter(x => x === 2),
)

click$.subscribe(() => {
  return true
})

const pauseble$ = interval$.takeUntil(click$)

const init = 0
const inc = acc => acc + 1 
const reset = acc => init

const incOrReset$ = Observable.merge(
  pauseble$.mapTo(inc),
  reset$.mapTo(reset)
)


let app$ = start$
  .switchMapTo(incOrReset$)
  .startWith(init)
  .scan((acc, currFunc) => currFunc(acc))
  .map(toTime)
  .subscribe(
    (val) => render(val)
    )



