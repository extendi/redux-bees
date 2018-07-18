export default function buildMiddleware() {
  return () => next => (promise) => {
    if (!promise) {
      return null;
    }

    if (!promise.then) {
      return next(promise);
    }

    if (promise.noop) {
      return null;
    }

    const meta = {
      api: true,
      name: promise.actionName,
      params: promise.params,
    };

    next({
      type: `api/${promise.actionName}/request`,
      meta: { ...meta, type: 'request' },
    });

    return promise
      .then((result) => {
        next({
          type: `api/${promise.actionName}/response`,
          payload: result,
          meta: { ...meta, type: 'response' },
        });
        return Promise.resolve(result);
      })
      .catch((result) => {
        next({
          type: `api/${promise.actionName}/error`,
          payload: result,
          meta: { ...meta, type: 'error' },
        });
        return Promise.reject(result);
      });
  };
}
