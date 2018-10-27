import { queryBillList, queryBillDetail, queryBillOrderList, queryOwnCompanyList } from '../services/api';

export default {
  namespace: 'statement',

  state: {
    billList: [],
    exportList: {},
    billOrderList: [],
    ownCompanyList: [],
    billDetail: {},
  },

  effects: {
    //结算 - 帐单列表或导出
    *billlist({ payload }, { call, put }) {
      const response = yield call(queryBillList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            billList: response.res
          },
        });
      }
      
    },
    *billlistExport({ payload }, { call, put }) {
      const response = yield call(queryBillList, payload);
      yield put({
        type: 'save',
        payload: {
          exportList: response
        },
      });
    },
    //结算 - 帐单详情
    *billDetail({ payload }, { call, put }) {
      const response = yield call(queryBillDetail, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            billDetail: response.res
          },
        });
      }
      
    },
    //结算-获取帐单订单列表
    *billOrderList({ payload }, { call, put }) {
      const response = yield call(queryBillOrderList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            billOrderList: response.res
          },
        });
      }
      
    },
    //公共接口 - 帐单列表页面获取帐套公司列表
    *ownCompanyList({ payload }, { call, put }) {
      const response = yield call(queryOwnCompanyList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            ownCompanyList: response.res
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
  },
};
