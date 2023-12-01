# 리액트 파이버 아키텍쳐

## 리액트 파이버

리액트 파이버는 자바스크립트 객체이다. 파이버는 파이버 재조정자(reconciler)가 관리하는데, reconciler는 가상 DOM과 실제 DOM을 비교하여 변경에 관련된 정보를 가지고 있는 파이버를 기준으로 렌더링을 요청한다.

파이버는 애니메이션, 레이아웃, 인터랙션에 대한 반응성 문제를 해결하기 위해 다음과 같은 일을 할 수 있다.

- 작업을 작은단위로 분할하고 쪼갠 후, 우선순위를 매긴다.

- 이러한 작업을 일시 중지하고 나중에 다시 시작한다.

- 이전에 했던 작업을 채사용하거나 폐기한다.

이러한 모든 과정을 **비동기**로 일어난다. 과거에는 스택 알고리즘이었으나, 현재는 동기식의 문제를 해결하기 위해 비동기로 이루어진다.

### 파이버

파이버는 하나의 작업 단위로 구성돼 있다. 리액트는 작업 단위를 하나씩 처리하고 `finishWork()`라는 작업으로 마ㅏ무리한다. 그리고 이 작업을 커밋하여 DOM에 변경사항을 만들어낸다. 다음과 같은 두 단계로 나눌 수 있다.

- 렌더 단계
  렌더 단계에서는 사용자에게 노출되지 않는 모든 비동기 작업을 수행한다. 이때 앞서 언급한 세가지 작업 등이 일어난다.

- 커밋 단계
  `finishWork()`를 실행하여 동기적으로 실행하거나 중단할 수도 있고, 실제 DOM에 반영한다.

파이버의 코드는 다음과 같다.

```js
function FiberNode(tag, pendingProps, key, mode) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;
  this.refCleanup = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null;

  // 이하 프로파일러, __DEV__
}
```

파이버와 리액트 요소의 중요한 차이점은 리액트 요소는 렌더링이 발생하면 새롭게 생성되지만 파이버는 가급적 재사용된다. 파이버는 컴포넌트의 최초 마운트 시점에 생성되어 이후에는 가급적 재사용된다.

### 파이버 주요 속성

#### tag

```js
export const FunctionComponent = 0;
export const ClassComponent = 1;
export const IndeterminateComponent = 2; // Before we know whether it is function or class
export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
export const HostComponent = 5;
export const HostText = 6;
export const Fragment = 7;
export const Mode = 8;
export const ContextConsumer = 9;
export const ContextProvider = 10;
export const ForwardRef = 11;
export const Profiler = 12;
export const SuspenseComponent = 13;
export const MemoComponent = 14;
export const SimpleMemoComponent = 15;
export const LazyComponent = 16;
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const ScopeComponent = 21;
export const OffscreenComponent = 22;
export const LegacyHiddenComponent = 23;
export const CacheComponent = 24;
export const TracingMarkerComponent = 25;
export const HostHoistable = 26;
export const HostSingleton = 27;
```

파이버를 만드는 함수 중 `createFiberFromElement`를 보고 유추할 수 있듯이, 파이버는 **하나의 element에 하나가 생성되는 1:1 관계를 가지고 있다.** 이떄, 1:1로 매칭된 정보를 가지는 것이 `tag`이다. 연결 대상은 리액트 컴포넌트일 수도, DOM 노드일 수도, 혹은 다른 어떤 것일 수도 있다.

#### stateNode

이 속성은 파이버 자체에 대한 참조를 가지고 있고, 이 참조를 바탕으로 리액트는 파이버와 관련된 상태에 접근한다.

#### child, sibling, return

파이버간 관계 개념을 나타낸다. 리액트 컴포넌트 트리처럼 파이버도 트리 형식을 가지는데, 이 트리 형식에 필요한 정보가 이 속성 내부에 정의된다. 다만 리액트 컴포넌트 트리와 다른점은 `children`이 없고 하나의 `child`만 존재한다. 그렇기에 파이버는 다음과 같은 구조를 가진다.

```html
<ul>
  <li>하나</li>
  <li>둘</li>
  <li>셋</li>
</ul>
```

위와 같은 여러 자식이 있는 구조는 `sibling`을 통해 구현된다.

```js
const l3 = {
  return: ul,
  index: 2,
};

const l2 = {
  sibling: l3,
  return: ul,
  index: 1,
};

const l1 = {
  sibling: l2,
  return: ul,
  index: 0,
};

const ul = {
  //...
  child: l1,
};
```

