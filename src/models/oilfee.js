import {
  queryoilfee1,
  queryoilfee1List,
  queryoilfee1ListExport,
  queryoilfee2,
  queryoilfeeCompanyLevel,
  queryoilfee3,
  queryoilfee3Export,
  queryoilfee3List,
  queryoilfee3ListExport,
  queryoilfee4List,
  queryoilfee4ListExport,
  queryoilfeeDownloadTemplet,
  queryoilfeeBranch,
  queryoilfeeCompany,
  queryoilfeeDriver,
  queryoilfeeDistribute,
  queryoilfeeRecover,
  queryoilfeeRecycle,
} from '../services/api';

export default {
  namespace: 'oilfee',

  state: {
    oilAccountInfo: {},
    oilAccountInfoAmount: '',
    oilAccountInfoList: {},
    oilAccountInfoListExport: {},
    oilBranchInfoList: {},
    oilBranchInfodetailList: {},
    oilBranchInfoCompanyLevel: [],
    oilDriverInfoList: {},
    oilDriverInfoListExport: {},
    oilDriverInfodetailList: {},
    oilDriverInfodetailListExport: {},
    providedetailList: {},
    providedetailListExport: {},
    provideTemplet: {},
    branchCompany: [],
    provideCompany: [],
    provideCompanyCount: 0,
    provideDriver: [],
    provideDriverCount: 0,
    provideDistribute: {},
    provideRecover: {},
    provideRecycle: { money: '正在加载' },
  },

  effects: {
    //帐户-获取油卡账户详情
    *fetch1({ payload }, { call, put }) {
      const response = yield call(queryoilfee1, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilAccountInfo: response.res,
            oilAccountInfoAmount: response.res.accountAmount == undefined ? '...' : response.res.accountAmount,
          },
        });
      }
    },
    //帐户-公司账户流水明细（总公司/分公司）
    *fetch1List({ payload }, { call, put }) {
      const response = yield call(queryoilfee1List, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilAccountInfoList: response.res,
          },
        });
      }
    },
    //帐户-公司账户流水明细导出（总公司/分公司）
    *fetch1ListExport({ payload }, { call, put }) {
      const response = yield call(queryoilfee1ListExport, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilAccountInfoListExport: response,
          },
        });
      }
    },
    //帐户-获取分公司油卡账户详情
    *fetch2({ payload }, { call, put }) {
      const response = yield call(queryoilfee2, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilBranchInfoList: response.res,
          },
        });
      }
    },
    //帐户-公司账户流水明细（总公司/分公司)
    *fetch2Detail({ payload }, { call, put }) {
      const response = yield call(queryoilfee1List, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilBranchInfodetailList: response.res,
          },
        });
      }
    },
    //帐户-获取司机油卡账户详情列表
    *fetch3({ payload }, { call, put }) {
      const response = yield call(queryoilfee3, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilDriverInfoList: response.res,
          },
        });
      }
    },
    //帐户-获取司机油卡账户详情列表导出
    *fetch3Export({ payload }, { call, put }) {
      const response = yield call(queryoilfee3Export, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilDriverInfoListExport: response,
          },
        });
      }
    },
    //帐户-司机油卡账户收支明细
    *fetch3Detail({ payload }, { call, put }) {
      const response = yield call(queryoilfee3List, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilDriverInfodetailList: response.res,
          },
        });
      }
    },
    //帐户-司机油卡账户收支明细导出
    *fetch3DetailExport({ payload }, { call, put }) {
      const response = yield call(queryoilfee3ListExport, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilDriverInfodetailListExport: response,
          },
        });
      }
    },
    //帐户-（总/分）公司油费发放详情
    *fetch4Detail({ payload }, { call, put }) {
      const response = yield call(queryoilfee4List, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            providedetailList: response.res,
          },
        });
      }
    },
    //帐户-（总/分）公司油费发放详情导出
    *fetch4DetailExport({ payload }, { call, put }) {
      const response = yield call(queryoilfee4ListExport, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            providedetailListExport: response,
          },
        });
      }
    },
    //获取分公司列表
    *fetchBranch({ payload }, { call, put }) {
      const response = yield call(queryoilfeeBranch, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            branchCompany: response.res,
          },
        });
      }
    },
    //获取公司等级
    *fetchCompanyLevel({ payload }, { call, put }) {
      const response = yield call(queryoilfeeCompanyLevel, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            oilBranchInfoCompanyLevel: response.res,
          },
        });
      }
    },
    //当前可发放油费的子公司,isAll=1获取全部
    *fetchProvideCompany({ payload }, { call, put }) {
      const response = yield call(queryoilfeeCompany, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            provideCompany: response.res.list,
            provideCompanyCount: response.res.count,
          },
        });
      }
    },
    //当前可发放油费的司机,isAll=1获取全部，distribute=1获取有效司机
    *fetchProvideDriver({ payload }, { call, put }) {
      const response = yield call(queryoilfeeDriver, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            provideDriver: response.res.list,
            provideDriverCount: response.res.count,
          },
        });
      }
    },
    //添加发放计划
    *fetchProvideDistribute({ payload }, { call, put }) {
      const response = yield call(queryoilfeeDistribute, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            provideDistribute: response,
          },
        });
      }
    },
    //帐户-油费回收
    *fetchProvideRecover({ payload }, { call, put }) {
      const response = yield call(queryoilfeeRecover, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            provideRecover: response,
          },
        });
      }
    },
    //获取可回收油费
    *fetchProvideRecycle({ payload }, { call, put }) {
      const response = yield call(queryoilfeeRecycle, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            provideRecycle: response.res,
          },
        });
      }
    },
    //获取可回收油费后，重置为“正在加载”
    *fetchProvideRecycleReset({ payload }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          provideRecycle: { money: '正在加载' },
        },
      });
    },
    // 下载模板-油费发放
    *fetchProvideDownloadTemplet({ payload }, { call, put }) {
      const response = yield call(queryoilfeeDownloadTemplet, payload);
      if(response) {
        yield put({
          type: 'save',
          payload: {
            provideTemplet: response,
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
