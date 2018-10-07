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
} from 'antd';
import reqwest from 'reqwest';
const { RangePicker } = DatePicker;

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import OilFeeRecycleSelect from './components/OilFeeRecycleSelect';
import OilFeeGrant from './components/OilFeeGrant';

import styles from './OilFee.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;
import moment from 'moment';
import { getTimeDistance } from '../../utils/utils';

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
      form.resetFields();
      handleAdd2(fieldsValue);
    });
  };
  return (
    <Modal
      centered
      title="油费批量导入"
      width={850}
      visible={importModal}
      okText="上传"
      onOk={okHandle}
      onCancel={() => setImportmodal()}
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

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetch4Detail','oilfee/fetch4DetailExport'],
}))
@Form.create()
export default class ProvideComponent extends PureComponent {
  state = {
    grantModalVisible: false,
    formValues: {},
    recycleModalVisible: false,
    rangePickerValue: getTimeDistance('month'),
    activeKey: 'add',
    importModal: false,
    //上传
    fileList: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    //总账户详情
    dispatch({
      type: 'oilfee/fetch1',
      payload: { member_id: 26 },
    });

    //分公司名称
    dispatch({
      type: 'oilfee/fetchBranch',
      payload: { member_id: 26 },
    });

    //油费发放详情
    dispatch({
      type: 'oilfee/fetch4Detail',
      payload: {
        member_id: 26,
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });
  }
  // 子组件使用的切换 tabs 方式
  activeKeyChange = key => {
    const { dispatch } = this.props;
    this.setState({
      activeKey: key,
    });
    //切换tab刷新发放明细的数据
    if (key == 'list') {
      //油费发放详情
      dispatch({
        type: 'oilfee/fetch4Detail',
        payload: {
          member_id: 26,
          page: 1,
          pageSize: 10,
          isCount: 1,
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

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      member_id: 26,
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
    };

    dispatch({
      type: 'oilfee/fetch4Detail',
      payload: params,
    });
  };

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
    });
    dispatch({
      type: 'oilfee/fetch4Detail',
      payload: {},
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
        member_id: 26,
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
        dispatch({
          type: 'oilfee/fetch4Detail',
          payload: values,
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

  //上传
  handleAdd2 = fields => {
    // const { dispatch } = this.props;
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files', file);
    });
    // You can use any AJAX library you like
    reqwest({
      // url: '//jsonplaceholder.typicode.com/posts/',
      url: '//test.api-bms.51zhaoyou.com/bms/oilAccount/OABatchDistribute',
      method: 'post',
      processData: false,
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('accessToken') || '',
      },
      data: formData,
      success: response => {
        // message.success('upload successfully.');
        message.success(response.msg);
        //部分成功，response.res.result == 0,response.res.path != "",下载出错提示文件
        if (response.res.result == 0 && response.res.path != '') {
          window.open(response.res.path);
        }
        this.setState({
          modalVisible: false,
        });
      },
      error: err => {
        message.error('upload failed.');
        console.log(err);
      },
    });
  };

  // 批量导入
  setImportmodal = flag => {
    this.setState({
      importModal: !!flag,
    });
    console.log('->setImportmodal');
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
    const { oilAccountInfo, providedetailList, branchCompany } = oilfee;
    const { count, list: tabledata } = providedetailList;
    const { getFieldDecorator } = this.props.form;
    const { importModal } = this.state;

    //所属分公司
    const branchOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (branchCompany != undefined && branchCompany.length > 0) {
      branchCompany.forEach(item => {
        branchOptions.push(
          <Option
            key={item.companyBranchId}
            value={item.companyBranchId}
          >
            {item.companyBranchName}
          </Option>
        );
      });
    }

    const propsUpload = {
      action: '//test.api-bms.51zhaoyou.com/bms/oilAccount/OABatchDistribute',
      // action: '//jsonplaceholder.typicode.com/posts/',
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
      total: count,
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
              <h3>
                您的账户剩余可发放额度：<span className={styles.bigFontSize}>{`${
                  oilAccountInfo.accountAmount
                }元`}</span>
              </h3>
            </Card>
          </Col>
        </Row>
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
          {/* 油费发放列表 */}
          <Tabs size="large" activeKey={this.state.activeKey} onChange={this.onChangeActiveKey}>
            {/* 新增发放油费 */}
            <TabPane tab="油费发放" key="add">
              <Card bordered={false}>
                <OilFeeGrant activeKey={this.activeKeyChange} />
              </Card>
            </TabPane>
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
                            {getFieldDecorator('range-picke')(
                              // < onChange={onChange} />
                              <RangePicker
                                style={{ width: '100%' }}
                                disabledDate={this.disabledDate}
                                onChange={this.handleRangePickerChange}
                              />
                            )}
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
                    <Button type="primary" onClick={() => this.setImportmodal(true)}>
                      <Icon type="upload" />批量导入
                    </Button>
                    <Button icon="delete" onClick={() => this.handleRecycleModalVisible(true)}>
                      回收
                    </Button>
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
