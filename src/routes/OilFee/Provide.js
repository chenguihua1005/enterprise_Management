import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Select,
  Input,
  Button,
  Table,
  DatePicker,
  Tabs,
  Icon,
  message,
  Modal,
  Upload,
  notification,
} from 'antd';
import reqwest from 'reqwest';
import { baseUrl } from '../../services/api';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import OilFeeRecycleSelect from './components/OilFeeRecycleSelect';
import OilFeeGrant from './components/OilFeeGrant';
import styles from './OilFee.less';
import moment from 'moment';
import { getTimeDistance } from '../../utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;

//批量导入，弹框
const CreateForm2 = Form.create()(props => {
  const {
    importModal,
    form,
    setImportmodal,
    setDownload,
    branchOptions,
    handleAdd2,
    propsUpload,
  } = props;
  const { getFieldDecorator } = form;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //form.resetFields();
      handleAdd2(fieldsValue);
    });
  };
  return (
    <Modal
      centered
      title="油费批量发放"
      width={850}
      visible={importModal}
      okText="上传"
      onOk={okHandle}
      onCancel={() => setImportmodal()}
      maskClosable={false}
    >
      <Row>
        <Col span={12}>
          <FormItem
            labelCol={{ span: 16 }}
            wrapperCol={{ span: 4 }}
            label="请将油费发放计划填入模板，进行批量导入"
          >
            <Button type="primary" onClick={() => setDownload()}>
              下载模板
            </Button>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="数据文件">
            {getFieldDecorator('excel', {})(
              // (<input type="file" name="excel" />)
              <Upload {...propsUpload}>
                <Button>
                  <Icon type="upload" /> 请选择excel文件导入
                </Button>
              </Upload>
            )}
          </FormItem>
        </Col>
      </Row>
    </Modal>
  );
});

