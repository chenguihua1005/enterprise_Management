import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { queryAccountLogin,queryGetVerifyImg ,queryUpdatePassword} from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import Cookies from 'js-cookie';
import { message } from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
    username: '',
    response: {},
    getVerifyImg: {},
    isFirstEntry: true,
    updatePwdResponse:{}
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(queryAccountLogin, payload);
      if (response) {
        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });
        // Login successfully
        if (response.err === 0) {
          // 登录成功重新置位
          yield put({
            type: 'changeIsFirstEntry',
            payload: {},
          });
          reloadAuthorized();
          window.sessionStorage.setItem('loginStatus', 'ok');
          //在Cookie中添加accessToken
          // Cookies.set('accessToken', response.res.accessToken);
          //存储username到currentUsername
          window.localStorage.setItem('currentUsername', response.res.username);
          //存储token
          window.localStorage.setItem('accessToken', response.res.accessToken);
          // console.log('accessToken =' + window.localStorage.getItem('accessToken'));
          //存储客户公司
          window.localStorage.setItem('branchName', response.res.branchName);
          //存储客户姓名
          window.localStorage.setItem('realName', response.res.realName);
          //存储客户手机
          window.localStorage.setItem('mobilePhone', response.res.mobilePhone);
          //存储登录权限信息
          window.localStorage.setItem('loginRole',JSON.stringify(response.res.privileges) );
          //存储用户是否修改过密码
          window.localStorage.setItem('isReset', response.res.isResetPassword);
          //存储登录权限标识
          window.localStorage.setItem('currentAuthority', response.res.currentAuthority);
          yield put(routerRedux.push('/'));
          //登录成功后手动渲染客服组件
          // window.location.reload();
        }
      }
    },
    *logout(_, { put, select }) {
      try {
        yield put({
          type: 'changeIsFirstEntryLogout',
          payload: {},
        });
        //重置token
        window.localStorage.removeItem('accessToken');
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        // window.location.reload();
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus2',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },

    // 获取验证码
    *getVerifyImg({ payload },{ call, put }) {
      const response = yield call(queryGetVerifyImg, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            getVerifyImg: response,
          },
        });
      }
    },
    // 用户密码更新
    *fetchUpdatePwd({ payload }, { call, put }) {
      const response = yield call(queryUpdatePassword, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: {
            updatePwdResponse: response,
          },
        });
      }
    },

    *logout2(_, { put, select }) {
      try {
        // 401 403统一做退出登录，仅提示用户一次
        yield put({
          type: 'changeIsFirstEntryMessage',
          payload: {},
        });
        //重置token
        window.localStorage.removeItem('accessToken');
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus2',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        console.log("routerRedux",routerRedux);
        yield put(routerRedux.push('/user/login'));
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      // setAuthority(payload.currentAuthority);
      setAuthority('admin');
      return {
        ...state,
        status: 'ok',
        type: 'account',
        username: payload.res.username,
        response: payload,
      };
    },
    changeLoginStatus2(state, { payload }) {
      // setAuthority(payload.currentAuthority);
      setAuthority('admin');
      return {
        ...state,
        status: 'ok',
        type: 'account',
      };
    },
    changeIsFirstEntryMessage(state, {}) {
      if (state.isFirstEntry === true) {
        message.warning('您的登录失效了，需要重新登录');
      }
      return {
        ...state,
        isFirstEntry: false,
      };
    },
    changeIsFirstEntry(state, {}) {
      return {
        ...state,
        isFirstEntry: true,
      };
    },
    changeIsFirstEntryLogout(state, {}) {
      return {
        ...state,
        isFirstEntry: false,
      };
    },
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
