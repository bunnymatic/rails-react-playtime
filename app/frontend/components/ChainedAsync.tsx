import React, { FC, useCallback, useState } from 'react';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * max) + min;
}
const genRandomHex = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

const logit = (msg: unknown) => {
  console.log(`[${new Date().getTime()}]`, msg);
};

const doMutation = ({
  waitTime,
  requestId,
}: {
  waitTime: number;
  requestId: string;
}) =>
  new Promise((resolve, _) => {
    logit(`enqueued ${waitTime}`);
    return setTimeout(() => {
      logit(`done ${waitTime}`);
      return resolve({ waitTime, requestId });
    }, waitTime);
  });

const useAutoSave = ({ runningRequest, enqueue }) => {
  return useCallback(
    async (val: { waitTime: number; requestId: string }) => {
      const maybePreviousAutoSave = !!runningRequest
        ? runningRequest
        : Promise.resolve({ waitTime: 0, requestId: 'initial' });
      const currentAutoSave = maybePreviousAutoSave.then(
        async (previous) => {
          console.log(`queuing muation with ${val}`)
          console.log(previous)
          const requestPromise = doMutation(val);
          const result = await requestPromise;
          console.log({result})
          return result;
        }
      );
      enqueue(currentAutoSave);
      return currentAutoSave;
    },
    [runningRequest, enqueue]
  );
};


interface RequestPayload {
  requestId: string;
  waitTime: number;
}

export const ChainedAsync = () => {
  const [results, setResults] = useState<Array<unknown>>([])
  const [runningRequest, setRunningRequest] = useState<
    () => Promise<unknown> | undefined
  >();
  const enqueue = (request: () => Promise<unknown>) => {
    setRunningRequest(request);
    return request;
  };
  const autoSave = useAutoSave({ runningRequest, enqueue });

  const handleAutoSave = (waitTime: number, requestId: string) => {
    const promise = autoSave({ waitTime, requestId });

    return promise.then((result) => {
      console.log(`updating results ${results.length} ${result}`)
      setResults([...results, result])
    });
  };
  const handleClick = () => {
    const waitTime = getRandomInt(1000, 2000);
    const requestId = genRandomHex(12);
    logit(`enqueing ${waitTime}`);
    return enqueue(handleAutoSave(waitTime, requestId));
  };

//   const onClick =() => {
//     logit('clicked');
//     return handleClick().then((r) =>
//       logit(`${JSON.stringify(r)} click resolved `)
//     );000
//   };

  return (
    <div>
      <div>
        <h2>Hi {new Date().getTime()}</h2>
        <div>count: {results.length}</div>
        { results.map((result) => (
          
          <div key={JSON.stringify(result)}>
            
            <pre>{JSON.stringify(result)}</pre>
          </div>
          ))
        }
      </div>
      <button onClick={handleClick}>add request</button>
    </div>
  );
  // return (
  //   <ChainedAsyncUpdater runningRequest={runningRequest} enqueue={enqueue} />
  // );
};
