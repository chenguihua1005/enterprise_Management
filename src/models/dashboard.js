import { 
  queryStatisticsInfo,
  queryAddOilStatistics,
  queryBranchAddOilStatistics
} from '../services/api';

export default {
  namespace: 'dashboard',

  state: {
    statisticsInfo: {},
    addOilStatistics: [],
    branchAddOilStatistics: [],
    loading: false,
  },

  effects: {
    *statisticsInfo({ payload }, { call, put }) {
      const response = yield call(queryStatisticsInfo, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            statisticsInfo: response.res,
          },
        });
      }
      
    },
    *addOilStatistics({ payload }, { call, put }) {
      const response = yield call(queryAddOilStatistics, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            addOilStatistics: response.res,
          },
        });
      }
      
    },
    
    *branchAddOilStatistics({ payload }, { call, put }) {
      const response = yield call(queryBranchAddOilStatistics, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            branchAddOilStatistics: response.res,
          },
        });
      }
      
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        salesData: [],
      };
    },
  },
};
