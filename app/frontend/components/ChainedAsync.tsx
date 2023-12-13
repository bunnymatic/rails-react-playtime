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
      resolve({ waitTime, requestId });
    }, waitTime);
  });

const useAutoSave = ({ asyncRequests, enqueue }) => {
  return useCallback(
    async (val: { waitTime: number; requestId: string }) => {
      const maybePreviousAutoSave = asyncRequests.length
        ? asyncRequests[asyncRequests.length - 1]
        : Promise.resolve({ waitTime: 0, requestId: 'initial' });
      const currentAutoSave = maybePreviousAutoSave.then(
        async (previousResult) => {
          logit({ previousResult, waitTime: val.waitTime });
          const requestPromise = doMutation(val);
          const result = await requestPromise;
          return val;
        }
      );
      enqueue(currentAutoSave);
      return currentAutoSave;
    },
    [asyncRequests, enqueue]
  );
};

interface ChainedAsyncUpdaterProps {
  asyncRequests: Array<() => Promise<unknown>>;
  enqueue: () => void;
}

interface RequestPayload {
  requestId: string;
  waitTime: number;
}
const ChainedAsyncUpdater = ({
  asyncRequests,
  enqueue,
}): FC<ChainedAsyncUpdaterProps> => {
  const autoSave = useAutoSave({ asyncRequests, enqueue });
  const [entries, setEntries] = useState<RequestPayload[]>([]);

  const handleAutoSave = (waitTime: number, requestId: string) => {
    const promise = autoSave({ waitTime, requestId } as RequestPayload);

    return promise.then(() => {
      setEntries([...entries, { waitTime, requestId } as RequestPayload]);
    });
  };
  const handleClick = () => {
    const waitTime = getRandomInt(1000, 2000);
    const requestId = genRandomHex(12);
    logit(`enqueing ${waitTime}`);
    return enqueue(handleAutoSave(waitTime, requestId));
  };

  const onClick = async () => {
    logit('clicked');
    return handleClick().then((r) =>
      logit(`${JSON.stringify(r)} click resolved `)
    );
  };

  return (
    <div>
      <div>
        <h2>Queue Size: #{asyncRequests.length}</h2>
        {entries.map((e) => (
          <div key={e.requestId}>
            <pre>{JSON.stringify(e)}</pre>
          </div>
        ))}
      </div>
      <button onClick={onClick}>add request</button>
    </div>
  );
};
export const ChainedAsync = (): FC => {
  const [asyncRequests, setAsyncRequests] = useState<
    () => Promise<Array[number]>
  >([]);
  const enqueue = (request) => {
    setAsyncRequests([...asyncRequests, request]);
    return request;
  };

  return (
    <ChainedAsyncUpdater asyncRequests={asyncRequests} enqueue={enqueue} />
  );
};
