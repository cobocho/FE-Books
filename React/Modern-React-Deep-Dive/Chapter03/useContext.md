# useContext

## Context란

리액트에서는 props drilling에 대한 대안으로 값을 공유하기 위해 존재하는 기능이다.

```tsx
interface Props extends PropsWithChildren {
  text: string;
}

interface MyContextValue {
  hello: string;
}

const MyContext = createContext<MyContextValue | undefined>(undefined);

const ContextProvider = ({ text, children }: Props) => {
  return <MyContext.Provider value={{ hello: text }}>{children}</MyContext.Provider>;
};

const useMyContext = () => {
  const context = useContext(MyContext);

  if (context === undefined) {
    throw new Error('useMyContext는 ContextProvider 내부에서만 사용 가능합니다.');
  }

  return context;
};

const Child = () => {
  const { hello } = useMyContext();

  return <div>{hello}</div>;
};

const App = () => {
  return (
    <>
      <ContextProvider text="react">
        <Child />
      </ContextProvider>
    </>
  );
};
```

특히 위처럼 컨텍스트를 함수로 감싸서 사용한다면 컨텍스트 타입 추론도 간편하고 `Provider`의 유무도 쉽게 에러를 찾을 수 있다.

# useContext 사용시 주의할 점

`useContext`를 함수형 컴포넌트 내부에서 사용할 경우에는 항상 컴포넌트 재활용이 어려워진다는 것을 염두에 두어야한다.
컨텍스트를 사용하는 순간 해당 컴포넌트는 컨텍스트와 종속성을 가지게된다.

이러한 상황을 방지하기 위해서는 컨텍스트를 작게 가져가거나 재사용되지 않을만한 컴포넌트에만 사용한다.
