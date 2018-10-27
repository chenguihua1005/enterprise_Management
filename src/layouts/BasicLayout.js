import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import sha1 from 'crypto-js/sha1';
// import logo from '../assets/logo.svg';
import logo from '../assets/logo.png';
import { reloadAuthorized } from '../utils/Authorized';

const { Content, Header, Footer } = Layout;
const { AuthorizedRoute, check } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData, routerData) => {
  const result = {};
  const childResult = {};
  for (const i of menuData) {
    if (!routerData[i.path]) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  }
  return Object.assign({}, routerData, result, childResult);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  state = {
    isMobile,
  };

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(getMenuData(), routerData),
    };
  }

  componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'user/fetchCurrent',
    // }).then(()=>{
      //取localStorage值，当currentUsername为""
      const { currentUsername } = this.props;      
      if(!currentUsername){
        window.history.replaceState(null, 'login', '#/user/login');
        window.location.reload();
      }
    // });

    //udesk客服组件接入，客户认证，手动初始化
        //随机数
        let noncevalue=parseInt(1000000*Math.random()).toString(16)+parseInt(1000000*Math.random()).toString(16)+parseInt(1000000*Math.random()).toString(16);
        //时间戳
        let timestampvalue=(new Date()).valueOf();
        //客户key
        let web_token_value=window.localStorage.getItem('mobilePhone');
        //加密算法
        let sign_str = `nonce=${noncevalue}&timestamp=${timestampvalue}&web_token=${web_token_value}&d34ab0d37757ed23b62712cced140fde`;
        sign_str = sha1(sign_str).toString().toUpperCase();
        window.ud("customer",{
        "c_name": window.localStorage.getItem('realName'),
        "c_phone":window.localStorage.getItem('mobilePhone'),
        "c_org":window.localStorage.getItem('branchName'),
        "c_email":"test@51zhaoyou.com",
        "nonce":noncevalue,
        "signature": sign_str,
        "timestamp": timestampvalue,
        "web_token": web_token_value
        })
        // window.ud.init();
        document.getElementById("btn_udesk_im").style.display="block";
  }
  componentWillMount(){
    this.props.history.push;
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
    document.getElementById("btn_udesk_im").style.display="none";
    // window.location.reload();
  }

  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '企业管理后台';
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = routerData[key];
      }
    });
    if (currRouterData && currRouterData.name) {
      title = `${currRouterData.name} - 企业管理后台`;
    }
    return title;
  }

  getBaseRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);
    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    // if (redirect) {
    //   urlParams.searchParams.delete('redirect');
    //   window.history.replaceState(null, 'redirect', urlParams.href);
    // } else {}
    // return redirect;
    const { routerData} = this.props;
    const status=window.sessionStorage.getItem('loginStatus');
    // console.log('loginStatus =' + 'loginStatus');
    // const status=window.localStorage.getItem('loginStatus');
    // get the first authorized route path in routerData
    //验证登录状态
    if(!status&&!redirect){
      // window.history.replaceState(null, 'login', '#/user/login');
      // localStorage.setItem('antd-pro-authority', 'guest');
      return 'user/login';
      // localStorage.setItem('antd-pro-authority', 'guest');
        reloadAuthorized();
    }else{
      const authorizedPath = Object.keys(routerData).find(
        item => check(routerData[item].authority, item) && item !== '/'
      );
      return authorizedPath;
    }
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'triggerError') {
      dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };
  handleNoticeVisibleChange = visible => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  render() {
    const {
      currentUsername,
      collapsed,
      notices,
      fetchingNotices,
      routerData,
      match,
      location,
    } = this.props;
    const { isMobile: mb } = this.state;
    const bashRedirect = this.getBaseRedirect();
    const layout = (
      <Layout>
        <SiderMenu
          logo={logo}
          // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
          // If you do not have the Authorized parameter
          // you will be forced to jump to the 403 interface without permission
          Authorized={Authorized}
          menuData={getMenuData()}
          collapsed={collapsed}
          location={location}
          isMobile={mb}
          onCollapse={this.handleMenuCollapse}
        />
        <Layout>
          <Header style={{ padding: 0 }}>
            <GlobalHeader
              logo={logo}
              currentUsername={currentUsername}
              fetchingNotices={fetchingNotices}
              notices={notices}
              collapsed={collapsed}
              isMobile={mb}
              onNoticeClear={this.handleNoticeClear}
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
            />
          </Header>
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            <Switch>
              {redirectData.map(item => (
                <Redirect key={item.from} exact from={item.from} to={item.to} />
              ))}
              {getRoutes(match.path, routerData).map(item => (
                <AuthorizedRoute
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                  authority={item.authority}
                  redirectPath="/exception/403"
                />
              ))}
              <Redirect exact from="/" to={bashRedirect} />
              <Route render={NotFound} />
            </Switch>
          </Content>
          <Footer style={{ padding: 0 }}>
            <GlobalFooter
              links={[
                // {
                //   key: 'Pro 首页',
                //   title: 'Pro 首页',
                //   href: 'http://pro.ant.design',
                //   blankTarget: true,
                // },
                // {
                //   key: 'github',
                //   title: <Icon type="github" />,
                //   href: 'https://github.com/ant-design/ant-design-pro',
                //   blankTarget: true,
                // },
                // {
                //   key: 'Ant Design',
                //   title: 'Ant Design',
                //   href: 'http://ant.design',
                //   blankTarget: true,
                // },
              ]}
              copyright={
                <Fragment>
                  Copyright <Icon type="copyright" /> 2018 上海找油信息科技有限公司
                </Fragment>
              }
            />
          </Footer>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(({ login, global = {}}) => ({
  // currentUsername: login.username,
  currentUsername: login.username == "" ? window.localStorage.getItem("currentUsername") : login.username,
  collapsed: global.collapsed,
}))(BasicLayout);
