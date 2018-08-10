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
