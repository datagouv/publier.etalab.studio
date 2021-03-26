const module = {
  namespaced: true,
  state() {
    return {
      rows: [],
      schema: "etalab/schema-hautes-remunerations",
      tutu: "ooo",
    };
  },
};

const mutations = {
  setSchemaNameData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.schema = data;
  },
  setSchemaRowsData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.rows = data;
  },
};

const actions = {
  fillSchemaNameData({ commit }, data) {
    commit('setSchemaNameData', data);
  },
  fillSchemaRowsData({ commit }, data) {
    commit('setSchemaRowsData', data);
  },
};

export default { ...module, mutations, actions };
