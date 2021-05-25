const module = {
  namespaced: true,
  state() {
    return {
      rows: [],
      schema: "",
      columnDefs: [
        {
          field: 'selectCol',
          headerName: '',
          size: '40px',
          type: 'supp',
        },
      ],
      fileHeader: [],
      fileRows: [],
      fileNbRows: 0,
      realRowsIds: [],
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
  setColumnDefsData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.columnDefs = data;
  },
  setFileHeaderData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.fileHeader = data;
  },
  setFileRowsData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.fileRows = data;
  },
  setFileNbRowsData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.fileNbRows = data;
  },
  setRealRowsIdsData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.realRowsIds = data;
  },
  reinitData(state) {      
    state.rows = [];
    state.schema = "";
    state.columnDefs =  [
      {
        field: 'selectCol',
        headerName: '',
        size: '40px',
        type: 'supp',
      },
    ];
    state.fileHeader = [];
    state.fileRows = [];
    state.fileNbRows = 0;
  },
};

const actions = {
  fillSchemaNameData({ commit }, data) {
    commit('setSchemaNameData', data);
  },
  fillSchemaRowsData({ commit }, data) {
    commit('setSchemaRowsData', data);
  },
  fillColumnDefsData({ commit }, data) {
    commit('setColumnDefsData', data);
  },
  fillFileHeaderData({ commit }, data) {
    commit('setFileHeaderData', data);
  },
  fillFileRowsData({ commit }, data) {
    commit('setFileRowsData', data);
  },
  fillFileNbRowsData({ commit }, data) {
    commit('setFileNbRowsData', data);
  },
  fillRealRowsIds({ commit }, data) {
    commit('setRealRowsIdsData', data);
  },
  reinitStateData({ commit }) {
    commit('reinitData');
  },
};

export default { ...module, mutations, actions };
