import React, { PureComponent } from 'react';
import { connect } from 'dva';

import {
  Row,
  Col,
  Card,
  Form,
  Tabs,
  Button,
  Table,
  Divider,
  Input,
  Icon,
  Select,
  message,
} from 'antd';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from '../OilFee.less';

import AccountBranchDetailComponent from './BranchDetail';
import OilFeeRecycle from '../components/OilFeeRecycle';
import OilFeeGrantSingle from '../components/OilFeeGrantSingle';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const { Option } = Select;

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetch2'],
}))
@Form.create()
export default class AccountBranchComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 2;
    const panes = [{ title: '分公司账户', content: '', key: '1' }];
    this.state = {
      current: 1,
      activeKey: panes[0].key,
      panes,
      recycleModalVisible: false,
      recycleInfo: {}, // 回收弹窗默认显示信息
      grantModalVisible: false, // 发放弹窗
      grantInfo: {},
    };
  }
  // 回收 modal 操作
  handleRecycleModalVisible = (status, info) => {
    if (info.distributeStatus == 0) {
      message.warning('您只能回收一级分公司油费！');
      return;
    }
    this.setState({
      recycleModalVisible: status,
      recycleInfo: info,
    });
    // console.log(this.state);
    //可回收余额
    this.props.dispatch({
      type: 'oilfee/fetchProvideRecycle',
      payload: {
        grantType: 1,
        data: info.companyBranchId,
      },
    });
  };
  // 发放弹窗 操作
  handleGrantModalVisible = (status, info) => {
    if (info.distributeStatus == 0) {
      message.warning('您只能给一级分公司发放油费！');
      return;
    }
    this.setState({
      grantModalVisible: status,
      grantInfo: info,
    });
  };
  componentDidMount() {
    const { dispatch } = this.props;
    //总账户详情
    dispatch({
      type: 'oilfee/fetch1',
      payload: {},
    });
    //帐户-获取分公司油卡账户详情
    dispatch({
      type: 'oilfee/fetch2',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });
    //获取公司等级
    dispatch({
      type: 'oilfee/fetchCompanyLevel',
      payload: {},
    });
  }

  //重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    //帐户-获取分公司油卡账户详情
    dispatch({
      type: 'oilfee/fetch2',
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
      // mobilePhone: '',
      branchName: '',
      companyLevel: -1,
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
        branchName: fieldsValue.branchName,
        companyLevel: fieldsValue.branchLevel,
      };
      dispatch({
        type: 'oilfee/fetch2',
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
      //默认值
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
      // mobilePhone: '',
      branchName: '',
      companyLevel: -1,
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
        branchName: fieldsValue.branchName,
        companyLevel: fieldsValue.branchLevel,
      };
      dispatch({
        type: 'oilfee/fetch2',
        payload: values,
      }).then(() => {
        this.setState({
          current: pagination.current,
        });
      });
    });
  };

  // 搜索区表单
  renderAdvancedForm(companyLevelOptions) {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 24, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="分公司名称">{getFieldDecorator('branchName')(<Input />)}</FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="分公司级别">
              {getFieldDecorator('branchLevel', {
                initialValue: -1,
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {companyLevelOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginTop: 24 }}>
            <Button type="primary" htmlType="submit">
              <Icon type="search" />查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }
  // 收支明细
  incomeAndExpense(record) {
    const panes = this.state.panes;
    let activeKey = `${this.newTabIndex++}`;
    // 保持仅有两个 tabs
    if (panes.length > 1) {
      panes.pop();
    }
    panes.push({
      title: '公司账户明细-预存账户',
      content: (
        <AccountBranchDetailComponent
          companyId={record.companyBranchId}
          companyBranchName={record.companyBranchName}
        />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
    console.log(record.companyBranchId);
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
    const { oilBranchInfoList, oilAccountInfo, oilBranchInfoCompanyLevel } = oilfee;
    const { count, list: tabledata } = oilBranchInfoList;

    //公司等级
    const companyLevelOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (oilBranchInfoCompanyLevel != undefined && oilBranchInfoCompanyLevel.length > 0) {
      oilBranchInfoCompanyLevel.forEach(item => {
        companyLevelOptions.push(
          <Option key={item.key} value={item.key}>
            {item.value}
          </Option>
        );
      });
    }

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      current: this.state.current,
      total: parseInt(count),
      showTotal: () => `共计 ${count} 条`,
    };
    const columnData = [
      {
        title: '分公司名称',
        dataIndex: 'companyBranchName',
      },
      {
        title: '分公司级别',
        dataIndex: 'companylevel',
        render: text =>
          text == '1' ? '一级分公司' : '二级分公司',
      },
      {
        title: '可用余额(元)',
        dataIndex: 'balance',
      },
      {
        title: '操作',
        key: 'prop3',
        render: (text, record) => (
          <span>
            <Button type="primary" onClick={() => this.handleGrantModalVisible(true, record)}>
              发放油费
            </Button>
            <Divider type="vertical" />
            <Button onClick={() => this.handleRecycleModalVisible(true, record)}>回收油费</Button>
            <Divider type="vertical" />
            <Button onClick={() => this.incomeAndExpense(record)}>账户收支明细</Button>
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
                {this.renderAdvancedForm(companyLevelOptions)}
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
        {/* 回收 */}
        <OilFeeRecycle
          modalVisible={this.state.recycleModalVisible}
          handleModalVisible={() => this.handleRecycleModalVisible(false, {})}
          recycleInfo={this.state.recycleInfo}
          grantType="motorcade"
        />
        {/* 发放油费 */}
        <OilFeeGrantSingle
          modalVisible={this.state.grantModalVisible}
          handleModalVisible={() => this.handleGrantModalVisible(false, {})}
          grantInfo={this.state.grantInfo}
          grantType="motorcade"
        />
      </PageHeaderLayout>
    );
  }
}
