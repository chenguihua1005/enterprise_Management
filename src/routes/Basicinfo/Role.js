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
  Divider,
  Icon,
  Popconfirm,
  message,
} from 'antd';
import {
    Field
  } from 'components/Charts';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Basicinfo.less';
import props from './../../layouts/BlankLayout';
import { Tree } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
const { TextArea } = Input;
const TreeNode = Tree.TreeNode;
// 新增
const CreateForm = Form.create()(props => {
    const { 
      modalVisible, 
      form, 
      handleAdd, 
      handleModalVisible} = props;
    const {getFieldDecorator}=form;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        form.resetFields();
        let prams={
            arName:fieldsValue["arName"],
            status:JSON.parse(fieldsValue["status"]),
            remark:fieldsValue["remark"]
        };
        handleAdd(prams);
      });
    };
    const cancelHandle=()=>{
      handleModalVisible();
    }
   
    return (
      <Modal
        title="新建角色"
        width={700}
        visible={modalVisible}
        onOk={okHandle}
        onCancel={cancelHandle}
        destroyOnClose={true}
        maskClosable={false}
      >
       <Card>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                label="角色名称"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
                >
                {getFieldDecorator('arName', {
                    rules: [{ required: true,message: '必填'}],
                })(
                    <Input />
                )}
                </FormItem>
                <FormItem
                label="是否有效"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
                >
                {getFieldDecorator('status', {
                    // initialValue:`${item.planNum}`,
                    initialValue:'1',
                    rules: [{ required: true,message: '必填'}],
                })(
                    <Select>
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                    </Select>
                )}
                </FormItem>
                <FormItem
                label="角色描述"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
                >
                {getFieldDecorator('remark', {
                    rules: [{ required: true,message: '必填'}],
                })(
                    <TextArea></TextArea>
                )}
                </FormItem>
            </Form>
          </div>
        </div>
        </Card>
      </Modal>
    );
  });
//编辑
const EditForm = Form.create()(props => {
    const { 
      modalVisible, 
      form, 
      handleEdit, 
      handleEditModalVisible,
      editModalItem} = props;
    const {getFieldDecorator}=form;
    const {arId,arName,status,remark}=editModalItem;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // form.resetFields();
        const values = Object.assign(fieldsValue, {"id":arId});
        handleEdit(values);
      });
    };
    const cancelHandle=()=>{
      handleEditModalVisible();
    }
      
    return (
      <Modal
        title="编辑角色"
        width={700}
        visible={modalVisible}
        onOk={okHandle}
        onCancel={cancelHandle}
        destroyOnClose={true}
        maskClosable={false}
      >
       <Card>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    label="角色名称"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 12 }}
                    >
                    {getFieldDecorator('id', {
                        initialValue:`${arName}`,
                        // initialValue:'都是',
                        rules: [{ required: true,message: '必填字段'}],
                    })(
                        <Input disabled={true} />
                    )}
                    </FormItem>
                    <FormItem
                    label="是否有效"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 12 }}
                    >
                    {getFieldDecorator('status', {
                        initialValue:`${status}`,
                        // initialValue:'1',
                        rules: [{ required: true,message: '必填字段'}],
                    })(
                        <Select
                        >
                        <Option value="1">是</Option>
                        <Option value="0">否</Option>
                        </Select>
                    )}
                    </FormItem>
                    <FormItem
                    label="角色描述"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 12 }}
                    >
                    {getFieldDecorator('remark', {
                        initialValue:`${remark}`,
                        //  initialValue:'大师风范',
                         rules: [{ required: true,message: '必填字段'}],
                    })(
                        <TextArea></TextArea>
                    )}
                </FormItem>
            </Form>
          </div>
        </div>
        </Card>
      </Modal>
    );
  });
