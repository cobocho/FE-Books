# 클래스형 컴포넌트

## shouldComponentUpdate()

기본적으로 `this.setState`가 호출되면 리렌더링 된다. 하지만 해당 메서드를 통해 컴포넌트에 영향을 받지 않는 변화에 대해 정의할 수 있다.

해당 메서드가 `true`를 반환하면 리렌더링이 일어나고 `false`를 반환하면 리렌더링이 일어나지 않는다.

```ts
shouldComponentUpdate(nextProps: Props, nextState: State) {
  // props의 타이틀이 같거나 state의 input이 같으면 업데이트하지 않는다.
  return this.props.title !== nextProps.title || this.state.input !== nextState.input
}
```

## React.PureComponent

`PureComponent`는 `props`와 `state`에 대한 얕은 비교를 실행하여 동일할 경우 리렌더링을 건너뛴다.

```ts
import React from 'react';

interface State {
  count: number;
}

type Props = Record<string, never>;

export class ReactComponent extends React.Component<Props, State> {
  private renderCounter = 0;

  private constructor(props: Props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  private handleClick = () => {
    this.setState({ count: 1 });
  };

  public render() {
    console.log('ReactComponent', ++this.renderCounter); // eslint-disable-line no-console
    return (
      <h1>
        ReactComponent: {this.state.count} <button onClick={this.handleClick}>+</button>
      </h1>
    );
  }
}

export class ReactPureComponent extends React.PureComponent<Props, State> {
  private renderCounter = 0;

  private constructor(props: Props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  private handleClick = () => {
    this.setState({ count: 1 });
  };

  public render() {
    console.log('ReactPureComponent', ++this.renderCounter); // eslint-disable-line no-console
    return (
      <h1>
        ReactPureComponent: {this.state.count} <button onClick={this.handleClick}>+</button>
      </h1>
    );
  }
}

export default function CompareComponent() {
  return (
    <>
      <h2>React.Component</h2>
      <ReactComponent />
      <h2>React.PureComponent</h2>
      <ReactPureComponent />
    </>
  );
}
```

`PureComponent`와 `Component`를 통해 실행한 위 코드의 결과는 다음과 같다.

<img width="522" alt="image" src="https://github.com/cobocho/cobocho/assets/99083803/0d2b4ef2-a20e-4673-8302-415f31169dff">

하지만 `PureComponent`의 경우 얕은 비교만 실행하기에 복잡한 구조의 데이터 변경은 감지하지 못하고 비교 연산 과정에서도 비용이 존재하기에 얕은 비교가 동일한 경우가 많은 컴포넌트에 적재적소로 활용하는 것이 좋다.

## static getDerivedStateFromProps()

```ts
static getDerivedStateFromProps(nextProps: Props, prevState: State) {
  if (props.name !== state.name) {
    // state를 변경시킨다.
    return {
      name: props.name
    }

    // state에 영향을 끼치지 않는다.
    return null;
  }
}
```

이 메서드는 `render()`를 호출하기 직전에 호출되며. 반환값으로 `state`를 업데이트한다. `null`을 반환하면 영향을 주지 않는다.

## static getSnapShotBeforeUpdate()

이 메서드는 DOM이 업데이트되기 직전에 호출된다. 여기서 반환되는 값은 `componentDidUpdate`로 전달된다. DOM에 렌더링되기 전에 윈도우 크기를 조절하거나 스크롤 위치를 조정하는 등의 작업을 처리하는데 유용하다.

```ts
class ScrollingList extends React.Component {
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  getSnapShotBeforeUpdate(prevProps: Props, prevState: State) {
    if (props.list.length < this.props.list.length) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }

    return null;
  }

  // snapshot은 클래스 제네릭의 세번째 인수로 넣어줄 수 있다.
  componentDidUpdate(prevProps: Props, prevState: State, snapshot: Snapshot) {
    // getSnapShotBeforeUpdate로 넘겨받은 값을 snapshot을 통해 접근 가능하다.
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  render() {
    return <div ref={this.listRef}>{/* ...contents... */}</div>;
  }
}
```

## 생명주기 메서드 정리

<img width="1149" alt="image" src="https://github.com/cobocho/cobocho/assets/99083803/7963d0d1-2bc0-4ebd-ad25-8212ae355fc0">

## getDerivedStateFromError()

이 메서드는 정상적인 생명주기에서 실행되는 메서드가 아닌 에러 상황에서 실행되는 메서드다.

`getDerivedStateFromError`는 자식 컴포넌트에서 에러가 발행했을 때 호출되는 메서드이다.

```ts
type Props = PropsWithChildren<{}>;
type State = { hasError: boolean; errorMessage: string };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.toString() };
  }

  render() {
    // 에러 발생시
    if (this.state.hasError) {
      return (
        <div>
          <h1>에러가 발생하였습니다.</h1>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }

    // 일반적인 상황
    return this.props.children;
  }
}
```

`getDerivedStateFromError`는 static 메서드로 `error`를 인수로 받으며 이는 하위 컴포넌트에서 발생한 에러를 말한다. 그리고 `getDerivedStateFromError`는 반드시 `state` 값을 반환해야한다. 이유는 `getDerivedStateFromError`가 하위 컴포넌트에서 에러가 발생할 시 어떻게 렌더링을 결정하는 용도이기 때문이다. 또한 렌더링 과정에서 호출되므로 부수효과를 일으켜서는 안된다. 부수효과는 `componentDidCatch`를 통해 컨트롤한다.

## componentDidCatch

`componentDidCatch`는 자식 컴포넌트에서 에러가 발생시 실행되며 `getDerivedStateFromError`에서 에러를 잡고 `state`를 결정한 이후에 실행된다. `componentDidCatch`는 두 개의 인수를 받는데, 첫번째는 `error`, 두번째는 어떤 컴포넌트가 에러를 발생시켰는지 가지는 `info`이다.

```ts
type Props = PropsWithChildren<{}>;
type State = { hasError: boolean; errorMessage: string };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.toString() };
  }

  componentDidCatch(error, info) {
    console.log(error);
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    console.log(info.componentStack);
  }

  render() {
    // 에러 발생시
    if (this.state.hasError) {
      return (
        <div>
          <h1>에러가 발생하였습니다.</h1>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }

    // 일반적인 상황
    return this.props.children;
  }
}
```

`componentDidCatch`에서 부수효과를 처리할 수 있는 이유는 커밋 단계에서 해당 메서드가 실행되기 때문이다.

## 클래스형 컴포넌트의 한계

### 데이터를 추적하기가 어렵다.

클래스형 컴포넌트는 `state`의 흐름을 추적하기가 어렵다. 또한 메서드의 순서가 강제되지 않아 읽기도 어렵다.

### 내부 로직의 재사용이 어렵다.

공통 로직이 많아질수록 코차 컴포넌트나 `props`가 많아져 코드 관리가 힘들다.

### 기능이 많아질수록 컴포넌트의 크기가 커진다.

내부에서 처리하는 로직과 데이터 흐름이 많아질수록 컴포넌트 킈가 기하급수적으로 늘어난다.

### 코드 크기를 최적화하기 어렵다.

클래스형 컴포넌트는 트리쉐이킹이 완벽하게 되지 않아 번들 크기를 최적화하는데 불리한 요소를 가진다.

### 핫 리로딩에 불리하다.

클래스형 컴포넌트는 최초 렌더링 시에 인스턴스를 생성하고 내부에서 `state`를 관리하므로 초기화되지만 함수형 컴포넌트는 클로저를 통해 관리하므로 함수가 다시 실행되도 `state`를 잃지 않는다.
