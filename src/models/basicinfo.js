import {
  queryBasicinfo1,
  queryBasicinfo1Branch,
  queryBasicinfo2,
  queryBasicinfo3,
  queryCloseUser,
  queryAddUser,
  queryBasicinfoBranch,
  queryBasicinfoValid,
  queryBasicinfoDriverInfo,
  queryBasicinfoDriverUpdate,
  queryBasicinfoDriverAdd,
  queryBasicinfoDriverDel,
  queryUserInfo,
  queryUpdateUser,
  queryUpdateSubsidiary,
  querySubsidiaryInfo,
  querySubsidiaryOptions,
  queryAddSubsidiary,
  queryResetPassword,
  queryGetUserData,
  querySubsidiaryDownloadTemplet,
  querySubsidiaryImportDriverInfo,
} from '../services/api';

export default {
  namespace: 'basicinfo',

  state: {
    subsidiaryList: [],
    subsidiaryBranchList: [],
    driverList: [],
    accountList: [],
    //所属分公司
    branchCompany: [],
    //是否有效
    isValid: {},
    driverInfo: {},//司机编辑
    driverUpdate: {},
    driverAdd: {},
    driverDel: {},
    userStatus: {},
    addUser: {}, //账号编辑
    subsidiaryInfo: {}, //分公司编辑
    userInfo: {}, //账号编辑
    updateUser: {},
    resetPassword: {},
    updateSubsidiary: {},
    addSubsidiary: {},
    getUserData: {},
    subsidiaryOptions: [],
    subsidiaryTemplet: {},
    subsidiaryImportDriverInfo: {},
  },

  effects: {
    //分公司管理下拉列表
    *fetch1({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo1, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryList: response.res,
        },
      });
    },
    // 二级分公司新增公司判断
    *getUserData({ payload }, { call, put }) {
      const response = yield call(queryGetUserData, payload);
      yield put({
        type: 'save',
        payload: {
          getUserData: response,
        },
      });
    },
    *fetch1Branch({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo1Branch, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryBranchList: response.res.list,
        },
      });
    },
    //司机管理下拉列表
    *fetch2({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo2, payload);
      yield put({
        type: 'save',
        payload: {
          driverList: response.res,
        },
      });
    },
    //账号管理下拉列表
    *fetch3({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo3, payload);
      yield put({
        type: 'save',
        payload: {
          accountList: response.res,
        },
      });
    },
    *closeUser({ payload }, { call, put }) {
      const response = yield call(queryCloseUser, payload);
      yield put({
        type: 'save',
        payload: {
          userStatus: response.res,
        },
      });
    },
    *addUser({ payload }, { call, put }) {
      const response = yield call(queryAddUser, payload);
      yield put({
        type: 'save',
        payload: {
          addUser: response,
        },
      });
    },

    *fetchBranchCompany({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoBranch, payload);
      yield put({
        type: 'save',
        payload: {
          branchCompany: response.res.info,
        },
      });
    },
    *fetchValidation({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoValid, payload);
      yield put({
        type: 'save',
        payload: {
          isValid: response.res.driverCompanyRelationType,
        },
      });
    },

    *fetchDriverInfo({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoDriverInfo, payload);
      yield put({
        type: 'save',
        payload: {
          driverInfo: response.res,
        },
      });
    },

    //司机更新
    *driverUpdate({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoDriverUpdate, payload);
      yield put({
        type: 'save',
        payload: {
          driverUpdate: response,
        },
      });
    },
    //司机新增
    *driverAdd({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoDriverAdd, payload);
      yield put({
        type: 'save',
        payload: {
          driverAdd: response,
        },
      });
    },
    //司机删除
    *driverDel({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoDriverDel, payload);
      yield put({
        type: 'save',
        payload: {
          driverDel: response,
        },
      });
    },
    // 编辑用户
    *updateUser({ payload }, { call, put }) {
      const response = yield call(queryUpdateUser, payload);
      yield put({
        type: 'save',
        payload: {
          updateUser: response,
        },
      });
    },
    // 用户详情
    *userInfo({ payload }, { call, put }) {
      const response = yield call(queryUserInfo, payload);
      yield put({
        type: 'save',
        payload: {
          userInfo: response.res,
        },
      });
    },

    // 重置密码
    *resetPassword({ payload }, { call, put }) {
      const response = yield call(queryResetPassword, payload);
      yield put({
        type: 'save',
        payload: {
          resetPassword: response.res,
        },
      });
    },

    // 添加公司
    *addSubsidiary({ payload }, { call, put }) {
      const response = yield call(queryAddSubsidiary, payload);
      yield put({
        type: 'save',
        payload: {
          addSubsidiary: response,
        },
      });
    },
    // 编辑公司
    *updateSubsidiary({ payload }, { call, put }) {
      const response = yield call(queryUpdateSubsidiary, payload);
      yield put({
        type: 'save',
        payload: {
          updateSubsidiary: response,
        },
      });
    },
    // 公司详情
    *subsidiaryInfo({ payload }, { call, put }) {
      const response = yield call(querySubsidiaryInfo, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryInfo: response.res,
        },
      });
    },
    // 编辑公司下拉列表
    *subsidiaryOptions({ payload }, { call, put }) {
      const response = yield call(querySubsidiaryOptions, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryOptions: response.res.list,
        },
      });
    },
    // 下载模板-司机查询
    *subsidiaryDownloadTemplet({ payload }, { call, put }) {
      const response = yield call(querySubsidiaryDownloadTemplet, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryTemplet: response,
        },
      });
    },
    // 司机导入-批量导入
    *subsidiaryImportDriverInfo({ payload }, { call, put }) {
      const response = yield call(querySubsidiaryImportDriverInfo, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryImportDriverInfo: response,
        },
      });
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
