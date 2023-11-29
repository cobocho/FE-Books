# 클로저의 메모리 누수

리액트에서 클로저가 사용되는 대표적인 예시는 `useState`이다.
리액트는 `useState`에서 클로저를 이용해 setter 함수와 state를 반환받아 항상 최신 상태의 state에 접근한다.

하지만 클로저의 경우 비용이 발생하기도한다.
클로저는 클로저가 생성되면서 선언적 환경을 기억하기 위해 비용이 발생한다.

## 예시

```js
const aButton = document.querySelector('#a');
const bButton = document.querySelector('#b');

let aArr = null;
let bArr = null;

const heavyJob = () => {
  const longArr = Array.from({ length: 10000000 }, (_, i) => i + 1);
  console.log(aArr === longArr);
  console.log(longArr.length);
  aArr = longArr;
};

const heavyJobWithClosure = () => {
  const longArr = Array.from({ length: 10000000 }, (_, i) => i + 1);
  return () => {
    console.log(bArr === longArr);
    console.log(longArr.length);
    bArr = longArr;
  };
};

const innerFunc = heavyJobWithClosure();

a.addEventListener('click', heavyJob);
b.addEventListener('click', () => {
  innerFunc();
});
```

클로저를 사용하여 길이가 10,000,000인 배열을 생성하는 함수를 작성한다.
A 방법으로는 일반적인 함수로 처리되고, B 방법으로는 클로저를 활용한다.

그리고 프로그램을 실행시키면 다음과 같은 결과가 나오게 된다.

<img width="281" alt="image" src="https://github.com/cobocho/FE-Books/assets/99083803/a6b6254e-4fbe-46ea-961a-b6b728231216">

<img width="200" alt="image" src="https://github.com/cobocho/FE-Books/assets/99083803/bc6e7945-cf33-4e77-8a15-2320683e6fce">

일반적인 함수로 처리할 경우에는 실행 당시 외에는 메모리의 크기가 작다.

```js
let aArr = null;

const heavyJob = () => {
  const longArr = Array.from({ length: 10000000 }, (_, i) => i + 1);
  console.log(aArr === longArr);
  console.log(longArr.length);
  aArr = longArr;
};
```

또한 위와같이 이전 스냅샷과의 비교를 확인할 시 항상 `false`를 반환한다.

### B 방법 (클로저를 이용한 방법)

<img width="263" alt="image" src="https://github.com/cobocho/FE-Books/assets/99083803/b3a0345b-ce5f-41ce-9db9-43ee5b9ba0dc">

<img width="202" alt="image" src="https://github.com/cobocho/FE-Books/assets/99083803/46f70df0-c564-42a4-ab24-c31580c6b4c1">

클로저의 경우 스크립트를 실행하면서 이미 메모리를 점유한다.

```js
let bArr = null;

const heavyJobWithClosure = () => {
  const longArr = Array.from({ length: 10000000 }, (_, i) => i + 1);
  return () => {
    console.log(bArr === longArr);
    console.log(longArr.length);
    bArr = longArr;
  };
};
```

반대로 클로저의 경우 동일한 객체에 접근하기 때문에 첫번째 실행 이후 항상 이전 스냅샷과의 비교에서 `true`를 반환하며 실행 시간도 짧다.

```js
const heavyJobWithClosure = () => {
  let longArr = Array.from({ length: 10000000 }, (_, i) => i + 1);
  return () => {
    console.log(longArr.length);
    longArr = null;
  };
};
```

<img width="196" alt="image" src="https://github.com/cobocho/FE-Books/assets/99083803/10f718fe-22c3-4200-822e-ef8e442e6969">

위와 같이 클로저의 위해서는 렉시컬 스코프의 참조를 끊어주는 코드를 통해 메모리 누수를 막을 수 있다.
