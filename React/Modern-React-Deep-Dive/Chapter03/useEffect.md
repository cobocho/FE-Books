# useEffect의 클린업 함수

```ts
function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  useEffect(() => {
    const addMouseEvent = () => {
      console.log(count);
    };

    window.addEventListener('click', addMouseEvent);

    return () => {
      console.log('클린업 함수 실행!', count);
      window.removeEventListener('click', addMouseEvent);
    };
  }, [count]);

  return (
    <>
      <h1>{count}</h1>
      <button onClick={handleClick}>+</button>
    </>
  );
}
```

위 코드의 로그를 살펴보면 다음과 같다.

```
클린업 함수 실행! 0
1

클린업 함수 실행! 1
2

클린업 함수 실행! 2
3

클린업 함수 실행! 3
4
```

위 로그를 살펴보면 클린업 함수는 이전 상태를 참조한다는 것을 알 수 있다. 클린업 함수는 새로운 갑소가 함께 렌더링된 뒤에 실행되기 때문이다.

클린업 함수는 새로운 값을 기반으로 렌더링 뒤에 실행되지만 이 변경된 값 대신에 이전 값을 보고 실행한다.

```ts
// 최초 실행
useEffect(() => {
  const addMouseEvent = () => {
    console.log(1);
  };

  window.addEventListener('click', addMouseEvent);

  // 클린업 함수
  // 다음 렌더링이 끝난 뒤에 실행된다.
  return () => {
    console.log('클린업 함수 실행!', 1);
    window.removeEventListener('click', addMouseEvent);
  };
}, [count]);

// 이후 실행
useEffect(() => {
  const addMouseEvent = () => {
    console.log(2);
  };

  window.addEventListener('click', addMouseEvent);

  // 클린업 함수
  return () => {
    console.log('클린업 함수 실행!', 2);
    window.removeEventListener('click', addMouseEvent);
  };
}, [count]);
```

이 사실을 통해 왜 `useEffect`에 이벤트를 추가하면 클린업에서 지워야하는지를 알 수 있다. `useEffect`는 그 콜백이 실행될 때마다, 이전의 클린업 함수가 존재한다면 그 클린업 함수를 실행한 뒤에 콜백을 실행한다.

즉 상태를 청소해주는 개념으로 보는 것이 옳다.

# useEffect의 구현

`useEffect`의 대략적인 모습은 다음과 같다.

```ts
const MyReact = function () {
  const global = {};
  const index = 0;

  const useEffect = (callback, dependencies) => {
    const hooks = global.hooks;

    // 이전 훅 정보가 있는지 확인한다.
    let previousDependencies = hooks[index];

    // 의존성 배열이 변경됐는지 확인
    let isDependenciesChanged = previousDependencies
      ? dependencies.some((value, idx) => !Object.is(value, previousDependencies[idx]))
      : true;

    if (isDependenciesChanged) {
      // 의존성 배열이 변경시 콜백 실행
      callback();
    }

    // 현재 의존성을 훅에 다시 저장한다.
    hooks[index] = dependencies;

    // 다음 훅이 일어날 때를 대비하기 위해 index를 추가한다.
    index++;
  };
};
```

핵심은 의존성 배열의 이전 값과 현재 값의 얕은 비교이다.

# useEffect 사용시 주의사항

## 빈 의존성 배열을 피하자

```ts
function Component({ log }) {
  useEffect(() => {
    logging(log);
  }, []);
}
```

`useEffect`는 반드시 의존성 배열로 전달한 값의 변경에 의해 실행되어야 한다. 의존성 배열이 없다면, 부수 효과와 컴포넌트의 연결고리가 끊어지게 된다. 정말로 마운트 시 실행되어야하는지 부모 컴포넌트로부터 찾아보자.

## useEffect의 콜백에 함수명을 부여하라

```ts
useEffect(const logActiveUser = () => {
  logging(user.id)
})
```

`useEffect`가 많아진다면 콜백에 이름을 부여하면 목적을 파악하기 쉬워진다.
