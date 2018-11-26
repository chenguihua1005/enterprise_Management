import {
  queryBasicinfoBranch,
  querySearchOrder,
  querySkidList,
  queryGoodsList,
  queryRegionList,
  queryRetailOrderDetails
} from '../services/api';

export default {
  namespace: 'order',

  state: {
    orderList: [],
    skidList: [],
    regionCompany: [],
    cityCompany: [],
    orderDetails: {},
    exportList: {},
  },

  effects: {
    *searchOrder({ payload }, { call, put }) {
      const response = yield call(querySearchOrder, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            orderList: response.res
          },
        });
      }
      
    },
    *searchOrderExport({ payload }, { call, put }) {
      const response = yield call(querySearchOrder, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            exportList: response
          },
        });
      }
    },
    *skidList({ payload }, { call, put }) {
      const response = yield call(querySkidList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            skidList: response.res
          },
        });
      }
      
    },
   // 分公司
    *fetchBranchCompany({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoBranch, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            branchCompany: response.res.info
          },
        });
      }
      
    },
    // 用油类型
    *fetchGoodsCompany({ payload }, { call, put }) {
      const response = yield call(queryGoodsList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            GoodsCompany: response.res
          },
        });
      }
     
    },
    // 城市
    *regionList({ payload }, { call, put }) {
      const response = yield call(queryRegionList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            regionCompany: response.res
          },
        });
      }
    },
    // 地区
    *regionList2({ payload }, { call, put }) {
      const response = yield call(queryRegionList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            cityCompany: response.res
          },
        });
      }
    },
    // 订单详情
    *retailOrderDetails({ payload }, { call, put }) {
      const response = yield call(queryRetailOrderDetails, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            orderDetails: response.res
          },
        });
      }
    },
  },

  reducers: {
    save(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
