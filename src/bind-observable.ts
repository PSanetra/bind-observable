import { ReplaySubject } from 'rxjs'
import { BindObservableOpts, isBindObservableOpts } from './bind-observable-options'

type SubjectByProp = Map<string, ReplaySubject<any>>

const subjects: WeakMap<object, SubjectByProp> = new WeakMap()

type ValueByProp = Map<string, any>

const values: WeakMap<object, ValueByProp> = new WeakMap()

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

function defineObservableProperty(target: object, observableKey: string): void {
  Object.defineProperty(target, observableKey, {
    configurable: true,
    enumerable: false,
    get() {
      return subject(this, observableKey)
    },
  })
}

function redefineSimpleProperty(target: any, propertyKey: string, observableKey: string): void {
  Object.defineProperty(target, propertyKey, {
    configurable: true,
    enumerable: true,
    set(value) {
      valueMap(this).set(propertyKey, value)
      subject(this, observableKey).next(this[propertyKey])
    },
    get() {
      return valueMap(this).get(propertyKey)
    },
  })
}

function redefineAccessorProperty(
  target: object,
  propertyKey: string,
  observableKey: string,
  emitRawSetterValue: boolean,
  descriptor: PropertyDescriptor
): void {
  Object.defineProperty(target, propertyKey, {
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    set(value) {
      if (!descriptor.set) {
        throw new Error(`Property ${propertyKey} doesn't have a setter and cannot be written`)
      }

      descriptor.set.call(this, value)

      const companionProp = subject(this, observableKey)

      if (emitRawSetterValue || !descriptor.get) {
        companionProp.next(value)
      } else {
        companionProp.next(this[propertyKey])
      }
    },
    get(): any {
      if (!descriptor.get) {
        throw new Error(`Property ${propertyKey} doesn't have a getter and cannot be read`)
      }

      return descriptor.get.call(this)
    },
  })
}

/**
 * Binds a property to an observable companion property.
 * The observable companion property will emit on all assignments (including initialization),
 * but will not emit undefined if undefined is not explicitly assigned on initialization.
 *
 * Warning:
 * Relative declaration position of this decorator to other decorators may be important if another
 * decorator is transforming the getter return value.
 *
 * @param {string | BindObservableOpts} observableKeyOrOpts
 * provides the companion property key or other additional options.
 * If the companion property key is not provided, then it will be assumed to be
 * the name of the original property key + '$' suffix.
 */
export function BindObservable(observableKeyOrOpts?: string | BindObservableOpts) {
  return (target: any, propertyKey: string) => {
    const opts: BindObservableOpts = isBindObservableOpts(observableKeyOrOpts)
      ? observableKeyOrOpts
      : {}

    if (typeof observableKeyOrOpts === 'string') {
      opts.key = observableKeyOrOpts
    }

    const observableKey: string = opts.key || propertyKey + '$'

    // The third parameter of this function (descriptor) is passed only if the decorated property
    // is an accessor, but it won't be passed if another decorator has replaced the descriptor.
    // See Property Decorators at https://www.typescriptlang.org/docs/handbook/decorators.html
    // Because of this, we are forced to retrieve the current descriptor with Reflection API
    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey)

    delete target[propertyKey]
    delete target[observableKey]

    defineObservableProperty(target, observableKey)

    if (descriptor !== undefined) {
      redefineAccessorProperty(
        target,
        propertyKey,
        observableKey,
        !!opts.emitRawSetterValue,
        descriptor
      )
    } else {
      redefineSimpleProperty(target, propertyKey, observableKey)
    }
  }
}
