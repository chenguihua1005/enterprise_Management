import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Table,
  Icon,
  Button,
  Badge,
  DatePicker,
  message,
  Tabs,
} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from '../Settlement.less';
import moment from 'moment/moment';
import { getTimeDistance } from '../../../utils/utils';
import StatementDetail from './StatementDetail';
import form from './../../Forms/StepForm/Step1';
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

// rowSelection object indicates the need for row selection
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: record => ({
    // disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
};

@connect(({ statement, loading }) => ({
  statement,
  loading: loading.effects['statement/billlist','statement/billlistExport'],
}))
@Form.create()
export default class Credit extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 2;
    const panes = [{ title: '分公司账户', content: '', key: '1' }];
    this.state = {
      modalVisible: false,
      selectedRows: [],
      formValues: {},
      visible: false,
      currentId: -1,
      activeKey: panes[0].key,
      panes,
      rangePickerValue: getTimeDistance('month'),
    };
  }
  // 初始化
  componentDidMount() {
    const { dispatch } = this.props;
    //结算 - 帐单列表或导出
    dispatch({
      type: 'statement/billlist',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        billType: 2,
      },
    });
    //公共接口 - 帐单列表页面获取帐套公司列表
    dispatch({
      type: 'statement/ownCompanyList',
      payload: {},
    });
  }
  // 切换页数
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      page: pagination.current,
      count: pagination.pageSize,
      isCount: 1,
    };

    dispatch({
      type: 'statement/billlist',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        billType: 2,
      },
    });
  };
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'statement/fetch2',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };
  //日期框设置值
  handleRangePickerChange = rangePickerValue => {
    this.setState({
      rangePickerValue,
    });
  };
  //禁用当前日期之后的时间
  disabledDate = current => {
    // console.log(moment().subtract(3,"months"));
    // return current && current < moment().subtract(3,"months");
    return current && current > moment().endOf('day');
  };
  // 模糊查询
  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    const { rangePickerValue } = this.state;
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD HH:mm:ss');
      const endTime = endValue.format('YYYY-MM-DD HH:mm:ss');
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
          billSn: fieldsValue.billSn,
          ownCompanyId: fieldsValue.ownCompanyId,
          settledStatus: fieldsValue.settledStatus,
          billStartTime: startTime,
          billEndTime: endTime,
          page: 1,
          pageSize: 10,
          isCount: 1,
          billType: 2,
        };

        const values = {
          ...params,
          transactionType: fieldsValue.transactionType,
          direction: fieldsValue.direction,
        };
        dispatch({
          type: 'statement/billlist',
          payload: values,
        });
      });
    } else {
      message.error('日期不能为空');
    }
  };
  // 重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
      // rangePickerValue: getTimeDistance('month'),
    });
    // const startTime = startValue.format('YYYY-MM-DD');
    // const endTime = endValue.format('YYYY-MM-DD');

    dispatch({
      type: 'statement/billlist',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        billType: 2,
      },
    });
  };
  // 导出
  handlEexport = () => {
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state;
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD HH:mm:ss');
      const endTime = endValue.format('YYYY-MM-DD HH:mm:ss');
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
          billSn: fieldsValue.billSn,
          ownCompanyId: fieldsValue.ownCompanyId,
          billStartTime: startTime,
          billEndTime: endTime,
          page: 1,
          pageSize: 10,
          isCount: 1,
          billType: 2,
          actionType: 1,
        };

        const values = {
          ...params,
          transactionType: fieldsValue.transactionType,
          direction: fieldsValue.direction,
        };
        dispatch({
          type: 'statement/billlistExport',
          payload: values,
        }).then(() => {
          const { exportList } = this.props.statement;
          switch (exportList.err) {
            //err=0成功
            case 0:
              message.success(exportList.msg);
              window.open(exportList.res.downLoadUrl);
              break;
            default:
              message.warning(exportList.msg);
          }
        });
      });
    } else {
      message.error('日期不能为空');
    }
  };
  // 预存账单详情
  handleModalVisible = (flag, billNumber) => {
    // this.setState({
    //   modalVisible: !!flag,
    //   currentId: id,
    // });
    const { form, dispatch } = this.props;

    dispatch({
      type: 'statement/billlist',
      payload: {
        billNumber: billNumber,
      },
    });
    const panes = this.state.panes;
    let activeKey = `${this.newTabIndex++}`;
    // 保持仅有两个 tabs
    if (panes.length > 1) {
      panes.pop();
    }
    panes.push({
      title: ' 预存账单详情',
      content: <StatementDetail billNumber={billNumber} />,
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };

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
    const { dispatch } = this.props;
    this.setState({ activeKey });
    //结算 - 帐单列表或导出
    dispatch({
      type: 'statement/billlist',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        billType: 1,
      },
    });
  };
  // remove 触发器
  onEdit = (targetKey, action) => {
    console.log(action);
    this[action](targetKey);
  };
  // 对账状态
  getBillStatus = status => {
    if (status == 1) {
      return <Badge status="default" text="未结算" />;
    } else if (status == 2) {
      return <Badge status="processing" text="结算中" />;
    } else {
      return <Badge status="success" text="已完成" />;
    }
  };
  render() {
    const { statement, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const { billList, ownCompanyList } = statement;
    const { count, list: tableData } = billList;

    //结算主体
    const ownOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (ownCompanyList != undefined && ownCompanyList.length > 0) {
      ownCompanyList.forEach(item => {
        ownOptions.push(
          <Option key={item.ownId} value={`${item.ownId}`}>
            {item.ownName}
          </Option>
        );
      });
    }

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: count,
      showTotal: () => `共计 ${count} 条`,
    };

    const columns = [
      {
        title: '账单编号',
        dataIndex: 'billNumber',
        render: text => <a onClick={() => this.handleModalVisible(true, text)}>{text}</a>,
        fixed: 'left',
      },
      {
        title: '账单类型',
        dataIndex: 'billType',
      },
      {
        title: '结算公司主体',
        dataIndex: 'subjectCompanyName',
      },
      {
        title: '账单总金额',
        dataIndex: 'billAmount',
      },
      {
        title: '账单结算金额',
        dataIndex: 'billSettlementAmount',
      },
      {
        title: '已核销金额',
        dataIndex: 'billedAmount',
      },
      {
        title: '待核销金额',
        dataIndex: 'waitBillAmount',
      },
      {
        title: '账单周期',
        dataIndex: 'billCycle',
      },
      {
        title: '账单日',
        dataIndex: 'billDate',
      },
      {
        title: '账单核销状态',
        dataIndex: 'billStatus',
        render: text => this.getBillStatus(text),

        // render: text =>
        //   text === 1 ? <Badge status="1" text="已核销" /> : <Badge status="2" text="未核销" />,
      },
    ];

    const pageList = (
      <div>
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card bordered={false}>
              <div className={`${styles.tableList} ${styles.tableListForm}`}>
                <Form onSubmit={this.handleSearch} layout="inline">
                  <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={12} sm={24}>
                      <FormItem label="账单编号">
                        {getFieldDecorator('billSn')(<Input placeholder="请输入" />)}
                      </FormItem>
                    </Col>
                    <Col md={12} sm={24}>
                      <FormItem label="结算主体">
                        {getFieldDecorator('ownCompanyId')(
                          <Select
                            showSearch
                            allowClear
                            placeholder="结算主体"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {ownOptions}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={12} sm={24}>
                      <FormItem label="还款状态">
                        {getFieldDecorator('settledStatus')(
                          <Select placeholder="请选择" style={{ width: '100%' }}>
                            <Option value="-1">全部</Option>
                            <Option value="2">结算中</Option>
                            <Option value="1">未结算</Option>
                            <Option value="3">已完成</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col md={12} sm={24}>
                      <FormItem label="账单时间">
                        {getFieldDecorator('time')(
                          <RangePicker
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                            placeholder={['开始日期', '结束日期']}
                            style={{ width: '100%' }}
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
                      <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handlEexport}>
                    <Icon type="export" />导出
                  </Button>
                    </span>
                  </div>
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <Table
              loading={loading}
              rowSelection={rowSelection}
              columns={columns}
              dataSource={tableData}
              pagination={paginationProps}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 1500 }}
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
      </PageHeaderLayout>
    );
  }
}
