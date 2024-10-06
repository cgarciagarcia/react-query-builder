const watchAction = (attribute, watchFunction, builder, state) => {
  const watcher = watchFunction(attribute, builder);

  return {
    ...state,
    watchers: {
      ...state.watchers,
      [attribute]: watcher,
    },
  };
};