//设置权限
const RoleForm = Form.create()(props => {
    const { 
      modalVisible, 
      form, 
      handleRole, 
      handleRoleModalVisible,
      renderTreeNodes,
      onExpand,
      onCheck,
      onSelect,
      states,
      TreeData} = props;
    const {expandedKeys,autoExpandParent,checkedKeys,selectedKeys}=states;
    const okHandle = () => {
    //   form.validateFields((err, fieldsValue) => {
    //     if (err) return;
    //     // form.resetFields();
    //     handleRole(fieldsValue);
    //   });
      handleRole(checkedKeys);
    };
    const cancelHandle=()=>{
        handleRoleModalVisible();
    }
    // const treeData = [{
    //     title: '数据总览',
    //     key: 'dashboard',
    //   },{
    //     title: '基础信息管理',
    //     key: 'basicinfo',
    //     children: [{
    //       title: '分公司管理',
    //       key: 'subsidiary',
    //     }, {
    //         title: '司机管理',
    //         key: 'driver',
    //     }, {
    //       title: '账号管理',
    //       key: 'accountadmin',
    //       children: [
    //         { title: '角色管理', key: 'role' },
    //         { title: '用户管理', key: 'user' },
    //       ],
    //     }],
    //   },{
    //     title: '订单管理',
    //     key: 'order',
    //   }, {
    //     title: '油费管理',
    //     key: 'oilfee',
    //     children: [
    //       { title: '账户管理', 
    //         key: 'oilaccount',
    //         children:[{
    //             title: '总账户',
    //             key: 'general',
    //         },{
    //             title: '分公司账户',
    //             key: 'branch',
    //         },{
    //             title: '司机账户',
    //             key: 'driveraccout',
    //         }]
    //     },
    //       { title: '油费发放', key: 'provide' },
    //     ],
    //   }, {
    //     title: '结算管理',
    //     key: 'settlement',
    //   }];
    return (
      <Modal
        title="设置权限"
        width={700}
        visible={modalVisible}
        onOk={okHandle}
        onCancel={cancelHandle}
        destroyOnClose={true}
        maskClosable={false}
      >
       <Card>
        <Tree
            checkable//节点前添加 Checkbox 复选框
            defaultExpandAll//默认展开所有树节点
            onExpand={onExpand}//展开/收起节点时触发
            expandedKeys={expandedKeys}//展开指定的树节点
            autoExpandParent={autoExpandParent}//是否自动展开父节点
            onCheck={onCheck}//点击复选框触发
            checkedKeys={checkedKeys}//选中复选框的树节点
            onSelect={onSelect}//点击树节点触发
            selectedKeys={selectedKeys}//设置选中的树节点TreeData
        >
            {renderTreeNodes(TreeData)}
        </Tree>
        </Card>
      </Modal>
    );
  });
