import {
  queryDailySheetLoad,
  queryDailySheetDownLoad,
  queryRegionList,
  queryCompanyTree,
  queryMonthlySheetLoad,
  queryMonthlySheetDownLoad
  } from '../services/api';
  
  export default {
    namespace: 'sheet',
  
    state: {
      daliySheetList: [],
      daliyReporList: [],
      monthlySheetList: [],
      monthlyReporList: [],
      regionList: [],
      treeList:[]
    },
  
    effects: {
      //公共树
      *fetchCompanyTree({ payload }, { call, put }) {
        const response = yield call(queryCompanyTree, payload);
        if (response) {
          yield put({
            type: 'save',
            payload: {
              treeList: response.res,
            },
          });
        }
      },
      //城市
      *fetchRegionList({ payload }, { call, put }) {
        const response = yield call(queryRegionList, payload);
        if (response) {
          yield put({
            type: 'save',
            payload: {
              regionList: response.res,
            },
          });
        }
      },
      //日报表查询
      *fetchDailySheet({ payload }, { call, put }) {
        const response = yield call(queryDailySheetLoad, payload);
        if (response) {
          yield put({
            type: 'save',
            payload: {
              daliySheetList: response.res,
            },
          });
        }
      },
      //日报表导出
      *fetchDailyReport({ payload }, { call, put }) {
        const response = yield call(queryDailySheetDownLoad, payload);
        if (response) {
          yield put({
            type: 'save',
            payload: {
              daliyReporList: response,
            },
          });
        }
      },
       //月报表查询
       *fetchMonthlySheet({ payload }, { call, put }) {
        const response = yield call(queryMonthlySheetLoad, payload);
        if (response) {
          yield put({
            type: 'save',
            payload: {
              monthlySheetList: response.res,
            },
          });
        }
      },
      //月报表导出
      *fetchMonthlyReport({ payload }, { call, put }) {
        const response = yield call(queryMonthlySheetDownLoad, payload);
        if (response) {
          yield put({
            type: 'save',
            payload: {
              monthlyReporList: response,
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
  