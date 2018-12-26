# BindObservable decorator

[![npm version](https://badge.fury.io/js/bind-observable.svg)](https://badge.fury.io/js/bind-observable)
[![Travis](https://travis-ci.org/PSanetra/bind-observable.svg?branch=master)](https://travis-ci.org/PSanetra/bind-observable)
[![Coverage Status](https://coveralls.io/repos/github/PSanetra/bind-observable/badge.svg?branch=master)](https://coveralls.io/github/PSanetra/bind-observable?branch=master)

This library provides the `@BindObservable()` decorator, which binds a property to a observable companion property. The companion Observable always emits the latest value of the bound property.   

### Installation

```bash
npm install bind-observable --save
```

### Usage

The following code binds the property `myProp` to the observable property `myProp$` and prints two values (`'initialValue'` and `'newValue'`) to the console. 

```typescript
class MyClass {

  @BindObservable()
  public myProp: string = 'initialValue';
  public myProp$!: Observable<string>;

}

const myInstance = new MyClass();

myInstance.myProp$.subscribe(console.log);

myInstance.myProp = 'newValue'

```

### Details

This decorator adds property accessors to the `PropertyDescriptor` of the decorated property. It will emit the getter value after every underlying setter call. You can use the `emitRawSetterValue` option to emit the raw setter value and not a value, which is possibly modified by underlying setter and getter calls.

The decorator will also emit initial property values only if these values are explictly defined. In the following example the observable `initializedProp$` does emit a `undefined` value. On the other hand `uninitializedProp$` will emit its first value on the first assignment. 

```typescript
class MyClass {

  @BindObservable()
  public uninitializedProp?: string;
  public uninitializedProp$!: Observable<string>;

  @BindObservable()
  public initializedProp: string | undefined = undefined;
  public initializedProp$!: Observable<string>;

}

const myInstance = new MyClass();

// Prints nothing to the console
myInstance.uninitializedProp$.subscribe(console.log);

// Prints 'undefined' to the console
myInstance.initializedProp$.subscribe(console.log);

```

### Known Bugs

This decorator does not work if used directly on property accessors, but it can be used together with other decorators which add accessors to the `PropertyDescriptor`.
