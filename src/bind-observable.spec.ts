import { BindObservable } from '../src/bind-observable'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'

describe('BindObservable', () => {
  it('lets observable emit on property assignment', async () => {
    class TestClass {
      @BindObservable()
      public myProp: string | undefined
      public myProp$!: Observable<string | undefined>
    }

    const instance = new TestClass()

    instance.myProp = 'myValue'

    expect(await instance.myProp$.pipe(take(1)).toPromise()).toEqual('myValue')
  })

  it('supports custom observable name', async () => {
    class TestClass {
      @BindObservable('myObservable$')
      public myProp: string | undefined
      public myObservable$!: Observable<string | undefined>
    }

    const instance = new TestClass()

    instance.myProp = 'myValue'

    expect(await instance.myObservable$.pipe(take(1)).toPromise()).toEqual('myValue')
  })

  it('supports property initializer', async () => {
    class TestClass {
      @BindObservable('myObservable$')
      public myProp: string = 'myValue'
      public myObservable$!: Observable<string>
    }

    const instance = new TestClass()

    expect(await instance.myObservable$.pipe(take(1)).toPromise()).toEqual('myValue')
  })

  it('replays only latest value', async () => {
    class TestClass {
      @BindObservable('myObservable$')
      public myProp: string = 'myValue'
      public myObservable$!: Observable<string>
    }

    const instance = new TestClass()

    instance.myProp = 'newValue'

    expect(await instance.myObservable$.pipe(take(1)).toPromise()).toEqual('newValue')
  })

  it('property value still gettable', async () => {
    class TestClass {
      @BindObservable('myObservable$')
      public myProp: string = 'myValue'
      public myObservable$!: Observable<string>
    }

    const instance = new TestClass()

    expect(instance.myProp).toEqual('myValue')
  })
})
