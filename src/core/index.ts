import { DefaultOptions, Options, TrackerVersion } from "../types/index";
import { createHistoryEvent } from "../utils/pv";

const MouseEventList = ['click', 'dbClick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover']
class Tracker {
  public data: Options;
  constructor(options: Options) {
    this.data = Object.assign(this.initDef(), options)
    this.installTracker()
  }

  // 默认初始化
  private initDef(): DefaultOptions {
    window.history['pushState'] = createHistoryEvent('pushState')
    window.history['replaceState'] = createHistoryEvent('replaceState')
    return <DefaultOptions>{
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
      sdkVersion: TrackerVersion.version
    }
  }

  // 手动上报
  public sendTracker<T>(data: T) {
    this.reportTracker(data)
  }

  private captureEvents<T>(mouseEventList: string[], targetKey: string, data?: T) {
    mouseEventList.forEach(event => {
      window.addEventListener(event, () => {
        console.log('got it');
        this.reportTracker({
          event,
          targetKey,
          data
        })
      })
    })
  }

  private installTracker() {
    if (this.data.historyTracker) {
      this.captureEvents(['pushState', 'popState', 'replaceState'], 'history-pv')
    }
    if (this.data.hashTracker) {
      this.captureEvents(['hashChange'], 'hash-pv')
    }
    if (this.data.domTracker) {
      this.tragetKeyReport()
    }
    if (this.data.jsError) {
      this.jsError()
    }
  }

  public setUserId<T extends DefaultOptions['uuid']>(uuid: T) {
    this.data.uuid = uuid
  }

  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra
  }

  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, { time: new Date().getTime() })
    let headers = {
      type: 'application/x-www-form-unlencoded'
    }
    let blob = new Blob([JSON.stringify(params)], headers)
    navigator.sendBeacon(this.data.requestUrl, blob)
  }

  private tragetKeyReport() {
    MouseEventList.forEach(ev => {
      window.addEventListener(ev, (e) => {
        const target = e.target as HTMLElement
        const targetKey = target.getAttribute('target-key')
        if (targetKey) {
          this.reportTracker({
            event: ev,
            targetKey
          })
        }
      })
    })
  }

  private jsError() {
    this.errorEvent()
    this.promiseReject()
  }

  private errorEvent() {
    window.addEventListener('error', (event) => {
      this.reportTracker({
        event: "error",
        targetKey: "message",
        message: event.message
      })
    })
  }

  private promiseReject() {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch(error => {
        this.reportTracker({
          event: "promise",
          targetKey: "message",
          message: error
        })
      })
    })
  }
}

export default Tracker