import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message ,Form,Modal,Card,Input,Select ,Button,Row,Col} from 'antd';
import {Field} from 'components/Charts';
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
import styles from './BasicLayout.less';
import sha1 from 'crypto-js/sha1';
// import logo from '../assets/logo.svg';
import logo from '../assets/logo.png';
import { reloadAuthorized } from '../utils/Authorized';

const { Content, Header, Footer } = Layout;
const { AuthorizedRoute, check } = Authorized;
const FormItem = Form.Item;
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
const CreateForm = Form.create()(props => {
  const { 
    modalVisible, 
    form, 
    loginOut,
    handleMotifyPwd, 
    handleModalVisible,
    handleResetPasswordBlur,
    confirmDirty,
    type} = props;
  const {getFieldDecorator}=form;
  const okHandle = () => {
    console.log('强制修改密码');
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleMotifyPwd(fieldsValue);
    });
    // handleModalVisible();
  };
  const cancelHandle=()=>{
    handleModalVisible();
  }
  const checkPassword=(rule, value, callback)=>{
      var pattern = /^(?![a-zA-Z]+$)(?![a-z\d]+$)(?![a-z!@#\$%]+$)(?![A-Z\d]+$)(?![A-Z!@#\$%]+$)(?![\d!@#\$%]+$)[a-zA-Z\d!@#\$%]+$/;
      if (value&&value.length < 6) {
        callback('密码长度小于6位！')
      } else if (value&&value.length > 20) {
        callback('密码长度大于20位！')
      } else if(!value){
        callback()
      }
      // else if (!(pattern.test(value))) {
      //   callback('至少包括数字，英文字母，大写字母，特殊符号4类中的3类！')
      // }
  }
  const handleConfirmPassword = (rule, value, callback) => {
    const { getFieldValue } = form
    if (value && value !== getFieldValue('password')) {
        callback('两次输入不一致！')
    }
    callback()
  }
  const validateToNextPassword = (rule, value, callback) => {
    // const form = this.props.form;
    if (value && confirmDirty) {
      form.validateFields(['repeatPassword'], { force: true });
    }
    callback();
  };
  const handleConfirmBlur = e => {
    const value = e.target.value;
    handleResetPasswordBlur(value);
  };
  const initPwd=()=>{
    return (
      <FormItem
      label="输入原密码"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 12 }}
      >
      {getFieldDecorator('oldPassword', {
          rules: [{ 
            required: true,message: '请输入原密码'},{
            // validator: checkPassword
            }]
      })(
          <Input type="password" placeholder="原密码" />
      )}
      </FormItem>
    )
  }
  const styleTitle=()=>{
    return (
      <div style={{textAlign:"center"}}>
        <span>为了您的账户安全，请先修改密码！</span>
      </div>
    )
  }
 
  return (
    <Modal
      title={type != 0 ?"修改密码":styleTitle()}
      width={600}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={cancelHandle} 
      destroyOnClose={true}
      maskClosable={false}
      closable={type != 0 ?true:false}
      footer={type != 0 ?(<div><Button  onClick={() => cancelHandle()}>取消</Button><Button type="primary" onClick={() => okHandle()}>确定</Button></div>):<Button type="primary" onClick={() => okHandle()}>确定</Button>}
    >
    {/* <Card style={{border:0}}>
      <Row gutter={{ md: 8, lg: 24, xl: 24 }} style={{marginBottom:20}}>
          <Col md={12} sm={24}>
              <Field label="用户名称:" value={window.localStorage.getItem('currentUsername')}/>
          </Col>
      </Row>
      <Row>
          <Col md={12} sm={24}>
              <Field label="手机号码:" value={window.localStorage.getItem('mobilePhone')}/>
          </Col>
       </Row>
    </Card> */}
     <Card style={{border:0}}>
      <div className={styles.tableList}>
        <div className={styles.tableListForm}>
          <Form onSubmit={this.handleSubmit}>
              <FormItem
                label="用户名"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
                style={{marginLeft:9}}
              >
                <Field value={window.localStorage.getItem('currentUsername')}/>
              </FormItem>
              <FormItem
                label="手机号"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
                style={{marginLeft:9}}
              >
                <Field value={window.localStorage.getItem('mobilePhone')}/>
              </FormItem>
              {//主动修改 初始密码必填
                type != 0 ? initPwd() : null
              }
              <FormItem
              label="重设新密码"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
              >
              {getFieldDecorator('password', {
                  rules: [
                    {
                    validator: validateToNextPassword,
                  },
                  { 
                    required: true,
                    message: '密码长度必须是6-20位，数字或字母!',
                    pattern:/^[0-9a-zA-Z]{6,20}$/
                    // pattern:/^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/
                   }
                  ]
              })(
                  <Input type="password" placeholder="6-20位数字或字母或数字字母组合" />
              )}
              </FormItem>
              <FormItem
              label="确认新密码"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
              >
              {getFieldDecorator('repeatPassword', {
                  min:6,
                  max: 20,
                  rules: [{ required: true,message: '请输入新密码'},{
                    validator: handleConfirmPassword
                  }],
              })(
                  <Input type="password"  placeholder="6-20位数字或字母或数字字母组合" onBlur={handleConfirmBlur}/>
              )}
              </FormItem>
          </Form>
        </div>
      </div>
      </Card>
    </Modal>
  );
});
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
@connect(({ login }) => ({
  login
}))
@Form.create()
class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  state = {
    isMobile,
    modalVisible:false,
    confirmDirty:false,
    type:JSON.parse(window.localStorage.getItem('isReset')) //默认的状态 0未修改 1已修改 3老用户
  };

  //强制修改登录密码弹框
  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  //重置密码成功后 强制登出
  loginOut = () => {
    this.props.dispatch({
      type: 'login/logout',
    }).then(() => {
      message.success("密码修改成功，请重新登录!");
    })
  }
  //修改密码接口
  handleMotifyPwd = (fields) => {
    const {type}=this.state;
    let updataType=type == 0 ? 1 : 2;
    const values = Object.assign(fields,{type:updataType});
    const {dispatch} = this.props;
    dispatch({
      type: 'login/fetchUpdatePwd',
      payload: values
    }).then(()=>{
      const { updatePwdResponse } = this.props.login;
      if(updatePwdResponse.err==0){
        this.loginOut();
      }else{
        message.error(updatePwdResponse.msg);
      }
    })
  }
  handleResetPasswordBlur = value => {
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
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
    //取localStorage值，当currentUsername为""
    const { currentUsername } = this.props;      
    if(!currentUsername){
      window.history.replaceState(null, 'login', '#/user/login');
      window.location.reload();
    }

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
    document.getElementById("btn_udesk_im").style.display="block";
    //用户登录后强制重置密码 需要加判断 判断账号是否第一次登录 除了0都不用强制弹窗
    const {type}=this.state;
    if(type==0){
      this.handleModalVisible(true);
    }
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
    const {type}=this.state;
    if (key === 'triggerError') {
      dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
    if(key=='changePwd'){
      this.handleModalVisible(true);
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
    const { isMobile: mb,modalVisible,type ,confirmDirty} = this.state;
    const bashRedirect = this.getBaseRedirect();
    const parentMethods={
      handleMotifyPwd: this.handleMotifyPwd,
      handleModalVisible: this.handleModalVisible,
      handleResetPasswordBlur: this.handleResetPasswordBlur,
      loginOut:this.loginOut,
      type:type,
      confirmDirty:confirmDirty
    };
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
          <CreateForm {...parentMethods} modalVisible={modalVisible} />
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
