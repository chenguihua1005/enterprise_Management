import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Tabs, Button, Table, Divider, Icon, message } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from '../OilFee.less';
import AccountDetailDetailComponent from './DriverDetail';
import OilFeeDriverSetting from '../components/AccountSetting';
import OilFeeRecycle from '../components/OilFeeRecycle';
import OilFeeGrantSingle from '../components/OilFeeGrantSingle';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects[('oilfee/fetch3', 'oilfee/fetch3Export')],
}))
@Form.create()
export default class AccountBranchComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 2; // 防止 tab 的 key 重复 每生成一次 tab 都会增加1
    const panes = [{ title: '司机账户', content: '', key: '1' }];
    this.state = {
      activeKey: panes[0].key, // 默认选中 tab
      panes,
      current: 1,
      formValues: {}, // 表单信息
      settingModalVisible: false,
      dirverInfo: {}, // 司机信息
      recycleModalVisible: false,
      recycleInfo: {}, // 回收弹窗默认显示信息
      grantModalVisible: false, // 发放弹窗
      grantInfo: {},
    };
  }
  // 账户设置 modal
  handleSettingModalVisible = (status, info) => {
    this.setState({
      settingModalVisible: status,
      dirverInfo: info,
    });
    console.log(this.state);
  };
  // 回收油费 modal 操作
  handleRecycleModalVisible = (status, info) => {
    this.setState({
      recycleModalVisible: status,
      recycleInfo: info,
    });
    console.log(this.state);
    //获取可回收油费
    this.props.dispatch({
      type: 'oilfee/fetchProvideRecycle',
      payload: {
        grantType: 2,
        data: info.employeeId,
      },
    });
  };
  // 发放弹窗 操作
  handleGrantModalVisible = (status, info) => {
    if (info.isRecover == 0 || info.isRecover == 2) {
      message.warning('您只能给有效司机发放油费！');
      return;
    }
    this.setState({
      grantModalVisible: status,
      grantInfo: info,
    });
  };

  componentDidMount() {
    const { dispatch } = this.props;
    //帐户-获取油卡账户详情
    dispatch({
      type: 'oilfee/fetch1',
      payload: {},
    });
    //帐户-获取司机油卡账户详情列表
    dispatch({
      type: 'oilfee/fetch3',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });
  }

  //重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    //帐户-获取司机油卡账户详情列表
    dispatch({
      type: 'oilfee/fetch3',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
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
    const params = {
      //默认值
      page: 1,
      pageSize: 10,
      isCount: 1,
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
        mobilePhone: fieldsValue.mobilePhone,
        branchName: fieldsValue.branchName,
        employeeName: fieldsValue.employeeName,
      };

      this.setState({
        formValues: values,
      });
      //帐户-获取司机油卡账户详情列表
      dispatch({
        type: 'oilfee/fetch3',
        payload: values,
      }).then(() => {
        this.setState({
          current: 1,
        });
      });
    });
  };

  //列表变化翻页的回调
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, form } = this.props;
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
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
        mobilePhone: fieldsValue.mobilePhone,
        branchName: fieldsValue.branchName,
        employeeName: fieldsValue.employeeName,
      };

      this.setState({
        formValues: values,
      });
      //帐户-获取司机油卡账户详情列表
      dispatch({
        type: 'oilfee/fetch3',
        payload: values,
      }).then(() => {
        this.setState({
          current: pagination.current,
        });
      });
    });
  };

  //导出
  handleExport = () => {
    console.log('handleExport');
    const { dispatch, form } = this.props;
    const { getFieldValue } = form;
    const values = {
      actionType: 1,
      mobilePhone: getFieldValue('mobilePhone'),
      branchName: getFieldValue('branchName'),
    };
    dispatch({
      type: 'oilfee/fetch3Export',
      payload: values,
    }).then(() => {
      const { oilDriverInfoListExport } = this.props.oilfee;
      switch (oilDriverInfoListExport.err) {
        //err=0成功
        case 0:
          message.success(oilDriverInfoListExport.msg);
          window.open(oilDriverInfoListExport.res.path);
          break;
        default:
          message.warning(oilDriverInfoListExport.msg);
      }
    });
  };

  // 搜索区表单
  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 24, lg: 24, xl: 48 }}>
          <Col md={12} sm={12} xs={24}>
            <FormItem label="司机手机号">
              {getFieldDecorator('mobilePhone', {})(<Input />)}
            </FormItem>
          </Col>
          <Col md={12} sm={12} xs={24}>
            <FormItem label="分公司/车队名称">
              {getFieldDecorator('branchName')(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginTop: 24 }}>
          <Col md={12} sm={12} xs={24}>
            <FormItem label="司机名称">{getFieldDecorator('employeeName', {})(<Input />)}</FormItem>
          </Col>
          <Col md={12} sm={24} xs={24}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" htmlType="submit">
                  <Icon type="search" />查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleExport}>
                  <Icon type="export" />导出
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  // 收支明细
  handleIncomeAndExpensePage(record) {
    const panes = this.state.panes;
    let activeKey = `${this.newTabIndex++}`;
    // 保持仅有两个 tabs
    if (panes.length > 1) {
      panes.pop();
    }
    panes.push({
      title: '  司机账户交易明细',
      content: <AccountDetailDetailComponent driverId={record} />,
      key: activeKey,
    });
    this.setState({ panes, activeKey });
    console.log(record);
  }

  // 关闭 tabs
  remove = targetKey => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  // remove 触发器
  onEdit = (targetKey, action) => {
    console.log(action);
    this[action](targetKey);
  };

  render() {
    const { oilfee, loading } = this.props;
    const { oilDriverInfoList } = oilfee;
    const { count, list: tabledata } = oilDriverInfoList;
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
        title: '司机名称',
        dataIndex: 'employeeName',
      },
      {
        title: '司机手机号',
        dataIndex: 'employeeMobile',
      },
      {
        title: '账号',
        dataIndex: 'accountNumber',
      },
      {
        title: '所属公司',
        dataIndex: 'belongCompanyName',
      },
      {
        title: '当前余额(元)',
        dataIndex: 'balance',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
            <Button
              type="primary"
              // disabled={record.status == 0 || record.status == 1001}
              onClick={() => this.handleGrantModalVisible(true, record)}
            >
              发放油费
            </Button>
            <Divider type="vertical" />
            {/* <Button onClick={() => this.handleSettingModalVisible(true, record)}>账户设置</Button>
            <Divider type="vertical" /> */}
            <Button onClick={() => this.handleRecycleModalVisible(true, record)}>回收油费</Button>
            <Divider type="vertical" />
            <Button onClick={() => this.handleIncomeAndExpensePage(record)}>收支明细</Button>
          </span>
        ),
      },
    ];

    const pageList = (
      <div>
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card bordered={false}>
              <div className={`${styles.tableListForm} ${styles.noMarginBottom}`}>
                {this.renderAdvancedForm()}
              </div>
            </Card>
          </Col>
        </Row>
        <Card bordered={false}>
          <div className={styles.tableList}>
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
      </div>
    );
    return (
      <PageHeaderLayout>
        <div
          className={this.state.panes.length > 1 ? styles.tabsWrapper : styles.tabsWrapperNoTabsBar}
        >
          <Tabs
            hideAdd
            onChange={this.onChange}
            activeKey={this.state.activeKey}
            type="editable-card"
            onEdit={this.onEdit}
          >
            {this.state.panes.map(
              pane =>
                pane.key == '1' ? (
                  <TabPane tab={pane.title} key="1" closable={false}>
                    {pageList}
                  </TabPane>
                ) : (
                  <TabPane tab={pane.title} key={pane.key} closable={true}>
                    {pane.content}
                  </TabPane>
                )
            )}
          </Tabs>
        </div>
        {/* 账户设置弹窗 */}
        <OilFeeDriverSetting
          modalVisible={this.state.settingModalVisible}
          handleModalVisible={() => this.handleSettingModalVisible(false, {})}
          dirverInfo={this.state.dirverInfo}
        />
        {/* 回收 */}
        <OilFeeRecycle
          modalVisible={this.state.recycleModalVisible}
          handleModalVisible={() => this.handleRecycleModalVisible(false, {})}
          recycleInfo={this.state.recycleInfo}
          grantType="driver"
        />
        {/* 发放油费 */}
        <OilFeeGrantSingle
          modalVisible={this.state.grantModalVisible}
          handleModalVisible={() => this.handleGrantModalVisible(false, {})}
          grantInfo={this.state.grantInfo}
          grantType="driver"
        />
      </PageHeaderLayout>
    );
  }
}
