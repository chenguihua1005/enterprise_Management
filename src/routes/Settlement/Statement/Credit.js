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
import { isArrayIterable } from '../../../utils/utils';
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

// checkBox 筛选
// const rowSelection = {
//   onChange: (selectedRowKeys, selectedRows) => {
//     // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
//   },
//   getCheckboxProps: record => ({
//     // disabled: record.name === 'Disabled User', // Column configuration not to be checked
//     name: record.name,
//   }),
// };

@connect(({ statement, loading }) => ({
  statement,
  loading: loading.effects[('statement/billlist', 'statement/billlistExport')],
}))
@Form.create()
export default class Credit extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 2;
    const panes = [{ title: '对账单', content: '', key: '1' }];
    this.state = {
      modalVisible: false,
      selectedRows: [],
      formValues: {},
      visible: false,
      currentId: -1,
      activeKey: panes[0].key,
      panes,
      current:1,
      rangePickerValue: [],
    };
    this.startTime = '';
    this.endTime = '';
  }
  // 初始化
  componentDidMount() {
    const { dispatch } = this.props;
    // const { rangePickerValue } = this.state; //startValue,endValue
    // const [startValue, endValue] = rangePickerValue;
    // const startTime = startValue.format('YYYY-MM-DD');
    // const endTime = endValue.format('YYYY-MM-DD');
    //结算 - 帐单列表或导出
    dispatch({
      type: 'statement/billlist',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        billType: 2,
        // billStartTime: startTime,
        // billEndTime: endTime,
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
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state;
    if (Object.keys(rangePickerValue).length != 0) {
      const [startValue, endValue] = rangePickerValue;
      this.startTime = startValue.format('YYYY-MM-DD');
      this.endTime = endValue.format('YYYY-MM-DD');
    } else {
      this.startTime = '';
      this.endTime = '';
    }
    
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
        billStartTime: this.startTime,
        billEndTime: this.endTime,
        page: pagination.current,
        pageSize: pagination.pageSize,
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
      }).then( () => {
        this.setState({
          current:1
        })
      });
    })
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };
  //日期框设置值
  handleRangePickerChange = (date) => {
    this.setState({
      rangePickerValue: date,
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
    if (Object.keys(rangePickerValue).length != 0) {
      const [startValue, endValue] = rangePickerValue;
      this.startTime = startValue.format('YYYY-MM-DD');
      this.endTime = endValue.format('YYYY-MM-DD');
    } else {
      this.startTime = '';
      this.endTime = '';
    }
    
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
        billStartTime: this.startTime,
        billEndTime: this.endTime,
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
      }).then( () => {
        this.setState({
          current:1
        })
      });
    })
  };

  // 重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
      rangePickerValue: [],
    });
    // const [startValue, endValue] = getTimeDistance('month');
    // const startTime = startValue.format('YYYY-MM-DD');
    // const endTime = endValue.format('YYYY-MM-DD');

    dispatch({
      type: 'statement/billlist',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
        billType: 2,
        billStartTime: '',
        billEndTime: '',
      },
    }).then( () => {
      this.setState({
        current:1
      })
    });
  };

  // 导出
  handlEexport = () => {
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state;
    if (Object.keys(rangePickerValue).length != 0) {
      const [startValue, endValue] = rangePickerValue;
      this.startTime = startValue.format('YYYY-MM-DD');
      this.endTime = endValue.format('YYYY-MM-DD');
    } else {
      this.startTime = '';
      this.endTime = '';
    }
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
        billStartTime: this.startTime,
        billEndTime: this.endTime,
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
  };

  // 预存账单详情
  handleModalVisible = (flag, billNumber) => {
    // this.setState({
    //   modalVisible: !!flag,
    //   currentId: id,
    // });
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

  //tab切换回调
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
        billType: 2,
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
    const { rangePickerValue } = this.state;

    //结算主体
    const ownOptions = [];
    if (isArrayIterable(ownCompanyList)) {
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
      total: parseInt(count),
      current: this.state.current,
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
        render: text =>
          text === 1 ? <Badge status="1" text="预存" /> : <Badge status="2" text="授信" />,
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
        title: '已还款金额',
        dataIndex: 'billedAmount',
      },
      {
        title: '待还款金额',
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
        title: '最后还款日期',
        dataIndex: 'lastRepaymentDate',
      },
      {
        title: '实际还清日',
        dataIndex: 'realRepaymentDate',
      },
      {
        title: '账单核销状态',
        dataIndex: 'repaymentStatus',
        render: text => this.getBillStatus(text),

        // render: text =>
        //   text === 1 ? <Badge status="1" text="已核销" /> : <Badge status="2" text="未核销" />,
      },
    ];

    const pageList = (
      <div>
        <Row gutter={24} style={{ marginBottom: 15 }}>
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
                        {getFieldDecorator('ownCompanyId',{
                          initialText: '全部',
                          initialValue: '全部',
                        })(
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
                        {getFieldDecorator('settledStatus',{
                          initialText: '全部',
                          initialValue: '全部',
                        })(
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
                      {form.getFieldDecorator('time')(
                        <RangePicker
                          style={{ width: '100%' }}
                          // value={rangePickerValue}
                          // disabledDate={this.disabledDate}
                          onChange={this.handleRangePickerChange}
                        />)}
                      </FormItem>
                    </Col>
                  </Row>
                  <div style={{ overflow: 'hidden' }}>
                    <span style={{ float: 'right' }}>
                      <Button type="primary" htmlType="submit">
                        <Icon type="search" />查询
                      </Button>
                      <Button style={{ marginLeft: 8 }} type="" onClick={this.handlEexport}>
                        <Icon type="export" />导出
                      </Button>
                      <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                      <Icon type="sync" />重置
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
              // rowSelection={rowSelection}
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
