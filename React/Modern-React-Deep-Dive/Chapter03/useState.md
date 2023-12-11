# useState

`useState`는 함수형 컴포넌트 내부에서 상태를 정의하고 관리한다. 리액트는 `useState`에서 변수에 대한 접근을 위하여 클로저를 사용한다. 리액트의 `useState`의 작동원리를 대략적으로 흉내를 낸다면 다음과 같다.

```ts
const = MyReact = function () {
  const global = {};
  let index = 0;

  const useState = (initialState) => {
    if (!global.states) {
      // 최초 접근시 빈배열로 초기화한다.
      global.states = [];
    }

    // 현재 상태값이 있는지 조회 후 없으면 초깃값으로 설정한다.
    const currentState = global.states[index] || initialState;

    // states의 값을 위에서 정한 상태값으로 변경한다.
    global.states[index] = currentState;

    // 즉시 실행 함수로 setter를 만든다.
    const setState = (function () {
      // 현재 index를 클로저로 가두어 setState의 인덱스를 유지시킨다.
      let currentIndex = index;

      return (value) => {
        global.states[currentIndex] = value;
        // 렌더링 로직...
      };
    })();

    // useState를 쓸 때 마다 index를 하나씩 추가한다.
    // 즉, 하나의 state마다 index가 할당된다.
    index += 1;

    return [currentState, setState];
  };
};
```

실제 리액트 라이브러리에서는 `useReducer`를 이용한다.
이처럼 리액트는 클로저를 사용하여 이전의 값을 정확하게 꺼내 쓸 수 있다.
