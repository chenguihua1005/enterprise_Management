import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Button,
  Modal,
  Table,
  Badge,
  Divider,
  Icon,
  message,
  InputNumber 
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Basicinfo.less';
import { getTimeDistance } from '../../utils/utils';
import { Tree } from 'antd';
import props from './../../layouts/BlankLayout';

const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
const { TextArea } = Input;
const TreeNode = Tree.TreeNode;
// 新增/编辑
const CreateForm = Form.create()(props => {
  const {
    modalVisible,
    confirmDirty,
    form,
    handleAdd,
    closeModalVisible,
    editBranchOptions,
    userData,
    disable,
    handleResetPasswordBlur,
    title,
    renderTreeNodes,
    usersRoleSelected,
    usersRoleOptions,
    TreeData,
    renderHaveRoleMenu
  } = props;
  const roleOption=[];
  if(Array.isArray(usersRoleOptions)&&usersRoleOptions.length>0){
    usersRoleOptions.forEach(item=>{
      roleOption.push(<Option key={item.arId} value={item.arId}>{item.arName}</Option>);
    })
  }
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
    });
  };

  const handleCloseModalVisible = flag => {
    form.resetFields();
    closeModalVisible(flag);
  };
  //验证手机号
  const checkAccount = (rule, value, callback) => {
    //与表单数据进行关联
    //正则用//包起来
    var regex = /^[1][3-9][0-9]{9}$/;
    var re = new RegExp(regex);
    if (value.length == 11) {
      //react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
      if (re.test(value)) {
        callback();
      } else {
        callback('请输入正确的手机号码！');
      }
    } else {
      callback('请输入11位的手机号码！');
    }
  };
  // 验证密码和确认密码
  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('请输入正确的密码');
    } else {
      callback();
    }
  };
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
  const renderShowRole=()=>{
    return (
      <Tree
        showLine
        defaultExpandAll//默认展开所有树节点
        // onSelect={onSelect} userData.TreeData
      >
          {renderTreeNodes(TreeData) }
      </Tree>
    )
  }
  const treeData = [
        {
            title: '数据总览',
            key: 'dashboard',
        },{
            title: '基础信息管理',
            key: 'basicinfo',
            children: [
                {
                title: '分公司管理',
                key: 'subsidiary',
                },{
                title: '司机管理',
                key: 'driver',
                },{
                title: '账号管理',
                key: 'accountadmin',
                children: [
                    { title: '角色管理', key: 'role' },
                    { title: '用户管理', key: 'user' },
                ],
            }],
        },{
            title: '订单管理',
            key: 'order',
        }, {
            title: '油费管理',
            key: 'oilfee',
            children: [
                { title: '账户管理', 
                    key: 'oilaccount',
                    children:[{
                        title: '总账户',
                        key: 'general',
                    },{
                        title: '分公司账户',
                        key: 'branch',
                    },{
                        title: '司机账户',
                        key: 'driveraccout',
                    }]
                },
                { title: '油费发放', key: 'provide' },
            ],
        },{
            title: '结算管理',
            key: 'settlement',
        }];
  return (
    <Modal
      title={title}
      width={850}
      // bodyStyle={{maxHeight:500,autoY:}}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCloseModalVisible(false)}
      destroyOnClose={true}
      maskClosable={false}
    >
            <Row gutter={{ md: 8, lg: 24, xl: 24 }}>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
            {form.getFieldDecorator('userName', {
              initialValue: userData.userName,
              rules: [{ type: 'string', required: true, message: '请输入用户名!' }],
            })(<Input placeholder="请输入" disabled={disable} />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="姓名">
            {form.getFieldDecorator('realName', {
              rules: [{ type: 'string', required: true, message: '请输入姓名!' }],
              initialValue: userData.realName,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
                <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}  label="手机号">
            {form.getFieldDecorator('mobilePhone', {
              initialValue: userData.mobilePhone,
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: '请输入正确的手机号',
                  max: 11,
                  pattern: /^[1][3-9][0-9]{9}$/
                },
                // {
                //   //这里input内的输入内容进行绑定函数即可，在Input里面无需进行函数绑定开使用验证（红色部分）
                //   validator: checkAccount,
                // },
              ],
                  })(<Input placeholder="请输入"/>)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="所属分公司">
            {form.getFieldDecorator('branchId', {
              rules: [{ required: true, message: '请选择所属分公司!' }],
              initialValue: userData.parentBranchId,
            })(
              <Select
                placeholder="请选择"
                // onChange={this.handleBranchList}
                style={{ width: '100%' }}
              >
                {editBranchOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
                <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="设密码">
            {form.getFieldDecorator('password', {
              // basicinfo: [{ required: true, message: '请输入密码' }],
              initialValue: userData.password,
              rules: [
                {
                  validator: validateToNextPassword,
                },
                { type: 'string', required: true, message: '请输入密码!' },
              ],
            })(<Input type="password" placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码确认">
            {form.getFieldDecorator('repeatPassword', {
              // basicinfo: [{ required: true, message: '请输入正确的密码' }],
              initialValue: userData.repeatPassword,
              rules: [
                {
                  validator: compareToFirstPassword,
                },
                {
                  required: true,
                  message: '请输入正确的密码',
                },
              ],
            })(<Input type="password" placeholder="请输入" onBlur={handleConfirmBlur} />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="备注">
            {form.getFieldDecorator('remark', {
              basicinfo: [{ required: true, message: 'Please input some description...' }],
              initialValue: userData.remark,
            })(<TextArea placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
            <Row>
              <Col span={24}>
                <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="角色">
                      {form.getFieldDecorator('role', {
                            initialValue: usersRoleSelected,
                            rules: [{ required: true, message: '请选择角色' }],
                            // initialText:'超级管理员',
                        }
                        )(
                            <Select onChange={(value, option)=>{renderHaveRoleMenu(value, option)}} style={{ width: '100%' }}>
                                {/* <Option value="0">管理员</Option>
                                <Option value="1">调度员</Option> */}
                                {roleOption}
                            </Select>
                        )}
                    </FormItem>
              </Col>
            </Row>
            <Card>
              <Row>
                <Col span={24}>
                  <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="角色权限">
                    {TreeData.length>0?renderShowRole():"该角色未设置权限"}
                  </FormItem>
                </Col>
              </Row>
            </Card>
    </Modal>
  );
});

@connect(({ basicinfo, loading }) => ({
  basicinfo,
  loading: loading.effects['basicinfo/fetch3'],
}))
@Form.create()
export default class Driver extends PureComponent {
  constructor(props) {
    super(props); // 调用积累所有的初始化方法
    this.isChange = false;
    this.userId = 0;
    this.memberIds = '';
    this.selectedRows = [],
    this.title = '新增';
    this.disable = false;
    this.state = {
      memberIds: '',
      modalVisible: false,
      disable: false,
      confirmDirty: false,
      roleList:[],
      deafultroleList:[],
      current:1,
      usersRoleSelected:'0',//存储选中的角色 默认时管理员角色id
      usersRoleOptions:[],//存储角色下拉菜单
      TreeData:[],
      userData: {
        userName: '',
        mobilePhone: '',
        realName: '',
        password: '',
        repeatPassword: '',
        remark: '',
        branchId: '全部',
        // parentBranchId: '',
      },
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      userData: nextProps.basicinfo.userInfo,
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 账户列表
    dispatch({
      type: 'basicinfo/fetch3',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });
    // 所属分公司
    dispatch({
      type: 'basicinfo/fetchBranchCompany',
      payload: {
        isNeedAll: 1
      },
    });
    //获取新增的角色下拉菜单
    dispatch({
      type: 'basicinfo/fetchGetUsersRole',
      payload: {
        memberId: 0
      } //没有用户id 就传0 返回当前用户登录的角色
    }).then(()=>{
      const { basicinfo} = this.props;
      const { getUsersRole } = basicinfo;
      const {list:usersRoleList}=getUsersRole;
      //角色菜单列表
      if(Array.isArray(usersRoleList)){
        const {roleList}=this.state;
        usersRoleList.forEach(item=>{
          roleList.push(<Option key={item.arId} value={item.arId}>{item.arName}</Option>); 
        })
      }
    })
     //获取查询的角色下拉菜单
     dispatch({
      type: 'basicinfo/fetchGetUsersRole',
      payload: {
        memberId: -1
      } //没有用户id 就传0 返回当前用户登录的角色
    }).then(()=>{
      const { basicinfo} = this.props;
      const { getUsersRole } = basicinfo;
      const {list:usersRoleList}=getUsersRole;
      //角色菜单列表
      if(Array.isArray(usersRoleList)){
        const {deafultroleList}=this.state;
        usersRoleList.forEach(item=>{
          deafultroleList.push(<Option key={item.arId} value={item.arId}>{item.arName}</Option>); 
        })
      }
    })
  }

  handleResetPasswordBlur = value => {
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  // 模糊查询
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      for (const prop in fieldsValue) {
        if (
          fieldsValue[prop] === '' ||
          fieldsValue[prop] === '全部' ||
          fieldsValue[prop] === undefined
        ) {
          delete fieldsValue[prop];
        }
        if (Array.isArray(fieldsValue[prop])) {
          if (fieldsValue[prop].join(',') === '全部') {
            delete fieldsValue[prop];
          }
        }
      }
      const params = {
        //默认值
        username: fieldsValue.username,
        mobilePhone: fieldsValue.mobile,
        realName: fieldsValue.truename,
        branchId: fieldsValue.branchId,
        status: fieldsValue.status,
        // role: fieldsValue.role,  ???
        page: 1,
        pageSize: 10,
        isCount: 1,
      };
      const values = Object.assign(params,fieldsValue);
      // 账户列表
      dispatch({
        type: 'basicinfo/fetch3',
        payload: values,
      }).then(()=>{
        this.setState({
          current:1
        });
      });
    });
  };

  //列表变化翻页的回调
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      for (const prop in fieldsValue) {
        if (
          fieldsValue[prop] === '' ||
          fieldsValue[prop] === '全部' ||
          fieldsValue[prop] === undefined
        ) {
          delete fieldsValue[prop];
        }
      }
      const params = {
        //默认值
        username: fieldsValue.username,
        mobilePhone: fieldsValue.mobile,
        realName: fieldsValue.truename,
        branchId: fieldsValue.branchId,
        status: fieldsValue.status,
        page: pagination.current,
        pageSize: pagination.pageSize,
        isCount: 1,
      };
      // 账户列表
      dispatch({
        type: 'basicinfo/fetch3',
        payload: params,
      }).then(()=>{
        this.setState({
          current:pagination.current
        });
      });
    });

  };

  //重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'basicinfo/fetch3',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    }).then(()=>{
      this.setState({
        current:1
      });
    });
  };

  // close关闭modal
  closeModalVisible = flag => {
    const { dispatch, form } = this.props;
    this.setState({
      modalVisible: flag,
    });
  };

  // 新增
  setModalVisible = flag => {
    const { dispatch } = this.props;
    dispatch({//新增时获取角色下拉菜单
      type: 'basicinfo/fetchGetUsersRole',
      payload: {memberId:0},//不知道member_id默认传0
    }).then(()=>{
      const {basicinfo} = this.props;
      const {getUsersRole}=basicinfo;
      const {list:getRoleList}=getUsersRole;
      //历史数据 会没有角色。默认会传选中得角色id去查权限菜单。但是如果没有得话，角色ID就传0去
      let usersRoleSelected=0;
      if(Array.isArray(getRoleList)&&getRoleList.length>0){
          const roleSelected=getRoleList.filter((item)=>{//选中的 记录下
          return item.isAuth==1;
          })
          usersRoleSelected=roleSelected[0].arId;
      }
      dispatch({//去请求有权限的菜单，默认是去请求管理员的权限下拉菜单展示
        type: 'basicinfo/fetchappGetRoleMenu',
        payload: {
          isAuth:1,
          role: usersRoleSelected == 0 ? 0 : usersRoleSelected//默认请求管理员的
        },
      }).then(()=>{//权限菜单请求到以后 渲染成树形
        const { basicinfo} = this.props;
        const {appMenuRole}=basicinfo;//获取到默认角色的权限菜单
        const {list:menuRole}=appMenuRole;
        menuRole.sort(this.compareSort("amOrder"));
        const TreeData=this.formatGetData(menuRole);
       
        this.isChange = false;
        this.title = '新增',
        this.state.userData = {
          userName: '',
          mobilePhone: '',
          realName: '',
          password: '',
          repeatPassword: '',
          remark: '',
          branchId: '',
          // parentBranchId: '',
        };
        this.setState({
          modalVisible: !!flag,
          usersRoleOptions: getRoleList,
          TreeData: TreeData,
          usersRoleSelected:usersRoleSelected,
          disable: false,
        });
      })
    });
  };

  // 添加成功
  handleAdd = (fields,form) => {
    const { dispatch } = this.props;
    if (this.isChange === false) {
      dispatch({
        type: 'basicinfo/addUser',
        payload: {
          mobilePhone: fields.mobilePhone,
          realName: fields.realName,
          username: fields.userName,
          branchId: fields.branchId,
          password: fields.password,
          repeatPassword: fields.repeatPassword,
          remark: fields.remark,
          role:fields.role,
        },
      }).then(() => {
        const { addUser } = this.props.basicinfo;
        switch (addUser.err) {
          //err=0成功
          case 0:
            message.success(addUser.msg);
            this.setState({
              modalVisible: false,
            });
            form.resetFields();
            dispatch({
              type: 'basicinfo/fetch3',
              payload: {
                page: 1,
                pageSize: 10,
                isCount: 1,
              },
            });
            break;
          default:
            this.setState({
              modalVisible: true,
            });
            message.warning(addUser.msg);
        }
      });
    } else {
      dispatch({
        type: 'basicinfo/updateUser',
        payload: {
          mobilePhone: fields.mobilePhone,
          realName: fields.realName,
          username: fields.userName,
          branchId: fields.branchId,
          password: fields.password,
          repeatPassword: fields.repeatPassword,
          remark: fields.remark,
          role:fields.role,
          userId: this.userId,
        },
      }).then(() => {
        const { updateUser } = this.props.basicinfo;
        switch (updateUser.err) {
          //err=0成功
          case 0:
            message.success(updateUser.msg);
            this.setState({
              modalVisible: false,
            });
            form.resetFields();
            dispatch({
              type: 'basicinfo/fetch3',
              payload: {
                page: 1,
                pageSize: 10,
                isCount: 1,
              },
            });
            break;
          default:
            this.setState({
              modalVisible: true,
            });
            message.warning(updateUser.msg);
        }
      });
    }
  };

  //编辑弹框显示
  handleEdit = (flag, record) => {
    const { dispatch } = this.props;
    if(record.isLive==2){//如果账号停用 不弹框
      this.setState({
        modalVisible: false,
      });
      message.warn("账号停用不能编辑，启用账号再试！")
    }else{
      dispatch({
        type: 'basicinfo/userInfo',
        payload: {
          memberId: record.memberId,
        },
      }).then(()=>{
        const { basicinfo} = this.props;
        const {userMsg}=basicinfo;
        if(userMsg.err=="50054"){
          message.warn(userMsg.msg,0.5);
        }else if(userMsg.err=="0"){ 
          dispatch({//编辑时获取角色下拉菜单
            type: 'basicinfo/fetchGetUsersRole',
            payload: {memberId:record.memberId},
          }).then(()=>{
            const {basicinfo} = this.props;
            const {getUsersRole}=basicinfo;
            const {list:getRoleList}=getUsersRole;
            //历史数据 会没有角色。默认会传选中得角色id去查权限菜单。但是如果没有得话，角色ID就传0去
            // let usersRoleSelected=0;
            // if(Array.isArray(getRoleList)&&getRoleList.length>0){
                const roleSelected=getRoleList.filter((item)=>{//选中的 记录下
                return item.isAuth==1;
                })
              let  usersRoleSelected=roleSelected[0].arId;
            // }
            dispatch({//去请求有权限的菜单，去请求当前行角色ID的权限菜单展示
                  type: 'basicinfo/fetchappGetRoleMenu',
                  payload: {
                    isAuth:1,
                    role: record.roleId == 0 ? usersRoleSelected : record.roleId//编辑时 角色ID为0时会默认管理员角色。默认请求管理员角色权限菜单
                  },
                }).then(()=>{//权限菜单请求到以后 渲染成树形
                  const { basicinfo} = this.props;
                  const {appMenuRole}=basicinfo;//获取到该角色的权限菜单
                  const {list:menuRole}=appMenuRole;
                  if(record.isLive==2){
                    message.warn("当前角色无效，无法默认当前角色");
                  }
                  menuRole.sort(this.compareSort("amOrder"));
                  const TreeData=this.formatGetData(menuRole);
                  this.isChange = true;
                  this.title = '编辑',
                  this.userId = record.memberId;
                  this.setState({
                    modalVisible: !!flag,
                    disable: true,
                    usersRoleOptions: getRoleList,
                    TreeData: TreeData,
                    usersRoleSelected:usersRoleSelected
                  });
                })
          });
        }
      });
    }
  };

  // 启用/停用
  enable = value => {
    const { dispatch } = this.props;
    // if (value.isLive == 1) {
    //   this.setState({ actionType: 2 })
    // } else {
    //   this.setState({ actionType: 1 })
    // }
    const params = {
      memberId: value.memberId,
      actionType: value.isLive == 1 ? 2 : 1,
    };

    dispatch({
      type: 'basicinfo/closeUser',
      payload: params,
    }).then(()=>{
      const {basicinfo} = this.props;
      const {userStatus}=basicinfo;
      if(userStatus.err=="50054"){
        message.warning(userStatus.msg);
      }else if(userStatus.err=="0"){
        dispatch({
          type: 'basicinfo/fetch3',
          payload: {
            page: 1,
            pageSize: 10,
            isCount: 1,
          },
        });
      }else{
        message.error("未知错误");
      }
    });
  };

  // 重置密码
  showConfirm = () => {
    const { dispatch } = this.props;
    const s = this;
    const { memberIds } = this.state;
    if (this.selectedRows.length > 0) {
      confirm({
        title: '确定要重置用户密码吗?',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          const params = {
            memberIds: memberIds.join(','),
          };
          dispatch({
            type: 'basicinfo/resetPassword',
            payload: params,
          }).then(() => {
            const { resetPassword } = s.props.basicinfo;
            //err=0成功
            if (resetPassword.err == 0) {
              message.success("重置成功，新的密码已通过短信发送！");
            } else {
              message.error(resetPassword.msg);
            }
          });
        },
        onCancel() {},
      });
    } else {
      message.error('请选择你需要重置密码的数据!');
    }
  };
  //遍历树节点
  renderTreeNodes = (data) => {
    if(Array.isArray(data)){
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode  title={item.title} key={item.key} dataRef={item}>
              {this.renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode {...item} />;
      });
    }
  }
  renderAdvanceForm() {
    return (
      <Form layout="inline" onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名">{<Input placeholder="请输入" />}</FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="手机号码">
              {<Input placeholder="请输入" style={{ width: '100%' }} />}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="姓名">
              {<Input placeholder="请输入" style={{ width: '100%' }} />}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="分公司">
              {
                <Select placeholder="请选择" showSearch={true} style={{ width: '100%' }}>
                  {branchOptions}
                </Select>
              }
            </FormItem>
          </Col>
          {/*<Col md={8} sm={24}>*/}
          {/*<FormItem label="角色">*/}
          {/*{<Input placeholder="请输入" style={{ width: '100%' }} />}*/}
          {/*</FormItem>*/}
          {/*</Col>*/}
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option key="0" value="0">
                    全部
                  </Option>
                  <Option key="1" value="1">
                    停用
                  </Option>
                  <Option key="2" value="2">
                    正常
                  </Option>
                </Select>
              }
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              <Icon type="search" />查询
            </Button>
            <Button style={{ marginLeft: 8 }}>重置</Button>
          </span>
        </div>
      </Form>
    );
  }
  renderTreeData=(data,target,hasChild)=>{
    if(data&&data.length>0){
      for (var i in data) {
          if(data[i]["key"]==target.parentId){//节点的父节点ID等于树形结构里的菜单ID的话
              const obj={};
              obj["title"]=target.amName;
              obj["key"]=target.amId;
              if(hasChild){
                  obj["children"]=[];
              }
              data[i].children.push(obj);
              break;
          }else{
              this.renderTreeData(data[i].children,target,hasChild);
          }
      };
    }
}

 //格式化树形格式
 formatGetData=(data)=>{
  const treeData=[];
  data.forEach((item)=>{
      // if(item.isAuth=="1"&&selectNode.indexOf(item.amId)==-1){
      //     selectNode.push(item.amId.toString());//有权限的菜单ID记录下来
      // }
      if(item.isParent==0){//有子节点
          const obj={};
          obj["title"]=item.amName;
          obj["key"]=item.amId;
          obj["children"]=[];
          if(item.level==0){//是根节点
              treeData.push(obj);
          }else{
              this.renderTreeData(treeData,item,true);
          }
      }else if(item.isParent==1){//没有子节点
          const obj={};
          obj["title"]=item.amName;
          obj["key"]=item.amId;
          if(item.level==0){//是根节点
              treeData.push(obj);
          }else{
              this.renderTreeData(treeData,item,false);
          }
      }
  })
  return treeData;
}
  //字段排序
compareSort= (prop)=> {
  return function (obj1, obj2) {
      var val1 = obj1[prop];
      var val2 = obj2[prop];
      if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1);
          val2 = Number(val2);
      }
      if (val1 < val2) {
          return 1;
      } else if (val1 > val2) {
          return -1;
      } else {
          return 0;
      }            
  } 
}
//角色ID查询有权限的菜单
renderHaveRoleMenu=(arId)=>{
  const { dispatch} = this.props;
  dispatch({//去请求有权限的菜单  不管新增还是编辑 根据角色ID查有权限的数据
    type: 'basicinfo/fetchappGetRoleMenu',
    payload: {
      isAuth:1,
      role:arId
    },
  }).then(()=>{//权限数据请求到以后 渲染成树形
    const { basicinfo} = this.props;
    const {appMenuRole}=basicinfo;//获取到角色的权限菜单
    const {list:menuRole}=appMenuRole;
    menuRole.sort(this.compareSort("amOrder"));
    const TreeData=this.formatGetData(menuRole);
    //更新树形菜单
    this.setState({
      TreeData: TreeData
    });
  })
}
  render() {
    const { basicinfo, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const { accountList, branchCompany, userInfo, addUser, resetPassword,getUsersRole } = basicinfo;
    const { count, list: tableData } = accountList;
    const { modalVisible, userData, disable, confirmDirty,usersRoleSelected ,usersRoleOptions,TreeData,deafultroleList,current} = this.state;
    // const dataCount = accountList.total;
    //所属分公司
    const branchOptions = [];
    const editBranchOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (branchCompany != undefined && branchCompany.length > 0) {
      branchCompany.forEach(item => {
        branchOptions.push(
          <Option key={item.companyBranchId} value={item.companyBranchId}>
            {item.companyBranchName}
          </Option>
        );
        if (item.companyBranchName != '全部'){
          editBranchOptions.push(
            <Option key={item.companyBranchId} value={item.companyBranchId}>
              {item.companyBranchName}
            </Option>
          );
        }
      });
    }
    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: parseInt(count),
      current:current,
      showTotal: () => `共计 ${count} 条`,
    };
    const parentMethods = {
      handleAdd: this.handleAdd,
      closeModalVisible: this.closeModalVisible,
      branchOptions,
      editBranchOptions,
      userData:userData,
      disable,
      confirmDirty,
      handleResetPasswordBlur: this.handleResetPasswordBlur,
      title:this.title,
      renderTreeNodes:this.renderTreeNodes,
      usersRoleSelected:usersRoleSelected,
      usersRoleOptions:usersRoleOptions,
      TreeData:TreeData,
      renderHaveRoleMenu:this.renderHaveRoleMenu  //获取角色权限菜单
    };
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          memberIds: selectedRowKeys,
        });
        this.selectedRows = selectedRows;
        this.state.selectedRows = selectedRows;
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        console.log(this.memberIds);
      },
      // getCheckboxProps: record => ({
      //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
      //   name: record.name,
      // }),
    };
    
    
    const column = [
      {
        title: '用户名',
        width:100,
        dataIndex: 'username',
      },
      {
        title: '姓名',
        dataIndex: 'realName',
        width:100,
      },
      {
        title: '手机号',
        width:120,
        dataIndex: 'mobilePhone',
      },
      {
        title: '所属分公司',
        dataIndex: 'branchName',
      },
      {
        title: '状态',
        dataIndex: 'isLive',
        width:80,
        render: text =>
          // text === 1 ? <Badge status="1" text="启用" /> : <Badge status="2" text="停用" />,
          text === 1 ? '启用' : '停用',
      },
      {
        title: '角色名称',
        width:105,
        dataIndex: 'roleName',
      },
      {
        title: '操作时间',
        width:110,
        dataIndex: 'operateTime',
      },
      {
        title: '操作',
        width:200,
        render: (text, record) => (
          <Fragment>
            <Button type="primary" onClick={() => this.handleEdit(true, record)}>
              编辑
            </Button>
            <Divider type="vertical" />
            <Button type="danger" onClick={() => this.enable(record)}>
              {record.isLive == 1 ? '停用' : '启用'}
            </Button>
          </Fragment>
        ),
      },
    ];
    return (
      <PageHeaderLayout>
        <div className={styles.tableList}>
          <Card bordered={false}>
            <div className={styles.tableListForm}>
              <Form layout="inline" onSubmit={this.handleSearch}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <FormItem label="用户名">
                      {getFieldDecorator('username')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="手机">
                      {getFieldDecorator('mobile')(
                        <Input placeholder="请输入" style={{ width: '100%' }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="姓名">
                      {getFieldDecorator('truename')(
                        <Input placeholder="请输入" style={{ width: '100%' }} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <FormItem label="分公司">
                      {getFieldDecorator('branchId')(
                        <Select placeholder="请选择" showSearch={true} style={{ width: '100%' }}>
                          {branchOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  {/*<Col md={8} sm={24}>*/}
                  {/*<FormItem label="角色">*/}
                  {/*{<Input placeholder="请输入" style={{ width: '100%' }} />}*/}
                  {/*</FormItem>*/}
                  {/*</Col>*/}
                  <Col md={8} sm={24}>
                    <FormItem label="状态">
                      {/* {getFieldDecorator('status')(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          <Option key="0" value="0">
                            全部
                          </Option>
                          <Option key="1" value="1">
                            停用
                          </Option>
                          <Option key="2" value="2">
                            正常
                          </Option>
                        </Select>
                      )} */}
                       {getFieldDecorator('status', {
                              initialValue:'0',
                              initialText:'全部',
                          }
                          )(
                          <Select>
                          <Option value="0">全部</Option>
                          <Option value="1">停用</Option>
                          <Option value="2">正常</Option>
                      </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                  <FormItem label="角色">
                    {getFieldDecorator('roleId', {
                              initialValue:-1,
                              initialText:'全部',
                          }
                          )(
                            <Select showSearch={true} style={{ width: '100%' }}>
                             {deafultroleList}
                           </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <div style={{ overflow: 'hidden' }}>
                <span style={{ float: 'right'}}>
                    <Button type="primary" htmlType="submit">
                      <Icon type="search" />查询
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                      重置
                    </Button>
                    </span>
                  </div>
              </Form>
            </div>
          </Card>
          <Row style={{ marginTop: 20 }}>
            <Card>
              <div className={styles.tableListOperator}>
                <Button icon="plus" type="primary" onClick={() => this.setModalVisible(true)}>
                  新增
                </Button>
                <Button type="primary" onClick={this.showConfirm}>
                  重置密码
                </Button>
              </div>
              <div>
                <Table
                  rowSelection={rowSelection}
                  pagination={paginationProps}
                  loading={loading}
                  columns={column}
                  dataSource={tableData}
                  onChange={this.handleStandardTableChange}
                />
              </div>
            </Card>
          </Row>
        </div>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
