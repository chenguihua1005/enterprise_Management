import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon, message, Row, Input, Col } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { IMiniProgressProps } from './../../components/Charts/MiniProgress/index.d';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      type: 'account',
      autoLogin: true,
      codeImg: '',
      imgToken: '',
      imgCode:''
    };
    
  }
  
  componentDidMount() {
    const { dispatch } = this.props;
    // 获取验证码
    dispatch({
      type: 'login/getVerifyImg', 
      payload: {
        width: 70,
        height: 40,
      },
    })
    .then(() => {
      const { getVerifyImg } = this.props.login;
      if(getVerifyImg.err==0){
        this.setState({
          codeImg:getVerifyImg.res.base64img,
          imgToken:getVerifyImg.res.imgToken,
        });
      }else if(JSON.stringify(getVerifyImg) != "{}"){
        message.warning(getVerifyImg.msg);
      }
      // switch (getVerifyImg.err) {
      //   //err=0成功
      //   case 0:
      //     this.setState({
      //       codeImg:getVerifyImg.res.base64img,
      //       imgToken:getVerifyImg.res.imgToken,
      //     });
      //     break;
      //   default:
      //     message.warning(getVerifyImg.msg);
      // }
    });
    
  }

  onTabChange = type => {
    this.setState({ type });
  };
  onInputBlur = () => {
    // const { login } = this.props;
    // const userName = login.username;
    // console.log(userName)
  }
  handleSubmit = (err, values) => {
    const { type, imgToken, imgCode } = this.state;
    const { dispatch, form } = this.props;
    if (!err) {
      if (imgCode === '') {
        message.error('请输入验证码!')
      } else {
        dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
          imgToken,
          imgCode,
        },
      }).then(() => {
        const { response } = this.props.login;
        if (response.err !== 0) {
          message.error(response.msg)
        // 登录失败 重新刷新验证码
        dispatch({
        type: 'login/getVerifyImg', 
        payload: {
          width: 80,
          height: 40,
        },
      }).then(() => {
        const { getVerifyImg } = this.props.login;
        switch (getVerifyImg.err) {
        //err=0成功
        case 0:
          this.setState({
          codeImg:getVerifyImg.res.base64img,
          imgToken:getVerifyImg.res.imgToken,
          });
          break;
        default:
          message.warning(getVerifyImg.msg);
        }
      });
    }
  });
}
    } 
    };
    

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };
  handleImgCodeChange = (e) => {
      let value = e.target.value;
      this.setState({
        imgCode: value
      })
  }
  // 点击验证码再次获取
  getCode = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/getVerifyImg', 
      payload: {
        width: 80,
        height: 40,
      },
    })
    .then(() => {
      const { getVerifyImg } = this.props.login;
      switch (getVerifyImg.err) {
        //err=0成功
        case 0:
          this.setState({
            codeImg:getVerifyImg.res.base64img,
            imgToken:getVerifyImg.res.imgToken,
          });
          break;
        default:
          message.warning(getVerifyImg.msg);
      }
    });
  }
  render() {
    const { login, submitting } = this.props;
    const { getVerifyImg } = login;
    const { type, autoLogin, codeImg, imgCode } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          {login.status === 'error' &&
            login.type === 'account' &&
            !submitting &&
            this.renderMessage('账户或密码错误（admin/888888）')}
          <UserName name="username" placeholder="用户名" onBlur={() => this.onInputBlur()}/>
          <Password name="password" placeholder="密码" />
          <div className={styles.code}>
            <Row>
              <Col md={15} sm={24}>
                <Input value={imgCode} placeholder="请输入验证码" onChange={this.handleImgCodeChange}/>
              </Col>
              <Col md={2}>
              </Col>
              <Col md={7} sm={24} className={styles.img}>
              
                <img src={codeImg} alt="" onClick={() => this.getCode()}/>
              
              </Col>
            </Row>
          </div>

          {/* <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              记住密码
            </Checkbox>
          </div> */}
          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}
