import {
  queryBasicinfo1,
  queryBasicinfo1Branch,
  queryBasicinfo1BranchEdit,
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
  queryAddSubsidiary,
  queryResetPassword,
  queryGetUserData,
  querySubsidiaryDownloadTemplet,
  querySubsidiaryImportDriverInfo,
  queryDingNotice,
  queryNoticeList,
  queryAppRoleInfo,
  queryAppRoleOne,
  queryAppRoleSaveOne,
  queryAppGetMenuRole,
  querySetRoleAuth,
  queryUsersRole,
  querySetRoleAdd,
  queryDelRole
} from '../services/api';

export default {
  namespace: 'basicinfo',

  state: {
    subsidiaryList: [],
    //分公司管理-上级分公司，全部
    subsidiaryBranchList: [],
    //分公司管理-上级分公司-新增
    subsidiaryBranchList2: [],
    //分公司管理-上级分公司-编辑
    subsidiaryBranchList3: [],
    driverList: [],
    accountList: [],
    //司机管理-所属分公司，全部
    branchCompany: [],
    //司机管理-所属分公司
    branchCompany2: [],
    //是否有效
    isValid: {},
    driverInfo: {}, //司机编辑
    driverUpdate: {},
    driverAdd: {},
    driverDel: {},
    userStatus: {},
    addUser: {}, //账号编辑
    subsidiaryInfo: {}, //分公司编辑
    userMsg:{},//编辑状态ma
    userInfo: {}, //账号编辑
    updateUser: {},
    resetPassword: {},
    updateSubsidiary: {},
    addSubsidiary: {},
    getUserData: {},
    subsidiaryTemplet: {},
    subsidiaryImportDriverInfo: {},
    dingNotice: {},
    noticeList: [],
    appRoleList:[],//角色权限列表
    appRoleOne:[],//角色详情
    setRoleOne:[],//新增角色状态码
    appRoleSaveMsg:[],//编辑权限 状态码
    appMenuRole:[],//权限菜单
    setRoleAuth:[],//设置权限 状态码
    getUsersRole:[],//用户角色下拉列表
    delRole:[],//删除角色 状态吗
  },

  effects: {
    //分公司管理下拉列表
    *fetch1({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo1, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            subsidiaryList: response.res,
          },
        });
      }
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
    //分公司管理-上级分公司，全部
    *fetch1Branch({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo1Branch, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            subsidiaryBranchList: response.res.list,
          },
        });
      }
    },
    //分公司管理-上级分公司-新增
    *fetch1BranchAdd({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo1Branch, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryBranchList2: response.res.list,
        },
      });
    },
    //分公司管理-上级分公司-编辑
    *fetch1BranchEdit({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo1BranchEdit, payload);
      yield put({
        type: 'save',
        payload: {
          subsidiaryBranchList3: response.res.list,
        },
      });
    },
    //司机管理下拉列表
    *fetch2({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo2, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            driverList: response.res,
          },
        });
      }
    },
    //获取异步上传文件已处理未读个数
    *dingNotice({ payload }, { call, put }) {
      const response = yield call(queryDingNotice, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            dingNotice: response.res,
          },
        });
      }
    },
    //异步文件未读消息列表
    *noticeList({ payload }, { call, put }) {
      const response = yield call(queryNoticeList, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            noticeList: response.res,
          },
        });
      }
    },
    //账号管理下拉列表
    *fetch3({ payload }, { call, put }) {
      const response = yield call(queryBasicinfo3, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            accountList: response.res,
          },
        });
      }
    },
    *closeUser({ payload }, { call, put }) {
      const response = yield call(queryCloseUser, payload);
      yield put({
        type: 'save',
        payload: {
          userStatus: response,//接收状态 需要捕获错误值 response.res
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
    //司机管理-所属分公司，全部
    *fetchBranchCompany({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoBranch, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            branchCompany: response.res.info,
          },
        });
      }
    },
    //司机管理-所属分公司
    *fetchBranchCompany2({ payload }, { call, put }) {
      const response = yield call(queryBasicinfoBranch, payload);
      yield put({
        type: 'save',
        payload: {
          branchCompany2: response.res.info,
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
          userMsg: response,
          userInfo: response.res,//response.res
        },
      });
    },

    // 重置密码
    *resetPassword({ payload }, { call, put }) {
      const response = yield call(queryResetPassword, payload);
      yield put({
        type: 'save',
        payload: {
          resetPassword: response,
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
    // 账号管理-角色查询 new
    *fetchappRoleInfo({ payload }, { call, put }) {
      const response = yield call(queryAppRoleInfo, payload);
      yield put({
        type: 'save',
        payload: {
          appRoleList: response.res,
        },
      });
    },
    // 账号管理-角色详情 new
    *fetchappRoleOne({ payload }, { call, put }) {
      const response = yield call(queryAppRoleOne, payload);
      yield put({
        type: 'save',
        payload: {
          appRoleOne: response.res,
        },
      });
    },
    // 账号管理-新增角色 new
    *fetchSetRoleOne({ payload }, { call, put }) {
      const response = yield call(querySetRoleAdd, payload);
      yield put({
        type: 'save',
        payload: {
          setRoleOne: response,
        },
      });
    },
    // 账号管理-编辑角色 new
    *fetchappRoleSaveOne({ payload }, { call, put }) {
      const response = yield call(queryAppRoleSaveOne, payload);
      yield put({
        type: 'save',
        payload: {
          appRoleSaveMsg: response,
        },
      });
    },
    // 账号管理-获取权限菜单
    *fetchappGetRoleMenu({ payload }, { call, put }) {
      const response = yield call(queryAppGetMenuRole, payload);
      yield put({
        type: 'save',
        payload: {
          appMenuRole: response.res,
        },
      });
    },
    // 账号管理-设置权限
    *fetchSetRoleAuth({ payload }, { call, put }) {
      const response = yield call(querySetRoleAuth, payload);
      yield put({
        type: 'save',
        payload: {
          setRoleAuth: response,
        },
      });
    },
    // 账号管理-删除权限
    *fetchDelRole({ payload }, { call, put }) {
      const response = yield call(queryDelRole, payload);
      yield put({
        type: 'save',
        payload: {
          delRole: response,
        },
      });
    },
    // 用户管理-权限下拉菜单
    *fetchGetUsersRole({ payload }, { call, put }) {
      const response = yield call(queryUsersRole, payload);
      yield put({
        type: 'save',
        payload: {
          getUsersRole: response.res,
        },
      });
    }
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
