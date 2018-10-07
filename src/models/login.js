import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin } from '../services/api';
import { queryAccountLogin } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { getPageQuery } from '../utils/utils';
import Cookies from 'js-cookie';

export default {
  namespace: 'login',

  state: {
    status: undefined,
    username: '',
    response: {},
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(queryAccountLogin, payload);
      // const response = {};
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.err === 0) {
        reloadAuthorized();
        window.sessionStorage.setItem('loginStatus', 'ok');
        //在Cookie中添加accessToken
        // Cookies.set('accessToken', response.res.accessToken);
        //存储username到currentUsername
        window.localStorage.setItem('currentUsername', response.res.username);
        //存储token
        window.localStorage.setItem('accessToken', response.res.accessToken);
        console.log("accessToken =" +window.localStorage.getItem('accessToken'));
        yield put(routerRedux.push('/'));
      }
    },
    *logout(_, { put, select }) {
      try {
        //重置token
        window.localStorage.setItem('accessToken', '');
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
        type: "account",
        username: payload.res.username,
        response: payload
      };
    },
    changeLoginStatus2(state, { payload }) {
      // setAuthority(payload.currentAuthority);
      setAuthority('admin');
      return {
        ...state,
        status: 'ok',
        type: "account",
      };
    },
  },
};