//查看权限
const LookForm = Form.create()(props => {
    const { 
      modalVisible, 
      form, 
      handleRole, 
      handleRoleModalVisible,
      renderTreeNodes,
      onSelect,
      states,
      delRole,
      renderTreeItem,
      lookModalItem} = props;
    const {treeData}=states;
    // const {getFieldDecorator}=form;
    const status = lookModalItem.status == "1" ? "有效" : "无效";
    // const okHandle = () => {
    //   form.validateFields((err, fieldsValue) => {
    //     if (err) return;
    //     // form.resetFields();
    //     handleRole(prams);
    //   });
    // };
    const cancelHandle=()=>{
        handleRoleModalVisible();
    }
    const renderShowRole=()=>{
        return (
          <Tree
            showLine
            defaultExpandAll//默认展开所有树节点
            // onSelect={onSelect} userData.TreeData
          >
              {renderTreeNodes(treeData) }
          </Tree>
        )
      }
    // console.log(treeData);
    return (
      <Modal
        title="查看权限"
        width={850}
        visible={modalVisible}
        // onOk={okHandle}
        onCancel={cancelHandle}
        footer={null}
        destroyOnClose={true}
        maskClosable={false}
      >
       <Card>
        <Row gutter={{ md: 8, lg: 24, xl: 24 }} style={{marginBottom:20}}>
            <Col md={8} sm={24}>
                <Field label="角色名称:" value={`${lookModalItem.arName}`}/>
            </Col>
            <Col md={8} sm={24}>
                <Field label="是否有效:" value={status}/>
            </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 24 }}>
            <Col md={24} sm={24}>
            <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="角色描述">
                <TextArea autosize={true} style={{resize:"none",border:"none",paddingLeft:5,paddingTop:3,lineHeight:2.5}} readOnly="readOnly" value={`${lookModalItem.remark}`}>
                </TextArea>
            </FormItem> 
                {/* <Field label="角色描述" value={`${lookModalItem.remark}`} title={`${lookModalItem.remark}`} /> */}
            </Col>
        </Row>
        </Card>
        <Card>
         <Row>
           <Col span={24}>
            <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="角色权限">
                {treeData.length>0?renderShowRole():"该角色未设置权限"}
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
      editModalVisible: false,
      roleModalVisible:false,
      lookModalVisible:false,
      disable: false,
      confirmDirty: false,
    //   expandedKeys: ['basicinfo','oilfee','oilaccount','accountadmin'],//'0-0-0', '0-0-1'
      autoExpandParent: true,
      checkedKeys: [],//'basicinfo','oilfee','oilaccount','accountadmin'
      checkedKeysBox:[],
      selectedKeys: [],
      editModalItem:{},
      lookModalItem:{},
      treeData:[],
      current:1,
      userData: {
        userName: '',
        mobilePhone: '',
        realName: '',
        password: '',
        repeatPassword: '',
        remark: '',
        branchId: '全部',
        parentBranchId: 0,
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
    // 角色列表
    dispatch({
        type: 'basicinfo/fetchappRoleInfo',
        payload: {
            isvalid: "-1",
            isGrant: "-1",
            page: 1,
            pageSize: 10,
            isPage: 1,
        },
    });
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
        // if (Array.isArray(fieldsValue[prop])) {
        //   if (fieldsValue[prop].join(',') === '全部') {
        //     delete fieldsValue[prop];
        //   }
        // }
      }
      const params = {
        //默认值
        isvalid: "-1",
        isGrant: "-1",
        page: 1,
        pageSize: 10,
        isPage: 1,
      };
      const values = Object.assign(params,fieldsValue);
      
      // 角色列表
      dispatch({
        type: 'basicinfo/fetchappRoleInfo',
        payload: values,
      }).then(()=>{
        this.setState({
          current: 1
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
        status:fieldsValue["isvalid"],
        remark:fieldsValue["remark"],
        page: pagination.current,
        pageSize: pagination.pageSize,
        isPage: 1,
      };
      //角色列表
      dispatch({
        type: 'basicinfo/fetchappRoleInfo',
        payload: params,
      }).then(()=>{
        this.setState({
          current: pagination.current
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
      type: 'basicinfo/fetchappRoleInfo',
      payload: {
        isvalid: "-1",
        isGrant: "-1",
        page: 1,
        pageSize: 10,
        isPage: 1,
      },
    }).then(()=>{
        this.setState({
          current: 1
        });
    });
  };

  //新增对话框显示或取消
  handleModalVisible = (flag,record) => {
    this.setState({
      modalVisible: !!flag,
    });
  };
 
  // 新增角色
    handleAdd = fields => {
        const { dispatch} = this.props;
        dispatch({
            type: 'basicinfo/fetchSetRoleOne',
            payload: fields,
        }).then(()=>{
            const { basicinfo} = this.props;
            const {setRoleOne}=basicinfo;
            if(setRoleOne.err=="0"){
                message.success(setRoleOne.msg);
                dispatch({ 
                    type: 'basicinfo/fetchappRoleInfo',
                    payload: {
                        isvalid: "-1",
                        isGrant: "-1",
                        page: 1,
                        pageSize: 10,
                        isPage: 1,
                    },
                });
                this.setState({
                  modalVisible:false
              });
            }else{
                message.error(setRoleOne.msg);
                this.setState({
                  modalVisible:true
              });
            }
            
        });
    };
    //编辑权限
    handleEdit= fields =>{
        const { dispatch} = this.props;
        dispatch({
            type: 'basicinfo/fetchappRoleSaveOne',
            payload: fields,
        }).then(()=>{
            const {basicinfo} = this.props;
            const {appRoleSaveMsg}=basicinfo;
            if(appRoleSaveMsg.err=="0"){
                message.success(appRoleSaveMsg.msg);
                dispatch({ 
                    type: 'basicinfo/fetchappRoleInfo',
                    payload: {
                        isvalid: "-1",
                        isGrant: "-1",
                        page: 1,
                        pageSize: 10,
                        isPage: 1,
                    },
                });
                this.setState({
                    editModalVisible:false 
                });
            }else{
                message.error(appRoleSaveMsg.msg);
                //如果被有效用户使用过的角色  就提示错误，并且不能关闭编辑窗口
            }
        });
    }
    //设置权限确定接口
    handleRole= fields =>{
        const { dispatch} = this.props;
        let params={
            arId:JSON.parse(window.sessionStorage.getItem("amId")),
            menuIds:fields.join(",")
        }
        dispatch({
            type: 'basicinfo/fetchSetRoleAuth',
            payload: params,
        }).then(()=>{
            const {basicinfo} = this.props;
            const {setRoleAuth}=basicinfo;
            if(setRoleAuth.err=="0"){
                message.success(setRoleAuth.msg+" 重新登录后生效!");
                // 角色列表
                dispatch({
                    type: 'basicinfo/fetchappRoleInfo',
                    payload: {
                        isvalid: "-1",
                        isGrant: "-1",
                        page: 1,
                        pageSize: 10,
                        isPage: 1,
                    },
                });
            }else{
                message.error(setRoleAuth.msg);
            }
            this.setState({
                roleModalVisible:false
            });
        });
    }

  //编辑对话框显示或取消
  handleEditModalVisible = (flag,record) => {
    if(!record){
      this.setState({
        editModalVisible:!!flag
      });
    }else{
      const { dispatch} = this.props;
      dispatch({  //请求角色id的详情
        type: 'basicinfo/fetchappRoleOne',
        payload: {
            arId:record.id
        },
      }).then(()=>{
        const { basicinfo} = this.props;
        const {appRoleOne}=basicinfo;
        // if(appRoleOne.err=="0"){       }else{
        //     message.error(appRoleOne.msg);
        // }
        // const {res:roleOne}=appRoleOne;
        const editModalItem={
            arId:appRoleOne.arId,
            arName:appRoleOne.arName,
            status:appRoleOne.status,
            remark:appRoleOne.remark
        };
        this.setState({
            editModalVisible:!!flag,
            editModalItem:editModalItem
            });
      });
    }
  };
  //设置权限
  handleRoleModalVisible=(flag,record)=>{
    if(!record){
      this.setState({
        roleModalVisible:!!flag
      });
    }else{
      //储存角色id
      window.sessionStorage.setItem("amId",record.id);
      const { dispatch} = this.props;
      if(record.status==0){//角色无效 不能弹框设置权限
        this.setState({
          roleModalVisible:false
        });
        message.warn("角色无效不能设置权限");
      }else{
        dispatch({  //请求角色id的详情 获取角色详情
          type: 'basicinfo/fetchappGetRoleMenu',
          payload: {
              role:record.id
          },
        }).then(()=>{//获取角色详情成功后 获取角色权限菜单
              const { basicinfo} = this.props;
              const {appMenuRole}=basicinfo;//获取到权限菜单
              const {list:menuRole}=appMenuRole;
              menuRole.sort(this.compareSort("amOrder"));
              const selectNode=[];
              menuRole.forEach(item => {
                if (item.isAuth == "1" && selectNode.indexOf(item.amId) == -1) {
                  selectNode.push(item.amId.toString()); //有权限的菜单ID记录下来
                }
              });
              console.log('需要选中的节点',selectNode);
              const TreeData=this.formatGetData(menuRole);
              this.setState({
                  roleModalVisible:!!flag,
                  checkedKeys:selectNode,
                  treeData:TreeData
              });
        });
      }
    }
  }
  //查看权限
  handleLookModalVisible=(flag,record)=>{
    if(!record){
      this.setState({
        lookModalVisible:!!flag
      });
    }else{
      const { dispatch} = this.props;
      dispatch({  //请求角色id的详情
        type: 'basicinfo/fetchappRoleOne',
        payload: {
            arId:record.id
        },
      }).then(()=>{
        const { basicinfo} = this.props;
        const {appRoleOne}=basicinfo;
        const lookModalItem={
            arId:appRoleOne.arId,
            arName:appRoleOne.arName,
            status:appRoleOne.status,
            remark:appRoleOne.remark
        };
        dispatch({  //获取权限菜单
            type: 'basicinfo/fetchappGetRoleMenu',
            payload: {
                isAuth:1,
                role:record.id
            },
        }).then(()=>{
            const { basicinfo} = this.props;
            const {appMenuRole}=basicinfo;//获取到权限菜单
            const {list:menuRole}=appMenuRole;
            menuRole.sort(this.compareSort("amOrder"));
            const selectNode=[];
            menuRole.forEach(item => {
            if (item.isAuth == "1" && selectNode.indexOf(item.amId) == -1) {
                selectNode.push(item.amId.toString()); //有权限的菜单ID记录下来
            }
            });
            const TreeData=this.formatGetData(menuRole);
            this.setState({
                lookModalVisible:!!flag,
                checkedKeys:selectNode,
                treeData:TreeData,
                lookModalItem:lookModalItem
            });
        })
      });
    }
  }
  //删除权限
  handleDelete=(record)=>{
    console.log('record',record);
    const { dispatch} = this.props;
    dispatch({
        type: 'basicinfo/fetchDelRole',
        payload: {
          roleId: record.id
        },
    }).then(()=>{
        const {basicinfo} = this.props;
        const {delRole}=basicinfo;
        if(delRole.err=="0"){
            message.success(delRole.msg);
            dispatch({ 
                type: 'basicinfo/fetchappRoleInfo',
                payload: {
                    isvalid: "-1",
                    isGrant: "-1",
                    page: 1,
                    pageSize: 10,
                    isPage: 1,
                },
            });
        }else{
            message.error(delRole.msg);
            //如果被有效用户使用过的角色  就提示错误，并且不能关闭编辑窗口
        }
    });
  }

  onExpand = (expandedKeys) => {
    console.log('onExpand', expandedKeys);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onCheck = (checkedKeys) => {
    console.log('onCheck', checkedKeys);
    this.setState({ checkedKeys });
  }

  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  }
  //遍历树节点
  renderTreeNodes = (data) => {
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
  //删除没有权限的节点
  delRole=(treedata,roledata)=>{
    roledata.forEach(item=>{
        this.renderTreeItem(treedata,item);
    })
  }
  //递归树形数据结构 传没有权限的进去 删除没有权限的节点
  renderTreeItem =(data,key)=>{
    for (var i in data) {
        if (data[i]["key"] == key) {
            data.splice(i,1);
            break;
        } else {
            this.renderTreeItem(data[i].children, key);
        }
    }
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

  render() {
    const { basicinfo, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const { appRoleList} = basicinfo;
    const { count, list: tableData } = appRoleList;
    const { modalVisible,editModalVisible, roleModalVisible,lookModalVisible,editModalItem,lookModalItem,checkedKeysBox,treeData,current} = this.state;
    // const dataCount = accountList.total;
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
      handleModalVisible: this.handleModalVisible,
    };
    const parentEditMethods = {
        handleEdit: this.handleEdit,
        handleEditModalVisible: this.handleEditModalVisible,
        editModalItem:editModalItem
      };
    const parentRoleMethods ={
        handleRole: this.handleRole,
        handleRoleModalVisible: this.handleRoleModalVisible,
        onExpand:this.onExpand,
        onCheck:this.onCheck,
        onSelect:this.onSelect,
        renderTreeNodes:this.renderTreeNodes,
        states:this.state,
        TreeData:treeData,
        checkedKeysBox:checkedKeysBox
    }
    const parentLookMethods ={
        handleRoleModalVisible: this.handleLookModalVisible,
        onSelect:this.onSelect,
        renderTreeNodes:this.renderTreeNodes,
        states:this.state,
        lookModalItem:lookModalItem
    }

    const column = [
      {
        title: '角色名称',
        dataIndex: 'arName',
        key:"arName"
      },
      {
        title: '是否有效',
        dataIndex: 'status',
        key:"status",
        render: function(text){
            switch (text) {
              case 1:
                return "有效";
              case 0:
                return "无效";
            }
        }
      },
      {
        title: '设置权限',
        dataIndex: 'isGrant',
        dataIndex: 'isGrant',
        render: function(text){
            switch (text) {
              case 1:
                return "已设置";
              case 0:
                return "未设置";
            }
        }
      },
      {
        title: '操作时间',
        dataIndex: 'createTime',
        dataIndex: 'createTime'
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <Button icon="eye" title="查看权限" onClick={() => this.handleLookModalVisible(true,record)}>
            </Button>
            <Divider type="vertical" />
            <Button icon="lock" title="设置权限" onClick={() => this.handleRoleModalVisible(true,record)}></Button>
            <Divider type="vertical" />
            <Button icon="edit" title="编辑" onClick={() => this.handleEditModalVisible(true,record)}></Button>
            <Divider type="vertical" />
            <Popconfirm title="确认删除角色吗？" onConfirm={() => this.handleDelete(record)}>
                <Button icon="delete" title="删除"></Button>
            </Popconfirm>
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
                <Row gutter={{ md: 8, lg: 24, xl: 24 }}>
                  <Col md={6} sm={24}>
                    <FormItem label="角色名称">
                      {getFieldDecorator('arName')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <FormItem label="设置权限">
                      {getFieldDecorator('isGrant', {
                            initialValue:'-1',
                            initialText:'全部',
                        }
                        )(
                            <Select
                                onChange={this.handChangeTarget}
                                >
                                <Option value="-1">全部</Option>
                                <Option value="1">已设置</Option>
                                <Option value="0">未设置</Option>
                            </Select>
                        )}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <FormItem label="是否有效">
                      {getFieldDecorator('isvalid', {
                            initialValue:'-1',
                            initialText:'全部',
                        }
                        )(
                        <Select
                            onChange={this.handChangeTarget}
                        >
                        <Option value="-1">全部</Option>
                        <Option value="1">有效</Option>
                        <Option value="0">无效</Option>
                    </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <span style={{ float: 'right'}}>
                        <Button type="primary" htmlType="submit">
                            查询
                            </Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                            重置
                        </Button>
                    </span>
                  </Col>
                </Row>
              </Form>
            </div>
          </Card>
          <Row style={{ marginTop: 20 }}>
            <Card>
              <div className={styles.tableListOperator}>
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新增
                </Button>
              </div>
              <div>
                <Table
                //   rowSelection={rowSelection}  表格前面的checkbox
                  rowKey={record => record.id}
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
        <EditForm {...parentEditMethods} modalVisible={editModalVisible} />
        <RoleForm {...parentRoleMethods} modalVisible={roleModalVisible} />
        <LookForm {...parentLookMethods} modalVisible={lookModalVisible} />
      </PageHeaderLayout>
    );
  }
}
