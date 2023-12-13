# useReducer

`useReducer`는 `useState`의 심화 버전이라고 볼 수 있다. 특징은 다음과 같다.

- 반환값은 `useState`와 동일하게 길이가 2인 배열이다.

  - state: 현재 리듀서의 값을 의미한다.
  - dispatcher: `state`를 업데이트하는 함수이다.

- 인수는 2개에서 3개를 받는다.
  - reducer: 기본 액션을 정의하는 함수이다.
  - initialState: 두 번째 인수로, 상태의 초깃값을 의미한다.
  - init: 게으른 초기화처럼 초깃값을 지연해서 생성시키고싶을때 사용한다.

```ts
interface State {
  count: number;
}

type Action = { type: 'up' | 'down' | 'reset'; payload?: State };

const init = (count: State) => {
  return count;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'up':
      return { count: state.count + 1 };
    case 'down':
      return { count: state.count - 1 };
    case 'reset':
      return init(action.payload || { count: 0 });
    default:
      throw new Error(`unexpected action type ${action.type}`);
  }
};

const initialState: State = { count: 0 };

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState, init);

  const plusHandler = () => {
    dispatch({ type: 'up' });
  };
  const minusHandler = () => {
    dispatch({ type: 'down' });
  };
  const resetHandler = () => {
    dispatch({ type: 'reset', payload: { count: 1 } });
  };

  return (
    <div>
      <h1>{state.count}</h1>
      <button onClick={plusHandler}>+</button>
      <button onClick={minusHandler}>-</button>
      <button onClick={resetHandler}>reset</button>
    </div>
  );
};

export default App;
```

`reducer`의 목적은 복잡한 `state`를 컴포넌트의 외부에 두고 `state`에 대한 병경을 `dispatch`로 제한하는 것이다.

Preact의 `useState`의 경우 내부에서 `useReducer`를 사용한다.

```ts
export const useState = (initialState) => {
  currentHook = 1;
  return useReducer(invokeOrReturn, initialState);
};
```

그얼다면 `useState`는 `useReducer`로 어떻게 구현할 수 있을까?

```ts
const reducer = (prevState, newState) => {
  return typeof newState === 'function' ? newState(prevState) : newState;
};
```

먼저 첫 번째 인수는 값을 업데이트하는 함수이거나 값 그자체여야 한다.

두번째 인수는 초깃값이니 별다른 처리를 하지 않는다.

```ts
const init = (initialArg: Initializer) => {
  return typeof initialArg === 'funtion' ? initialArg() ; initialArg;
}
```

세 번째 인수는 값을 초기화하는 함수이거나 값 그자체여야 한다.

위 두 함수를 `useReducer`에서 사용하면 `useState`를 흉내낼 수 있다.

반대로 `useState`로 `useReducer`를 흉내낼 수도 있다.
