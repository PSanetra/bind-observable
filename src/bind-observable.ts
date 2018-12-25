import { ReplaySubject } from 'rxjs'

type SubjectByProp = Map<string, ReplaySubject<any>>

const subjects: WeakMap<Object, SubjectByProp> = new WeakMap()

type ValueByProp = Map<string, any>

const values: WeakMap<Object, ValueByProp> = new WeakMap()

function subject(instance: any, key: string): ReplaySubject<any> {
  let subjectByProp = subjects.get(instance)

  if (!subjectByProp) {
    subjectByProp = new Map<string, ReplaySubject<any>>()
    subjects.set(instance, subjectByProp)
  }

  let subject = subjectByProp.get(key)

  if (!subject) {
    subject = new ReplaySubject<any>(1)
    subjectByProp.set(key, subject)
  }

  return subject
}

function valueMap(instance: any): ValueByProp {
  let valueMap = values.get(instance)

  if (!valueMap) {
    valueMap = new Map<string, any>()
    values.set(instance, valueMap)
  }

  return valueMap
}

/**
 * Binds a property to an observable companion property.
 * The observable companion property will emit on all assignments (including initialization),
 * but will not emit undefined if undefined is not explicitly assigned on initialization.
 * @param {string} observableKey
 * optional custom key of the companion property.
 * If not provided, the observableKey is the name of the original property key with a '$' suffix.
 */
export function BindObservable(observableKey?: string) {
  return (target: any, propertyKey: string) => {
    observableKey = observableKey || propertyKey + '$'

    delete target[propertyKey]
    delete target[observableKey]

    Object.defineProperty(target, propertyKey, {
      set(value) {
        valueMap(this).set(propertyKey, value)
        subject(this, observableKey as string).next(value)
      },
      get() {
        return valueMap(this).get(propertyKey)
      }
    })

    Object.defineProperty(target, observableKey, {
      get() {
        return subject(this, observableKey as string)
      }
    })
  }
}