![](https://assets-global.website-files.com/5d2dd7e1b4a76d8b803ac1aa/5f6b3409f5628c49d6136dee_React%20Fiber%20relationship.jpeg)

위와 같이 `<ul>` 파이버(`ul`)의 자식은 첫번째 `<li>`의 파이버(`l1`)이 된다. 나머지 두개의 `<li>`는 `sibling`으로 구성되며, `return`은 부모 파이버를 의미한다.

#### index

`sibling` 간 순서를 숫자로 표현한다.

#### pendingProps

아직 작업을 미처 처리하지 못환 `props`

#### memoizedProps

`pendingProps`를 기준으로 렌더링 이후 `pendingProps`를 `memoizedProps`로 저장해 관리한다.

#### updateQueue

```ts
type UpdateQueue = {
  first: Update | null;
  last: Update | null;
  hasForceUpdate: boolean;
  callbackList: null | Array<Callback>; //setState로 넘긴 콜백 목록
};
```

상태 업데이트, 콜백, DOM 업데이트 등 필요한 작업을 담아두는 큐이다.

#### memoizedState

함수형 컴포넌트에 모든 훅 리스트가 저장된다.

#### alternate

반대편 파이버 트리를 가르킨다.

이렇게 생성된 파이버는 `state`가 변경되거나 생명주기 메서드가 실행되거나 DOM의 변경이 필요할 때 실행된다.
이러한 작업들은 작은 단위로 나눠서 처리할 수도, 애니메이션같이 우선순위가 높은 작업은 빠르게 처리하거나, 낮은 작업을 연기시키는 등 좀 더 유연하게 처리된다.

### 파이버 트리

!()[https://goidle.github.io/static/258b43ce623e7b6340fc6aed969199ed/374ac/vDOM.png]

리액트 내부에는 두개의 파이버 트리가 존재한다. 하나는 현재 모습을 담은 `current` 트리와 작업 중인 상태인 `workingProcess` 트리가 존재한다. 리액트 파이버의 작업이 끝나면 리액트는 단순히 포인터만 병경해 `workingProcess` 트리를 `current` 트리로 수정한다. 이러한 기술을 **더블 버퍼링**이라고 한다.

#### 파이버 작업 순서

파이버 노드의 생성 흐름은 다음과 같다.

1. 리액트는 `beginWork()`를 실행해 ㅎ파이버 작업을 수행하는데, 더이상 자식이 없는 파이버를 만날 때까지 트리 형식으로 시작된다.

2. 1번 작업이 끝나면 그다음 `completeWork()`를 실행해 파이버 작업을 완료한다.

3. 형제가 있을 시 형제로 넘어간다.

4. 2번, 3번이 모두 끝났다면 `return`으로 돌아가 자신의 작업이 끝난 것을 알린다.

```js
<A1>
  <B1>안녕하세요</B1>
  <B2>
    <C1>
      <D1></D1>
      <D2></D2>
    </C1>
  </B2>
  <B3 />
</A1>
```

위 작업은 다음과 같이 수행된다.

![image](https://github.com/cobocho/cobocho/assets/99083803/3227f6df-e916-4b18-8bd5-3ff8fe10173c)

1. `A1`의 `beginWork()`가 수행된다.

2. `A1`의 자식인 `B1`으로 가 `beginWork()`를 수행한다.

3. `B1`은 자식이 없으므로 `completeWork()`를 수행하고 형제인 `B2`로 넘어간다.

4. `B2`의 `beginWork()`를 수행한다.

5. `B2`의 자식인 `C1`으로 가 `beginWork()`를 수행한다.

6. `C1`의 자식인 `D1`으로 가 `beginWork()`를 수행한다.

7. `D1`은 자식이 없으므로 `completeWork()`를 수행하고 형제인 `D2`로 넘어간다.

8. `D2`은 자식이 없으므로 `completeWork()`를 수행한다.

9. `D2`는 자식도 형제도 없으니 순서대로 올라가 `C1`, `B2` 순으로 `completeWork()`를 호출한다.

10. `B2`의 형제인 `B3`로 이동해 `beginWork()`를 수행한다.

11. `B3`의 `completeWork()`를 호출하고 상위로 타오 올라간다.

12. `A1`의 `completeWork()`를 호출한다.

13. 루트 노드가 완성되는 순간, 최종적으로 `commitWork()`가 수행되고 변경사항을 비교해 업데이트가 필요한 변경 사항이 DOM에 반영된다.

트리가 생성된 이후에는 `useState`를 통한 업데이트 요청을 받아 `workingProcess` 트리를 다시 빌드한다. 이 빌드 과정은 앞서 트리를 만드는 과정과 동일하다. 최초 렌더링 시에는 모든 파이버를 새롭게 만들지만, 이후에는 기존 파이버에서 업데이트된 `props`를 받아 파이버 내부에서 처리한다.