@connect(({ oilfee, basicinfo, loading }) => ({
  oilfee,
  basicinfo,
  loading: loading.effects['oilfee/fetch4Detail', 'oilfee/fetch4DetailExport'],
}))
@Form.create()
export default class ProvideComponent extends PureComponent {
  state = {
    current: 1,
    grantModalVisible: false,
    formValues: {},
    flag: false,
    clearTimer: 0,
    recycleModalVisible: false,
    rangePickerValue: getTimeDistance('month'),
    activeKey: 'list',
    importModal: false,
    //上传
    fileList: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    const startTime = startValue.format('YYYY-MM-DD');
    const endTime = endValue.format('YYYY-MM-DD');
    //总账户详情
    dispatch({
      type: 'oilfee/fetch1',
      payload: {  },
    });

    //分公司名称
    dispatch({
      type: 'oilfee/fetchBranch',
      payload: {  },
    });

    //油费发放详情
    dispatch({
      type: 'oilfee/fetch4Detail',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        startTime,
        endTime,
      },
    });
  }

  // 子组件使用的切换 tabs 方式
  activeKeyChange = key => {
    const { dispatch } = this.props;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    const startTime = startValue.format('YYYY-MM-DD');
    const endTime = endValue.format('YYYY-MM-DD');
    this.setState({
      activeKey: key,
    });
    //切换tab刷新发放明细的数据
    if (key == 'list') {
      //油费发放详情
      dispatch({
        type: 'oilfee/fetch4Detail',
        payload: {
          page: 1,
          pageSize: 10,
          isCount: 1,
          startTime,
          endTime,
        },
      });
    }
  };

  // tabs 切换的回调
  onChangeActiveKey = activeKey => {
    // console.log(activeKey);
    this.setState({
      activeKey: activeKey,
    });
  };

  //回收Modal显示控制
  handleModalVisible(status) {
    this.setState({
      grantModalVisible: status,
    });
  }
  // 回收 modal 操作
  handleRecycleModalVisible = status => {
    this.setState({
      recycleModalVisible: status,
    });
  };

  // 重置搜索条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
      rangePickerValue: getTimeDistance('month'),
    });
    const [startValue, endValue] = getTimeDistance('month');
    const startTime = startValue.format('YYYY-MM-DD');
    const endTime = endValue.format('YYYY-MM-DD');
    //油费发放详情
    dispatch({
      type: 'oilfee/fetch4Detail',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        startTime,
        endTime,
      },
    }).then(() => {
      this.setState({
        current: 1,
      });
    });
  };

  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        page: 1,
        pageSize: 10,
        isCount: 1,
        startTime,
        endTime,
      };
      // 表单校验
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
        const values = {
          ...params,
          commonField: fieldsValue.commonField,
          grantType: fieldsValue.grantType,
          branchId: fieldsValue.branchId,
        };
        //油费发放详情
        dispatch({
          type: 'oilfee/fetch4Detail',
          payload: values,
        }).then(() => {
          this.setState({
            current: 1,
          });
        });
      });
    } else {
      message.error('日期不能为空');
    }
  };

  //列表变化翻页的回调
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        isCount: 1,
        startTime,
        endTime,
      };
      // 表单校验
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
        const values = {
          ...params,
          commonField: fieldsValue.commonField,
          grantType: fieldsValue.grantType,
          branchId: fieldsValue.branchId,
        };
        //油费发放详情
        dispatch({
          type: 'oilfee/fetch4Detail',
          payload: values,
        }).then(() => {
          this.setState({
            current: pagination.current,
          });
        });
      });
    } else {
      message.error('日期不能为空');
    }
  };

  //禁用当前日期之后的时间
  disabledDate = current => {
    // console.log(moment().subtract(3,"months"));
    // return current && current < moment().subtract(3,"months");
    return current && current > moment().endOf('day');
  };

  //日期框设置值
  handleRangePickerChange = rangePickerValue => {
    this.setState({
      rangePickerValue,
    });
  };

  //导出
  handleExport = () => {
    console.log('handleExport');
    const { dispatch, form } = this.props;
    const { getFieldValue } = form;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        actionType: 1,
        startTime,
        endTime,
      };
      const values = {
        ...params,
        commonField: getFieldValue('commonField'),
        grantType: getFieldValue('grantType'),
        branchId: getFieldValue('branchId'),
      };
      dispatch({
        type: 'oilfee/fetch4DetailExport',
        payload: values,
      }).then(() => {
        const { providedetailListExport } = this.props.oilfee;
        switch (providedetailListExport.err) {
          //err=0成功
          case 0:
            message.success(providedetailListExport.msg);
            window.open(providedetailListExport.res.path);
            break;
          default:
            message.warning(providedetailListExport.msg);
        }
      });
    } else {
      message.error('日期不能为空');
    }
  };

  countDown = () => {
    let secondsToGo = 5;
    const modal = Modal.success({
      // title: 'This is a notification message',
      content: `文件上传中，可能需要几分钟处理时间，您可以先操作其他页面，处理完成后系统会提示您`,
      onOk: this.updateDriverList(),
    });
  };
  updateDriverList = () => {
    console.log('updata', '更新了吗');
  };

  //上传
  handleAdd2 = fields => {
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    const startTime = startValue.format('YYYY-MM-DD');
    const endTime = endValue.format('YYYY-MM-DD');
    const { fileList } = this.state;
    const formData = new FormData();
    if (fileList.length == 0) {
      message.warning('请先上传文件！');
      return;
    } else if (fileList.length >= 2) {
      message.warning('一次只能上传一个文件！');
      return;
    }
    fileList.forEach(file => {
      formData.append('files', file);
    });
    reqwest({
      url: baseUrl + 'oilAccount/AsnycDistribute',
      method: 'post',
      processData: false,
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('accessToken') || '',
      },
      data: formData,
      success: response => {
        const { dispatch } = this.props;
        if (response.err === 0) {
          //清空excel列表
          this.setState({
            fileList: [],
          });
          this.setState({
            importModal: false,
          });
          this.countDown();
          this.getinfo();
        } else {
          //清空excel列表
          this.setState({
            fileList: [],
          });
          message.error(response.msg);
        }
      },
      error: err => {
        //清空excel列表
        this.setState({
          fileList: [],
        });
        message.error('上传错误!');
        console.log(err);
      },
    });
  };
  getinfo = () => {
    const { dispatch, form } = this.props;
    // 获取异步上传文件已处理未读个数
    dispatch({
      type: 'basicinfo/dingNotice',
      payload: {},
    }).then(() => {
      const { rangePickerValue } = this.state; //startValue,endValue
      const [startValue, endValue] = rangePickerValue;
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const { dingNotice } = this.props.basicinfo;
      if (dingNotice.num > 0) {
        //异步文件未读消息列表
        dispatch({
          type: 'basicinfo/noticeList',
          payload: {
            isCount: 1,
          },
        }).then(() => {
          const { noticeList } = this.props.basicinfo;
          const list = noticeList.list;
          this.openNotification(list);
          // //清空所属分公司旧数据
          // form.resetFields('belongCompanyId');
        });
      }
      if (this.state.flag === true) {
        this.setState({ flag: false });
        return false;
      } else {
        if (this.state.clearTimer === 0) {
          this.clearFlag();
        }
      }
      setTimeout(this.getinfo, 3000);
      //刷新
      //总账户详情
      dispatch({
        type: 'oilfee/fetch1',
        payload: {  },
      });
      //油费发放详情
      dispatch({
        type: 'oilfee/fetch4Detail',
        payload: {
          page: 1,
          pageSize: 10,
          isCount: 1,
          startTime,
          endTime,
        },
      });
    });
  };
  //设置定时器
  clearFlag = () => {
    const timer = setTimeout(() => {
      this.setState({
        flag: true,
        clearTimer: 0,
      });
    }, 1000 * 120);
    this.setState({ clearTimer: timer });
  };
  openNotification = list => {
    const key = `open${Date.now()}`;
    for (let i = 0; i < list.length; i++) {
      const tmp = list[i];
      // const notice = tmp.notice_type = 300 ? '油费管理' : '司机管理';
      if (tmp.err === 0) {
        notification.success({
          key,
          // duration: 0,
          placement: 'bottomRight',
          message: (tmp.notice_type === 300 ? '油费管理' : '司机管理') + '文件处理完成！',
          description: (
            <div>
              <p>{tmp.msg}</p>
              <a href="#" />
            </div>
          ),
          style: {
            width: 600,
            marginLeft: 335 - 600,
          },
          icon: <Icon type="check-circle" theme="outlined" style={{ color: '#108ee9' }} />,
          onClose: this.close(key),
        });
      } else if (tmp.err === 1) {
        notification.warning({
          key,
          duration: 0,
          placement: 'bottomRight',
          message: (tmp.notice_type === 300 ? '油费管理' : '司机管理') + '文件处理完成！',
          description: (
            <div>
              <p>{tmp.msg}</p>
              <a onClick={() => this.errorDownLoad(tmp.resultFile, key)}>下载错误失败文件</a>
            </div>
          ),
          style: {
            width: 600,
            marginLeft: 335 - 600,
          },
          icon: <Icon type="exclamation-circle" theme="outlined" style={{ color: '#108ee9' }} />,
          onClose: this.close(key),
        });
      } else {
        notification.error({
          key,
          duration: 0,
          placement: 'bottomRight',
          message: (tmp.notice_type === 300 ? '油费管理' : '司机管理') + '文件处理完成！',
          description: (
            <div>
              <p>{tmp.msg}</p>
              <a onClick={() => this.errorDownLoad(tmp.resultFile, key)}>下载错误失败文件</a>
            </div>
          ),
          style: {
            width: 600,
            marginLeft: 335 - 600,
          },
          icon: <Icon type="close-circle" theme="outlined" style={{ color: '#f81d22' }} />,
          onClose: this.close(key),
        });
      }
    }
  };

  // 下载导入失败文件
  errorDownLoad = (url, key) => {
    window.open(url);
    notification.close(key);
  };

  // 关闭异步弹框
  close = key => {
    notification.close(key);
  };

  //发放
  handleProvide = () => {
    this.setState({
      activeKey: 'add',
    });
  };

  // 批量导入
  setImportmodal = flag => {
    this.setState({
      importModal: !!flag,
    });
    // console.log('->setImportmodal');
    //清空excel列表
    this.setState({
      fileList: [],
    });
  };

  // 下载模板
  setDownload = () => {
    console.log('setDownload');
    const { dispatch } = this.props;
    const params = {
      template: 'oilMoney_1.0.0.xlsx',
    };
    //下载模板-司机查询
    dispatch({
      type: 'oilfee/fetchProvideDownloadTemplet',
      payload: params,
    }).then(() => {
      const { provideTemplet } = this.props.oilfee;
      switch (provideTemplet.err) {
        //err=0成功
        case 0:
          message.success(provideTemplet.msg);
          window.open(provideTemplet.res.template);
          break;
        default:
          message.warning(provideTemplet.msg);
      }
    });
  };

  render() {
    const { oilfee, loading } = this.props;
    const { oilAccountInfo, oilAccountInfoAmount, providedetailList, branchCompany } = oilfee;
    const { count, list: tabledata } = providedetailList;
    const { getFieldDecorator } = this.props.form;
    const { importModal } = this.state;
    const { rangePickerValue } = this.state;

    //所属分公司
    const branchOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (branchCompany != undefined && branchCompany.length > 0) {
      branchCompany.forEach(item => {
        branchOptions.push(
          <Option key={item.companyBranchId} value={item.companyBranchId}>
            {item.companyBranchName}
          </Option>
        );
      });
    }

    const propsUpload = {
      action: '//test.api-bms.51zhaoyou.com/bms/oilAccount/OABatchDistribute',
      // action: '//jsonplaceholder.typicode.com/posts/',
      accept: '.xlsx',
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
      fileList: this.state.fileList,
    };

    const parentMethods2 = {
      handleAdd2: this.handleAdd2,
      setImportmodal: this.setImportmodal,
      setDownload: this.setDownload,
      propsUpload,
      // fileList: this.state.fileList,
    };

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: parseInt(count),
      current: this.state.current,
      showTotal: () => `共计 ${count} 条`,
    };

    const columnData = [
      {
        title: '发放时间',
        dataIndex: 'createTime',
      },
      {
        title: '发放类型',
        dataIndex: 'grantType',
      },
      {
        title: '收款方',
        dataIndex: 'receiveCompanyName',
      },
      {
        title: '账户编号',
        dataIndex: 'accountNumber',
      },
      {
        title: '车牌号',
        dataIndex: 'carNumber',
      },
      {
        title: '金额',
        dataIndex: 'amount',
      },
    ];

    return (
      <PageHeaderLayout>
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card bordered={false}>
              <Col span={15}>
                <h3>
                  您的账户剩余可发放额度：<span
                    className={styles.bigFontSize}
                  >{`${oilAccountInfoAmount}元`}</span>
                </h3>
              </Col>
              <Col span={3}>
                <Button type="primary" onClick={() => this.handleProvide()}>
                  <Icon type="plus" />发放
                </Button>
              </Col>
              <Col span={3}>
                <Button type="primary" onClick={() => this.setImportmodal(true)}>
                  <Icon type="upload" />批量发放
                </Button>
              </Col>
              <Col span={3}>
                <Button
                  type="primary"
                  icon="delete"
                  onClick={() => this.handleRecycleModalVisible(true)}
                >
                  回收
                </Button>
              </Col>
            </Card>
          </Col>
        </Row>
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
          {/* 油费发放列表 */}
          <Tabs size="large" activeKey={this.state.activeKey} onChange={this.onChangeActiveKey}>
            <TabPane tab="发放明细" key="list" style={{ marginBottom: 0 }}>
              <Card bordered={false}>
                <div className={styles.tableList}>
                  <div className={styles.tableListForm}>
                    <Form onSubmit={this.handleSearch} layout="inline">
                      <Row gutter={{ md: 24, lg: 24, xl: 48 }}>
                        <Col md={12} sm={24}>
                          <FormItem label="关键词搜索">
                            {getFieldDecorator('commonField')(
                              <Input placeholder="请输入 手机号" />
                            )}
                          </FormItem>
                        </Col>
                        <Col md={12} sm={24}>
                          <FormItem label="发放类型">
                            {getFieldDecorator('grantType', {
                              initialValue: '0',
                            })(
                              <Select placeholder="请选择" style={{ width: '100%' }}>
                                <Option value="0">全部</Option>
                                <Option value="1">划出</Option>
                                <Option value="2">回收</Option>
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={{ md: 24, lg: 24, xl: 48 }}>
                        <Col md={12} sm={24}>
                          <FormItem label="分公司名称">
                            {getFieldDecorator('branchId', {
                              initialValue: 0,
                            })(
                              <Select placeholder="请选择" style={{ width: '100%' }}>
                                {branchOptions}
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                        <Col md={12} sm={24}>
                          <FormItem label="起止日期">
                            <RangePicker
                              style={{ width: '100%' }}
                              value={rangePickerValue}
                              disabledDate={this.disabledDate}
                              onChange={this.handleRangePickerChange}
                            />
                          </FormItem>
                        </Col>
                      </Row>
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ float: 'right', marginBottom: 24 }}>
                          <Button type="primary" htmlType="submit">
                            <Icon type="search" />查询
                          </Button>
                          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                            重置
                          </Button>
                          <Button
                            type="primary"
                            style={{ marginLeft: 8 }}
                            onClick={this.handleExport}
                          >
                            <Icon type="export" />导出
                          </Button>
                        </span>
                      </div>
                    </Form>
                  </div>
                  <div className={styles.tableListOperator}>
                    {/* <Button
                      icon="plus"
                      type="primary"
                      onClick={() => this.handleModalVisible(true)}
                    >
                      发放
                    </Button> */}
                    {/* <Button type="primary" onClick={() => this.setImportmodal(true)}>
                      <Icon type="upload" />批量导入
                    </Button>
                    <Button icon="delete" onClick={() => this.handleRecycleModalVisible(true)}>
                      回收
                    </Button> */}
                  </div>
                  <Table
                    pagination={paginationProps}
                    loading={loading}
                    rowKey={'key'}
                    dataSource={tabledata}
                    columns={columnData}
                    onChange={this.handleStandardTableChange}
                  />
                </div>
              </Card>
            </TabPane>
            {/* 新增发放油费 */}
            <TabPane tab="油费发放" key="add">
              <Card bordered={false}>
                <OilFeeGrant activeKey={this.activeKeyChange} />
              </Card>
            </TabPane>
          </Tabs>
        </Card>
        {/* 回收 */}
        <OilFeeRecycleSelect
          modalVisible={this.state.recycleModalVisible}
          handleModalVisible={() => this.handleRecycleModalVisible(false)}
        />
        <CreateForm2 {...parentMethods2} importModal={importModal} />
      </PageHeaderLayout>
    );
  }
}
